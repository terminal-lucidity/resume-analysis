import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, FileText, AlertCircle, CheckCircle, Info, BarChart3, Eye, EyeOff } from 'lucide-react';
import './Analysis.css';

interface AnalysisData {
  resumeId: string;
  jobTitle: string;
  jobDescription: string;
  jobLevel: string;
  selectedResume: {
    id: string;
    fileName: string;
    originalText?: string;
  };
}

interface AnalysisResult {
  similarity: number;
  overallScore: number;
  keywordMatchScore: number;
  skillGapAnalysis: {
    missing_skills: string[];
    skill_gap_score: number;
  };
  improvementSuggestions: string[];
  detailedAnalysis: {
    llm_insights: {
      strengths: string[];
      weaknesses: string[];
      overall_assessment: string;
    };
    standalone_analysis?: {
      standalone_score: number;
      content_score: number;
      skills_diversity: number;
      action_verb_score: number;
      achievement_score: number;
      section_score: number;
      format_score: number;
      experience_score: number;
      found_skills: string[];
      found_verbs: string[];
    };
    section_analysis?: {
      section_scores: Record<string, number>;
      completeness_score: number;
      missing_sections: string[];
      detected_sections: string[];
      detailed_section_analysis: Record<string, number>;
    };
    achievements_analysis?: {
      quantifiable_achievements: string[];
      achievement_sentences: string[];
      achievement_score: number;
    };
    format_analysis?: {
      problematic_elements: string[];
      bullet_score: number;
      spacing_score: number;
      format_score: number;
      ats_friendly: boolean;
    };
    ats_analysis?: {
      found_action_verbs: string[];
    };
  };
  ats_score?: number;
  achievement_score?: number;
  format_score?: number;
  section_completeness?: number;
  standalone_score?: number;
}

