import React, { useState, useEffect } from 'react';
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

    try {
      const data = JSON.parse(storedData);
      console.log('Parsed analysis data:', data);
      setAnalysisData(data);
      performAnalysis(data);
    } catch (error) {
      console.error('Error parsing analysis data:', error);
      setError('Invalid analysis data');
      setIsLoading(false);
    }
  }, []);

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
        throw new Error(`Failed to fetch resume: ${errorData.error || resumeResponse.statusText}`);
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
          throw new Error(`Analysis failed: ${errorData.error || analysisResponse.statusText}`);
        }

        const result = await analysisResponse.json();
        setAnalysisResult(result);
        
        // Generate issues based on analysis
        generateIssues(resumeText, result);
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      setError('Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateIssues = (text: string, result: AnalysisResult) => {
    const newIssues: Array<{start: number, end: number, message: string}> = [];
    
    // Add issues based on missing skills
    if (result.skillGapAnalysis?.missing_skills) {
      result.skillGapAnalysis.missing_skills.forEach(skill => {
        // Find if the skill is mentioned in the resume
        const skillIndex = text.toLowerCase().indexOf(skill.toLowerCase());
        if (skillIndex === -1) {
          // Skill not found, add a general issue
          newIssues.push({
            start: 0,
            end: 50,
            message: `Missing skill: ${skill}`
          });
        }
      });
    }

    // Add issues based on improvement suggestions
    result.improvementSuggestions?.forEach((suggestion, index) => {
      newIssues.push({
        start: Math.min(index * 100, text.length - 50),
        end: Math.min(index * 100 + 50, text.length),
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
          const lineIssues = issues.filter(issue => 
            issue.start <= lineIndex * 50 && issue.end >= lineIndex * 50
          );

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
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!analysisData || !analysisResult) {
    return (
      <div className="analysis-error">
        <AlertCircle className="error-icon" />
        <h2>No Analysis Data</h2>
        <p>Please start an analysis from the dashboard.</p>
        <button onClick={handleBackToDashboard} className="back-button">
          <ArrowLeft className="button-icon" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="analysis-page">
      <div className="analysis-header">
        <button onClick={handleBackToDashboard} className="back-button">
          <ArrowLeft className="button-icon" />
          Back to Dashboard
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

      <div className="analysis-content">
        <div className="analysis-sidebar">
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

              {/* ATS Optimization Section */}
              <div className="insights-card ats-card">
                <h3>ATS Optimization</h3>
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
                      {analysisResult.detailedAnalysis.achievements_analysis.quantifiable_achievements.slice(0, 3).map((achievement, index) => (
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
                        <h4>Detected Sections:</h4>
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
                        <h4>Missing Sections:</h4>
                        <div className="missing-sections">
                          {analysisResult.detailedAnalysis.section_analysis.missing_sections.map((section, index) => (
                            <span key={index} className="section-tag missing">{section}</span>
                          ))}
                        </div>
                      </div>
                    )}
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

              {showDetailed && analysisResult.detailedAnalysis.standalone_analysis && (
                <div className="insights-card">
                  <h3>Standalone Analysis</h3>
                  <div className="ats-metrics">
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
                      <span>Action Verbs</span>
                      <span className="metric-score">
                        {(analysisResult.detailedAnalysis.standalone_analysis.action_verb_score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="ats-metric">
                      <span>Experience Level</span>
                      <span className="metric-score">
                        {(analysisResult.detailedAnalysis.standalone_analysis.experience_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  {analysisResult.detailedAnalysis.standalone_analysis.found_skills.length > 0 && (
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
        </div>

        <div className="resume-section">
          <div className="resume-header">
            <FileText className="resume-icon" />
            <h2>{analysisData.selectedResume.fileName}</h2>
          </div>
          <div className="resume-container">
            {renderResumeWithIssues()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis; 