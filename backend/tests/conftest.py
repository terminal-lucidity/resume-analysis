"""
Pytest configuration and fixtures for resume analysis backend tests
"""
import pytest
import asyncio
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import tempfile
import os
import json
from typing import Dict, Any, List

# Import the services we want to test
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hybrid_analysis_simple import app as hybrid_app, ImprovedAnalyzer
from embedding_service import app as embedding_app, HybridAnalyzer

@pytest.fixture
def hybrid_client():
    """Test client for hybrid analysis service"""
    return TestClient(hybrid_app)

@pytest.fixture
def embedding_client():
    """Test client for embedding service"""
    return TestClient(embedding_app)

@pytest.fixture
def improved_analyzer():
    """Instance of ImprovedAnalyzer for unit testing"""
    return ImprovedAnalyzer()

@pytest.fixture
def hybrid_analyzer():
    """Instance of HybridAnalyzer for unit testing"""
    return HybridAnalyzer()

@pytest.fixture
def sample_resume_data() -> Dict[str, str]:
    """Sample resume data for testing"""
    return {
        "senior_developer": """
        John Doe
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
        
        Software Engineer | StartupXYZ | 2018-2020
        - Built REST APIs handling 100K+ requests daily
        - Developed full-stack applications using Node.js, Express, MongoDB
        - Reduced API response time by 50% through optimization
        
        SKILLS:
        Programming: Python, JavaScript, Java, SQL, TypeScript
        Frameworks: Django, React, Express, Spring Boot, Angular
        Databases: PostgreSQL, MongoDB, Redis, MySQL
        Cloud: AWS, Docker, Kubernetes, Terraform
        Tools: Git, Jira, Jenkins, Postman, Figma
        """,
        
        "mid_developer": """
        Jane Smith
        Software Engineer
        jane.smith@email.com | (555) 987-6543
        
        SUMMARY:
        Software engineer with 3 years experience in web development.
        Passionate about clean code and user experience.
        
        EXPERIENCE:
        Software Engineer | WebTech | 2021-2023
        - Developed responsive web applications using React and Node.js
        - Worked with REST APIs and MongoDB database
        - Collaborated with design team on UI/UX improvements
        
        Junior Developer | CodeStart | 2020-2021
        - Built simple web applications using HTML, CSS, JavaScript
        - Learned modern frameworks and development practices
        
        SKILLS:
        Programming: JavaScript, Python, HTML, CSS
        Frameworks: React, Node.js, Express
        Databases: MongoDB, MySQL
        Tools: Git, VS Code, Postman
        """,
        
        "junior_developer": """
        Alex Johnson
        Junior Developer
        alex.johnson@email.com
        
        SUMMARY:
        Recent graduate with strong foundation in programming fundamentals.
        Eager to learn and contribute to development teams.
        
        EDUCATION:
        Bachelor of Computer Science | University of Tech | 2023
        - GPA: 3.8/4.0
        - Relevant coursework: Data Structures, Algorithms, Web Development
        
        PROJECTS:
        E-commerce Website | Personal Project | 2023
        - Built full-stack application using React and Node.js
        - Implemented user authentication and payment processing
        - Deployed on Heroku with MongoDB database
        
        Weather App | Course Project | 2022
        - Created responsive web application using HTML, CSS, JavaScript
        - Integrated with weather API for real-time data
        
        SKILLS:
        Programming: JavaScript, Python, HTML, CSS
        Frameworks: React, Node.js
        Databases: MongoDB
        Tools: Git, VS Code
        """
    }

@pytest.fixture
def sample_job_data() -> Dict[str, str]:
    """Sample job descriptions for testing"""
    return {
        "senior_developer": """
        Senior Software Engineer
        
        We are looking for a Senior Software Engineer to join our growing team.
        
        Requirements:
        - 5+ years of experience in software development
        - Strong knowledge of Python, JavaScript, and Java
        - Experience with Django, React, and cloud platforms
        - Knowledge of Docker, Kubernetes, and AWS
        - Experience with PostgreSQL and Redis
        - Leadership experience and team management skills
        - Experience with microservices architecture
        - Knowledge of CI/CD pipelines
        
        Nice to have:
        - Experience with machine learning frameworks
        - Knowledge of GraphQL and REST APIs
        - Experience with monitoring and logging tools
        """,
        
        "mid_developer": """
        Software Engineer
        
        We are seeking a Software Engineer to help build our web applications.
        
        Requirements:
        - 2-4 years of experience in web development
        - Proficiency in JavaScript and Python
        - Experience with React and Node.js
        - Knowledge of REST APIs and databases
        - Experience with Git and version control
        - Good communication and teamwork skills
        
        Nice to have:
        - Experience with TypeScript
        - Knowledge of cloud platforms
        - Experience with testing frameworks
        """,
        
        "junior_developer": """
        Junior Developer
        
        We are looking for a Junior Developer to join our team.
        
        Requirements:
        - Bachelor's degree in Computer Science or related field
        - Knowledge of JavaScript and web development
        - Experience with React or similar frameworks
        - Understanding of HTML, CSS, and responsive design
        - Good problem-solving skills
        - Eager to learn and grow
        
        Nice to have:
        - Experience with Node.js
        - Knowledge of databases
        - Experience with Git
        """
    }

