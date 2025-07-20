import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      setError('No token found in URL.');
    }
  }, [navigate]);

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>OAuth Sign-in Failed</h2>
        <p>{error}</p>
        <a href="/signin" style={{ color: '#667eea', textDecoration: 'underline' }}>Back to Sign In</a>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <svg
        className="auth-spinner"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginBottom: '1rem', color: '#667eea' }}
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
      <h2>Signing you in...</h2>
      <p>You will be redirected shortly.</p>
    </div>
  );
};

export default OAuthSuccess; 