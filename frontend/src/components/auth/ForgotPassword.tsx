import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

interface ForgotPasswordFormData {
  email: string;
}

interface FormErrors {
  email?: string;
  general?: string;
}

const ForgotPassword: React.FC = () => {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({}); // Clear any previous errors
    
    try {
      // TODO: Implement actual password reset API call
      // For now, just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (isSubmitted) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="auth-title">Check Your Email</h1>
            <p className="auth-subtitle">We've sent you a password reset link</p>
          </div>

          <div className="auth-form">
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.5' }}>
                We've sent a password reset link to <strong>{formData.email}</strong>
              </p>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/signin" className="auth-secondary-button">
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter your email to receive a reset link</p>
        </div>

        <div className="auth-form">
          <form onSubmit={handleSubmit} noValidate>
            {errors.general && (
              <div className="auth-error-general">
                <svg className="auth-error-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{errors.general}</span>
              </div>
            )}

            <div className="auth-form-group">
              <label htmlFor="email" className="auth-label">
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`auth-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email"
                />
                <svg className="auth-input-icon" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              {errors.email && (
                <p className="auth-error">{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="auth-button"
            >
              {isLoading ? (
                <>
                  <svg
                    className="auth-spinner"
                    width="20"
                    height="20"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span className="auth-divider-text">Remember your password?</span>
          </div>

          <Link to="/signin" className="auth-secondary-button">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 