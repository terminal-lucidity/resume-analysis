#!/usr/bin/env python3
"""
Test script to analyze the actual resume format from the image
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from improved_ats_analysis import ImprovedATSAnalyzer

def test_real_resume():
    """Test with the actual resume format from the image"""
    
    analyzer = ImprovedATSAnalyzer()
    
    # Resume from the image
    real_resume = """
    EDUCATION
    UMass Amherst | Manning College of Information and Computer Sciences
    9/21 – 5/25
    B.Sc. in Computer Science and Mathematics
    Major GPA: 3.55/4.0
    
    Courses Taken: Machine Learning, Artificial Intelligence, Software Engineering, Statistics, Algorithms, Data Structures, (Java), Search Engines, Computer Networks, Cyber Security, Operating Systems, Computation and Language Theory, Scientific Computing, Systems Design, Linear Algebra, Abstract Algebra
    
    SKILLS
    Analytics: Python, SQL, Pandas, Scikit-learn, MongoDB, MySQL, PostgreSQL
    Programming Languages: Python, JavaScript, TypeScript, Java, C/C++, SQL
    Tools & Technologies: MERN Stack, FastAPI, REST API, Git, Redis, Linux, TensorFlow, PyTorch, Tailwind CSS
    AI/ML Related: OpenAI API, Cloud Computing, LLMs (Ollama, Mistral, Gemini)
    
    EXPERIENCE
    Paisabazaar Software Engineering Internship
    Gurugram, India
    6/22 – 8/22
    
    • Engineered and deployed Python and JavaScript applications for credit score management, improving efficiency by 30%.
    • Optimized REST APIs for Redis and MySQL, cutting customer endpoint response time by 20%.
    • Architected a secure authentication system, enhancing user profile management and security.
    """
    
    print("=== Testing Real Resume Format ===")
    
    # Test section detection
    print("\n1. Section Detection:")
    section_analysis = analyzer.detect_sections(real_resume)
    print(f"Completeness Score: {section_analysis['completeness_score']:.2f}")
    print(f"Detected Sections: {list(section_analysis['detected_sections'].keys())}")
    print(f"Missing Sections: {section_analysis['missing_sections']}")
    
    # Print detailed section info
    print("\nDetailed Section Analysis:")
    for section_name, section_info in section_analysis['detected_sections'].items():
        print(f"  {section_name}: confidence={section_info.confidence:.2f}")
    
    # Test standalone scoring
    print("\n2. Standalone Scoring:")
    standalone_analysis = analyzer.calculate_standalone_score(real_resume)
    print(f"Overall Score: {standalone_analysis['standalone_score']:.2f}")
    print(f"Content Score: {standalone_analysis['content_score']:.2f}")
    print(f"Skills Diversity: {standalone_analysis['skills_diversity']:.2f}")
    print(f"Action Verb Score: {standalone_analysis['action_verb_score']:.2f}")
    print(f"Achievement Score: {standalone_analysis['achievement_score']:.2f}")
    
    # Test action verbs detection
    print("\n3. Action Verbs Detection:")
    detected_verbs = analyzer.detect_action_verbs(real_resume)
    for category, verbs in detected_verbs.items():
        print(f"  {category.capitalize()}: {verbs}")
    
    # Test keyword extraction
    print("\n4. Keyword Extraction:")
    keywords = analyzer.extract_keywords(real_resume)
    for category, found_keywords in keywords.items():
        print(f"  {category.capitalize()}: {found_keywords}")
    
    # Test achievements detection
    print("\n5. Achievements Detection:")
    achievements = analyzer.detect_quantifiable_achievements(real_resume)
    print(f"  Achievement Score: {achievements['achievement_score']:.2f}")
    print(f"  Quantifiable Achievements: {achievements['quantifiable_achievements']}")
    print(f"  Achievement Sentences: {achievements['achievement_sentences']}")
    
    # Test format analysis
    print("\n6. Format Analysis:")
    format_analysis = analyzer.analyze_format_optimization(real_resume)
    print(f"  Format Score: {format_analysis['format_score']:.2f}")
    print(f"  ATS Friendly: {format_analysis['ats_friendly']}")
    print(f"  Problematic Elements: {format_analysis['problematic_elements']}")

def test_section_patterns():
    """Test individual section patterns"""
    analyzer = ImprovedATSAnalyzer()
    
    print("\n=== Testing Section Patterns ===")
    
    # Test education pattern
    education_text = "EDUCATION\nUMass Amherst | Manning College of Information and Computer Sciences"
    print(f"Education pattern test: {any(re.search(pattern, education_text.lower()) for pattern in analyzer.section_patterns[analyzer.section_patterns.keys().__iter__().__next__()]['headers'])}")
    
    # Test skills pattern
    skills_text = "SKILLS\nAnalytics: Python, SQL, Pandas"
    print(f"Skills pattern test: {any(re.search(pattern, skills_text.lower()) for pattern in analyzer.section_patterns[analyzer.section_patterns.keys().__iter__().__next__()]['headers'])}")
    
    # Test experience pattern
    experience_text = "EXPERIENCE\nPaisabazaar Software Engineering Internship"
    print(f"Experience pattern test: {any(re.search(pattern, experience_text.lower()) for pattern in analyzer.section_patterns[analyzer.section_patterns.keys().__iter__().__next__()]['headers'])}")

if __name__ == "__main__":
    test_real_resume()
    test_section_patterns() 