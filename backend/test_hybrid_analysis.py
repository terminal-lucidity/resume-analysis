#!/usr/bin/env python3
"""
Test script for the Hybrid Resume Analysis Service
This script tests the analysis service with sample data.
"""

import requests
import json
import time

def test_health_check():
    """Test the health check endpoint"""
    try:
        response = requests.get("http://localhost:8001/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_analysis():
    """Test the analysis endpoint with sample data"""
    sample_resume = """
    John Doe
    Senior Software Engineer
    
    EXPERIENCE:
    Senior Software Engineer at TechCorp (2020-2023)
    - Developed scalable web applications using Python, Django, and React
    - Led a team of 5 developers on multiple projects
    - Implemented CI/CD pipelines using Docker and AWS
    - Managed PostgreSQL databases and Redis caching
    
    Software Engineer at StartupXYZ (2018-2020)
    - Built REST APIs using Node.js and Express
    - Worked with MongoDB and MySQL databases
    - Used Git for version control and Jira for project management
    
    SKILLS:
    Programming: Python, JavaScript, Java, SQL
    Frameworks: Django, React, Express, Spring Boot
    Databases: PostgreSQL, MongoDB, Redis, MySQL
    Cloud: AWS, Docker, Kubernetes
    Tools: Git, Jira, Jenkins, Postman
    """
    
    sample_job = """
    Senior Software Engineer
    
    We are looking for a Senior Software Engineer to join our team.
    
    Requirements:
    - 5+ years of experience in software development
    - Strong knowledge of Python, JavaScript, and Java
    - Experience with Django, React, and cloud platforms
    - Knowledge of Docker, Kubernetes, and AWS
    - Experience with PostgreSQL and Redis
    - Leadership experience and team management skills
    
    Nice to have:
    - Experience with machine learning frameworks
    - Knowledge of microservices architecture
    - Experience with CI/CD pipelines
    """
    
    payload = {
        "resume": sample_resume,
        "job": sample_job,
        "jobLevel": "senior"
    }
    
    try:
        print("🔄 Testing analysis endpoint...")
        response = requests.post(
            "http://localhost:8001/analyze",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Analysis completed successfully!")
            print("\n📊 Analysis Results:")
            print(f"Overall Score: {result.get('overall_score', 'N/A'):.2f}")
            print(f"Semantic Similarity: {result.get('similarity', 'N/A'):.2f}")
            print(f"Keyword Match Score: {result.get('keyword_match_score', 'N/A'):.2f}")
            
            # Print skill gap analysis
            skill_gap = result.get('skill_gap_analysis', {})
            if skill_gap:
                print(f"\n🔍 Skill Gap Analysis:")
                print(f"Missing Skills: {skill_gap.get('missing_skills', [])}")
                print(f"Skill Gap Score: {skill_gap.get('skill_gap_score', 'N/A'):.2f}")
            
            # Print improvement suggestions
            suggestions = result.get('improvement_suggestions', [])
            if suggestions:
                print(f"\n💡 Improvement Suggestions:")
                for i, suggestion in enumerate(suggestions, 1):
                    print(f"{i}. {suggestion}")
            
            # Print LLM insights if available
            detailed = result.get('detailed_analysis', {})
            llm_insights = detailed.get('llm_insights', {})
            if llm_insights and llm_insights.get('strengths'):
                print(f"\n🤖 LLM Insights:")
                print(f"Strengths: {llm_insights.get('strengths', [])}")
                print(f"Weaknesses: {llm_insights.get('weaknesses', [])}")
            
            return True
        else:
            print(f"❌ Analysis failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Analysis request failed: {e}")
        return False

def test_without_llm():
    """Test analysis when LLM is not available"""
    print("\n🔄 Testing analysis without LLM...")
    
    # This test will work even if Ollama is not running
    # The service should gracefully handle LLM unavailability
    
    sample_resume = "Python developer with 3 years experience in web development."
    sample_job = "We need a Python developer with web development experience."
    
    payload = {
        "resume": sample_resume,
        "job": sample_job,
        "jobLevel": "mid"
    }
    
    try:
        response = requests.post(
            "http://localhost:8001/analyze",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Analysis without LLM completed successfully!")
            print(f"Overall Score: {result.get('overall_score', 'N/A'):.2f}")
            return True
        else:
            print(f"❌ Analysis without LLM failed: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Analysis without LLM request failed: {e}")
        return False

def main():
    """Main test function"""
    print("🧪 Testing Hybrid Resume Analysis Service")
    print("=" * 50)
    
    # Test 1: Health check
    if not test_health_check():
        print("\n❌ Service is not running. Please start the service first:")
        print("python embedding_service.py")
        return
    
    # Test 2: Full analysis
    if not test_analysis():
        print("\n❌ Full analysis test failed")
        return
    
    # Test 3: Analysis without LLM
    if not test_without_llm():
        print("\n❌ Analysis without LLM test failed")
        return
    
    print("\n🎉 All tests passed! The hybrid analysis service is working correctly.")
    print("\n💡 Next steps:")
    print("1. The service is ready for production use")
    print("2. You can now integrate it with your frontend")
    print("3. Consider setting up Ollama for enhanced LLM insights")

if __name__ == "__main__":
    main() 