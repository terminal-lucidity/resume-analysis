import React from 'react';
import './Features.css';
import { 
  Target, 
  Zap, 
  CheckCircle, 
  BarChart3, 
  Users, 
  Shield,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Features: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem('token') && localStorage.getItem('user'));
  
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
    // {
    //   step: 'Step 5',
    //   icon: Upload,
    //   title: "Smart Resume Upload",
    //   description: "Upload your resume in any format - PDF, DOC, DOCX. Our AI extracts and analyzes every detail automatically.",
    //   benefits: ["Drag & drop interface", "Multiple file formats", "Instant text extraction"]
    // }
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
    <div className="features-section">
      <div className="features-container">
        {/* Hero Section */}
        <section style={{paddingTop: '2rem', paddingBottom: '1rem'}}>
          <h1 className="features-title">
            Powerful Features for
            <span style={{color: '#6366f1', display: 'block'}}>Resume Success</span>
          </h1>
          <p className="features-subtitle">
            Everything you need to create a winning resume that gets you noticed by recruiters and lands you interviews.
          </p>
          <div className="features-stats">
            {stats.map((stat, index) => (
              <div key={index} className="features-stat-card">
                <div className="features-stat-number">{stat.number}</div>
                <div className="features-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Features */}
        <section>
          <h2 className="features-title">Everything You Need to Succeed</h2>
          <p className="features-subtitle">Our comprehensive suite of tools helps you create resumes that stand out</p>
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
        </section>

        {/* Key Benefits */}
        <section style={{marginTop: '3rem'}}>
          <h2 className="features-title" style={{fontSize: '2rem', marginBottom: '1rem'}}>Why Choose Vettly?</h2>
          <p className="features-subtitle" style={{marginBottom: '2.5rem'}}>Join thousands of job seekers who've improved their resumes with our platform</p>
          <div className="features-cards" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
            {keyBenefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="features-card" style={{padding: '2rem 1.5rem'}}>
                  <div className="features-icon" style={{width: '2.5rem', height: '2.5rem'}}>
                    <IconComponent size={24} />
                  </div>
                  <h3 className="features-title-card">{benefit.title}</h3>
                  <p className="features-desc">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Features;