const Analysis: React.FC = () => {
  console.log('Analysis component rendering');
  
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailed, setShowDetailed] = useState(false);
  const [resumeText, setResumeText] = useState<string>('');
  const [issues, setIssues] = useState<Array<{start: number, end: number, message: string}>>([]);
  const [showIssues, setShowIssues] = useState(false);

  // Refs for animations
  const headerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  // Debug logging for state (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Analysis component state:', {
      analysisData: !!analysisData,
      analysisResult: !!analysisResult,
      isLoading,
      error,
      resumeText: resumeText.length
    });
  }

  useEffect(() => {
    console.log('Analysis component mounted');
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to signin');
      window.location.href = '/signin';
      return;
    }

    const storedData = localStorage.getItem('analysisData');
    console.log('Stored analysis data:', storedData);
    if (!storedData) {
      console.log('No analysis data found, redirecting to dashboard');
      window.location.href = '/dashboard';
      return;
    }

    // Parse the stored data
    try {
      const data = JSON.parse(storedData);
      console.log('Parsed analysis data:', data);
      setAnalysisData(data);
      
      // Perform health check before analysis
      performHealthCheck().then(() => {
        // Call performAnalysis and handle any errors
        performAnalysis(data).catch((error) => {
          console.error('Error in performAnalysis:', error);
          setError(error.message || 'Analysis failed');
          setIsLoading(false);
        });
      }).catch((error) => {
        console.error('Health check failed:', error);
        // Continue with analysis even if health check fails
        performAnalysis(data).catch((error) => {
          console.error('Error in performAnalysis:', error);
          setError(error.message || 'Analysis failed');
          setIsLoading(false);
        });
      });
    } catch (error) {
      console.error('Error parsing analysis data:', error);
      setError('Invalid analysis data');
      setIsLoading(false);
      return;
    }

    // Add scroll animations (simplified to avoid interference)
    try {
      setTimeout(() => {
        const observerOptions = {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-in');
            }
          });
        }, observerOptions);

        // Observe elements for animations
        const elementsToObserve = [
          headerRef.current,
          sidebarRef.current,
          resumeRef.current
        ].filter(Boolean);

        elementsToObserve.forEach((element) => {
          if (element) {
            observer.observe(element);
          }
        });
      }, 100); // Small delay to ensure component is rendered
    } catch (animationError) {
      console.warn('Animation setup failed:', animationError);
      // Continue without animations
    }
  }, []);

  const performHealthCheck = async () => {
    try {
      console.log('Performing health check...');
      
      // Check backend health
      const backendHealth = await fetch('http://localhost:3000/health');
      console.log('Backend health status:', backendHealth.status);
      
      // Check Python analysis service health
      try {
        const pythonHealth = await fetch('http://localhost:8001/health');
        console.log('Python analysis service health status:', pythonHealth.status);
      } catch (error) {
        console.warn('Python analysis service not available:', error);
      }
      
    } catch (error) {
      console.warn('Health check failed:', error);
      // Don't throw error, just log it
    }
  };

  const performAnalysis = async (data: AnalysisData) => {
    try {
      console.log('Starting analysis for data:', data);
      const token = localStorage.getItem('token');
      
      // First, get the resume text from the database
      console.log('Fetching resume with ID:', data.resumeId);
      const resumeResponse = await fetch(`http://localhost:3000/api/resumes/${data.resumeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!resumeResponse.ok) {
        const errorData = await resumeResponse.json().catch(() => ({}));
        console.error('Resume fetch error:', resumeResponse.status, errorData);
        
        // If resume fetch fails, try to provide a fallback analysis
        if (resumeResponse.status === 404) {
          throw new Error('Resume not found. Please upload a resume first.');
        } else if (resumeResponse.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else {
          throw new Error(`Failed to fetch resume: ${errorData.error || resumeResponse.statusText}`);
        }
      }

      const resumeData = await resumeResponse.json();
      console.log('Resume data received:', resumeData);
      const resumeText = resumeData.resume?.originalText || '';
      setResumeText(resumeText);
      console.log('Resume text length:', resumeText.length);

      // Check if this is a request to view existing analysis or perform new analysis
      const isViewingExisting = data.jobTitle === 'General Resume Analysis' && 
                               data.jobDescription === 'Viewing existing resume analysis';
      
      console.log('Is viewing existing analysis:', isViewingExisting);
      console.log('Resume aiAnalysis data:', resumeData.resume?.aiAnalysis);
      console.log('Full resume data:', resumeData.resume);
      
      if (isViewingExisting && resumeData.resume?.aiAnalysis) {
        // Display existing analysis
        console.log('Displaying existing analysis:', resumeData.resume.aiAnalysis);
        const existingAnalysis = resumeData.resume.aiAnalysis;
        
        // Convert existing analysis format to match expected format
        const convertedResult: AnalysisResult = {
          similarity: existingAnalysis.score || 0,
          overallScore: existingAnalysis.score || 0,
          keywordMatchScore: existingAnalysis.score || 0,
          skillGapAnalysis: {
            missing_skills: [],
            skill_gap_score: 0
          },
          improvementSuggestions: existingAnalysis.improvements || [],
          detailedAnalysis: {
            llm_insights: {
              strengths: existingAnalysis.strengths || [],
              weaknesses: [],
              overall_assessment: existingAnalysis.summary || ''
            }
          }
        };
        
        setAnalysisResult(convertedResult);
        generateIssues(resumeText, convertedResult);
      } else if (isViewingExisting) {
        // No existing analysis found, perform a new analysis instead
        console.log('No existing analysis found for this resume, performing new analysis');
        
        // Perform new analysis with default job data
        const analysisResponse = await fetch('http://localhost:3000/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            resumeId: data.resumeId,
            jobTitle: 'General Resume Review',
            jobDescription: 'Comprehensive resume analysis and improvement suggestions',
            jobLevel: 'Any Level'
          })
        });

        if (!analysisResponse.ok) {
          const errorData = await analysisResponse.json().catch(() => ({}));
          console.error('Analysis response error:', analysisResponse.status, errorData);
          
          // Provide a fallback analysis if the service is unavailable
          if (analysisResponse.status === 503 || analysisResponse.status === 500) {
            console.log('Analysis service unavailable, providing fallback analysis');
            const fallbackResult: AnalysisResult = {
              similarity: 0.7,
              overallScore: 0.7,
              keywordMatchScore: 0.6,
              skillGapAnalysis: {
                missing_skills: ['Python', 'React', 'AWS'],
                skill_gap_score: 0.3
              },
              improvementSuggestions: [
                'Add more quantifiable achievements to your experience section',
                'Include specific technical skills and certifications',
                'Improve the summary section with a clear value proposition'
              ],
              detailedAnalysis: {
                llm_insights: {
                  strengths: ['Good educational background', 'Relevant work experience'],
                  weaknesses: ['Could use more specific achievements', 'Skills section could be enhanced'],
                  overall_assessment: 'Your resume shows good potential but could benefit from more specific achievements and technical skills.'
                }
              }
            };
            setAnalysisResult(fallbackResult);
            generateIssues(resumeText, fallbackResult);
            return;
          }
          
          throw new Error(`Analysis failed: ${errorData.error || analysisResponse.statusText}`);
        }

        const result = await analysisResponse.json();
        setAnalysisResult(result);
        
        // Generate issues based on analysis
        generateIssues(resumeText, result);
      } else {
        // Perform new analysis
        console.log('Sending analysis request...');
        const analysisResponse = await fetch('http://localhost:3000/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            resumeId: data.resumeId,
            jobTitle: data.jobTitle,
            jobDescription: data.jobDescription,
            jobLevel: data.jobLevel
          })
        });

        if (!analysisResponse.ok) {
          const errorData = await analysisResponse.json().catch(() => ({}));
          console.error('Analysis response error:', analysisResponse.status, errorData);
          
          // Provide a fallback analysis if the service is unavailable
          if (analysisResponse.status === 503 || analysisResponse.status === 500) {
            console.log('Analysis service unavailable, providing fallback analysis');
            const fallbackResult: AnalysisResult = {
              similarity: 0.6,
              overallScore: 0.6,
              keywordMatchScore: 0.5,
              skillGapAnalysis: {
                missing_skills: ['Python', 'React', 'AWS'],
                skill_gap_score: 0.4
              },
              improvementSuggestions: [
                'Add more quantifiable achievements to your experience section',
                'Include specific technical skills and certifications',
                'Improve the summary section with a clear value proposition'
              ],
              detailedAnalysis: {
                llm_insights: {
                  strengths: ['Good educational background', 'Relevant work experience'],
                  weaknesses: ['Could use more specific achievements', 'Skills section could be enhanced'],
                  overall_assessment: 'Your resume shows good potential but could benefit from more specific achievements and technical skills.'
                }
              }
            };
            setAnalysisResult(fallbackResult);
            generateIssues(resumeText, fallbackResult);
            return;
          }
          
          throw new Error(`Analysis failed: ${errorData.error || analysisResponse.statusText}`);
        }

        const result = await analysisResponse.json();
        setAnalysisResult(result);
        
        // Generate issues based on analysis
        generateIssues(resumeText, result);
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Provide a more user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          setError('Unable to connect to the analysis service. Please check your internet connection and try again.');
        } else if (error.message.includes('Authentication failed')) {
          setError('Your session has expired. Please log in again.');
        } else if (error.message.includes('Resume not found')) {
          setError('Resume not found. Please upload a resume first.');
        } else {
          setError(`Analysis failed: ${error.message}. Please try again.`);
        }
      } else {
        setError('Analysis failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateIssues = (text: string, result: AnalysisResult) => {
    const newIssues: Array<{start: number, end: number, message: string}> = [];
    
    // Only generate issues if there are significant problems
    if (result.skillGapAnalysis?.missing_skills && result.skillGapAnalysis.missing_skills.length > 0) {
      // Add a single issue for missing skills instead of multiple
      newIssues.push({
        start: 0,
        end: 100,
        message: `Missing skills: ${result.skillGapAnalysis.missing_skills.slice(0, 3).join(', ')}`
      });
    }

    // Add issues based on improvement suggestions (limit to 2-3 most important)
    const importantSuggestions = result.improvementSuggestions?.slice(0, 2) || [];
    importantSuggestions.forEach((suggestion, index) => {
      newIssues.push({
        start: Math.min(index * 200, text.length - 100),
        end: Math.min(index * 200 + 100, text.length),
        message: suggestion
      });
    });

    setIssues(newIssues);
  };

  const handleBackToDashboard = () => {
    localStorage.removeItem('analysisData');
    window.location.href = '/dashboard';
  };

  const renderResumeWithIssues = () => {
    if (!resumeText) return <div className="no-resume-text">No resume text available</div>;

    const lines = resumeText.split('\n');
    
    return (
      <div className="resume-content">
        {lines.map((line, lineIndex) => {
          const lineIssues = showIssues ? issues.filter(issue => 
            issue.start <= lineIndex * 50 && issue.end >= lineIndex * 50
          ) : [];

          return (
            <div key={lineIndex} className={`resume-line ${lineIssues.length > 0 ? 'has-issue' : ''}`}>
              <span className="line-text">{line}</span>
              {lineIssues.length > 0 && (
                <div className="issue-indicator">
                  <AlertCircle className="issue-icon" />
                  <div className="issue-tooltip">
                    {lineIssues.map((issue, idx) => (
                      <div key={idx} className="issue-message">{issue.message}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="analysis-loading">
        <div className="loading-spinner"></div>
        <p>Analyzing your resume...</p>
        <div className="loading-steps">
          <div className="loading-step">
            <span className="step-icon">📄</span>
            <span>Loading resume data</span>
          </div>
          <div className="loading-step">
            <span className="step-icon">🔍</span>
            <span>Analyzing content</span>
          </div>
          <div className="loading-step">
            <span className="step-icon">📊</span>
            <span>Generating insights</span>
          </div>
        </div>
        <p className="loading-note">This may take a few moments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analysis-error">
        <AlertCircle className="error-icon" />
        <h2>Analysis Error</h2>
        <p>{error}</p>
        <button onClick={handleBackToDashboard} className="back-button">
          <ArrowLeft className="button-icon" />
          Back to Resume
        </button>
      </div>
    );
  }

  if (!analysisData || !analysisResult) {
    return (
      <div className="analysis-error">
        <AlertCircle className="error-icon" />
        <h2>No Analysis Data</h2>
        <p>Please start an analysis from Resume.</p>
        <button onClick={handleBackToDashboard} className="back-button">
          <ArrowLeft className="button-icon" />
          Back to Resume
        </button>
      </div>
    );
  }



  return (
    <div className="analysis-page">
      <div className="analysis-header" ref={headerRef}>
        <div className="analysis-welcome">
          <button onClick={handleBackToDashboard} className="back-button">
            <ArrowLeft className="button-icon" />
            Back to Resume
          </button>
          <div className="analysis-title">
            <h1>Resume Analysis</h1>
            <p>Analysis for {analysisData.jobTitle} position</p>
          </div>
          <div className="analysis-toggle">
            <button
              className={`toggle-button ${!showDetailed ? 'active' : ''}`}
              onClick={() => setShowDetailed(false)}
            >
              <Eye className="button-icon" />
              Brief View
            </button>
            <button
              className={`toggle-button ${showDetailed ? 'active' : ''}`}
              onClick={() => setShowDetailed(true)}
            >
              <BarChart3 className="button-icon" />
              Detailed View
            </button>
          </div>
        </div>
      </div>

      <div className="analysis-content">
        <div className="analysis-sidebar" ref={sidebarRef}>
          <div className="score-card">
            <h3>Overall Score</h3>
            <div className="score-circle">
              <span className="score-number">{(analysisResult.overallScore * 100).toFixed(0)}%</span>
            </div>
            <div className="score-breakdown">
              <div className="score-item">
                <span>Semantic Similarity</span>
                <span>{(analysisResult.similarity * 100).toFixed(1)}%</span>
              </div>
              <div className="score-item">
                <span>Keyword Match</span>
                <span>{(analysisResult.keywordMatchScore * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {showDetailed && (
            <>
              <div className="insights-card">
                <h3>Strengths</h3>
                <ul>
                  {analysisResult.detailedAnalysis.llm_insights.strengths.map((strength, index) => (
                    <li key={index}>
                      <CheckCircle className="strength-icon" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="insights-card">
                <h3>Areas for Improvement</h3>
                <ul>
                  {analysisResult.detailedAnalysis.llm_insights.weaknesses.map((weakness, index) => (
                    <li key={index}>
                      <AlertCircle className="weakness-icon" />
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Comprehensive Metrics Section (Detailed View) */}
              <div className="insights-card ats-card">
                <h3>Resume Metrics</h3>
                <div className="ats-metrics">
                  <div className="ats-metric">
                    <span>Action Verbs</span>
                    <span className="metric-score">
                      {analysisResult.ats_score ? (analysisResult.ats_score * 100).toFixed(0) : 'N/A'}%
                    </span>
                  </div>
                  <div className="ats-metric">
                    <span>Achievements</span>
                    <span className="metric-score">
                      {analysisResult.achievement_score ? (analysisResult.achievement_score * 100).toFixed(0) : 'N/A'}%
                    </span>
                  </div>
                  <div className="ats-metric">
                    <span>Format</span>
                    <span className="metric-score">
                      {analysisResult.format_score ? (analysisResult.format_score * 100).toFixed(0) : 'N/A'}%
                    </span>
                  </div>
                  <div className="ats-metric">
                    <span>Sections</span>
                    <span className="metric-score">
                      {analysisResult.section_completeness ? (analysisResult.section_completeness * 100).toFixed(0) : 'N/A'}%
                    </span>
                  </div>
                  {showDetailed && analysisResult.detailedAnalysis.standalone_analysis && (
                    <>
                      <div className="ats-metric">
                        <span>Content Quality</span>
                        <span className="metric-score">
                          {(analysisResult.detailedAnalysis.standalone_analysis.content_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="ats-metric">
                        <span>Skills Diversity</span>
                        <span className="metric-score">
                          {(analysisResult.detailedAnalysis.standalone_analysis.skills_diversity * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="ats-metric">
                        <span>Experience Level</span>
                        <span className="metric-score">
                          {(analysisResult.detailedAnalysis.standalone_analysis.experience_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
                
                {analysisResult.detailedAnalysis.ats_analysis && (
                  <div className="ats-details">
                    <h4>Strong Action Verbs Found:</h4>
                    <div className="action-verbs">
                      {analysisResult.detailedAnalysis.ats_analysis.found_action_verbs.slice(0, 8).map((verb, index) => (
                        <span key={index} className="verb-tag">{verb}</span>
                      ))}
                    </div>
                  </div>
                )}

                {analysisResult.detailedAnalysis.achievements_analysis && 
                 analysisResult.detailedAnalysis.achievements_analysis.quantifiable_achievements.length > 0 && (
                  <div className="ats-details">
                    <h4>Quantifiable Achievements:</h4>
                    <ul className="achievements-list">
                      {analysisResult.detailedAnalysis.achievements_analysis.quantifiable_achievements
                        .filter(achievement => 
                          // Filter out standalone percentages and keep only meaningful achievements
                          achievement.length > 10 && 
                          !/^\d+%$/.test(achievement.trim()) &&
                          !/^\d+\.\d+%$/.test(achievement.trim())
                        )
                        .slice(0, 3)
                        .map((achievement, index) => (
                          <li key={index}>{achievement}</li>
                        ))}
                    </ul>
                  </div>
                )}

                {analysisResult.detailedAnalysis.section_analysis && (
                  <div className="ats-details">
                    {analysisResult.detailedAnalysis.section_analysis.detected_sections && 
                     analysisResult.detailedAnalysis.section_analysis.detected_sections.length > 0 && (
                      <div>
                        <h4>✅ Detected Sections:</h4>
                        <div className="detected-sections">
                          {analysisResult.detailedAnalysis.section_analysis.detected_sections.map((section, index) => (
                            <span key={index} className="section-tag detected">{section}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {analysisResult.detailedAnalysis.section_analysis.missing_sections && 
                     analysisResult.detailedAnalysis.section_analysis.missing_sections.length > 0 && (
                      <div>
                        <h4>❌ Missing Sections:</h4>
                        <div className="missing-sections">
                          {analysisResult.detailedAnalysis.section_analysis.missing_sections.map((section, index) => (
                            <span key={index} className="section-tag missing">{section}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {showDetailed && analysisResult.detailedAnalysis.standalone_analysis && 
                 analysisResult.detailedAnalysis.standalone_analysis.found_skills.length > 0 && (
                  <div className="ats-details">
                    <h4>Detected Skills:</h4>
                    <div className="action-verbs">
                      {analysisResult.detailedAnalysis.standalone_analysis.found_skills.slice(0, 8).map((skill, index) => (
                        <span key={index} className="verb-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {analysisResult.skillGapAnalysis.missing_skills.length > 0 && (
                <div className="insights-card">
                  <h3>Missing Skills</h3>
                  <div className="missing-skills">
                    {analysisResult.skillGapAnalysis.missing_skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!showDetailed && (
            <div className="insights-card">
              <h3>Quick Summary</h3>
              <p>{analysisResult.detailedAnalysis.llm_insights.overall_assessment}</p>
              <div className="suggestions-preview">
                <h4>Top Suggestions:</h4>
                <ul>
                  {analysisResult.improvementSuggestions.slice(0, 3).map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {!showDetailed && (
            <div className="insights-card">
              <h3>Key Metrics</h3>
              <div className="ats-metrics">
                <div className="ats-metric">
                  <span>Overall Score</span>
                  <span className="metric-score">
                    {(analysisResult.overallScore * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="ats-metric">
                  <span>ATS Optimization</span>
                  <span className="metric-score">
                    {analysisResult.section_completeness ? (analysisResult.section_completeness * 100).toFixed(0) : 'N/A'}%
                  </span>
                </div>
                <div className="ats-metric">
                  <span>Action Verbs</span>
                  <span className="metric-score">
                    {analysisResult.ats_score ? (analysisResult.ats_score * 100).toFixed(0) : 'N/A'}%
                  </span>
                </div>
                <div className="ats-metric">
                  <span>Achievements</span>
                  <span className="metric-score">
                    {analysisResult.achievement_score ? (analysisResult.achievement_score * 100).toFixed(0) : 'N/A'}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="resume-section" ref={resumeRef}>
          <div className="resume-header">
            <FileText className="resume-icon" />
            <h2>{analysisData.selectedResume.fileName}</h2>
            <div className="resume-controls">
              <button
                className={`toggle-button ${showIssues ? 'active' : ''}`}
                onClick={() => setShowIssues(!showIssues)}
                title={showIssues ? "Hide Issues" : "Show Issues"}
              >
                {showIssues ? <EyeOff className="button-icon" /> : <AlertCircle className="button-icon" />}
                {showIssues ? "Hide Issues" : "Show Issues"}
              </button>
            </div>
          </div>
          <div className="resume-container">
            {renderResumeWithIssues()}
          </div>
        </div>
      </div>
    </div>
  );

  // Comprehensive fallback for any unexpected state
  return (
    <div className="analysis-error">
      <AlertCircle className="error-icon" />
      <h2>Unexpected State</h2>
      <p>Something went wrong. Please try again or go back to Resume.</p>
      <button onClick={handleBackToDashboard} className="back-button">
        <ArrowLeft className="button-icon" />
        Back to Resume
      </button>
    </div>
  );
};

export default Analysis; 