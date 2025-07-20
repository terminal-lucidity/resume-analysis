import React from 'react';
import './Features.css';
import { 
  Upload, 
  Target, 
  Zap, 
  CheckCircle, 
  BarChart3, 
  FileText, 
  Users, 
  Shield
} from 'lucide-react';

const Features: React.FC = () => {
  const mainFeatures = [
    {
      icon: <div className="features-icon"><Upload /></div>,
      title: "Smart Resume Upload",
      description: "Upload your resume in any format - PDF, DOC, DOCX. Our AI extracts and analyzes every detail automatically.",
      benefits: ["Drag & drop interface", "Multiple file formats", "Instant text extraction"]
    },
    {
      icon: <div className="features-icon"><Target /></div>,
      title: "AI-Powered Analysis",
      description: "Advanced AI algorithms analyze your resume against job requirements and industry standards.",
      benefits: ["Keyword optimization", "Skills gap analysis", "Industry benchmarking"]
    },
    {
      icon: <div className="features-icon"><BarChart3 /></div>,
      title: "Detailed Insights",
      description: "Get comprehensive feedback on strengths, weaknesses, and specific improvement recommendations.",
      benefits: ["Score breakdown", "Actionable suggestions", "Progress tracking"]
    }
  ];

  const keyBenefits = [
    {
      icon: <div className="features-icon" style={{width: '2.5rem', height: '2.5rem'}}><Zap /></div>,
      title: "Lightning Fast",
      description: "Get your analysis in under 30 seconds"
    },
    {
      icon: <div className="features-icon" style={{width: '2.5rem', height: '2.5rem'}}><CheckCircle /></div>,
      title: "Accurate Results",
      description: "95% accuracy rate in resume analysis"
    },
    {
      icon: <div className="features-icon" style={{width: '2.5rem', height: '2.5rem'}}><Users /></div>,
      title: "Recruiter Insights",
      description: "See what recruiters actually look for"
    },
    {
      icon: <div className="features-icon" style={{width: '2.5rem', height: '2.5rem'}}><Shield /></div>,
      title: "Privacy First",
      description: "Your data is encrypted and secure"
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Upload Your Resume",
      description: "Simply drag and drop your resume file or browse to upload it. We support PDF, DOC, and DOCX formats.",
      icon: <Upload />
    },
    {
      step: "02",
      title: "AI Analysis",
      description: "Our advanced AI analyzes your resume for content, structure, keywords, and overall effectiveness.",
      icon: <Target />
    },
    {
      step: "03",
      title: "Get Results",
      description: "Receive detailed feedback with specific recommendations to improve your resume and increase your chances.",
      icon: <FileText />
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
          <h2 className="features-title" style={{fontSize: '2rem', marginBottom: '1rem'}}>Everything You Need to Succeed</h2>
          <p className="features-subtitle" style={{marginBottom: '2.5rem'}}>Our comprehensive suite of tools helps you create resumes that stand out</p>
          <div className="features-cards">
            {mainFeatures.map((feature, index) => (
              <div key={index} className="features-card">
                {feature.icon}
                <h3 className="features-title-card">{feature.title}</h3>
                <p className="features-desc">{feature.description}</p>
                <ul className="features-benefits">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="features-benefit">
                      <span className="features-benefit-icon"><CheckCircle /></span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section style={{marginTop: '3rem'}}>
          <h2 className="features-title" style={{fontSize: '2rem', marginBottom: '1rem'}}>How It Works</h2>
          <p className="features-subtitle" style={{marginBottom: '2.5rem'}}>Get started in just three simple steps</p>
          <div className="features-cards" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
            {howItWorks.map((step, index) => (
              <div key={index} className="features-card" style={{padding: '2rem 1.5rem'}}>
                <div style={{fontWeight: 700, fontSize: '1.5rem', color: '#6366f1', marginBottom: '0.5rem'}}>{step.step}</div>
                <div className="features-icon" style={{marginBottom: '1rem', background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)', color: '#fff'}}>{step.icon}</div>
                <h3 className="features-title-card">{step.title}</h3>
                <p className="features-desc">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Key Benefits */}
        <section style={{marginTop: '3rem'}}>
          <h2 className="features-title" style={{fontSize: '2rem', marginBottom: '1rem'}}>Why Choose Vettly?</h2>
          <p className="features-subtitle" style={{marginBottom: '2.5rem'}}>Join thousands of job seekers who've improved their resumes with our platform</p>
          <div className="features-cards" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
            {keyBenefits.map((benefit, index) => (
              <div key={index} className="features-card" style={{padding: '2rem 1.5rem'}}>
                {benefit.icon}
                <h3 className="features-title-card">{benefit.title}</h3>
                <p className="features-desc">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Features; 