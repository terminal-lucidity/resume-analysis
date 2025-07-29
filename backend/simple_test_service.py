#!/usr/bin/env python3
"""
Simple test script to analyze ATS compliance issues
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from hybrid_analysis_simple import ImprovedAnalyzer

def test_ats_compliance():
    """Test ATS compliance with sample resumes"""
    
    analyzer = ImprovedAnalyzer()
    
    # Test resume with all required sections
    complete_resume = """
    JOHN DOE
    Senior Software Engineer
    john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe
    
    SUMMARY:
    Experienced software engineer with 8+ years developing scalable web applications.
    Led teams of 5-10 developers and delivered projects worth $2M+ annually.
    
    EXPERIENCE:
    Senior Software Engineer | TechCorp | 2020-2023
    - Led development of microservices architecture serving 1M+ users
    - Managed team of 5 developers, improved code quality by 40%
    - Implemented CI/CD pipelines reducing deployment time by 60%
    - Used Python, Django, React, AWS, Docker, PostgreSQL
    
    EDUCATION:
    Bachelor of Computer Science | University of Technology | 2015
    
    SKILLS:
    Programming: Python, JavaScript, Java, SQL, TypeScript
    Frameworks: Django, React, Express, Spring Boot, Angular
    Databases: PostgreSQL, MongoDB, Redis, MySQL
    Cloud: AWS, Docker, Kubernetes, Terraform
    Tools: Git, Jira, Jenkins, Postman, Figma
    """
    
    print("=== Testing ATS Compliance ===")
    
    # Test section detection
    print("\n1. Section Detection:")
    section_analysis = analyzer.enhanced_section_detection(complete_resume)
    print(f"Completeness Score: {section_analysis['completeness_score']:.2f}")
    print(f"Detected Sections: {section_analysis['detected_sections']}")
    print(f"Missing Sections: {section_analysis['missing_sections']}")
    
    # Test standalone scoring
    print("\n2. Standalone Scoring:")
    standalone_analysis = analyzer.calculate_standalone_score(complete_resume)
    print(f"Overall Score: {standalone_analysis['standalone_score']:.2f}")
    print(f"Content Score: {standalone_analysis['content_score']:.2f}")
    print(f"Skills Diversity: {standalone_analysis['skills_diversity']:.2f}")
    print(f"Action Verb Score: {standalone_analysis['action_verb_score']:.2f}")
    
    # Test achievements detection
    print("\n3. Achievements Detection:")
    achievements = analyzer.detect_quantifiable_achievements(complete_resume)
    print(f"Achievement Score: {achievements['achievement_score']:.2f}")
    print(f"Quantifiable Achievements: {len(achievements['quantifiable_achievements'])}")
    print(f"Achievement Sentences: {len(achievements['achievement_sentences'])}")
    
    # Test format optimization
    print("\n4. Format Optimization:")
    format_analysis = analyzer.analyze_format_optimization(complete_resume)
    print(f"Format Score: {format_analysis['format_score']:.2f}")
    print(f"ATS Friendly: {format_analysis['ats_friendly']}")
    print(f"Problematic Elements: {format_analysis['problematic_elements']}")
    
    # Test keyword extraction
    print("\n5. Keyword Extraction:")
    keywords = analyzer.extract_keywords(complete_resume)
    for category, found_keywords in keywords.items():
        print(f"{category.capitalize()}: {found_keywords}")
    
    # Test with incomplete resume
    print("\n=== Testing Incomplete Resume ===")
    incomplete_resume = """
    John Doe
    Software Engineer
    
    EXPERIENCE:
    Software Engineer | TechCorp | 2020-2023
    - Developed web applications
    """
    
    incomplete_section = analyzer.enhanced_section_detection(incomplete_resume)
    incomplete_standalone = analyzer.calculate_standalone_score(incomplete_resume)
    
    print(f"Incomplete Resume - Completeness: {incomplete_section['completeness_score']:.2f}")
    print(f"Incomplete Resume - Standalone Score: {incomplete_standalone['standalone_score']:.2f}")
    
    # Compare scores
    print(f"\nScore Comparison:")
    print(f"Complete Resume Score: {standalone_analysis['standalone_score']:.2f}")
    print(f"Incomplete Resume Score: {incomplete_standalone['standalone_score']:.2f}")
    print(f"Score Difference: {standalone_analysis['standalone_score'] - incomplete_standalone['standalone_score']:.2f}")

if __name__ == "__main__":
    test_ats_compliance() 