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
        resume_text = "Experienced Python developer with Django and React skills"
        job_text = "Python developer with web development experience"
        
        # Use the actual method name
        similarity = improved_analyzer.calculate_keyword_similarity(resume_text, job_text)
        
        assert 0 <= similarity <= 1, "Similarity should be between 0 and 1"
        assert similarity > 0.5, "Similar texts should have high similarity"
        
        # Test with different content
        different_job = "Marketing specialist with social media experience"
        different_similarity = improved_analyzer.calculate_keyword_similarity(resume_text, different_job)
        
        assert similarity > different_similarity, "Similar content should score higher than different content"
    
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
        Senior Software Engineer with 8+ years experience
        Led teams of 10+ developers
        Managed $2M+ projects
        Architected microservices
        """
        
        junior_resume = """
        Recent graduate with basic programming skills
        Completed coursework in computer science
        Built simple web applications
        """
        
        # Test with actual methods - use standalone scoring
        senior_analysis = improved_analyzer.calculate_standalone_score(senior_resume)
        junior_analysis = improved_analyzer.calculate_standalone_score(junior_resume)
        
        # Senior resume should score higher
        assert senior_analysis['overall_score'] > junior_analysis['overall_score'], \
            "Senior resume should score higher than junior resume"
        
        # Check that both analyses have required fields
        assert 'overall_score' in senior_analysis, "Senior analysis should have overall score"
        assert 'overall_score' in junior_analysis, "Junior analysis should have overall score"
        assert 'detailed_section_analysis' in senior_analysis, "Analysis should have detailed sections"
        assert 'detailed_section_analysis' in junior_analysis, "Analysis should have detailed sections"
    
    def test_skill_gap_analysis_accuracy(self, improved_analyzer):
        """Test skill gap analysis accuracy"""
        resume_text = """
        Software Engineer with Python and JavaScript experience
        Worked with Django and React frameworks
        Used PostgreSQL and MongoDB databases
        """
        
        job_text = """
        We need a Python developer with:
        - Django and Flask experience
        - React and Angular knowledge
        - PostgreSQL and Redis databases
        - AWS cloud experience
        - Docker and Kubernetes
        """
        
        # Extract keywords from both texts
        resume_keywords = improved_analyzer.extract_keywords(resume_text)
        job_keywords = improved_analyzer.extract_keywords(job_text)
        
        # Check that keywords are extracted
        assert 'programming' in resume_keywords, "Should extract programming keywords"
        assert 'frameworks' in resume_keywords, "Should extract framework keywords"
        assert 'databases' in resume_keywords, "Should extract database keywords"
        
        # Check that job keywords are extracted
        assert 'programming' in job_keywords, "Should extract job programming keywords"
        assert 'frameworks' in job_keywords, "Should extract job framework keywords"
        assert 'databases' in job_keywords, "Should extract job database keywords"
        
        # Calculate similarity to assess skill gap
        similarity = improved_analyzer.calculate_keyword_similarity(resume_text, job_text)
        assert 0 <= similarity <= 1, "Similarity should be between 0 and 1"
    
    def test_achievement_detection_accuracy(self, improved_analyzer):
        """Test detection of quantifiable achievements"""
        achievement_text = """
        Led development team that increased revenue by 40%
        Improved system performance by 60%
        Reduced costs by 25%
        Grew user base by 30%
        Achieved 15% efficiency gains
        Generated $2M in additional revenue
        """
        
        achievements = improved_analyzer.detect_quantifiable_achievements(achievement_text)
        
        # Check that achievements are detected
        assert 'achievements' in achievements, "Should detect achievements"
        assert len(achievements['achievements']) > 0, "Should find multiple achievements"
        
        # Check that percentages are detected
        percentage_achievements = [a for a in achievements['achievements'] if '%' in a]
        assert len(percentage_achievements) >= 4, "Should detect percentage achievements"
        
        # Check that monetary values are detected
        monetary_achievements = [a for a in achievements['achievements'] if '$' in a]
        assert len(monetary_achievements) >= 1, "Should detect monetary achievements"
        
        # Check achievement score
        assert 'achievement_score' in achievements, "Should have achievement score"
        assert 0 <= achievements['achievement_score'] <= 1, "Achievement score should be between 0 and 1"
    
    def test_section_detection_accuracy(self, improved_analyzer):
        """Test section detection accuracy"""
        complete_resume = """
        John Doe
        Software Engineer
        john.doe@email.com | (555) 123-4567
        
        SUMMARY:
        Experienced developer with 5 years experience.
        
        EXPERIENCE:
        Software Engineer | TechCorp | 2020-2023
        - Developed web applications
        
        EDUCATION:
        Bachelor of Computer Science | University | 2020
        
        SKILLS:
        Python, JavaScript, React, Django
        
        PROJECTS:
        E-commerce website | 2023
        - Built full-stack application
        """
        
        sections = improved_analyzer.enhanced_section_detection(complete_resume)
        
        # Check that sections are detected
        assert 'detected_sections' in sections, "Should detect sections"
        assert 'missing_sections' in sections, "Should identify missing sections"
        assert 'completeness_score' in sections, "Should calculate completeness score"
        
        # Check that key sections are detected
        detected_sections = sections['detected_sections']
        assert 'contact' in detected_sections, "Should detect contact information"
        assert 'experience' in detected_sections, "Should detect experience section"
        assert 'education' in detected_sections, "Should detect education section"
        assert 'skills' in detected_sections, "Should detect skills section"
        
        # Check completeness score
        assert 0 <= sections['completeness_score'] <= 1, "Completeness score should be between 0 and 1"
    
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
        """Test model performance benchmarks"""
        industry_resume = """
        Senior Software Engineer with 8+ years experience
        Led development teams of 10+ developers
        Architected microservices serving 1M+ users
        Managed $2M+ projects annually
        """
        
        industry_job = """
        Senior Software Engineer
        Requirements:
        - 8+ years experience in software development
        - Experience leading development teams
        - Microservices architecture experience
        - Project management skills
        """
        
        # Test performance with actual method
        similarity = improved_analyzer.calculate_keyword_similarity(industry_resume, industry_job)
        
        # Performance assertions
        assert 0 <= similarity <= 1, "Similarity should be between 0 and 1"
        assert similarity > 0.3, "Industry-level content should have reasonable similarity"
        
        # Test response time (should be fast)
        import time
        start_time = time.time()
        improved_analyzer.calculate_keyword_similarity(industry_resume, industry_job)
        end_time = time.time()
        
        response_time = end_time - start_time
        assert response_time < 5.0, "Response time should be under 5 seconds"
    
    def test_llm_integration_accuracy(self, improved_analyzer, mock_ollama_response):
        """Test LLM integration accuracy"""
        resume_text = "Python developer with Django experience"
        job_text = "We need a Python developer with Django skills"
        
        with patch('requests.post') as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.text = mock_ollama_response
            
            llm_insights = improved_analyzer.generate_llm_insights(resume_text, job_text, "mid")
            
            # Check that LLM insights are generated
            assert 'overall_assessment' in llm_insights, "Should have overall assessment"
            assert 'strengths' in llm_insights, "Should have strengths"
            assert 'weaknesses' in llm_insights, "Should have weaknesses"
            assert 'suggestions' in llm_insights, "Should have suggestions"
            
            # Check that insights are meaningful
            assert len(llm_insights['strengths']) > 0, "Should identify strengths"
            assert len(llm_insights['suggestions']) > 0, "Should provide suggestions"
    
    def test_error_handling_accuracy(self, improved_analyzer):
        """Test error handling accuracy"""
        # Test with empty inputs
        empty_similarity = improved_analyzer.calculate_keyword_similarity("", "")
        assert 0 <= empty_similarity <= 1, "Should handle empty inputs gracefully"
        
        # Test with very short inputs
        short_similarity = improved_analyzer.calculate_keyword_similarity("a", "b")
        assert 0 <= short_similarity <= 1, "Should handle short inputs gracefully"
        
        # Test with special characters
        special_similarity = improved_analyzer.calculate_keyword_similarity("test@#$%", "test@#$%")
        assert 0 <= special_similarity <= 1, "Should handle special characters gracefully"
        
        # Test with very long inputs
        long_text = "test " * 1000
        long_similarity = improved_analyzer.calculate_keyword_similarity(long_text, long_text)
        assert 0 <= long_similarity <= 1, "Should handle long inputs gracefully"
    
    def test_model_robustness(self, improved_analyzer):
        """Test model robustness with various inputs"""
        test_cases = [
            ("Python developer", "Python developer"),
            ("", ""),
            ("a", "b"),
            ("test@#$%", "test@#$%"),
            ("very long text " * 100, "very long text " * 100),
            ("1234567890", "1234567890"),
            ("Python developer with Django experience", "We need a Python developer"),
        ]
        
        for resume, job in test_cases:
            try:
                similarity = improved_analyzer.calculate_keyword_similarity(resume, job)
                assert 0 <= similarity <= 1, f"Similarity should be between 0 and 1 for: {resume} vs {job}"
            except Exception as e:
                pytest.fail(f"Model should handle input gracefully: {resume} vs {job}, error: {e}") 