import { Upload, Target, Zap, ArrowRight, BarChart3, CheckCircle, Users, Shield, Search } from "lucide-react";
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

  const mainFeatures = [
    {
      step: 'Step 1',
      icon: Target,
      title: "AI-Powered Analysis",
      description: "Advanced AI algorithms analyze your resume against job requirements and industry standards.",
      benefits: ["Keyword optimization", "Skills gap analysis", "Industry benchmarking"]
    },
    {
      step: 'Step 2',
      icon: BarChart3,
      title: "Detailed Insights",
      description: "Get comprehensive feedback on strengths, weaknesses, and specific improvement recommendations.",
      benefits: ["Score breakdown", "Actionable suggestions", "Progress tracking"]
    },
    {
      step: 'Step 3',
      icon: Users,
      title: "Interview Prep",
      description: "Practice with AI-generated interview questions tailored to your resume and target roles. Get tips and feedback to boost your confidence.",
      benefits: ["Role-specific questions", "AI feedback", "Confidence building"]
    },
    {
      step: 'Step 4',
      icon: Search,
      title: "Personalized Job Matching",
      description: "We help you find jobs that match your resume and skills, connecting you with opportunities tailored to your profile.",
      benefits: ["Curated job listings", "Resume-based recommendations", "Direct application links"]
    },
  ];

  const keyBenefits = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get your analysis in under 30 seconds"
    },
    {
      icon: CheckCircle,
      title: "Accurate Results",
      description: "95% accuracy rate in resume analysis"
    },
    {
      icon: Users,
      title: "Recruiter Insights",
      description: "See what recruiters actually look for"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data is encrypted and secure"
    }
  ];

  const stats = [
    { number: "50K+", label: "Resumes Analyzed" },
    { number: "95%", label: "Accuracy Rate" },
    { number: "30s", label: "Average Analysis Time" },
    { number: "10K+", label: "Happy Users" }
  ];

  return (
    <div>
      {/* Hero Section */}
      <main className="hero-background section-hero text-center">
        <div className="container">
          <h1 className="heading-primary mb-lg">
            Vet your Resume,
            <span className="heading-accent block">Get Hired Faster.</span>
          </h1>
          <p className="text-large mb-xl max-w-2xl mx-auto">
            Upload your resume and job description. Let Vettly spot what recruiters are looking for — and what you're missing.
          </p>
          <div className="btn-group flex flex-wrap justify-center gap-md">
            {isAuthenticated ? (
              <button 
                onClick={handleDashboardClick}
                className="btn btn-primary btn-large flex items-center gap-sm group"
              >
                <BarChart3 className="w-5 h-5" />
                Go to Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button className="btn btn-primary btn-large flex items-center gap-sm group">
                Try Vettly for Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            <button className="btn btn-secondary btn-large">See Demo</button>
          </div>
        </div>
      </main>

      {/* Stats Section */}
      <section className="section bg-white dark:bg-gray-900">
        <div className="container">
          <div className="features-stats">
            {stats.map((stat, index) => (
              <div key={index} className="features-stat-card">
                <div className="features-stat-number">{stat.number}</div>
                <div className="features-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="section bg-gray-50 dark:bg-gray-800">
        <div className="container">
          <div className="text-center mb-xl max-w-2xl mx-auto">
            <h2 className="heading-secondary mb-md">Everything You Need to Succeed</h2>
            <p className="text-large">
              Our comprehensive suite of tools helps you create resumes that stand out
            </p>
          </div>

          <div className="features-steps-flow">
            {mainFeatures.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={idx}
                  className={`features-step-card${idx === 0 ? ' clickable' : ''}`}
                  onClick={idx === 0 ? () => navigate(isAuthenticated ? '/dashboard' : '/signin') : undefined}
                >
                  <div className="features-icon">
                    <IconComponent size={28} />
                  </div>
                  <h3 className="step-title">{feature.title}</h3>
                  <p className="step-desc">{feature.description}</p>
                  <ul className="step-benefits">
                    {feature.benefits.map((b, i) => (
                      <li key={i}>
                        <CheckCircle size={18} /> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="section bg-white dark:bg-gray-900">
        <div className="container">
          <div className="text-center mb-xl max-w-2xl mx-auto">
            <h2 className="heading-secondary mb-md">Why Choose Vettly?</h2>
            <p className="text-large">
              Join thousands of job seekers who've improved their resumes with our platform
            </p>
          </div>

          <div className="benefits-grid">
            {keyBenefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="benefit-card">
                  <div className="benefit-icon">
                    <IconComponent size={28} />
                  </div>
                  <h3 className="benefit-title">{benefit.title}</h3>
                  <p className="benefit-desc">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2 className="text-4xl font-bold mb-md">Ready to Get Started?</h2>
          <p className="text-xl mb-xl max-w-2xl mx-auto">
            Join thousands of job seekers who've improved their resumes with Vettly.
          </p>
          {isAuthenticated ? (
            <button 
              onClick={handleDashboardClick}
              className="btn btn-primary btn-large flex items-center gap-sm mx-auto"
            >
              <BarChart3 className="w-5 h-5" />
              Go to Dashboard
            </button>
          ) : (
            <button className="btn btn-primary btn-large">Start Your Analysis</button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3 className="text-xl font-bold text-blue-400 mb-md">Vettly</h3>
              <p>
                AI-powered resume analysis to help you land your dream job.
              </p>
            </div>
            <div className="footer-section">
              <h4 className="mb-md">Product</h4>
              <ul className="space-y-2">
                <li><a href="#">Features</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">Demo</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="mb-md">Company</h4>
              <ul className="space-y-2">
                <li><a href="#">About</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Blog</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="mb-md">Support</h4>
              <ul className="space-y-2">
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