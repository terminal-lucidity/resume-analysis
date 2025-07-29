#!/usr/bin/env python3
"""
Improved Hybrid Resume Analysis Service
Enhanced field detection and standalone scoring with improved ATS analysis
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

# Import improved ATS analyzer
from improved_ats_analysis import ImprovedATSAnalyzer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Improved Hybrid Resume Analysis Service")

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
    ats_score: Optional[float] = None
    achievement_score: Optional[float] = None
    format_score: Optional[float] = None
    section_completeness: Optional[float] = None
    standalone_score: Optional[float] = None

class ImprovedAnalyzer:
    def __init__(self):
        # Initialize improved ATS analyzer
        self.ats_analyzer = ImprovedATSAnalyzer()
        
        # Enhanced technical keywords by category
        self.technical_keywords = {
            'programming': ['python', 'javascript', 'java', 'c++', 'c#', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'typescript', 'scala', 'r', 'matlab'],
            'frameworks': ['react', 'angular', 'vue', 'django', 'flask', 'express', 'spring', 'laravel', 'rails', 'node.js', 'asp.net', 'jquery', 'bootstrap', 'tailwind'],
            'databases': ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'oracle', 'sql server', 'sqlite', 'neo4j'],
            'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'gitlab', 'github actions', 'ci/cd', 'microservices'],
            'ml_ai': ['tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'opencv', 'keras', 'xgboost', 'spark', 'hadoop'],
            'tools': ['git', 'jira', 'confluence', 'slack', 'figma', 'postman', 'swagger', 'maven', 'gradle', 'npm', 'yarn']
        }
        
        # Enhanced ATS keywords
        self.ats_keywords = {
            'leadership': ['led', 'managed', 'supervised', 'directed', 'coordinated', 'oversaw', 'headed', 'chaired', 'mentored', 'trained'],
            'achievement': ['increased', 'decreased', 'improved', 'enhanced', 'optimized', 'streamlined', 'reduced', 'grew', 'boosted', 'accelerated'],
            'technical_skills': ['developed', 'implemented', 'designed', 'architected', 'built', 'created', 'programmed', 'coded', 'debugged', 'deployed'],
            'communication': ['presented', 'communicated', 'collaborated', 'coordinated', 'liaised', 'negotiated', 'facilitated', 'documented', 'reported'],
            'analysis': ['analyzed', 'evaluated', 'assessed', 'researched', 'investigated', 'examined', 'studied', 'diagnosed', 'troubleshot'],
            'project_management': ['planned', 'organized', 'scheduled', 'budgeted', 'executed', 'delivered', 'completed', 'launched', 'maintained']
        }
        
        # Enhanced strong action verbs
        self.strong_action_verbs = [
            'achieved', 'accelerated', 'accomplished', 'acquired', 'adapted', 'administered', 'advanced', 'advised',
            'analyzed', 'architected', 'assembled', 'assessed', 'assigned', 'assisted', 'attained', 'authored',
            'automated', 'balanced', 'boosted', 'built', 'calculated', 'catalyzed', 'chaired', 'changed',
            'collaborated', 'collected', 'commanded', 'communicated', 'compiled', 'completed', 'computed', 'conceived',
            'conducted', 'configured', 'consolidated', 'constructed', 'consulted', 'contracted', 'coordinated', 'created',
            'cultivated', 'customized', 'debugged', 'decreased', 'defined', 'delivered', 'demonstrated', 'designed',
            'developed', 'devised', 'diagnosed', 'directed', 'discovered', 'distributed', 'drafted', 'earned',
            'edited', 'educated', 'eliminated', 'enabled', 'enforced', 'engineered', 'enhanced', 'enlarged',
            'established', 'evaluated', 'examined', 'executed', 'expanded', 'expedited', 'experimented', 'explained',
            'facilitated', 'focused', 'forecasted', 'formed', 'formulated', 'founded', 'generated', 'governed',
            'guided', 'handled', 'headed', 'helped', 'hired', 'identified', 'implemented', 'improved',
            'increased', 'influenced', 'initiated', 'innovated', 'inspected', 'installed', 'instituted', 'instructed',
            'integrated', 'interpreted', 'interviewed', 'introduced', 'invented', 'investigated', 'launched', 'led',
            'maintained', 'managed', 'marketed', 'measured', 'mediated', 'mentored', 'monitored', 'motivated',
            'negotiated', 'operated', 'organized', 'originated', 'oversaw', 'performed', 'persuaded', 'planned',
            'prepared', 'presented', 'produced', 'programmed', 'projected', 'promoted', 'proposed', 'provided',
            'published', 'purchased', 'qualified', 'quantified', 'questioned', 'raised', 'recommended', 'recruited',
            'reduced', 'regulated', 'reinforced', 'reorganized', 'repaired', 'replaced', 'reported', 'researched',
            'resolved', 'restored', 'retained', 'retrieved', 'reviewed', 'revised', 'scheduled', 'secured',
            'selected', 'served', 'set', 'shaped', 'solved', 'specified', 'sponsored', 'started',
            'streamlined', 'strengthened', 'structured', 'studied', 'supervised', 'supplied', 'supported', 'sustained',
            'targeted', 'taught', 'tested', 'trained', 'transformed', 'translated', 'troubleshot', 'unified',
            'updated', 'upgraded', 'utilized', 'validated', 'verified', 'visualized', 'wrote'
        ]
    
    def enhanced_section_detection(self, text: str) -> Dict[str, Any]:
        """Use improved ATS analyzer for section detection"""
        return self.ats_analyzer.detect_sections(text)
    
    def calculate_standalone_score(self, resume_text: str) -> Dict[str, Any]:
        """Use improved ATS analyzer for standalone scoring"""
        return self.ats_analyzer.calculate_standalone_score(resume_text)
    
    def detect_quantifiable_achievements(self, text: str) -> Dict[str, Any]:
        """Use improved ATS analyzer for achievements detection"""
        return self.ats_analyzer.detect_quantifiable_achievements(text)
    
    def analyze_format_optimization(self, text: str) -> Dict[str, Any]:
        """Use improved ATS analyzer for format optimization"""
        return self.ats_analyzer.analyze_format_optimization(text)
    
    def extract_keywords(self, text: str) -> Dict[str, List[str]]:
        """Use improved ATS analyzer for keyword extraction"""
        return self.ats_analyzer.extract_keywords(text)
    
    def detect_action_verbs(self, text: str) -> Dict[str, List[str]]:
        """Use improved ATS analyzer for action verb detection"""
        return self.ats_analyzer.detect_action_verbs(text)
    
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
    
    def generate_llm_insights(self, resume_text: str, job_text: str, job_level: str) -> Dict[str, Any]:
        """Generate insights using LLM (if available)"""
        prompt = f"""
        Analyze this resume and provide insights:
        
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

