import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Building2, Briefcase, DollarSign, Clock, Star, Filter, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';
import './JobSearch.css';

interface Job {
  id: string;
  title: string;
  description: string;
  company: {
    id: string;
    name: string;
    website?: string;
    industry?: string;
    location?: string;
  };
  level: string;
  type: string;
  location?: string;
  salary?: string;
  remote?: boolean;
  skills?: string[];
  benefits?: string[];
  postedDate?: string;
  applicationUrl?: string;
}

interface JobSearchProps {
  onJobSelect?: (job: Job) => void;
}

const JobSearch: React.FC<JobSearchProps> = ({ onJobSelect }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommendations, setRecommendations] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    level: '',
    type: '',
    location: '',
    remote: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'recommendations'>('recommendations');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  // Refs for animations
  const headerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const jobsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/signin';
      return;
    }

    fetchRecommendations();
    fetchSavedJobs();

    // Add scroll animations
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
      searchRef.current,
      jobsRef.current
    ].filter(Boolean);

    elementsToObserve.forEach((element) => {
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      elementsToObserve.forEach((element) => {
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'search' && searchTerm) {
      fetchJobs();
    }
  }, [searchTerm, filters, activeTab]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        search: searchTerm,
        ...filters,
        limit: '20',
      });

      const response = await fetch(`/api/jobs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/jobs/recommendations?limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.jobs);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      setSavedJobs(JSON.parse(saved));
    }
  };

  const handleSaveJob = (jobId: string) => {
    const newSavedJobs = savedJobs.includes(jobId)
      ? savedJobs.filter(id => id !== jobId)
      : [...savedJobs, jobId];
    
    setSavedJobs(newSavedJobs);
    localStorage.setItem('savedJobs', JSON.stringify(newSavedJobs));
  };

  const handleJobClick = (job: Job) => {
    if (onJobSelect) {
      onJobSelect(job);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays < 7) return `${diffDays - 1} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getLevelColor = (level: string) => {
    const colors = {
      entry: 'bg-green-100 text-green-800',
      junior: 'bg-blue-100 text-blue-800',
      mid: 'bg-yellow-100 text-yellow-800',
      senior: 'bg-orange-100 text-orange-800',
      lead: 'bg-purple-100 text-purple-800',
      executive: 'bg-red-100 text-red-800',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      full_time: 'bg-blue-100 text-blue-800',
      part_time: 'bg-green-100 text-green-800',
      contract: 'bg-yellow-100 text-yellow-800',
      internship: 'bg-purple-100 text-purple-800',
      freelance: 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const currentJobs = activeTab === 'search' ? jobs : recommendations;

  return (
    <div className="job-search">
                    <div className="job-search-header" ref={headerRef}>
                <div className="job-search-welcome">
                  <h1>Job Discovery</h1>
                  <p>AI-powered matching for your next career opportunity</p>
                </div>
              </div>

      <div className="job-search-content">
        <div className="job-search-sidebar" ref={searchRef}>
          <div className="search-section">
            <div className="search-input-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search jobs, companies, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <button
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="filter-icon" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <label>Job Level</label>
                <select
                  value={filters.level}
                  onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                >
                  <option value="">All Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="executive">Executive</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Job Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <option value="">All Types</option>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

                                        <div className="filter-group">
                            <label>Location</label>
                            <input
                              type="text"
                              placeholder="City, State, or Remote"
                              value={filters.location}
                              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                            />
                          </div>
                          <div className="filter-group">
                            <label>Remote Only</label>
                            <label htmlFor="remote-toggle" className="toggle-switch">
                              <input
                                id="remote-toggle"
                                type="checkbox"
                                checked={filters.remote}
                                onChange={(e) => setFilters({ ...filters, remote: e.target.checked })}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
            </div>
          )}

          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'recommendations' ? 'active' : ''}`}
              onClick={() => setActiveTab('recommendations')}
            >
              <Star className="tab-icon" />
              Recommendations
            </button>
            <button
              className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              <Search className="tab-icon" />
              Search Jobs
            </button>
          </div>
        </div>

        <div className="jobs-section" ref={jobsRef}>
          {isLoading ? (
                                    <div className="loading-state">
                          <div className="loading-spinner"></div>
                          <p>Finding jobs for you...</p>
                        </div>
          ) : (
            <>
                                        <div className="jobs-header">
                            <h2>
                              {activeTab === 'recommendations' ? 'Recommended for You' : 'Search Results'}
                            </h2>
                            <span className="job-count">{currentJobs.length} jobs found</span>
                          </div>

              <div className="jobs-list">
                {currentJobs.length === 0 ? (
                                                <div className="empty-state">
                                <Search className="empty-icon" />
                                <h3>No jobs found</h3>
                                <p>
                                  {activeTab === 'recommendations'
                                    ? 'Upload a resume to get personalized recommendations'
                                    : 'Try adjusting your search criteria'
                                  }
                                </p>
                              </div>
                ) : (
                  currentJobs.map((job) => (
                    <div key={job.id} className="job-card" onClick={() => handleJobClick(job)}>
                      <div className="job-card-header">
                        <div className="job-title-section">
                          <h3 className="job-title">{job.title}</h3>
                          <div className="job-company">
                            <Building2 className="company-icon" />
                            <span>{job.company.name}</span>
                          </div>
                        </div>
                        <button
                          className="save-job-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveJob(job.id);
                          }}
                        >
                          {savedJobs.includes(job.id) ? (
                            <BookmarkCheck className="save-icon saved" />
                          ) : (
                            <Bookmark className="save-icon" />
                          )}
                        </button>
                      </div>

                      <div className="job-meta">
                        <div className="job-badges">
                          <span className={`job-badge level ${getLevelColor(job.level)}`}>
                            {job.level.replace('_', ' ')}
                          </span>
                          <span className={`job-badge type ${getTypeColor(job.type)}`}>
                            {job.type.replace('_', ' ')}
                          </span>
                          {job.remote && (
                            <span className="job-badge remote">Remote</span>
                          )}
                        </div>

                        <div className="job-details">
                          {job.location && (
                            <div className="job-detail">
                              <MapPin className="detail-icon" />
                              <span>{job.location}</span>
                            </div>
                          )}
                          {job.salary && (
                            <div className="job-detail">
                              <DollarSign className="detail-icon" />
                              <span>{job.salary}</span>
                            </div>
                          )}
                          {job.postedDate && (
                            <div className="job-detail">
                              <Clock className="detail-icon" />
                              <span>{formatDate(job.postedDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="job-description">
                        {job.description.length > 200
                          ? `${job.description.substring(0, 200)}...`
                          : job.description
                        }
                      </div>

                      {job.skills && job.skills.length > 0 && (
                        <div className="job-skills">
                          {job.skills.slice(0, 5).map((skill, index) => (
                            <span key={index} className="skill-tag">
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 5 && (
                            <span className="skill-tag more">
                              +{job.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="job-actions">
                        {job.applicationUrl && (
                          <a
                            href={job.applicationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="apply-button"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="apply-icon" />
                            Apply Now
                          </a>
                        )}
                        <button className="view-details-button">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobSearch; 