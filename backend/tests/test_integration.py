"""
Integration tests for the complete resume analysis workflow
Tests the full pipeline from resume processing to analysis results
"""
import pytest
import json
import time
from typing import Dict, Any
from unittest.mock import patch, Mock

class TestIntegrationWorkflow:
    """Integration test suite for complete workflow"""
    
    def test_complete_analysis_workflow(self, hybrid_client, sample_resume_data, sample_job_data):
        """Test complete analysis workflow from start to finish"""
        # Step 1: Health check
        health_response = hybrid_client.get("/health")
        assert health_response.status_code == 200
        
        # Step 2: Submit analysis request
        payload = {
            "resume": sample_resume_data["senior_developer"],
            "job": sample_job_data["senior_developer"],
            "jobLevel": "senior"
        }
        
        analysis_response = hybrid_client.post("/analyze", json=payload)
        assert analysis_response.status_code == 200
        
        # Step 3: Validate complete response structure
        data = analysis_response.json()
        
        # Check all required fields are present
        required_fields = [
            "similarity", "jobLevel", "overall_score", "keyword_match_score",
            "skill_gap_analysis", "improvement_suggestions", "detailed_analysis"
        ]
        
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        # Step 4: Validate data quality
        assert 0.0 <= data["similarity"] <= 1.0
        assert 0.0 <= data["overall_score"] <= 1.0
        assert 0.0 <= data["keyword_match_score"] <= 1.0
        assert data["jobLevel"] == "senior"
        
        # Step 5: Validate skill gap analysis
        skill_gap = data["skill_gap_analysis"]
        assert "missing_skills" in skill_gap
        assert "skill_gap_score" in skill_gap
        assert isinstance(skill_gap["missing_skills"], list)
        assert 0.0 <= skill_gap["skill_gap_score"] <= 1.0
        
        # Step 6: Validate improvement suggestions
        suggestions = data["improvement_suggestions"]
        assert isinstance(suggestions, list)
        assert len(suggestions) > 0, "Should provide improvement suggestions"
        
        # Step 7: Validate detailed analysis
        detailed = data["detailed_analysis"]
        assert isinstance(detailed, dict)
        
        print(f"✅ Complete workflow test passed")
        print(f"📊 Overall Score: {data['overall_score']:.3f}")
        print(f"🔍 Similarity: {data['similarity']:.3f}")
        print(f"🎯 Keyword Match: {data['keyword_match_score']:.3f}")
        print(f"📈 Skill Gap Score: {skill_gap['skill_gap_score']:.3f}")
        print(f"💡 Suggestions: {len(suggestions)} provided")
    
    def test_multiple_job_levels_workflow(self, hybrid_client, sample_resume_data, sample_job_data):
        """Test workflow with different job levels"""
        job_levels = ["junior", "mid", "senior"]
        results = {}
        
        for level in job_levels:
            payload = {
                "resume": sample_resume_data["senior_developer"],  # Use senior resume for all levels
                "job": sample_job_data["senior_developer"],
                "jobLevel": level
            }
            
            response = hybrid_client.post("/analyze", json=payload)
            assert response.status_code == 200
            
            data = response.json()
            results[level] = data
            
            # Validate response for each level
            assert data["jobLevel"] == level
            assert 0.0 <= data["overall_score"] <= 1.0
            assert 0.0 <= data["similarity"] <= 1.0
        
        # Validate that scores make sense across levels
        # Senior resume should score higher for senior level than junior level
        assert results["senior"]["overall_score"] >= results["junior"]["overall_score"], \
            "Senior resume should score higher for senior level than junior level"
        
        print(f"✅ Multi-level workflow test passed")
        for level, data in results.items():
            print(f"📊 {level.capitalize()} Level Score: {data['overall_score']:.3f}")
    
    def test_different_resume_types_workflow(self, hybrid_client, sample_resume_data, sample_job_data):
        """Test workflow with different resume types"""
        resume_types = ["junior_developer", "mid_developer", "senior_developer"]
        results = {}
        
        for resume_type in resume_types:
            payload = {
                "resume": sample_resume_data[resume_type],
                "job": sample_job_data["senior_developer"],  # Use senior job for all
                "jobLevel": "senior"
            }
            
            response = hybrid_client.post("/analyze", json=payload)
            assert response.status_code == 200
            
            data = response.json()
            results[resume_type] = data
            
            # Validate response for each resume type
            assert 0.0 <= data["overall_score"] <= 1.0
            assert 0.0 <= data["similarity"] <= 1.0
        
        # Validate that senior resume scores highest for senior job
        assert results["senior_developer"]["overall_score"] >= results["mid_developer"]["overall_score"], \
            "Senior resume should score higher than mid resume for senior job"
        assert results["senior_developer"]["overall_score"] >= results["junior_developer"]["overall_score"], \
            "Senior resume should score higher than junior resume for senior job"
        
        print(f"✅ Multi-resume workflow test passed")
        for resume_type, data in results.items():
            print(f"📊 {resume_type.replace('_', ' ').title()} Score: {data['overall_score']:.3f}")
    
    @patch('requests.post')
    def test_workflow_with_llm_integration(self, mock_post, hybrid_client, sample_resume_data, sample_job_data, mock_ollama_response):
        """Test complete workflow with LLM integration"""
        # Mock successful LLM response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = json.loads(mock_ollama_response)
        mock_post.return_value = mock_response
        
        payload = {
            "resume": sample_resume_data["senior_developer"],
            "job": sample_job_data["senior_developer"],
            "jobLevel": "senior"
        }
        
        response = hybrid_client.post("/analyze", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        # Check that LLM insights are included in detailed analysis
        detailed = data["detailed_analysis"]
        if "llm_insights" in detailed:
            llm_insights = detailed["llm_insights"]
            assert "strengths" in llm_insights
            assert "weaknesses" in llm_insights
            assert "recommendations" in llm_insights
            
            print(f"✅ LLM integration workflow test passed")
            print(f"🤖 LLM Strengths: {len(llm_insights['strengths'])} identified")
            print(f"⚠️ LLM Weaknesses: {len(llm_insights['weaknesses'])} identified")
            print(f"💡 LLM Recommendations: {len(llm_insights['recommendations'])} provided")
    
    def test_workflow_performance_benchmarks(self, hybrid_client, sample_resume_data, sample_job_data):
        """Test workflow performance benchmarks"""
        payload = {
            "resume": sample_resume_data["senior_developer"],
            "job": sample_job_data["senior_developer"],
            "jobLevel": "senior"
        }
        
        # Measure performance over multiple runs
        response_times = []
        scores = []
        
        for i in range(5):
            start_time = time.time()
            response = hybrid_client.post("/analyze", json=payload)
            end_time = time.time()
            
            assert response.status_code == 200
            response_time = end_time - start_time
            response_times.append(response_time)
            
            data = response.json()
            scores.append(data["overall_score"])
        
        # Calculate performance metrics
        avg_response_time = sum(response_times) / len(response_times)
        max_response_time = max(response_times)
        min_response_time = min(response_times)
        
        avg_score = sum(scores) / len(scores)
        score_variance = sum((s - avg_score) ** 2 for s in scores) / len(scores)
        
        # Performance assertions
        assert avg_response_time < 5.0, f"Average response time {avg_response_time}s is too slow"
        assert max_response_time < 10.0, f"Maximum response time {max_response_time}s is too slow"
        assert score_variance < 0.1, f"Score variance {score_variance} is too high (inconsistent results)"
        
        print(f"✅ Performance benchmark test passed")
        print(f"⏱️ Average Response Time: {avg_response_time:.3f}s")
        print(f"⏱️ Min Response Time: {min_response_time:.3f}s")
        print(f"⏱️ Max Response Time: {max_response_time:.3f}s")
        print(f"📊 Average Score: {avg_score:.3f}")
        print(f"📊 Score Variance: {score_variance:.3f}")
    
    def test_workflow_error_recovery(self, hybrid_client):
        """Test workflow error recovery and graceful degradation"""
        # Test with invalid inputs and ensure graceful handling
        test_cases = [
            {
                "name": "Empty resume",
                "payload": {"resume": "", "job": "Python developer", "jobLevel": "senior"},
                "expected_status": [200, 422]
            },
            {
                "name": "Empty job",
                "payload": {"resume": "Python developer", "job": "", "jobLevel": "senior"},
                "expected_status": [200, 422]
            },
            {
                "name": "Invalid job level",
                "payload": {"resume": "Python developer", "job": "Python developer", "jobLevel": "invalid"},
                "expected_status": [200, 422]
            },
            {
                "name": "Very short inputs",
                "payload": {"resume": "Python", "job": "Python", "jobLevel": "senior"},
                "expected_status": [200]
            }
        ]
        
        for test_case in test_cases:
            response = hybrid_client.post("/analyze", json=test_case["payload"])
            assert response.status_code in test_case["expected_status"], \
                f"Test case '{test_case['name']}' failed: expected {test_case['expected_status']}, got {response.status_code}"
        
        print(f"✅ Error recovery test passed")
    
    def test_workflow_data_consistency(self, hybrid_client, sample_resume_data, sample_job_data):
        """Test workflow data consistency across multiple runs"""
        payload = {
            "resume": sample_resume_data["senior_developer"],
            "job": sample_job_data["senior_developer"],
            "jobLevel": "senior"
        }
        
        # Run multiple times and check consistency
        results = []
        for _ in range(3):
            response = hybrid_client.post("/analyze", json=payload)
            assert response.status_code == 200
            results.append(response.json())
        
        # Check that all results have the same structure
        for i, result in enumerate(results):
            required_fields = ["similarity", "jobLevel", "overall_score", "keyword_match_score"]
            for field in required_fields:
                assert field in result, f"Result {i} missing field: {field}"
        
        # Check that scores are in valid ranges
        for i, result in enumerate(results):
            assert 0.0 <= result["similarity"] <= 1.0, f"Result {i} similarity out of range"
            assert 0.0 <= result["overall_score"] <= 1.0, f"Result {i} overall_score out of range"
            assert 0.0 <= result["keyword_match_score"] <= 1.0, f"Result {i} keyword_match_score out of range"
        
        print(f"✅ Data consistency test passed")
        print(f"📊 Results consistency: {len(results)} runs completed successfully")
    
    def test_workflow_end_to_end_scenarios(self, hybrid_client, sample_resume_data, sample_job_data):
        """Test end-to-end scenarios that mirror real-world usage"""
        scenarios = [
            {
                "name": "Perfect Match",
                "resume": sample_resume_data["senior_developer"],
                "job": sample_job_data["senior_developer"],
                "level": "senior",
                "expected_score_min": 0.6
            },
            {
                "name": "Partial Match",
                "resume": sample_resume_data["mid_developer"],
                "job": sample_job_data["senior_developer"],
                "level": "senior",
                "expected_score_min": 0.3
            },
            {
                "name": "Mismatch",
                "resume": sample_resume_data["junior_developer"],
                "job": sample_job_data["senior_developer"],
                "level": "senior",
                "expected_score_min": 0.2
            }
        ]
        
        for scenario in scenarios:
            payload = {
                "resume": scenario["resume"],
                "job": scenario["job"],
                "jobLevel": scenario["level"]
            }
            
            response = hybrid_client.post("/analyze", json=payload)
            assert response.status_code == 200
            
            data = response.json()
            actual_score = data["overall_score"]
            
            assert actual_score >= scenario["expected_score_min"], \
                f"Scenario '{scenario['name']}' score {actual_score} below minimum {scenario['expected_score_min']}"
            
            print(f"✅ {scenario['name']}: Score {actual_score:.3f} (min: {scenario['expected_score_min']})")
        
        print(f"✅ End-to-end scenarios test passed")
    
    def test_workflow_ats_compliance_integration(self, hybrid_client, ats_optimized_resume, non_ats_resume, sample_job_data):
        """Test workflow with ATS compliance features"""
        # Test ATS-optimized resume
        ats_payload = {
            "resume": ats_optimized_resume,
            "job": sample_job_data["senior_developer"],
            "jobLevel": "senior"
        }
        
        ats_response = hybrid_client.post("/analyze", json=ats_payload)
        assert ats_response.status_code == 200
        ats_data = ats_response.json()
        
        # Test non-ATS resume
        non_ats_payload = {
            "resume": non_ats_resume,
            "job": sample_job_data["senior_developer"],
            "jobLevel": "senior"
        }
        
        non_ats_response = hybrid_client.post("/analyze", json=non_ats_payload)
        assert non_ats_response.status_code == 200
        non_ats_data = non_ats_response.json()
        
        # ATS-optimized resume should score higher
        assert ats_data["overall_score"] >= non_ats_data["overall_score"], \
            "ATS-optimized resume should score higher than non-ATS resume"
        
        print(f"✅ ATS compliance integration test passed")
        print(f"📊 ATS Resume Score: {ats_data['overall_score']:.3f}")
        print(f"📊 Non-ATS Resume Score: {non_ats_data['overall_score']:.3f}")
    
    def test_workflow_skill_gap_analysis_integration(self, hybrid_client, sample_resume_data, sample_job_data):
        """Test workflow with comprehensive skill gap analysis"""
        payload = {
            "resume": sample_resume_data["mid_developer"],  # Use mid-level resume
            "job": sample_job_data["senior_developer"],     # Compare with senior job
            "jobLevel": "senior"
        }
        
        response = hybrid_client.post("/analyze", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        skill_gap = data["skill_gap_analysis"]
        
        # Validate skill gap analysis
        assert "missing_skills" in skill_gap
        assert "skill_gap_score" in skill_gap
        assert isinstance(skill_gap["missing_skills"], list)
        assert 0.0 <= skill_gap["skill_gap_score"] <= 1.0
        
        # Should have some missing skills when comparing mid to senior
        assert len(skill_gap["missing_skills"]) > 0, "Should identify missing skills for level mismatch"
        
        print(f"✅ Skill gap analysis integration test passed")
        print(f"📊 Skill Gap Score: {skill_gap['skill_gap_score']:.3f}")
        print(f"🔍 Missing Skills: {len(skill_gap['missing_skills'])} identified")
    
    def test_workflow_improvement_suggestions_integration(self, hybrid_client, sample_resume_data, sample_job_data):
        """Test workflow with improvement suggestions"""
        payload = {
            "resume": sample_resume_data["junior_developer"],  # Use junior resume
            "job": sample_job_data["senior_developer"],       # Compare with senior job
            "jobLevel": "senior"
        }
        
        response = hybrid_client.post("/analyze", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        suggestions = data["improvement_suggestions"]
        
        # Validate improvement suggestions
        assert isinstance(suggestions, list)
        assert len(suggestions) > 0, "Should provide improvement suggestions"
        
        # Check that suggestions are meaningful
        for suggestion in suggestions:
            assert len(suggestion) > 10, "Suggestions should be meaningful"
            assert isinstance(suggestion, str), "Suggestions should be strings"
        
        print(f"✅ Improvement suggestions integration test passed")
        print(f"💡 Suggestions provided: {len(suggestions)}")
        for i, suggestion in enumerate(suggestions[:3], 1):  # Show first 3
            print(f"   {i}. {suggestion[:100]}...") 