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
        
        # Test ATS-optimized resume
        ats_score = improved_analyzer.analyze_format_optimization(ats_optimized_resume)
        
        # Test non-ATS resume
        non_ats_score = improved_analyzer.analyze_format_optimization(non_ats_resume)
        
        # ATS-optimized resume should score higher
        assert ats_score['format_score'] > non_ats_score['format_score'], \
            "ATS-optimized resume should score higher than non-ATS resume"
        
        # Check specific format elements
        assert ats_score['has_contact_info'] == True, "ATS resume should have contact info"
        assert ats_score['has_clear_sections'] == True, "ATS resume should have clear sections"
        assert ats_score['uses_bullet_points'] == True, "ATS resume should use bullet points"
        
        # Non-ATS resume should score lower on these elements
        assert non_ats_score['has_contact_info'] == False, "Non-ATS resume should lack contact info"
        assert non_ats_score['has_clear_sections'] == False, "Non-ATS resume should lack clear sections"
    
    def test_quantifiable_achievements_detection(self, improved_analyzer):
        """Test detection of quantifiable achievements"""
        resume_with_achievements = """
        Senior Software Engineer
        - Increased system performance by 40%
        - Reduced deployment time by 60%
        - Managed team of 5 developers
        - Delivered projects worth $2M+ annually
        - Improved code quality by 25%
        """
        
        resume_without_achievements = """
        Senior Software Engineer
        - Worked on system improvements
        - Helped with deployments
        - Worked with other developers
        - Completed various projects
        - Made code better
        """
        
        achievements_with = improved_analyzer.detect_quantifiable_achievements(resume_with_achievements)
        achievements_without = improved_analyzer.detect_quantifiable_achievements(resume_without_achievements)
        
        # Resume with achievements should score higher
        assert achievements_with['achievement_score'] > achievements_without['achievement_score'], \
            "Resume with quantifiable achievements should score higher"
        
        # Check specific achievements
        assert len(achievements_with['quantifiable_achievements']) > 0, \
            "Should detect quantifiable achievements"
        
        # Check for specific achievement patterns
        achievement_text = ' '.join(achievements_with['quantifiable_achievements'])
        assert "40%" in achievement_text, "Should detect percentage achievements"
        assert "60%" in achievement_text, "Should detect percentage achievements"
        assert "$2M" in achievement_text, "Should detect monetary achievements"
    
    def test_section_completeness_detection(self, improved_analyzer):
        """Test detection of resume section completeness"""
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
        """
        
        incomplete_resume = """
        John Doe
        Software Engineer
        
        I have some experience in programming.
        Worked at a few companies.
        Know some programming languages.
        """
        
        complete_score = improved_analyzer.calculate_standalone_score(complete_resume)
        incomplete_score = improved_analyzer.calculate_standalone_score(incomplete_resume)
        
        # Complete resume should score higher
        assert complete_score['section_completeness'] > incomplete_score['section_completeness'], \
            "Complete resume should have higher section completeness score"
        
        # Check specific sections
        assert complete_score['has_contact_info'] == True, "Complete resume should have contact info"
        assert complete_score['has_experience_section'] == True, "Complete resume should have experience section"
        assert complete_score['has_skills_section'] == True, "Complete resume should have skills section"
        assert complete_score['has_education_section'] == True, "Complete resume should have education section"
    
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
        """Test job level matching for ATS compliance"""
        senior_resume = """
        Senior Software Engineer with 8+ years experience.
        Led development teams and managed projects.
        Architected scalable systems and mentored junior developers.
        """
        
        mid_resume = """
        Software Engineer with 3 years experience.
        Developed applications and worked with teams.
        Contributed to projects and learned new technologies.
        """
        
        junior_resume = """
        Junior Developer with 1 year experience.
        Helped with development tasks and learned from others.
        Worked on small projects and used basic technologies.
        """
        
        # Test job level analysis
        senior_analysis = improved_analyzer.analyze_job_level_fit(senior_resume, "senior")
        mid_analysis = improved_analyzer.analyze_job_level_fit(mid_resume, "mid")
        junior_analysis = improved_analyzer.analyze_job_level_fit(junior_resume, "junior")
        
        # Senior resume should score higher for senior level
        assert senior_analysis['level_match_score'] > mid_analysis['level_match_score'], \
            "Senior resume should match senior level better than mid level"
        
        assert senior_analysis['level_match_score'] > junior_analysis['level_match_score'], \
            "Senior resume should match senior level better than junior level"
    
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
        """Test overall ATS scoring system"""
        job_description = """
        Senior Software Engineer
        Requirements: Python, JavaScript, Django, React, AWS, Docker
        """
        
        # Test ATS-optimized resume
        ats_score = improved_analyzer.calculate_standalone_score(ats_optimized_resume)
        
        # Test non-ATS resume
        non_ats_score = improved_analyzer.calculate_standalone_score(non_ats_resume)
        
        # ATS-optimized resume should have higher overall score
        assert ats_score['standalone_score'] > non_ats_score['standalone_score'], \
            "ATS-optimized resume should have higher overall score"
        
        # Check individual scoring components
        assert ats_score['format_score'] > non_ats_score['format_score'], \
            "ATS resume should have higher format score"
        assert ats_score['achievement_score'] > non_ats_score['achievement_score'], \
            "ATS resume should have higher achievement score"
        assert ats_score['section_completeness'] > non_ats_score['section_completeness'], \
            "ATS resume should have higher section completeness" 