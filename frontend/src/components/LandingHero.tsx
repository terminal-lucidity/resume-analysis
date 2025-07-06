function LandingHero() {
    return (
      <section className="text-center py-20 px-6 bg-gray-50 dark:bg-gray-900">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
          Vet your Resume, Get Hired Faster.
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-8">
          Upload your resume and job description. Let Vettly spot what recruiters are looking for — and what you're missing.
        </p>
        <a
          href="#scan"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition shadow"
        >
          Try Vettly for Free
        </a>
      </section>
    );
  }
  
  export default LandingHero;
  