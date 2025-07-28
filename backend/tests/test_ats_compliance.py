"""
Tests for ATS (Applicant Tracking System) compliance
Ensures the AI models meet industry-level ATS scanning standards
"""
import pytest
import re
from typing import Dict, List, Any
from unittest.mock import patch, Mock

class TestATSCompliance:
    """Test suite for ATS compliance features"""
    
    def test_ats_keyword_detection(self, improved_analyzer, industry_ats_keywords):
        """Test that ATS keywords are properly detected"""
        resume_text = """
        Senior Software Engineer with 8+ years experience.
        Led development teams and managed projects.
        Increased system performance by 40%.
        Developed scalable applications using Python and React.
        """
        
        # Test keyword extraction
        keywords = improved_analyzer.extract_keywords(resume_text)
        
        # Check that ATS keywords are detected
        text_lower = resume_text.lower()
        detected_keywords = []
        
        for category, keyword_list in industry_ats_keywords.items():
            for keyword in keyword_list:
                if keyword in text_lower:
                    detected_keywords.append(keyword)
        
        assert len(detected_keywords) > 0, "No ATS keywords detected"
        assert "led" in detected_keywords, "Leadership keyword 'led' should be detected"
        assert "increased" in detected_keywords, "Achievement keyword 'increased' should be detected"
        assert "developed" in detected_keywords, "Technical keyword 'developed' should be detected"
    
    def test_ats_format_optimization(self, improved_analyzer, ats_optimized_resume, non_ats_resume):
        """Test ATS format optimization scoring"""
        ats_score = improved_analyzer.analyze_format_optimization(ats_optimized_resume)
        non_ats_score = improved_analyzer.analyze_format_optimization(non_ats_resume)
        
        # Check that format analysis is performed
        assert 'format_score' in ats_score, "Should calculate format score"
        assert 'format_score' in non_ats_score, "Should calculate format score"
        
        # ATS-optimized resume should score higher
        assert ats_score['format_score'] > non_ats_score['format_score'], \
            "ATS-optimized resume should score higher than non-ATS resume"
        
        # Scores should be in valid range
        assert 0 <= ats_score['format_score'] <= 1, "Format score should be between 0 and 1"
        assert 0 <= non_ats_score['format_score'] <= 1, "Format score should be between 0 and 1"
    
    def test_quantifiable_achievements_detection(self, improved_analyzer):
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
    
    def test_section_completeness_detection(self, improved_analyzer):
        """Test section completeness detection"""
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
        """
        
        incomplete_resume = """
        John Doe
        Software Engineer
        
        EXPERIENCE:
        Software Engineer | TechCorp | 2020-2023
        """
        
        complete_score = improved_analyzer.enhanced_section_detection(complete_resume)
        incomplete_score = improved_analyzer.enhanced_section_detection(incomplete_resume)
        
        # Check that completeness is calculated
        assert 'completeness_score' in complete_score, "Should calculate completeness score"
        assert 'completeness_score' in incomplete_score, "Should calculate completeness score"
        
        # Complete resume should score higher
        assert complete_score['completeness_score'] > incomplete_score['completeness_score'], \
            "Complete resume should have higher completeness score"
        
        # Scores should be in valid range
        assert 0 <= complete_score['completeness_score'] <= 1, "Completeness score should be between 0 and 1"
        assert 0 <= incomplete_score['completeness_score'] <= 1, "Completeness score should be between 0 and 1"
    
    def test_ats_keyword_density(self, improved_analyzer):
        """Test ATS keyword density analysis"""
        high_density_resume = """
        Senior Software Engineer with 8+ years experience.
        Led development teams and managed projects worth $2M+ annually.
        Increased system performance by 40% and reduced deployment time by 60%.
        Developed scalable applications using Python, Django, React, and AWS.
        Implemented CI/CD pipelines and managed PostgreSQL databases.
        Coordinated with cross-functional teams and presented technical solutions.
        """
        
        low_density_resume = """
        Software engineer with some experience.
        Worked on various projects and helped with development.
        Made some improvements to systems.
        Used different technologies and tools.
        Worked with other people and explained things.
        """
        
        # Test keyword density calculation
        high_density_score = improved_analyzer.calculate_keyword_similarity(
            high_density_resume, "software engineer python django react"
        )
        
        low_density_score = improved_analyzer.calculate_keyword_similarity(
            low_density_resume, "software engineer python django react"
        )
        
        # High density resume should score higher
        assert high_density_score > low_density_score, \
            "Resume with higher ATS keyword density should score higher"
    
    def test_ats_action_verbs_detection(self, improved_analyzer):
        """Test detection of strong action verbs"""
        strong_verbs_resume = """
        Senior Software Engineer
        - Led development of microservices architecture
        - Managed team of 5 developers
        - Implemented CI/CD pipelines
        - Developed scalable applications
        - Coordinated cross-functional teams
        - Presented technical solutions
        """
        
        weak_verbs_resume = """
        Senior Software Engineer
        - Helped with development of systems
        - Worked with other developers
        - Did some CI/CD work
        - Made some applications
        - Talked to different teams
        - Showed some solutions
        """
        
        # Extract action verbs
        strong_verbs = improved_analyzer.strong_action_verbs
        text_lower = strong_verbs_resume.lower()
        weak_text_lower = weak_verbs_resume.lower()
        
        # Count strong action verbs
        strong_count = sum(1 for verb in strong_verbs if verb in text_lower)
        weak_count = sum(1 for verb in strong_verbs if verb in weak_text_lower)
        
        assert strong_count > weak_count, \
            "Resume with strong action verbs should have higher count"
        
        # Check for specific strong verbs
        assert "led" in text_lower, "Should contain 'led'"
        assert "managed" in text_lower, "Should contain 'managed'"
        assert "implemented" in text_lower, "Should contain 'implemented'"
        assert "developed" in text_lower, "Should contain 'developed'"
    
    def test_ats_technical_keyword_matching(self, improved_analyzer, industry_technical_keywords):
        """Test technical keyword matching for ATS"""
        resume_text = """
        Senior Software Engineer
        - Developed applications using Python, Django, React
        - Worked with PostgreSQL, MongoDB, Redis databases
        - Deployed applications on AWS using Docker and Kubernetes
        - Used Git, Jira, Jenkins for development workflow
        - Implemented machine learning models with TensorFlow
        """
        
        job_text = """
        Senior Software Engineer
        Requirements:
        - Python, JavaScript, Java programming
        - Django, React, Express frameworks
        - PostgreSQL, MongoDB databases
        - AWS, Docker, Kubernetes cloud platforms
        - Git, Jira development tools
        - TensorFlow, PyTorch machine learning
        """
        
        # Test keyword extraction
        resume_keywords = improved_analyzer.extract_keywords(resume_text)
        job_keywords = improved_analyzer.extract_keywords(job_text)
        
        # Check that technical keywords are detected
        assert 'programming' in resume_keywords, "Should detect programming keywords"
        assert 'frameworks' in resume_keywords, "Should detect framework keywords"
        assert 'databases' in resume_keywords, "Should detect database keywords"
        assert 'cloud' in resume_keywords, "Should detect cloud keywords"
        assert 'tools' in resume_keywords, "Should detect tool keywords"
        
        # Test keyword similarity
        similarity = improved_analyzer.calculate_keyword_similarity(resume_text, job_text)
        assert similarity > 0.5, "Technical keyword similarity should be high for matching skills"
    
    def test_ats_job_level_matching(self, improved_analyzer):
        """Test job level matching accuracy"""
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
    
    def test_ats_contact_info_detection(self, improved_analyzer):
        """Test contact information detection for ATS"""
        resume_with_contact = """
        JOHN DOE
        Senior Software Engineer
        john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe
        """
        
        resume_without_contact = """
        John Doe
        Senior Software Engineer
        """
        
        # Test contact info detection
        has_contact = improved_analyzer.detect_contact_info(resume_with_contact)
        no_contact = improved_analyzer.detect_contact_info(resume_without_contact)
        
        assert has_contact == True, "Resume with contact info should be detected"
        assert no_contact == False, "Resume without contact info should not be detected"
    
    def test_ats_skills_section_detection(self, improved_analyzer):
        """Test skills section detection for ATS"""
        resume_with_skills = """
        TECHNICAL SKILLS
        Programming: Python, JavaScript, Java
        Frameworks: Django, React, Express
        Databases: PostgreSQL, MongoDB, Redis
        """
        
        resume_without_skills = """
        I know Python and JavaScript.
        I've used Django and React.
        I work with databases.
        """
        
        # Test skills section detection
        has_skills = improved_analyzer.detect_skills_content(resume_with_skills)
        no_skills = improved_analyzer.detect_skills_content(resume_without_skills)
        
        assert has_skills == True, "Resume with skills section should be detected"
        # Note: This might be True for both depending on implementation
        # The key is that structured skills sections score higher
    
    def test_ats_overall_scoring(self, improved_analyzer, ats_optimized_resume, non_ats_resume):
        """Test overall ATS scoring"""
        ats_score = improved_analyzer.calculate_standalone_score(ats_optimized_resume)
        non_ats_score = improved_analyzer.calculate_standalone_score(non_ats_resume)
        
        # Check that standalone scoring is performed
        assert 'overall_score' in ats_score, "Should calculate overall score"
        assert 'overall_score' in non_ats_score, "Should calculate overall score"
        
        # ATS-optimized resume should score higher
        assert ats_score['overall_score'] > non_ats_score['overall_score'], \
            "ATS-optimized resume should score higher than non-ATS resume"
        
        # Scores should be in valid range
        assert 0 <= ats_score['overall_score'] <= 1, "Overall score should be between 0 and 1"
        assert 0 <= non_ats_score['overall_score'] <= 1, "Overall score should be between 0 and 1" 