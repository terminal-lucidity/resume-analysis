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
      <main className="hero-background py-20 lg:py-32">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="heading-primary mb-6">
            Vet your Resume,
            <span className="heading-accent block">Get Hired Faster.</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Upload your resume and job description. Let Vettly spot what recruiters are looking for — and what you're missing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="btn-primary flex items-center gap-2 group">
              Try Vettly for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="btn-secondary">See Demo</button>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Vettly?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get the edge you need in today's competitive job market with AI-powered resume analysis.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-white dark:bg-gray-600 rounded-lg mb-6 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who've improved their resumes with Vettly.
          </p>
          <button className="btn-primary">Start Your Analysis</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-blue-400 mb-4">Vettly</h3>
            <p>
              AI-powered resume analysis to help you land your dream job.
            </p>
          </div>
          <div>
            <h4>Product</h4>
            <ul className="space-y-2">
              <li><a href="#">Features</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">Demo</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul className="space-y-2">
              <li><a href="#">About</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul className="space-y-2">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          &copy; 2024 Vettly. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default LandingHero;