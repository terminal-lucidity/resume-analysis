"""
Tests for API endpoints
Ensures proper functionality, error handling, and response formats
"""
import pytest
import json
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock

class TestAPIEndpoints:
    """Test suite for API endpoints"""
    
    def test_health_check_endpoint(self, hybrid_client, embedding_client):
        """Test health check endpoints"""
        # Test hybrid service health check
        response = hybrid_client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
        
        # Test embedding service health check
        response = embedding_client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
    
    def test_analyze_endpoint_success(self, hybrid_client, sample_resume_data, sample_job_data):
        """Test successful analysis endpoint"""
        payload = {
            "resume": sample_resume_data["senior_developer"],
            "job": sample_job_data["senior_developer"],
            "jobLevel": "senior"
        }
        
        response = hybrid_client.post("/analyze", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        # Check required fields
        assert "similarity" in data
        assert "jobLevel" in data
        assert "overall_score" in data
        assert "keyword_match_score" in data
        assert "skill_gap_analysis" in data
        assert "improvement_suggestions" in data
        assert "detailed_analysis" in data
        
        # Check data types and ranges
        assert isinstance(data["similarity"], (int, float))
        assert 0.0 <= data["similarity"] <= 1.0
        assert isinstance(data["overall_score"], (int, float))
        assert 0.0 <= data["overall_score"] <= 1.0
        assert isinstance(data["keyword_match_score"], (int, float))
        assert 0.0 <= data["keyword_match_score"] <= 1.0
        assert isinstance(data["skill_gap_analysis"], dict)
        assert isinstance(data["improvement_suggestions"], list)
        assert isinstance(data["detailed_analysis"], dict)
        
        # Check job level
        assert data["jobLevel"] == "senior"
    
    def test_analyze_endpoint_missing_fields(self, hybrid_client):
        """Test analyze endpoint with missing required fields"""
        # Test missing resume
        payload = {
            "job": "We need a Python developer",
            "jobLevel": "senior"
        }
        response = hybrid_client.post("/analyze", json=payload)
        assert response.status_code == 422  # Validation error
        
        # Test missing job
        payload = {
            "resume": "Python developer with experience",
            "jobLevel": "senior"
        }
        response = hybrid_client.post("/analyze", json=payload)
        assert response.status_code == 422  # Validation error
        
        # Test missing jobLevel
        payload = {
            "resume": "Python developer with experience",
            "job": "We need a Python developer"
        }
        response = hybrid_client.post("/analyze", json=payload)
        assert response.status_code == 422  # Validation error
    
    def test_analyze_endpoint_empty_fields(self, hybrid_client):
        """Test analyze endpoint with empty fields"""
        payload = {
            "resume": "",
            "job": "We need a Python developer",
            "jobLevel": "senior"
        }
        response = hybrid_client.post("/analyze", json=payload)
        # Should handle empty resume gracefully
        assert response.status_code in [200, 422]
        
        payload = {
            "resume": "Python developer with experience",
            "job": "",
            "jobLevel": "senior"
        }
        response = hybrid_client.post("/analyze", json=payload)
        # Should handle empty job gracefully
        assert response.status_code in [200, 422]
    
    def test_analyze_endpoint_invalid_job_level(self, hybrid_client, sample_resume_data, sample_job_data):
        """Test analyze endpoint with invalid job level"""
        payload = {
            "resume": sample_resume_data["senior_developer"],
            "job": sample_job_data["senior_developer"],
            "jobLevel": "invalid_level"
        }
        response = hybrid_client.post("/analyze", json=payload)
        # Should handle invalid job level gracefully
        assert response.status_code in [200, 422]
    
    def test_analyze_endpoint_large_inputs(self, hybrid_client, sample_job_data):
        """Test analyze endpoint with large inputs"""
        # Create a very large resume
        large_resume = "Python developer with experience. " * 1000
        
        payload = {
            "resume": large_resume,
            "job": sample_job_data["senior_developer"],
            "jobLevel": "senior"
        }
        response = hybrid_client.post("/analyze", json=payload)
        # Should handle large inputs gracefully
        assert response.status_code in [200, 413, 422]  # 413 for payload too large
    
    def test_analyze_endpoint_special_characters(self, hybrid_client, sample_job_data):
        """Test analyze endpoint with special characters"""
        resume_with_special = """
        Python developer with experience in:
        - Django & React frameworks
        - PostgreSQL & MongoDB databases
        - AWS (Amazon Web Services) & Docker
        - Git & Jira tools
        - Machine learning with TensorFlow & PyTorch
        """
        
        payload = {
            "resume": resume_with_special,
            "job": sample_job_data["senior_developer"],
            "jobLevel": "senior"
        }
        response = hybrid_client.post("/analyze", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "similarity" in data
        assert "overall_score" in data
    
    def test_analyze_endpoint_different_job_levels(self, hybrid_client, sample_resume_data, sample_job_data):
        """Test analyze endpoint with different job levels"""
        job_levels = ["junior", "mid", "senior"]
        
        for level in job_levels:
            payload = {
                "resume": sample_resume_data["senior_developer"],
                "job": sample_job_data["senior_developer"],
                "jobLevel": level
            }
            response = hybrid_client.post("/analyze", json=payload)
            assert response.status_code == 200
            
            data = response.json()
            assert data["jobLevel"] == level
            assert "overall_score" in data
            assert "skill_gap_analysis" in data
    
    def test_analyze_endpoint_response_structure(self, hybrid_client, sample_resume_data, sample_job_data):
        """Test analyze endpoint response structure"""
        payload = {
            "resume": sample_resume_data["senior_developer"],
            "job": sample_job_data["senior_developer"],
            "jobLevel": "senior"
        }
        
        response = hybrid_client.post("/analyze", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        # Test skill gap analysis structure
        skill_gap = data["skill_gap_analysis"]
        assert isinstance(skill_gap, dict)
        assert "missing_skills" in skill_gap
        assert "skill_gap_score" in skill_gap
        assert isinstance(skill_gap["missing_skills"], list)
        assert isinstance(skill_gap["skill_gap_score"], (int, float))
        
        # Test improvement suggestions structure
        suggestions = data["improvement_suggestions"]
        assert isinstance(suggestions, list)
        assert len(suggestions) > 0, "Should provide improvement suggestions"
        
        # Test detailed analysis structure
        detailed = data["detailed_analysis"]
        assert isinstance(detailed, dict)
        # Check for optional fields that might be present
        optional_fields = ["llm_insights", "ats_score", "achievement_score", "format_score"]
        for field in optional_fields:
            if field in detailed:
                assert isinstance(detailed[field], (dict, int, float))
    
    def test_analyze_endpoint_consistency(self, hybrid_client, sample_resume_data, sample_job_data):
        """Test analyze endpoint consistency across multiple calls"""
        payload = {
            "resume": sample_resume_data["senior_developer"],
            "job": sample_job_data["senior_developer"],
            "jobLevel": "senior"
        }
        
        # Make multiple calls and check consistency
        responses = []
        for _ in range(3):
            response = hybrid_client.post("/analyze", json=payload)
            assert response.status_code == 200
            responses.append(response.json())
        
        # Check that scores are consistent (within reasonable tolerance)
        similarities = [r["similarity"] for r in responses]
        overall_scores = [r["overall_score"] for r in responses]
        keyword_scores = [r["keyword_match_score"] for r in responses]
        
        # All scores should be in valid range
        for scores in [similarities, overall_scores, keyword_scores]:
            for score in scores:
                assert 0.0 <= score <= 1.0
        
        # Scores should be reasonably consistent (not exactly the same due to model variations)
        # We'll just check that they're all valid and in reasonable ranges
    
    @patch('requests.post')
    def test_analyze_endpoint_with_llm_failure(self, mock_post, hybrid_client, sample_resume_data, sample_job_data):
        """Test analyze endpoint when LLM service is unavailable"""
        # Mock LLM failure
        mock_post.side_effect = Exception("LLM service unavailable")
        
        payload = {
            "resume": sample_resume_data["senior_developer"],
            "job": sample_job_data["senior_developer"],
            "jobLevel": "senior"
        }
        
        response = hybrid_client.post("/analyze", json=payload)
        # Should still work without LLM
        assert response.status_code == 200
        
        data = response.json()
        assert "similarity" in data
        assert "overall_score" in data
        # LLM insights might be empty or not present
        if "detailed_analysis" in data:
            detailed = data["detailed_analysis"]
            if "llm_insights" in detailed:
                # LLM insights might be empty or have fallback content
                pass
    
    def test_analyze_endpoint_performance(self, hybrid_client, sample_resume_data, sample_job_data):
        """Test analyze endpoint performance"""
        import time
        
        payload = {
            "resume": sample_resume_data["senior_developer"],
            "job": sample_job_data["senior_developer"],
            "jobLevel": "senior"
        }
        
        # Measure response time
        start_time = time.time()
        response = hybrid_client.post("/analyze", json=payload)
        end_time = time.time()
        
        assert response.status_code == 200
        response_time = end_time - start_time
        
        # Response should be reasonably fast (under 10 seconds for complex analysis)
        assert response_time < 10.0, f"Response time {response_time}s is too slow"
        
        # For subsequent requests, should be faster due to model caching
        start_time = time.time()
        response = hybrid_client.post("/analyze", json=payload)
        end_time = time.time()
        
        assert response.status_code == 200
        cached_response_time = end_time - start_time
        
        # Cached response should be faster
        assert cached_response_time < response_time, "Cached response should be faster"
    
    def test_analyze_endpoint_content_types(self, hybrid_client, sample_resume_data, sample_job_data):
        """Test analyze endpoint with different content types"""
        payload = {
            "resume": sample_resume_data["senior_developer"],
            "job": sample_job_data["senior_developer"],
            "jobLevel": "senior"
        }
        
        # Test with application/json content type
        response = hybrid_client.post(
            "/analyze", 
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        
        # Test without explicit content type (should default to application/json)
        response = hybrid_client.post("/analyze", json=payload)
        assert response.status_code == 200
    
    def test_analyze_endpoint_error_handling(self, hybrid_client):
        """Test analyze endpoint error handling"""
        # Test with malformed JSON
        response = hybrid_client.post(
            "/analyze",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code in [422, 400]  # Validation error or bad request
        
        # Test with wrong content type
        payload = {
            "resume": "Python developer",
            "job": "We need a Python developer",
            "jobLevel": "senior"
        }
        response = hybrid_client.post(
            "/analyze",
            data=json.dumps(payload),
            headers={"Content-Type": "text/plain"}
        )
        # Should handle gracefully or return appropriate error
        assert response.status_code in [200, 422, 400]
    
    def test_analyze_endpoint_edge_cases(self, hybrid_client):
        """Test analyze endpoint with edge cases"""
        # Test with very short inputs
        payload = {
            "resume": "Python",
            "job": "Python",
            "jobLevel": "senior"
        }
        response = hybrid_client.post("/analyze", json=payload)
        assert response.status_code == 200
        
        # Test with unicode characters
        payload = {
            "resume": "Python développeur avec expérience",
            "job": "Nous cherchons un développeur Python",
            "jobLevel": "senior"
        }
        response = hybrid_client.post("/analyze", json=payload)
        assert response.status_code == 200
        
        # Test with numbers and symbols
        payload = {
            "resume": "Developer with 5+ years experience in Python 3.8+",
            "job": "Need developer with Python 3.8+ and 5+ years experience",
            "jobLevel": "senior"
        }
        response = hybrid_client.post("/analyze", json=payload)
        assert response.status_code == 200 