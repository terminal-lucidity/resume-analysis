import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Plus, CheckCircle, AlertCircle, Search, ArrowRight } from 'lucide-react';
import './Dashboard.css';

interface Resume {
  id: string;
  fileName: string;
  isActive: boolean;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
  hasAnalysis: boolean;
}

interface UserData {
  id: string;
  email: string;
  name?: string;
}

const Dashboard: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showJobAnalysis, setShowJobAnalysis] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [jobLevel, setJobLevel] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      window.location.href = '/signin';
      return;
    }

    try {
      setUser(JSON.parse(userData));
      fetchResumes();
    } catch (error) {
      console.error('Error parsing user data:', error);
      window.location.href = '/signin';
    }
  }, []);

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/resumes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resumes');
      }

      const data = await response.json();
      setResumes(data.resumes);
      
      // Set the first active resume as selected, or the first resume if none are active
      const activeResume = data.resumes.find((r: Resume) => r.isActive);
      if (activeResume) {
        setSelectedResumeId(activeResume.id);
      } else if (data.resumes.length > 0) {
        setSelectedResumeId(data.resumes[0].id);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
      setError('Failed to load resumes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a PDF or DOCX file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/resumes/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      await response.json();
      setSelectedFile(null);
      fetchResumes(); // Refresh the resumes list
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/resumes/${resumeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      fetchResumes(); // Refresh the resumes list
    } catch (error) {
      console.error('Delete error:', error);
      setError('Delete failed. Please try again.');
    }
  };

  const handleActivate = async (resumeId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/resumes/${resumeId}/activate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Activation failed');
      }

      fetchResumes(); // Refresh the resumes list
    } catch (error) {
      console.error('Activation error:', error);
      setError('Activation failed. Please try again.');
    }
  };

  const handleAnalyzeJob = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedResumeId) {
      setShowResumeModal(true);
      return;
    }
    
    if (!jobTitle || !jobLevel) {
      alert('Please fill in all required fields: Job Title and Job Level');
      return;
    }
    
    setAnalysisLoading(true);
    
    // Navigate to analysis page with the data
    const analysisData = {
      resumeId: selectedResumeId,
      jobTitle,
      jobDescription,
      jobLevel,
      selectedResume: resumes.find(r => r.id === selectedResumeId)
    };
    
    // Store analysis data in localStorage for the analysis page
    console.log('Storing analysis data:', analysisData);
    localStorage.setItem('analysisData', JSON.stringify(analysisData));
    
    // Navigate to analysis page
    console.log('Navigating to analysis page...');
    window.location.href = '/analysis';
  };

  const handleViewAnalysis = (resumeId: string) => {
    console.log('handleViewAnalysis called with resumeId:', resumeId);
    
    // Set the selected resume
    setSelectedResumeId(resumeId);
    
    // Navigate to analysis page with the resume data
    const selectedResume = resumes.find(r => r.id === resumeId);
    const analysisData = {
      resumeId: resumeId,
      jobTitle: 'General Resume Analysis', // Default title for existing analysis
      jobDescription: 'Viewing existing resume analysis', // Default description
      jobLevel: 'Any Level', // Default level
      selectedResume: selectedResume
    };
    
    // Store analysis data in localStorage for the analysis page
    console.log('Storing analysis data for existing resume:', analysisData);
    localStorage.setItem('analysisData', JSON.stringify(analysisData));
    
    // Navigate to analysis page
    console.log('Navigating to analysis page...');
    window.location.href = '/analysis';
  };

  const handleResumeSelect = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    setShowResumeModal(false);
  };

  const handleResumeSelectFromSidebar = (resumeId: string) => {
    setSelectedResumeId(resumeId);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <h1>Welcome back, {user?.name || user?.email?.split('@')[0] || 'User'}!</h1>
          <p>Manage your resumes and get insights to improve your job applications.</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-panel">
          {/* Column 1: Info Section (Upload or Analyze) */}
          <div className="upload-info-section">
            {showJobAnalysis ? (
              <div className="job-analysis-header">
                <div className="job-analysis-icon-container">
                  <Search className="job-analysis-icon" />
                </div>
                <h2>Analyze for a Job</h2>
                <p>Paste a job description or enter a job title to get tailored resume insights.</p>
              </div>
            ) : (
              <div className="upload-header">
                <div className="upload-icon-container">
                  <Upload className="upload-icon" />
                </div>
                <h2>Upload Resume</h2>
                <p>Upload your resume in PDF or DOCX format to get started</p>
              </div>
            )}
          </div>

          {/* Column 2: Upload or Job Analysis Form, conditional */}
          <div className="upload-action-section">
            {(!showJobAnalysis) ? (
              <div className="upload-area">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileSelect}
                  className="file-input"
                  disabled={isUploading}
                />
                <label htmlFor="resume-upload" className="upload-label">
                  <div className="upload-placeholder">
                    <div className="upload-placeholder-content">
                      <Plus className="upload-plus-icon" />
                      <span className="upload-text">Drop your resume here or click to browse</span>
                      <span className="upload-hint">PDF, DOCX up to 10MB</span>
                    </div>
                  </div>
                </label>

                {selectedFile && (
                  <div className="selected-file">
                    <FileText className="file-icon" />
                    <div className="file-info">
                      <span className="file-name">{selectedFile.name}</span>
                      <span className="file-size">({formatFileSize(selectedFile.size)})</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="upload-error">
                    <AlertCircle className="error-icon" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="upload-button"
                >
                  {isUploading ? (
                    <>
                      <div className="upload-spinner"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="button-icon" />
                      <span>Upload Resume</span>
                    </>
                  )}
                </button>
                {/* Show Analyze for a Job button if resumes exist */}
                {resumes.length > 0 && (
                  <button
                    className="analyze-job-toggle"
                    type="button"
                    onClick={() => setShowJobAnalysis(true)}
                  >
                    <Search className="button-icon" />
                    Analyze for a Job
                  </button>
                )}
              </div>
            ) : (
              <div className="job-analysis-form-panel">
                <button
                  className="go-back-button"
                  type="button"
                  onClick={() => setShowJobAnalysis(false)}
                >
                  ← Go Back
                </button>
                <form className="job-analysis-form" onSubmit={handleAnalyzeJob}>
                  <input
                    type="text"
                    className="job-title-input"
                    placeholder="Job Title *"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    disabled={analysisLoading}
                    required
                  />
                  
                  <select
                    className="job-level-select"
                    value={jobLevel}
                    onChange={(e) => setJobLevel(e.target.value)}
                    required
                  >
                    <option value="">Select Job Level *</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="lead">Lead</option>
                    <option value="manager">Manager</option>
                    <option value="director">Director</option>
                    <option value="executive">Executive</option>
                  </select>
                  
                  <textarea
                    className="job-description-textarea"
                    placeholder="Job Description (optional)"
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                    rows={6}
                    disabled={analysisLoading}
                  />
                  
                  <button
                    type="submit"
                    className="analyze-button"
                    disabled={analysisLoading || !jobTitle || !jobLevel}
                  >
                    {analysisLoading ? (
                      <>
                        <div className="analyze-spinner"></div>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Search className="button-icon" />
                        <span>Analyze Resume</span>
                        <ArrowRight className="button-icon" />
                      </>
                    )}
                  </button>
                </form>

              </div>
            )}
          </div>

          {/* Column 3: Previous Resumes */}
          <div className="resumes-section">
            <div className="resumes-header">
              <h2>Your Resumes</h2>
              <span className="resume-count">{resumes.length} resume{resumes.length !== 1 ? 's' : ''}</span>
            </div>

            {resumes.length === 0 ? (
              <div className="empty-state">
                <FileText className="empty-icon" />
                <h3>No resumes yet</h3>
                <p>Upload your first resume to get started with analysis and insights.</p>
                <button 
                  onClick={() => document.getElementById('resume-upload')?.click()}
                  className="empty-state-cta"
                >
                  <Plus className="cta-icon" />
                  Upload Your First Resume
                </button>
              </div>
            ) : (
              <div className="resumes-list">
                {resumes.map((resume) => (
                  <div 
                    key={resume.id} 
                    className={`resume-item ${resume.isActive ? 'active' : ''} ${selectedResumeId === resume.id ? 'selected' : ''}`}
                    onClick={() => handleResumeSelectFromSidebar(resume.id)}
                  >
                    <div className="resume-item-header">
                      <div className="resume-item-info">
                        <FileText className="resume-item-icon" />
                        <div>
                          <h4>{resume.fileName}</h4>
                          <p className="resume-item-meta">
                            {formatFileSize(resume.fileSize)} • {formatDate(resume.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="resume-item-status">
                        <div className="status-indicators">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!resume.isActive) {
                                handleActivate(resume.id);
                              }
                            }}
                            className={`active-toggle ${resume.isActive ? 'active' : 'inactive'}`}
                            title={resume.isActive ? 'Active Resume' : 'Set as Active'}
                          >
                            <CheckCircle className="active-icon" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(resume.id);
                            }}
                            className="delete-toggle"
                            title="Delete Resume"
                          >
                            <Trash2 className="delete-icon" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {resume.hasAnalysis && (
                      <button
                        className="analysis-badge"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewAnalysis(resume.id);
                        }}
                      >
                        <span>Analysis Available</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resume Selection Modal */}
      {showResumeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Select a Resume</h3>
              <button 
                className="modal-close"
                onClick={() => setShowResumeModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {resumes.length === 0 ? (
                <p>No resumes available. Please upload a resume first.</p>
              ) : (
                <div className="resume-selection-list">
                  {resumes.map((resume) => (
                    <div 
                      key={resume.id} 
                      className="resume-selection-item"
                      onClick={() => handleResumeSelect(resume.id)}
                    >
                      <FileText className="resume-icon" />
                      <div className="resume-info">
                        <h4>{resume.fileName}</h4>
                        <p>{formatFileSize(resume.fileSize)} • {formatDate(resume.createdAt)}</p>
                      </div>
                      {resume.isActive && <CheckCircle className="active-icon" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;