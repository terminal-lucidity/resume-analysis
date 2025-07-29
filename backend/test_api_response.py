#!/usr/bin/env python3
"""
Test script to verify API response format
"""

import requests
import json

def test_api_response():
    """Test the API response format"""
    
    # Test data
    test_data = {
        "resumeId": "test-resume-id",
        "jobTitle": "Software Engineer",
        "jobDescription": "Python developer with React experience",
        "jobLevel": "Mid Level"
    }
    
    # Test resume text
    resume_text = """
    EDUCATION
    UMass Amherst | Manning College of Information and Computer Sciences
    9/21 – 5/25
    B.Sc. in Computer Science and Mathematics
    Major GPA: 3.55/4.0
    
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
    
    # Test the test endpoint
    try:
        response = requests.post(
            "http://localhost:3000/api/analyze/test",
            json={
                "resumeText": resume_text,
                "jobTitle": "Software Engineer",
                "jobDescription": "Python developer with React experience",
                "jobLevel": "Mid Level"
            },
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ API Response received successfully")
            print(f"Overall Score: {result.get('overallScore', 'N/A')}")
            print(f"ATS Score: {result.get('ats_score', 'N/A')}")
            print(f"Achievement Score: {result.get('achievement_score', 'N/A')}")
            print(f"Format Score: {result.get('format_score', 'N/A')}")
            print(f"Section Completeness: {result.get('section_completeness', 'N/A')}")
            
            # Check detailed analysis
            detailed = result.get('detailedAnalysis', {})
            print(f"\nDetailed Analysis Keys: {list(detailed.keys())}")
            
            # Check section analysis
            section_analysis = detailed.get('section_analysis', {})
            if section_analysis:
                print(f"Section Analysis Keys: {list(section_analysis.keys())}")
                print(f"Detected Sections: {section_analysis.get('detected_sections', [])}")
                print(f"Missing Sections: {section_analysis.get('missing_sections', [])}")
                print(f"Completeness Score: {section_analysis.get('completeness_score', 'N/A')}")
            
            # Check ATS analysis
            ats_analysis = detailed.get('ats_analysis', {})
            if ats_analysis:
                print(f"ATS Analysis Keys: {list(ats_analysis.keys())}")
                print(f"Found Action Verbs: {ats_analysis.get('found_action_verbs', [])}")
                print(f"Action Verb Score: {ats_analysis.get('action_verb_score', 'N/A')}")
            
            # Check achievements analysis
            achievements = detailed.get('achievements_analysis', {})
            if achievements:
                print(f"Achievements Analysis Keys: {list(achievements.keys())}")
                print(f"Quantifiable Achievements: {achievements.get('quantifiable_achievements', [])}")
                print(f"Achievement Score: {achievements.get('achievement_score', 'N/A')}")
            
            return result
        else:
            print(f"❌ API Error: {response.status_code}")
            print(response.text)
            return None
            
    except Exception as e:
        print(f"❌ Error testing API: {e}")
        return None

if __name__ == "__main__":
    test_api_response() 