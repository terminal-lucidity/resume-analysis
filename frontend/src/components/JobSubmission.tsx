import React, { useState } from 'react';
import { Plus, Building2, MapPin, DollarSign, Briefcase, Clock, Send, CheckCircle } from 'lucide-react';
import './JobSubmission.css';

interface JobSubmissionForm {
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  skills: string[];
  level: string;
  type: string;
  remote: boolean;
  contactEmail?: string;
  applicationUrl?: string;
}

const JobSubmission: React.FC = () => {
  const [form, setForm] = useState<JobSubmissionForm>({
    title: '',
    company: '',
    location: '',
    description: '',
    salary: '',
    skills: [],
    level: 'mid',
    type: 'full_time',
    remote: false,
    contactEmail: '',
    applicationUrl: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof JobSubmissionForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillsChange = (skillsString: string) => {
    const skills = skillsString.split(',').map(skill => skill.trim()).filter(skill => skill);
    setForm(prev => ({ ...prev, skills }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/jobs/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setForm({
          title: '',
          company: '',
          location: '',
          description: '',
          salary: '',
          skills: [],
          level: 'mid',
          type: 'full_time',
          remote: false,
          contactEmail: '',
          applicationUrl: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit job');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="job-submission-success">
        <CheckCircle className="success-icon" />
        <h2>Job Posted Successfully!</h2>
        <p>Your job posting has been submitted and will be visible to all users.</p>
        <button 
          className="submit-another-button"
          onClick={() => setIsSubmitted(false)}
        >
          Post Another Job
        </button>
      </div>
    );
  }

  return (
    <div className="job-submission">
      <div className="job-submission-header">
        <h1>Post a Job</h1>
        <p>Share your job opportunity with our community - completely free!</p>
      </div>

      <form className="job-submission-form" onSubmit={handleSubmit}>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-section">
          <h3>Job Details</h3>
          
          <div className="form-group">
            <label htmlFor="title">Job Title *</label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Senior Frontend Developer"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="company">Company Name *</label>
              <input
                id="company"
                type="text"
                value={form.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="e.g., TechCorp Solutions"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                value={form.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., San Francisco, CA or Remote"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Job Description *</label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the role, responsibilities, and requirements..."
              rows={6}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salary">Salary Range</label>
              <input
                id="salary"
                type="text"
                value={form.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                placeholder="e.g., $80,000 - $120,000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="skills">Required Skills</label>
              <input
                id="skills"
                type="text"
                value={form.skills.join(', ')}
                onChange={(e) => handleSkillsChange(e.target.value)}
                placeholder="e.g., React, TypeScript, Node.js"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Job Requirements</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="level">Experience Level</label>
              <select
                id="level"
                value={form.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
              >
                <option value="entry">Entry Level</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="executive">Executive</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="type">Job Type</label>
              <select
                id="type"
                value={form.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.remote}
                onChange={(e) => handleInputChange('remote', e.target.checked)}
              />
              <span className="checkmark"></span>
              Remote work available
            </label>
          </div>
        </div>

        <div className="form-section">
          <h3>Application Details</h3>
          
          <div className="form-group">
            <label htmlFor="applicationUrl">Application URL</label>
            <input
              id="applicationUrl"
              type="url"
              value={form.applicationUrl}
              onChange={(e) => handleInputChange('applicationUrl', e.target.value)}
              placeholder="https://yourcompany.com/careers/apply"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contactEmail">Contact Email (Optional)</label>
            <input
              id="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              placeholder="hr@yourcompany.com"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Clock className="button-icon" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="button-icon" />
                Post Job
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobSubmission; 