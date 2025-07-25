#!/usr/bin/env python3
"""
Simplified Hybrid Resume Analysis Service
This version focuses on core functionality without complex dependencies
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import numpy as np
import re
import json
import requests
from typing import List, Dict, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Simplified Hybrid Resume Analysis Service")

# Initialize the embedding model
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    logger.info("Sentence transformer model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load sentence transformer: {e}")
    model = None

class AnalysisRequest(BaseModel):
    resume: str
    job: str
    jobLevel: str

class AnalysisResponse(BaseModel):
    similarity: float
    jobLevel: str
    overall_score: float
    keyword_match_score: float
    skill_gap_analysis: Dict[str, Any]
    improvement_suggestions: List[str]
    detailed_analysis: Dict[str, Any]

class SimpleAnalyzer:
    def __init__(self):
        # Technical keywords by category
        self.technical_keywords = {
            'programming': ['python', 'javascript', 'java', 'c++', 'c#', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin'],
            'frameworks': ['react', 'angular', 'vue', 'django', 'flask', 'express', 'spring', 'laravel', 'rails'],
            'databases': ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb'],
            'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'gitlab'],
            'ml_ai': ['tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'opencv'],
            'tools': ['git', 'jira', 'confluence', 'slack', 'figma', 'postman', 'swagger']
        }
    
    def extract_keywords(self, text: str) -> Dict[str, List[str]]:
        """Extract technical keywords from text"""
        text_lower = text.lower()
        extracted_keywords = {}
        
        for category, keywords in self.technical_keywords.items():
            found_keywords = [kw for kw in keywords if kw in text_lower]
            if found_keywords:
                extracted_keywords[category] = found_keywords
        
        return extracted_keywords
    
    def calculate_keyword_similarity(self, resume_text: str, job_text: str) -> float:
        """Calculate keyword-based similarity using simple word matching"""
        try:
            # Clean and prepare texts
            resume_clean = re.sub(r'[^\w\s]', '', resume_text.lower())
            job_clean = re.sub(r'[^\w\s]', '', job_text.lower())
            
            # Get all technical keywords
            all_keywords = []
            for keywords in self.technical_keywords.values():
                all_keywords.extend(keywords)
            
            # Count keyword matches
            resume_words = set(resume_clean.split())
            job_words = set(job_clean.split())
            
            resume_keywords = resume_words.intersection(set(all_keywords))
            job_keywords = job_words.intersection(set(all_keywords))
            
            if not job_keywords:
                return 0.0
            
            # Calculate Jaccard similarity
            intersection = resume_keywords.intersection(job_keywords)
            union = resume_keywords.union(job_keywords)
            
            return len(intersection) / len(union) if union else 0.0
            
        except Exception as e:
            logger.error(f"Error in keyword similarity: {e}")
            return 0.0
    
    def extract_skills_and_experience(self, text: str) -> Dict[str, Any]:
        """Extract skills and experience using simple text analysis"""
        text_lower = text.lower()
        
        # Extract skills (simple approach)
        skills = []
        for category, keywords in self.technical_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    skills.append(keyword)
        
        # Extract experience indicators
        experience_indicators = ['years', 'experience', 'worked', 'developed', 'implemented', 'managed', 'led']
        experience_score = sum(1 for word in text_lower.split() if word in experience_indicators)
        
        return {
            'skills': list(set(skills)),
            'experience_score': experience_score
        }
    
    def analyze_job_level_fit(self, resume_text: str, job_level: str) -> Dict[str, Any]:
        """Analyze how well the resume fits the job level"""
        text_lower = resume_text.lower()
        
        # Keywords for different levels
        level_keywords = {
            'entry': ['entry', 'junior', 'graduate', 'intern', '0-1', '1 year', 'fresh'],
            'mid': ['mid', 'intermediate', '2-3', '3-4', 'experienced', '3+ years'],
            'senior': ['senior', 'lead', 'principal', '5+', 'architect', 'manager', '5+ years'],
            'executive': ['executive', 'director', 'vp', 'cto', 'ceo', 'head of', 'chief']
        }
        
        level_scores = {}
        for level, keywords in level_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            level_scores[level] = score
        
        # Determine best fit level
        best_fit = max(level_scores, key=lambda x: level_scores[x])
        
        return {
            'level_scores': level_scores,
            'best_fit_level': best_fit,
            'requested_level': job_level,
            'level_match_score': level_scores.get(job_level, 0) / max(1, max(level_scores.values()))
        }
    
    def call_ollama_llm(self, prompt: str) -> str:
        """Call Ollama LLM for advanced analysis (optional)"""
        try:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "llama2",
                    "prompt": prompt,
                    "stream": False
                },
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json().get('response', '')
            else:
                return ""
        except Exception as e:
            logger.debug(f"Ollama not available: {e}")
            return ""
    
    def generate_llm_insights(self, resume_text: str, job_text: str, job_level: str) -> Dict[str, Any]:
        """Generate insights using LLM (if available)"""
        prompt = f"""
        Analyze this resume against the job description and provide insights:
        
        Resume: {resume_text[:500]}
        Job Description: {job_text[:500]}
        Job Level: {job_level}
        
        Provide a JSON response with:
        1. strengths (list of 3 key strengths)
        2. weaknesses (list of 3 areas for improvement)
        3. suggestions (list of 3 improvement suggestions)
        4. overall_assessment (brief summary)
        
        Format as JSON only.
        """
        
        llm_response = self.call_ollama_llm(prompt)
        
        if llm_response:
            try:
                # Try to extract JSON from response
                json_match = re.search(r'\{.*\}', llm_response, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        
        # Fallback insights
        return {
            'strengths': ['Technical skills present', 'Relevant experience'],
            'weaknesses': ['Could add more specific achievements', 'Consider highlighting leadership'],
            'suggestions': ['Add quantifiable achievements', 'Include more relevant keywords'],
            'overall_assessment': 'Resume analysis completed successfully'
        }

analyzer = SimpleAnalyzer()

@app.post('/analyze', response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest):
    try:
        logger.info(f"Starting analysis for job level: {request.jobLevel}")
        
        if not model:
            raise HTTPException(status_code=500, detail="Embedding model not available")
        
        # 1. Semantic similarity using embeddings
        resume_emb = model.encode(request.resume, convert_to_tensor=True)
        job_emb = model.encode(request.job, convert_to_tensor=True)
        semantic_similarity = util.pytorch_cos_sim(resume_emb, job_emb).item()
        
        # 2. Keyword-based similarity
        keyword_similarity = analyzer.calculate_keyword_similarity(request.resume, request.job)
        
        # 3. Extract keywords and skills
        resume_keywords = analyzer.extract_keywords(request.resume)
        job_keywords = analyzer.extract_keywords(request.job)
        
        # 4. Skills and experience analysis
        resume_skills = analyzer.extract_skills_and_experience(request.resume)
        job_skills = analyzer.extract_skills_and_experience(request.job)
        
        # 5. Job level analysis
        level_analysis = analyzer.analyze_job_level_fit(request.resume, request.jobLevel)
        
        # 6. LLM insights (if available)
        llm_insights = analyzer.generate_llm_insights(request.resume, request.job, request.jobLevel)
        
        # 7. Calculate skill gap
        resume_skill_set = set(resume_skills['skills'])
        job_skill_set = set(job_skills['skills'])
        missing_skills = job_skill_set - resume_skill_set
        skill_gap_score = 1 - (len(missing_skills) / max(1, len(job_skill_set)))
        
        # 8. Calculate overall score (weighted combination)
        overall_score = (
            semantic_similarity * 0.4 +
            keyword_similarity * 0.3 +
            level_analysis['level_match_score'] * 0.2 +
            skill_gap_score * 0.1
        )
        
        # 9. Generate improvement suggestions
        suggestions = []
        if semantic_similarity < 0.5:
            suggestions.append("Consider adding more relevant keywords from the job description")
        if keyword_similarity < 0.3:
            suggestions.append("Include more technical skills mentioned in the job posting")
        if level_analysis['level_match_score'] < 0.5:
            suggestions.append(f"Add more {request.jobLevel}-level experience indicators")
        if skill_gap_score < 0.7:
            suggestions.append(f"Consider learning: {', '.join(list(missing_skills)[:5])}")
        
        # Add LLM suggestions if available
        if llm_insights.get('suggestions'):
            suggestions.extend(llm_insights['suggestions'][:2])
        
        detailed_analysis = {
            'semantic_similarity': semantic_similarity,
            'keyword_similarity': keyword_similarity,
            'resume_keywords': resume_keywords,
            'job_keywords': job_keywords,
            'resume_skills': resume_skills,
            'job_skills': job_skills,
            'level_analysis': level_analysis,
            'llm_insights': llm_insights
        }
        
        return AnalysisResponse(
            similarity=semantic_similarity,
            jobLevel=request.jobLevel,
            overall_score=overall_score,
            keyword_match_score=keyword_similarity,
            skill_gap_analysis={
                'missing_skills': list(missing_skills),
                'skill_gap_score': skill_gap_score,
                'resume_skills_count': len(resume_skill_set),
                'job_skills_count': len(job_skill_set)
            },
            improvement_suggestions=suggestions[:5],
            detailed_analysis=detailed_analysis
        )
        
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get('/health')
async def health_check():
    return {"status": "healthy", "service": "simplified-hybrid-analyzer"}

if __name__ == "__main__":
    import uvicorn
    print("Starting Simplified Hybrid Resume Analysis Service...")
    uvicorn.run(app, host="0.0.0.0", port=8001) 