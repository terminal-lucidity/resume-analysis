"""
Tests for AI model accuracy and performance
Ensures the AI models meet industry-level accuracy standards
"""
import pytest
import numpy as np
from typing import Dict, List, Any
from unittest.mock import patch, Mock
import json

class TestAIModelAccuracy:
    """Test suite for AI model accuracy and performance"""
    
    def test_semantic_similarity_accuracy(self, improved_analyzer):
        """Test semantic similarity calculation accuracy"""
        # Test with highly similar content
        similar_resume = "Python developer with Django and React experience"
        similar_job = "We need a Python developer with Django and React skills"
        
        # Test with moderately similar content
        moderate_resume = "JavaScript developer with Node.js experience"
        moderate_job = "We need a Python developer with Django experience"
        
        # Test with dissimilar content
        dissimilar_resume = "Marketing specialist with social media experience"
        dissimilar_job = "We need a Python developer with Django experience"
        
        # Calculate similarities
        similar_score = improved_analyzer.calculate_semantic_similarity(similar_resume, similar_job)
        moderate_score = improved_analyzer.calculate_semantic_similarity(moderate_resume, moderate_job)
        dissimilar_score = improved_analyzer.calculate_semantic_similarity(dissimilar_resume, dissimilar_job)
        
        # Similar content should score highest
        assert similar_score > moderate_score, "Similar content should score higher than moderate"
        assert similar_score > dissimilar_score, "Similar content should score higher than dissimilar"
        assert moderate_score > dissimilar_score, "Moderate similarity should score higher than dissimilar"
        
        # Scores should be in reasonable ranges
        assert 0.0 <= similar_score <= 1.0, "Similarity score should be between 0 and 1"
        assert 0.0 <= moderate_score <= 1.0, "Similarity score should be between 0 and 1"
        assert 0.0 <= dissimilar_score <= 1.0, "Similarity score should be between 0 and 1"
    
    def test_keyword_extraction_accuracy(self, improved_analyzer, industry_technical_keywords):
        """Test keyword extraction accuracy"""
        resume_text = """
        Senior Software Engineer with experience in:
        - Python, JavaScript, Java programming
        - Django, React, Express frameworks
        - PostgreSQL, MongoDB, Redis databases
        - AWS, Docker, Kubernetes cloud platforms
        - Git, Jira, Jenkins development tools
        - TensorFlow, PyTorch machine learning
        """
        
        extracted_keywords = improved_analyzer.extract_keywords(resume_text)
        
        # Check that all major categories are detected
        assert 'programming' in extracted_keywords, "Should detect programming keywords"
        assert 'frameworks' in extracted_keywords, "Should detect framework keywords"
        assert 'databases' in extracted_keywords, "Should detect database keywords"
        assert 'cloud' in extracted_keywords, "Should detect cloud keywords"
        assert 'tools' in extracted_keywords, "Should detect tool keywords"
        assert 'ml_ai' in extracted_keywords, "Should detect ML/AI keywords"
        
        # Check specific keywords are detected
        programming_keywords = extracted_keywords.get('programming', [])
        assert 'python' in programming_keywords, "Should detect Python"
        assert 'javascript' in programming_keywords, "Should detect JavaScript"
        assert 'java' in programming_keywords, "Should detect Java"
        
        framework_keywords = extracted_keywords.get('frameworks', [])
        assert 'django' in framework_keywords, "Should detect Django"
        assert 'react' in framework_keywords, "Should detect React"
        assert 'express' in framework_keywords, "Should detect Express"
    
    def test_job_level_analysis_accuracy(self, improved_analyzer):
        """Test job level analysis accuracy"""
        senior_resume = """
        Senior Software Engineer with 8+ years experience.
        Led development teams of 5-10 developers.
        Architected scalable microservices systems.
        Mentored junior developers and conducted code reviews.
        Managed projects worth $2M+ annually.
        """
        
        mid_resume = """
        Software Engineer with 3 years experience.
        Developed full-stack applications using modern frameworks.
        Collaborated with cross-functional teams.
        Contributed to code reviews and technical discussions.
        Worked on projects with moderate complexity.
        """
        
        junior_resume = """
        Junior Developer with 1 year experience.
        Assisted with development tasks and bug fixes.
        Learned from senior developers and code reviews.
        Worked on small features and improvements.
        Used basic development tools and frameworks.
        """
        
        # Test senior level analysis
        senior_analysis = improved_analyzer.analyze_job_level_fit(senior_resume, "senior")
        assert senior_analysis['level_match_score'] > 0.7, "Senior resume should score high for senior level"
        assert senior_analysis['experience_years'] >= 8, "Should detect 8+ years experience"
        assert senior_analysis['has_leadership'] == True, "Should detect leadership experience"
        
        # Test mid level analysis
        mid_analysis = improved_analyzer.analyze_job_level_fit(mid_resume, "mid")
        assert 0.4 <= mid_analysis['level_match_score'] <= 0.8, "Mid resume should score appropriately for mid level"
        assert 2 <= mid_analysis['experience_years'] <= 5, "Should detect 3 years experience"
        
        # Test junior level analysis
        junior_analysis = improved_analyzer.analyze_job_level_fit(junior_resume, "junior")
        assert junior_analysis['level_match_score'] > 0.6, "Junior resume should score high for junior level"
        assert junior_analysis['experience_years'] <= 2, "Should detect 1 year experience"
    
    def test_skill_gap_analysis_accuracy(self, improved_analyzer):
        """Test skill gap analysis accuracy"""
        resume_text = """
        Software Engineer with experience in:
        - Python, JavaScript programming
        - Django, React frameworks
        - PostgreSQL, MongoDB databases
        - AWS, Docker cloud platforms
        - Git, Jira development tools
        """
        
        job_text = """
        Senior Software Engineer
        Requirements:
        - Python, JavaScript, Java programming
        - Django, React, Express frameworks
        - PostgreSQL, MongoDB, Redis databases
        - AWS, Docker, Kubernetes cloud platforms
        - Git, Jira, Jenkins development tools
        - TensorFlow, PyTorch machine learning
        """
        
        skill_gap = improved_analyzer.calculate_skill_gap_analysis(resume_text, job_text)
        
        # Check that missing skills are detected
        missing_skills = skill_gap.get('missing_skills', [])
        assert 'java' in missing_skills, "Should detect missing Java"
        assert 'express' in missing_skills, "Should detect missing Express"
        assert 'redis' in missing_skills, "Should detect missing Redis"
        assert 'kubernetes' in missing_skills, "Should detect missing Kubernetes"
        assert 'jenkins' in missing_skills, "Should detect missing Jenkins"
        assert 'tensorflow' in missing_skills, "Should detect missing TensorFlow"
        assert 'pytorch' in missing_skills, "Should detect missing PyTorch"
        
        # Check that present skills are not in missing list
        present_skills = ['python', 'javascript', 'django', 'react', 'postgresql', 'mongodb', 'aws', 'docker', 'git', 'jira']
        for skill in present_skills:
            assert skill not in missing_skills, f"Present skill {skill} should not be in missing list"
        
        # Check skill gap score
        skill_gap_score = skill_gap.get('skill_gap_score', 0)
        assert 0.0 <= skill_gap_score <= 1.0, "Skill gap score should be between 0 and 1"
        assert skill_gap_score > 0.0, "Should have some skill gap for this comparison"
    
    def test_achievement_detection_accuracy(self, improved_analyzer):
        """Test achievement detection accuracy"""
        resume_with_achievements = """
        Senior Software Engineer
        - Increased system performance by 40%
        - Reduced deployment time by 60%
        - Managed team of 5 developers
        - Delivered projects worth $2M+ annually
        - Improved code quality by 25%
        - Reduced bug reports by 30%
        - Increased user satisfaction by 15%
        """
        
        resume_without_achievements = """
        Senior Software Engineer
        - Worked on system improvements
        - Helped with deployments
        - Worked with other developers
        - Completed various projects
        - Made code better
        - Fixed some bugs
        - Talked to users
        """
        
        achievements_with = improved_analyzer.detect_quantifiable_achievements(resume_with_achievements)
        achievements_without = improved_analyzer.detect_quantifiable_achievements(resume_without_achievements)
        
        # Check achievement detection
        quantifiable_achievements = achievements_with.get('quantifiable_achievements', [])
        assert len(quantifiable_achievements) >= 5, "Should detect multiple quantifiable achievements"
        
        # Check for specific achievement patterns
        achievement_text = ' '.join(quantifiable_achievements)
        assert "40%" in achievement_text, "Should detect percentage achievements"
        assert "60%" in achievement_text, "Should detect percentage achievements"
        assert "$2M" in achievement_text, "Should detect monetary achievements"
        assert "25%" in achievement_text, "Should detect percentage achievements"
        assert "30%" in achievement_text, "Should detect percentage achievements"
        assert "15%" in achievement_text, "Should detect percentage achievements"
        
        # Resume without achievements should have lower score
        assert achievements_with['achievement_score'] > achievements_without['achievement_score'], \
            "Resume with achievements should score higher"
    
    def test_section_detection_accuracy(self, improved_analyzer):
        """Test resume section detection accuracy"""
        complete_resume = """
        JOHN DOE
        Senior Software Engineer
        john.doe@email.com | (555) 123-4567
        
        PROFESSIONAL SUMMARY
        Experienced software engineer with 8+ years experience.
        
        PROFESSIONAL EXPERIENCE
        Senior Software Engineer | TechCorp | 2020-2023
        - Led development teams and managed projects
        
        TECHNICAL SKILLS
        Programming: Python, JavaScript, Java
        Frameworks: Django, React, Express
        
        EDUCATION
        Bachelor of Computer Science | University of Tech | 2015
        
        CERTIFICATIONS
        AWS Certified Developer | 2022
        """
        
        sections = improved_analyzer.enhanced_section_detection(complete_resume)
        
        # Check that all major sections are detected
        assert sections.get('has_contact_info', False), "Should detect contact information"
        assert sections.get('has_summary', False), "Should detect summary section"
        assert sections.get('has_experience', False), "Should detect experience section"
        assert sections.get('has_skills', False), "Should detect skills section"
        assert sections.get('has_education', False), "Should detect education section"
        assert sections.get('has_certifications', False), "Should detect certifications section"
    
    def test_overall_scoring_consistency(self, improved_analyzer):
        """Test overall scoring consistency across different inputs"""
        # Test with same resume and job multiple times
        resume_text = "Python developer with Django and React experience"
        job_text = "We need a Python developer with Django and React skills"
        
        scores = []
        for _ in range(5):
            score = improved_analyzer.calculate_keyword_similarity(resume_text, job_text)
            scores.append(score)
        
        # Scores should be consistent (within small tolerance)
        mean_score = np.mean(scores)
        std_score = np.std(scores)
        assert std_score < 0.01, "Scores should be consistent across multiple runs"
        
        # All scores should be in reasonable range
        for score in scores:
            assert 0.0 <= score <= 1.0, "Score should be between 0 and 1"
    
    def test_model_performance_benchmarks(self, improved_analyzer):
        """Test model performance against industry benchmarks"""
        # Test with industry-standard resume and job descriptions
        industry_resume = """
        Senior Software Engineer with 8+ years experience.
        Led development of microservices architecture serving 1M+ users.
        Managed team of 5 developers, improved code quality by 40%.
        Implemented CI/CD pipelines reducing deployment time by 60%.
        Used Python, Django, React, AWS, Docker, PostgreSQL.
        """
        
        industry_job = """
        Senior Software Engineer
        Requirements:
        - 5+ years of experience in software development
        - Strong knowledge of Python, JavaScript, and Java
        - Experience with Django, React, and cloud platforms
        - Knowledge of Docker, Kubernetes, and AWS
        - Experience with PostgreSQL and Redis
        - Leadership experience and team management skills
        """
        
        # Test semantic similarity
        similarity = improved_analyzer.calculate_semantic_similarity(industry_resume, industry_job)
        assert similarity > 0.6, "Industry-standard comparison should have high similarity"
        
        # Test keyword similarity
        keyword_similarity = improved_analyzer.calculate_keyword_similarity(industry_resume, industry_job)
        assert keyword_similarity > 0.5, "Industry-standard comparison should have good keyword match"
        
        # Test skill gap analysis
        skill_gap = improved_analyzer.calculate_skill_gap_analysis(industry_resume, industry_job)
        skill_gap_score = skill_gap.get('skill_gap_score', 1.0)
        assert skill_gap_score < 0.5, "Industry-standard comparison should have low skill gap"
    
    @patch('requests.post')
    def test_llm_integration_accuracy(self, mock_post, improved_analyzer, mock_ollama_response):
        """Test LLM integration accuracy"""
        # Mock successful LLM response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = json.loads(mock_ollama_response)
        mock_post.return_value = mock_response
        
        resume_text = "Python developer with Django and React experience"
        job_text = "We need a Python developer with Django and React skills"
        
        llm_insights = improved_analyzer.generate_llm_insights(resume_text, job_text, "senior")
        
        # Check that LLM insights are properly structured
        assert 'strengths' in llm_insights, "Should have strengths analysis"
        assert 'weaknesses' in llm_insights, "Should have weaknesses analysis"
        assert 'recommendations' in llm_insights, "Should have recommendations"
        
        # Check that insights are not empty
        assert len(llm_insights['strengths']) > 0, "Should have strengths"
        assert len(llm_insights['weaknesses']) > 0, "Should have weaknesses"
        assert len(llm_insights['recommendations']) > 0, "Should have recommendations"
    
    def test_error_handling_accuracy(self, improved_analyzer):
        """Test error handling accuracy"""
        # Test with empty inputs
        empty_similarity = improved_analyzer.calculate_semantic_similarity("", "")
        assert empty_similarity == 0.0, "Empty inputs should return 0 similarity"
        
        # Test with very short inputs
        short_similarity = improved_analyzer.calculate_semantic_similarity("a", "b")
        assert 0.0 <= short_similarity <= 1.0, "Short inputs should return valid similarity"
        
        # Test with special characters
        special_similarity = improved_analyzer.calculate_semantic_similarity(
            "Python developer with @#$%^&*() experience",
            "We need a Python developer with !@#$%^&*() skills"
        )
        assert 0.0 <= special_similarity <= 1.0, "Special characters should be handled gracefully"
    
    def test_model_robustness(self, improved_analyzer):
        """Test model robustness with various input types"""
        test_cases = [
            ("Python developer", "Python developer"),  # Identical
            ("Python developer", "JavaScript developer"),  # Different
            ("PYTHON DEVELOPER", "python developer"),  # Case difference
            ("Python developer with 5 years", "Python developer with 5 years"),  # Longer identical
            ("", "Python developer"),  # Empty vs content
            ("Python developer", ""),  # Content vs empty
        ]
        
        for resume, job in test_cases:
            try:
                similarity = improved_analyzer.calculate_semantic_similarity(resume, job)
                assert 0.0 <= similarity <= 1.0, f"Similarity should be between 0 and 1 for: {resume} vs {job}"
            except Exception as e:
                pytest.fail(f"Model should handle input gracefully: {resume} vs {job}, error: {e}") 