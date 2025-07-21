import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Eye, Plus, CheckCircle, AlertCircle } from 'lucide-react';
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    setUploadProgress(0);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const response = await fetch('http://localhost:3000/api/resumes/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      
      // Refresh resumes list
      await fetchResumes();
      
      // Reset form
      setSelectedFile(null);
      setUploadProgress(0);
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
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
        throw new Error('Failed to delete resume');
      }

      await fetchResumes();
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete resume');
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
        throw new Error('Failed to activate resume');
      }

      await fetchResumes();
    } catch (error) {
      console.error('Activate error:', error);
      setError('Failed to activate resume');
    }
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
        {/* Upload Section */}
        <div className="upload-section">
          <div className="upload-card">
            <div className="upload-header">
              <Upload className="upload-icon" />
              <h2>Upload Resume</h2>
              <p>Upload your resume in PDF or DOCX format to get started</p>
            </div>

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
                  <Plus className="upload-plus-icon" />
                  <span>Choose a file or drag it here</span>
                  <span className="upload-hint">PDF, DOCX up to 10MB</span>
                </div>
              </label>

              {selectedFile && (
                <div className="selected-file">
                  <FileText className="file-icon" />
                  <span>{selectedFile.name}</span>
                  <span className="file-size">({formatFileSize(selectedFile.size)})</span>
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
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="button-icon" />
                    Upload Resume
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Resumes List */}
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
            </div>
          ) : (
            <div className="resumes-grid">
              {resumes.map((resume) => (
                <div key={resume.id} className={`resume-card ${resume.isActive ? 'active' : ''}`}>
                  <div className="resume-header">
                    <div className="resume-info">
                      <FileText className="resume-icon" />
                      <div>
                        <h3>{resume.fileName}</h3>
                        <p className="resume-meta">
                          {formatFileSize(resume.fileSize)} • {formatDate(resume.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="resume-status">
                      {resume.isActive && <CheckCircle className="active-icon" />}
                    </div>
                  </div>

                  <div className="resume-actions">
                    {!resume.isActive && (
                      <button
                        onClick={() => handleActivate(resume.id)}
                        className="action-button activate"
                      >
                        Set as Active
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="action-button delete"
                    >
                      <Trash2 className="action-icon" />
                    </button>
                  </div>

                  {resume.hasAnalysis && (
                    <div className="analysis-badge">
                      <span>Analysis Available</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 