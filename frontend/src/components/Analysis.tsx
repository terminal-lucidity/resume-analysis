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
  };
}

const Analysis: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailed, setShowDetailed] = useState(false);
  const [resumeText, setResumeText] = useState<string>('');
  const [issues, setIssues] = useState<Array<{start: number, end: number, message: string}>>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/signin';
      return;
    }

    const storedData = localStorage.getItem('analysisData');
    if (!storedData) {
      window.location.href = '/dashboard';
      return;
    }

    try {
      const data = JSON.parse(storedData);
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
      const token = localStorage.getItem('token');
      
      // First, get the resume text from the database
      const resumeResponse = await fetch(`http://localhost:3000/api/resumes/${data.resumeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!resumeResponse.ok) {
        throw new Error('Failed to fetch resume');
      }

      const resumeData = await resumeResponse.json();
      const resumeText = resumeData.originalText || '';
      setResumeText(resumeText);

      // Perform the analysis
      const analysisResponse = await fetch('http://localhost:3000/api/analyze/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resumeText,
          jobTitle: data.jobTitle,
          jobDescription: data.jobDescription,
          jobLevel: data.jobLevel
        })
      });

      if (!analysisResponse.ok) {
        throw new Error('Analysis failed');
      }

      const result = await analysisResponse.json();
      setAnalysisResult(result);
      
      // Generate issues based on analysis
      generateIssues(resumeText, result);
      
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