@pytest.fixture
def ats_optimized_resume() -> str:
    """ATS-optimized resume for testing"""
    return """
    JOHN DOE
    Senior Software Engineer
    john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe
    
    PROFESSIONAL SUMMARY
    Senior Software Engineer with 8+ years of experience developing scalable web applications. 
    Led teams of 5-10 developers and delivered projects worth $2M+ annually. 
    Expert in Python, JavaScript, Java, Django, React, AWS, Docker, PostgreSQL.
    
    PROFESSIONAL EXPERIENCE
    
    Senior Software Engineer | TechCorp | 2020-2023
    • Led development of microservices architecture serving 1M+ users
    • Managed team of 5 developers, improved code quality by 40%
    • Implemented CI/CD pipelines reducing deployment time by 60%
    • Developed applications using Python, Django, React, AWS, Docker, PostgreSQL
    
    Software Engineer | StartupXYZ | 2018-2020
    • Built REST APIs handling 100K+ requests daily
    • Developed full-stack applications using Node.js, Express, MongoDB
    • Reduced API response time by 50% through optimization
    
    TECHNICAL SKILLS
    Programming Languages: Python, JavaScript, Java, SQL, TypeScript
    Frameworks: Django, React, Express, Spring Boot, Angular
    Databases: PostgreSQL, MongoDB, Redis, MySQL
    Cloud Platforms: AWS, Docker, Kubernetes, Terraform
    Development Tools: Git, Jira, Jenkins, Postman, Figma
    
    EDUCATION
    Bachelor of Science in Computer Science | University of Technology | 2015
    """

@pytest.fixture
def non_ats_resume() -> str:
    """Non-ATS optimized resume for testing"""
    return """
    John Doe
    Senior Software Engineer
    
    I'm a software engineer with lots of experience building cool stuff.
    I've worked on many projects and know how to code really well.
    
    Work History:
    TechCorp - I was a senior developer there for 3 years
    - Did some coding and stuff
    - Worked with other people
    - Made some improvements
    
    StartupXYZ - I was a developer there for 2 years
    - Built some websites
    - Used different technologies
    - Fixed some bugs
    
    Skills:
    I know Python, JavaScript, and other programming languages.
    I've used frameworks like React and Django.
    I work with databases and cloud platforms.
    """

@pytest.fixture
def mock_ollama_response() -> str:
    """Mock response from Ollama LLM"""
    return """
    {
        "strengths": [
            "Strong technical skills in Python, JavaScript, and Java",
            "Experience with modern frameworks like Django and React",
            "Cloud platform experience with AWS and Docker",
            "Leadership experience managing development teams"
        ],
        "weaknesses": [
            "Could benefit from more machine learning experience",
            "Limited experience with newer technologies like GraphQL",
            "Could improve documentation and testing practices"
        ],
        "recommendations": [
            "Add more quantifiable achievements to resume",
            "Include specific metrics and KPIs",
            "Highlight leadership and team management experience",
            "Consider adding machine learning projects"
        ]
    }
    """

@pytest.fixture
def industry_ats_keywords() -> Dict[str, List[str]]:
    """Industry-standard ATS keywords by category"""
    return {
        "leadership": [
            "led", "managed", "supervised", "directed", "coordinated", "oversaw", 
            "headed", "chaired", "mentored", "trained", "guided", "facilitated"
        ],
        "achievement": [
            "increased", "decreased", "improved", "enhanced", "optimized", 
            "streamlined", "reduced", "grew", "boosted", "accelerated", "achieved"
        ],
        "technical": [
            "developed", "implemented", "designed", "architected", "built", 
            "created", "programmed", "coded", "debugged", "deployed", "integrated"
        ],
        "analysis": [
            "analyzed", "evaluated", "assessed", "researched", "investigated", 
            "examined", "studied", "diagnosed", "troubleshot", "optimized"
        ],
        "communication": [
            "presented", "communicated", "collaborated", "coordinated", "liaised", 
            "negotiated", "facilitated", "documented", "reported", "presented"
        ]
    }

@pytest.fixture
def industry_technical_keywords() -> Dict[str, List[str]]:
    """Industry-standard technical keywords by category"""
    return {
        "programming": [
            "python", "javascript", "java", "c++", "c#", "go", "rust", "php", 
            "ruby", "swift", "kotlin", "typescript", "scala", "r", "matlab"
        ],
        "frameworks": [
            "react", "angular", "vue", "django", "flask", "express", "spring", 
            "laravel", "rails", "node.js", "asp.net", "jquery", "bootstrap"
        ],
        "databases": [
            "mysql", "postgresql", "mongodb", "redis", "elasticsearch", 
            "cassandra", "dynamodb", "oracle", "sql server", "sqlite"
        ],
        "cloud": [
            "aws", "azure", "gcp", "docker", "kubernetes", "terraform", 
            "jenkins", "gitlab", "github actions", "ci/cd", "microservices"
        ],
        "ml_ai": [
            "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", 
            "matplotlib", "opencv", "keras", "xgboost", "spark", "hadoop"
        ]
    }

# Async support for pytest
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close() 