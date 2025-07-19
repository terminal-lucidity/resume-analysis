import React from 'react';
import { 
  Upload, 
  Target, 
  Zap, 
  CheckCircle, 
  BarChart3, 
  FileText, 
  Users, 
  Shield,
  Clock,
  TrendingUp,
  Award,
  MessageSquare
} from 'lucide-react';

const Features: React.FC = () => {
  const mainFeatures = [
    {
      icon: <Upload className="w-12 h-12 text-blue-500" />,
      title: "Smart Resume Upload",
      description: "Upload your resume in any format - PDF, DOC, DOCX. Our AI extracts and analyzes every detail automatically.",
      benefits: ["Drag & drop interface", "Multiple file formats", "Instant text extraction"]
    },
    {
      icon: <Target className="w-12 h-12 text-green-500" />,
      title: "AI-Powered Analysis",
      description: "Advanced AI algorithms analyze your resume against job requirements and industry standards.",
      benefits: ["Keyword optimization", "Skills gap analysis", "Industry benchmarking"]
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-purple-500" />,
      title: "Detailed Insights",
      description: "Get comprehensive feedback on strengths, weaknesses, and specific improvement recommendations.",
      benefits: ["Score breakdown", "Actionable suggestions", "Progress tracking"]
    }
  ];

  const keyBenefits = [
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Lightning Fast",
      description: "Get your analysis in under 30 seconds"
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      title: "Accurate Results",
      description: "95% accuracy rate in resume analysis"
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: "Recruiter Insights",
      description: "See what recruiters actually look for"
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-500" />,
      title: "Privacy First",
      description: "Your data is encrypted and secure"
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Upload Your Resume",
      description: "Simply drag and drop your resume file or browse to upload it. We support PDF, DOC, and DOCX formats.",
      icon: <Upload className="w-8 h-8" />
    },
    {
      step: "02",
      title: "AI Analysis",
      description: "Our advanced AI analyzes your resume for content, structure, keywords, and overall effectiveness.",
      icon: <Target className="w-8 h-8" />
    },
    {
      step: "03",
      title: "Get Results",
      description: "Receive detailed feedback with specific recommendations to improve your resume and increase your chances.",
      icon: <FileText className="w-8 h-8" />
    }
  ];

  const stats = [
    { number: "50K+", label: "Resumes Analyzed" },
    { number: "95%", label: "Accuracy Rate" },
    { number: "30s", label: "Average Analysis Time" },
    { number: "10K+", label: "Happy Users" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Powerful Features for
            <span className="text-blue-600 dark:text-blue-400 block">Resume Success</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12">
            Everything you need to create a winning resume that gets you noticed by recruiters and lands you interviews.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Our comprehensive suite of tools helps you create resumes that stand out
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {mainFeatures.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-gray-600 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Get started in just three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mx-auto mb-6">
                    {step.step}
                  </div>
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Vettly?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Join thousands of job seekers who've improved their resumes with our platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {keyBenefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Advanced Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Professional tools for serious job seekers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Clock className="w-8 h-8 text-blue-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Real-time Analysis
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Get instant feedback as you make changes to your resume
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Performance Tracking
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Track your resume's performance and improvement over time
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Award className="w-8 h-8 text-yellow-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Industry Recognition
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Get recognized for your achievements with optimized content
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <MessageSquare className="w-8 h-8 text-purple-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Expert Tips
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Receive personalized tips from industry experts
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <FileText className="w-8 h-8 text-indigo-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Multiple Formats
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Export your resume in various formats for different applications
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Users className="w-8 h-8 text-pink-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Community Support
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Connect with other job seekers and share experiences
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Your Resume?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of job seekers who've improved their resumes and landed their dream jobs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-200">
              Start Free Analysis
            </button>
            <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold py-3 px-8 rounded-xl transition-colors duration-200">
              View Pricing
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features; 