analyzer = ImprovedAnalyzer()

@app.post('/analyze', response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest):
    try:
        logger.info(f"Starting improved analysis for job level: {request.jobLevel}")
        
        if not model:
            raise HTTPException(status_code=500, detail="Embedding model not available")
        
        # 1. Enhanced section detection using improved ATS analyzer
        section_analysis = analyzer.enhanced_section_detection(request.resume)
        
        # Convert section analysis to frontend-compatible format
        section_analysis_frontend = {
            'section_scores': section_analysis['section_scores'],
            'completeness_score': section_analysis['completeness_score'],
            'missing_sections': section_analysis['missing_sections'],
            'detected_sections': list(section_analysis['detected_sections'].keys()),
            'detailed_section_analysis': section_analysis['section_scores']
        }
        
        # 2. Standalone scoring using improved ATS analyzer
        standalone_analysis = analyzer.calculate_standalone_score(request.resume)
        
        # 3. Semantic similarity using embeddings (if job description provided)
        semantic_similarity = 0.0
        if request.job.strip():
            resume_emb = model.encode(request.resume, convert_to_tensor=True)
            job_emb = model.encode(request.job, convert_to_tensor=True)
            semantic_similarity = util.pytorch_cos_sim(resume_emb, job_emb).item()
        
        # 4. Keyword-based similarity (if job description provided)
        keyword_similarity = 0.0
        if request.job.strip():
            keyword_similarity = analyzer.calculate_keyword_similarity(request.resume, request.job)
        
        # 5. Extract keywords and skills using improved ATS analyzer
        resume_keywords = analyzer.extract_keywords(request.resume)
        job_keywords = analyzer.extract_keywords(request.job) if request.job.strip() else {}
        
        # 6. Enhanced achievements detection using improved ATS analyzer
        achievements_analysis = analyzer.detect_quantifiable_achievements(request.resume)
        
        # 7. Format optimization analysis using improved ATS analyzer
        format_analysis = analyzer.analyze_format_optimization(request.resume)
        
        # 8. Action verbs detection using improved ATS analyzer
        action_verbs_analysis = analyzer.detect_action_verbs(request.resume)
        
        # 9. LLM insights (if available)
        llm_insights = analyzer.generate_llm_insights(request.resume, request.job, request.jobLevel)
        
        # 10. Calculate skill gap (if job description provided)
        skill_gap_analysis = {
            'missing_skills': [],
            'skill_gap_score': 1.0,
            'resume_skills_count': len(resume_keywords.get('programming', []) + resume_keywords.get('frameworks', [])),
            'job_skills_count': 0
        }
        
        if request.job.strip():
            resume_skill_set = set()
            for skills in resume_keywords.values():
                resume_skill_set.update(skills)
            
            job_skill_set = set()
            for skills in job_keywords.values():
                job_skill_set.update(skills)
            
            missing_skills = job_skill_set - resume_skill_set
            skill_gap_score = 1 - (len(missing_skills) / max(1, len(job_skill_set)))
            
            skill_gap_analysis = {
                'missing_skills': list(missing_skills),
                'skill_gap_score': skill_gap_score,
                'resume_skills_count': len(resume_skill_set),
                'job_skills_count': len(job_skill_set)
            }
        
        # 11. Calculate enhanced overall score
        if request.job.strip():
            # With job description
            overall_score = (
                semantic_similarity * 0.25 +
                keyword_similarity * 0.20 +
                standalone_analysis['standalone_score'] * 0.30 +
                section_analysis_frontend['completeness_score'] * 0.15 +
                format_analysis['format_score'] * 0.10
            )
        else:
            # Without job description - use standalone score
            overall_score = standalone_analysis['standalone_score']
        
        # 12. Generate enhanced improvement suggestions
        suggestions = []
        
        # Standalone suggestions based on improved ATS analysis
        if standalone_analysis['content_score'] < 0.4:
            suggestions.append("Add more detailed descriptions to your resume")
        
        if standalone_analysis['skills_diversity'] < 0.4:
            suggestions.append("Include more technical skills and technologies")
        
        if standalone_analysis['action_verb_score'] < 0.3:
            suggestions.append("Use more strong action verbs to make your achievements stand out")
        
        if achievements_analysis['achievement_score'] < 0.4:
            suggestions.append("Add quantifiable achievements with specific numbers and percentages")
        
        if section_analysis_frontend['completeness_score'] < 0.6:
            missing_sections = section_analysis_frontend['missing_sections']
            suggestions.append(f"Add missing sections: {', '.join(missing_sections[:3])}")
        
        if not format_analysis['ats_friendly']:
            suggestions.append("Optimize formatting for ATS compatibility - use simple fonts and avoid tables/graphics")
        
        # Action verb suggestions
        if action_verbs_analysis:
            total_verbs = sum(len(verbs) for verbs in action_verbs_analysis.values())
            if total_verbs < 8:
                suggestions.append("Include more action verbs to demonstrate your impact and achievements")
        
        # Job-specific suggestions (if job description provided)
        if request.job.strip():
            if semantic_similarity < 0.4:
                suggestions.append("Consider adding more relevant keywords from the job description")
            if keyword_similarity < 0.2:
                suggestions.append("Include more technical skills mentioned in the job posting")
            if skill_gap_analysis['skill_gap_score'] < 0.6:
                suggestions.append(f"Consider learning: {', '.join(skill_gap_analysis['missing_skills'][:5])}")
        
        # Add LLM suggestions if available
        if llm_insights.get('suggestions'):
            suggestions.extend(llm_insights['suggestions'][:2])
        
        detailed_analysis = {
            'semantic_similarity': semantic_similarity,
            'keyword_similarity': keyword_similarity,
            'resume_keywords': resume_keywords,
            'job_keywords': job_keywords,
            'section_analysis': section_analysis_frontend,
            'standalone_analysis': standalone_analysis,
            'achievements_analysis': achievements_analysis,
            'format_analysis': format_analysis,
            'action_verbs_analysis': action_verbs_analysis,
            'llm_insights': llm_insights,
            # Add ATS analysis for frontend compatibility
            'ats_analysis': {
                'found_action_verbs': action_verbs_analysis.get('technical', []) + 
                                    action_verbs_analysis.get('achievement', []) + 
                                    action_verbs_analysis.get('leadership', []),
                'action_verb_score': standalone_analysis['action_verb_score'],
                'achievement_score': achievements_analysis['achievement_score'],
                'format_score': format_analysis['format_score'],
                'section_completeness': section_analysis_frontend['completeness_score']
            }
        }
        
        return AnalysisResponse(
            similarity=semantic_similarity,
            jobLevel=request.jobLevel,
            overall_score=overall_score,
            keyword_match_score=keyword_similarity,
            skill_gap_analysis=skill_gap_analysis,
            improvement_suggestions=suggestions[:8],  # Increased to accommodate more suggestions
            detailed_analysis=detailed_analysis,
            ats_score=standalone_analysis['action_verb_score'],
            achievement_score=achievements_analysis['achievement_score'],
            format_score=format_analysis['format_score'],
            section_completeness=section_analysis_frontend['completeness_score'],
            standalone_score=standalone_analysis['standalone_score']
        )
        
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get('/health')
async def health_check():
    return {"status": "healthy", "service": "improved-hybrid-analyzer"}

if __name__ == "__main__":
    import uvicorn
    print("Starting Improved Hybrid Resume Analysis Service...")
    uvicorn.run(app, host="0.0.0.0", port=8001) 