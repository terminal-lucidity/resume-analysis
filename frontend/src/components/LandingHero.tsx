import { Upload, Target, Zap, ArrowRight } from "lucide-react";

function LandingHero() {
  const features = [
    {
      icon: <Upload className="w-8 h-8 text-blue-500" />,
      title: "Smart Upload",
      description: "Upload your resume and job description with drag-and-drop simplicity",
    },
    {
      icon: <Target className="w-8 h-8 text-green-500" />,
      title: "AI Analysis",
      description: "Get instant feedback on what recruiters are looking for in your resume",
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Quick Results",
      description: "Receive actionable insights in seconds, not hours",
    },
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
            <button className="btn btn-primary btn-large flex items-center gap-sm group">
              Try Vettly for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="btn btn-secondary btn-large">See Demo</button>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="section bg-white dark:bg-gray-900">
        <div className="container">
          <div className="text-center mb-xl max-w-2xl mx-auto">
            <h2 className="heading-secondary mb-md">Why Choose Vettly?</h2>
            <p className="text-large">
              Get the edge you need in today's competitive job market with AI-powered resume analysis.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-xl">
            {features.map((feature, index) => (
              <div key={index} className="card card-feature fade-in">
                <div className="flex items-center justify-center w-16 h-16 bg-white dark:bg-gray-600 rounded-xl mb-lg mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-md">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
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
          <button className="btn btn-primary btn-large">Start Your Analysis</button>
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