import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, MapPin, Globe, Users, Star, Edit, Trash2, Briefcase, Calendar, DollarSign } from 'lucide-react';
import './CompanyTracker.css';

interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  description?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Application {
  id: string;
  position: string;
  status: string;
  appliedDate?: string;
  interviewDate?: string;
  salary?: string;
  location?: string;
  jobUrl?: string;
  notes?: string;
  createdAt: string;
  company: {
    id: string;
    name: string;
    website?: string;
    industry?: string;
    location?: string;
  };
}

const CompanyTracker: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showAddApplication, setShowAddApplication] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [newCompany, setNewCompany] = useState({
    name: '',
    website: '',
    industry: '',
    size: '',
    location: '',
    description: ''
  });

  const [newApplication, setNewApplication] = useState({
    companyId: '',
    position: '',
    jobDescription: '',
    salary: '',
    location: '',
    jobUrl: '',
    status: 'draft',
    appliedDate: '',
    notes: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/signin';
      return;
    }
    fetchData();
    
    // Check if this is the user's first visit to tracker
    const hasVisitedTracker = localStorage.getItem('hasVisitedTracker');
    if (!hasVisitedTracker) {
      setShowOnboarding(true);
      localStorage.setItem('hasVisitedTracker', 'true');
    }
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch companies
      const companiesResponse = await fetch('http://localhost:3000/api/companies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch applications
      const applicationsResponse = await fetch('http://localhost:3000/api/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!companiesResponse.ok || !applicationsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const companiesData = await companiesResponse.json();
      const applicationsData = await applicationsResponse.json();

      setCompanies(companiesData.companies);
      setApplications(applicationsData.applications);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/companies', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCompany)
      });

      if (!response.ok) {
        throw new Error('Failed to create company');
      }

      await response.json();
      setNewCompany({
        name: '',
        website: '',
        industry: '',
        size: '',
        location: '',
        description: ''
      });
      setShowAddCompany(false);
      fetchData();
    } catch (error) {
      console.error('Error creating company:', error);
      setError('Failed to create company');
    }
  };

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newApplication)
      });

      if (!response.ok) {
        throw new Error('Failed to create application');
      }

      await response.json();
      setNewApplication({
        companyId: '',
        position: '',
        jobDescription: '',
        salary: '',
        location: '',
        jobUrl: '',
        status: 'draft',
        appliedDate: '',
        notes: ''
      });
      setShowAddApplication(false);
      fetchData();
    } catch (error) {
      console.error('Error creating application:', error);
      setError('Failed to create application');
    }
  };

  const handleToggleFavorite = async (companyId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/companies/${companyId}/favorite`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      fetchData();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update favorite status');
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update application status');
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      draft: '#6b7280',
      applied: '#3b82f6',
      under_review: '#f59e0b',
      interview_scheduled: '#8b5cf6',
      interview_completed: '#10b981',
      offer_received: '#ef4444',
      offer_accepted: '#059669',
      rejected: '#dc2626',
      withdrawn: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleOnboardingNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowOnboarding(false);
    }
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <div className="company-tracker-loading">
        <div className="loading-spinner"></div>
        <p>Loading your company tracker...</p>
      </div>
    );
  }

  return (
    <div className="company-tracker">
      <div className="company-tracker-header">
        <div className="header-content">
          <div className="header-icon">
            <Building2 className="header-icon-svg" />
          </div>
          <div className="header-text">
            <h1>Company Tracker</h1>
            <p>Track your job applications and manage companies you're interested in.</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="add-company-btn"
            onClick={() => setShowAddCompany(true)}
          >
            <Plus className="btn-icon" />
            Add Company
          </button>
          <button
            className="add-application-btn"
            onClick={() => setShowAddApplication(true)}
          >
            <Briefcase className="btn-icon" />
            Add Application
          </button>
        </div>
      </div>

      <div className="company-tracker-content">
        {/* Companies Section */}
        <div className="companies-section">
          <div className="section-header">
            <h2>Companies ({companies.length})</h2>
          </div>
          
          {companies.length === 0 ? (
            <div className="empty-state">
              <Building2 className="empty-icon" />
              <h3>No companies yet</h3>
              <p>Add companies you're interested in to start tracking applications.</p>
              <button 
                onClick={() => setShowAddCompany(true)}
                className="empty-state-cta"
              >
                <Plus className="cta-icon" />
                Add Your First Company
              </button>
            </div>
          ) : (
            <div className="companies-grid">
              {companies.map((company) => (
                <div key={company.id} className="company-card">
                  <div className="company-card-header">
                    <div className="company-info">
                      <h3>{company.name}</h3>
                      {company.industry && (
                        <span className="company-industry">{company.industry}</span>
                      )}
                    </div>
                    <button
                      className={`favorite-btn ${company.isFavorite ? 'favorited' : ''}`}
                      onClick={() => handleToggleFavorite(company.id)}
                    >
                      <Star className="favorite-icon" />
                    </button>
                  </div>
                  
                  <div className="company-details">
                    {company.website && (
                      <div className="detail-item">
                        <Globe className="detail-icon" />
                        <a href={company.website} target="_blank" rel="noopener noreferrer">
                          {company.website}
                        </a>
                      </div>
                    )}
                    {company.location && (
                      <div className="detail-item">
                        <MapPin className="detail-icon" />
                        <span>{company.location}</span>
                      </div>
                    )}
                    {company.size && (
                      <div className="detail-item">
                        <Users className="detail-icon" />
                        <span>{company.size} employees</span>
                      </div>
                    )}
                  </div>
                  
                  {company.description && (
                    <p className="company-description">{company.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Applications Section */}
        <div className="applications-section">
          <div className="section-header">
            <h2>Applications ({applications.length})</h2>
            <div className="filters">
              <div className="search-box">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="status-filter"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="applied">Applied</option>
                <option value="under_review">Under Review</option>
                <option value="interview_scheduled">Interview Scheduled</option>
                <option value="interview_completed">Interview Completed</option>
                <option value="offer_received">Offer Received</option>
                <option value="offer_accepted">Offer Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="empty-state">
              <Briefcase className="empty-icon" />
              <h3>No applications yet</h3>
              <p>Start tracking your job applications to stay organized.</p>
              <button 
                onClick={() => setShowAddApplication(true)}
                className="empty-state-cta"
              >
                <Plus className="cta-icon" />
                Add Your First Application
              </button>
            </div>
          ) : (
            <div className="applications-list">
              {filteredApplications.map((application) => (
                <div key={application.id} className="application-card">
                  <div className="application-header">
                    <div className="application-info">
                      <h3>{application.position}</h3>
                      <p className="company-name">{application.company.name}</p>
                    </div>
                    <div className="application-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(application.status) }}
                      >
                        {application.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="application-details">
                    {application.salary && (
                      <div className="detail-item">
                        <DollarSign className="detail-icon" />
                        <span>{application.salary}</span>
                      </div>
                    )}
                    {application.location && (
                      <div className="detail-item">
                        <MapPin className="detail-icon" />
                        <span>{application.location}</span>
                      </div>
                    )}
                    {application.appliedDate && (
                      <div className="detail-item">
                        <Calendar className="detail-icon" />
                        <span>Applied: {formatDate(application.appliedDate)}</span>
                      </div>
                    )}
                  </div>
                  
                  {application.notes && (
                    <p className="application-notes">{application.notes}</p>
                  )}
                  
                  <div className="application-actions">
                    <select
                      value={application.status}
                      onChange={(e) => handleUpdateApplicationStatus(application.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="draft">Draft</option>
                      <option value="applied">Applied</option>
                      <option value="under_review">Under Review</option>
                      <option value="interview_scheduled">Interview Scheduled</option>
                      <option value="interview_completed">Interview Completed</option>
                      <option value="offer_received">Offer Received</option>
                      <option value="offer_accepted">Offer Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Company Modal */}
      {showAddCompany && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Company</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddCompany(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddCompany} className="modal-form">
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                  required
                  placeholder="Enter company name"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    value={newCompany.website}
                    onChange={(e) => setNewCompany({...newCompany, website: e.target.value})}
                    placeholder="https://company.com"
                  />
                </div>
                <div className="form-group">
                  <label>Industry</label>
                  <input
                    type="text"
                    value={newCompany.industry}
                    onChange={(e) => setNewCompany({...newCompany, industry: e.target.value})}
                    placeholder="e.g., Technology, Healthcare"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={newCompany.location}
                    onChange={(e) => setNewCompany({...newCompany, location: e.target.value})}
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
                <div className="form-group">
                  <label>Company Size</label>
                  <select
                    value={newCompany.size}
                    onChange={(e) => setNewCompany({...newCompany, size: e.target.value})}
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newCompany.description}
                  onChange={(e) => setNewCompany({...newCompany, description: e.target.value})}
                  placeholder="Brief description of the company..."
                  rows={3}
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddCompany(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Application Modal */}
      {showAddApplication && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Application</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddApplication(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddApplication} className="modal-form">
              <div className="form-group">
                <label>Company *</label>
                <select
                  value={newApplication.companyId}
                  onChange={(e) => setNewApplication({...newApplication, companyId: e.target.value})}
                  required
                >
                  <option value="">Select a company</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Position *</label>
                <input
                  type="text"
                  value={newApplication.position}
                  onChange={(e) => setNewApplication({...newApplication, position: e.target.value})}
                  required
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Salary</label>
                  <input
                    type="text"
                    value={newApplication.salary}
                    onChange={(e) => setNewApplication({...newApplication, salary: e.target.value})}
                    placeholder="e.g., $120,000 - $150,000"
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={newApplication.location}
                    onChange={(e) => setNewApplication({...newApplication, location: e.target.value})}
                    placeholder="e.g., Remote, San Francisco"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Job URL</label>
                <input
                  type="url"
                  value={newApplication.jobUrl}
                  onChange={(e) => setNewApplication({...newApplication, jobUrl: e.target.value})}
                  placeholder="https://company.com/careers/job"
                />
              </div>
              
              <div className="form-group">
                <label>Applied Date</label>
                <input
                  type="date"
                  value={newApplication.appliedDate}
                  onChange={(e) => setNewApplication({...newApplication, appliedDate: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={newApplication.notes}
                  onChange={(e) => setNewApplication({...newApplication, notes: e.target.value})}
                  placeholder="Any notes about this application..."
                  rows={3}
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddApplication(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="modal-overlay">
          <div className="modal-content onboarding-modal">
            <div className="onboarding-header">
              <h2>Welcome to Company Tracker! 🎉</h2>
              <p>Let's get you started with tracking your job applications</p>
            </div>
            
            <div className="onboarding-steps">
              {currentStep === 1 && (
                <div className="onboarding-step">
                  <div className="step-icon">🏢</div>
                  <h3>Step 1: Add Companies</h3>
                  <p>Start by adding companies you're interested in working for. You can include details like industry, location, and company size.</p>
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="onboarding-step">
                  <div className="step-icon">📝</div>
                  <h3>Step 2: Track Applications</h3>
                  <p>For each company, add your job applications and track their status from draft to offer received.</p>
                </div>
              )}
              
              {currentStep === 3 && (
                <div className="onboarding-step">
                  <div className="step-icon">📊</div>
                  <h3>Step 3: Stay Organized</h3>
                  <p>Use search and filters to manage your applications, and keep track of your progress throughout your job search.</p>
                </div>
              )}
            </div>
            
            <div className="onboarding-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
              <span className="progress-text">{currentStep} of 3</span>
            </div>
            
            <div className="onboarding-actions">
              <button 
                className="skip-btn"
                onClick={handleOnboardingSkip}
              >
                Skip Tour
              </button>
              <button 
                className="next-btn"
                onClick={handleOnboardingNext}
              >
                {currentStep === 3 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyTracker; 