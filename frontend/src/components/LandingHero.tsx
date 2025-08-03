import { Upload, Target, Zap, ArrowRight, BarChart3, CheckCircle, Users, Shield, Search, Star, Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function LandingHero() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    setIsAuthenticated(!!(token && userData));
  }, []);

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const stats = [
    { 
      number: "50K+", 
      label: "Resumes Analyzed",
      icon: <BarChart3 className="w-6 h-6" />
    },
    { 
      number: "95%", 
      label: "Accuracy Rate",
      icon: <Star className="w-6 h-6" />
    },
    { 
      number: "30s", 
      label: "Analysis Time",
      icon: <Clock className="w-6 h-6" />
    },
    { 
      number: "10K+", 
      label: "Happy Users",
      icon: <TrendingUp className="w-6 h-6" />
    }
  ];

  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "AI-Powered Analysis",
      description: "Advanced algorithms analyze your resume against job requirements and industry standards.",
      highlights: ["Keyword optimization", "Skills gap analysis", "Industry benchmarking"]
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Detailed Insights",
      description: "Get comprehensive feedback on strengths, weaknesses, and specific improvement recommendations.",
      highlights: ["Score breakdown", "Actionable suggestions", "Progress tracking"]
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Interview Prep",
      description: "Practice with AI-generated questions tailored to your resume and target roles.",
      highlights: ["Role-specific questions", "AI feedback", "Confidence building"]
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Job Matching",
      description: "Find jobs that match your skills and get personalized recommendations.",
      highlights: ["Curated listings", "Resume-based matches", "Direct applications"]
    }
  ];

  const benefits = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Get your analysis in under 30 seconds"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Accurate Results",
      description: "95% accuracy rate in resume analysis"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Recruiter Insights",
      description: "See what recruiters actually look for"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy First",
      description: "Your data is encrypted and secure"
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Vet your Resume,
              <span className="hero-accent">Get Hired Faster.</span>
            </h1>
            <p className="hero-description">
              Upload your resume and job description. Let Vettly spot what recruiters are looking for — and what you're missing.
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <button 
                  onClick={handleDashboardClick}
                  className="btn-primary"
                >
                  <BarChart3 className="w-5 h-5" />
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button className="btn-primary">
                  Try Vettly for Free
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
              <button className="btn-secondary">See Demo</button>
            </div>
          </div>
        </div>
        <div className="scroll-indicator"></div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Everything You Need to Succeed</h2>
            <p className="section-subtitle">
              Our comprehensive suite of tools helps you create resumes that stand out
            </p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <ul className="feature-highlights">
                  {feature.highlights.map((highlight, i) => (
                    <li key={i}>
                      <CheckCircle className="w-4 h-4" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Vettly?</h2>
            <p className="section-subtitle">
              Join thousands of job seekers who've improved their resumes with our platform
            </p>
          </div>
          
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-icon">{benefit.icon}</div>
                <h3 className="benefit-title">{benefit.title}</h3>
                <p className="benefit-description">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-description">
            Join thousands of job seekers who've improved their resumes with Vettly.
          </p>
          {isAuthenticated ? (
            <button 
              onClick={handleDashboardClick}
              className="btn-primary btn-large"
            >
              <BarChart3 className="w-5 h-5" />
              Go to Dashboard
            </button>
          ) : (
            <button className="btn-primary btn-large">
              Start Your Analysis
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3 className="footer-brand">Vettly</h3>
              <p>AI-powered resume analysis to help you land your dream job.</p>
            </div>
            <div className="footer-section">
              <h4>Product</h4>
              <ul>
                <li><a href="#">Features</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">Demo</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Blog</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; 2024 Vettly. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingHero;