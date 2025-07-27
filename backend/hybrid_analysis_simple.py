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
    ats_score: Optional[float] = None
    achievement_score: Optional[float] = None
    format_score: Optional[float] = None
    section_completeness: Optional[float] = None

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
        
        # ATS-specific keywords and variations
        self.ats_keywords = {
            'leadership': ['led', 'managed', 'supervised', 'directed', 'coordinated', 'oversaw', 'headed', 'chaired'],
            'achievement': ['increased', 'decreased', 'improved', 'enhanced', 'optimized', 'streamlined', 'reduced', 'grew'],
            'technical_skills': ['developed', 'implemented', 'designed', 'architected', 'built', 'created', 'programmed', 'coded'],
            'communication': ['presented', 'communicated', 'collaborated', 'coordinated', 'liaised', 'negotiated', 'facilitated'],
            'analysis': ['analyzed', 'evaluated', 'assessed', 'researched', 'investigated', 'examined', 'studied'],
            'project_management': ['planned', 'organized', 'scheduled', 'budgeted', 'executed', 'delivered', 'completed']
        }
        
        # Industry-specific terminology
        self.industry_keywords = {
            'software_engineering': ['agile', 'scrum', 'sprint', 'ci/cd', 'devops', 'microservices', 'api', 'rest', 'graphql'],
            'data_science': ['machine learning', 'deep learning', 'neural networks', 'statistical analysis', 'data mining', 'predictive modeling'],
            'product_management': ['product roadmap', 'user stories', 'mvp', 'kpi', 'okr', 'user experience', 'market research'],
            'marketing': ['seo', 'sem', 'social media', 'content marketing', 'email campaigns', 'conversion rate', 'roi'],
            'finance': ['financial modeling', 'budgeting', 'forecasting', 'risk assessment', 'compliance', 'audit', 'p&l'],
            'sales': ['lead generation', 'pipeline management', 'crm', 'quota', 'territory', 'prospecting', 'closing']
        }
        
        # Strong action verbs for ATS optimization
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
        
        # Required resume sections for ATS
        self.required_sections = [
            'experience', 'education', 'skills', 'contact', 'summary', 'objective'
        ]
        
        # ATS-friendly formatting indicators
        self.ats_formatting = {
            'simple_fonts': ['arial', 'calibri', 'times new roman', 'georgia', 'verdana'],
            'standard_sections': ['experience', 'education', 'skills', 'summary', 'contact'],
            'avoid_elements': ['tables', 'images', 'graphics', 'columns', 'headers', 'footers']
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
    
    def analyze_ats_keywords(self, resume_text: str, job_text: str) -> Dict[str, Any]:
        """Analyze ATS-specific keyword matching"""
        resume_lower = resume_text.lower()
        job_lower = job_text.lower()
        
        # Check for strong action verbs with better detection
        found_action_verbs = []
        for verb in self.strong_action_verbs:
            # Check for exact word matches (not just substring)
            import re
            pattern = r'\b' + re.escape(verb) + r'\b'
            if re.search(pattern, resume_lower):
                found_action_verbs.append(verb)
        
        action_verb_score = min(len(found_action_verbs) / 15, 1.0)  # Normalize to 0-1
        
        # Check for ATS keyword categories
        ats_scores = {}
        for category, keywords in self.ats_keywords.items():
            resume_matches = sum(1 for kw in keywords if kw in resume_lower)
            job_matches = sum(1 for kw in keywords if kw in job_lower)
            if job_matches > 0:
                ats_scores[category] = resume_matches / job_matches
            else:
                ats_scores[category] = 0.0
        
        # Check for industry-specific keywords
        industry_scores = {}
        for industry, keywords in self.industry_keywords.items():
            resume_matches = sum(1 for kw in keywords if kw in resume_lower)
            job_matches = sum(1 for kw in keywords if kw in job_lower)
            if job_matches > 0:
                industry_scores[industry] = resume_matches / job_matches
            else:
                industry_scores[industry] = 0.0
        
        return {
            'action_verb_score': action_verb_score,
            'found_action_verbs': found_action_verbs[:10],  # Top 10
            'ats_category_scores': ats_scores,
            'industry_scores': industry_scores,
            'overall_ats_score': (action_verb_score + sum(ats_scores.values()) / len(ats_scores)) / 2
        }
    
    def detect_quantifiable_achievements(self, text: str) -> Dict[str, Any]:
        """Detect quantifiable achievements and metrics"""
        import re
        
        # Enhanced patterns for numbers and percentages
        number_patterns = [
            r'\d+%',  # Percentages
            r'\$\d+[,\d]*',  # Dollar amounts
            r'\d+[,\d]*\s*(users|customers|clients|projects|team members|people)',  # Counts with context
            r'increased\s+by\s+\d+%',  # Increase patterns
            r'decreased\s+by\s+\d+%',  # Decrease patterns
            r'reduced\s+by\s+\d+%',  # Reduction patterns
            r'improved\s+by\s+\d+%',  # Improvement patterns
            r'cut\s+.*\s+by\s+\d+%',  # Cut patterns
            r'optimized\s+.*\s+by\s+\d+%',  # Optimization patterns
            r'\d+\s+years?\s+of\s+experience',  # Experience duration
            r'managed\s+\d+[,\d]*\s*budget',  # Budget management
            r'gpa\s*:\s*\d+\.\d+',  # GPA
            r'\d+\.\d+\s*/\s*4\.0',  # GPA format
            r'response time.*\d+%',  # Performance metrics
            r'efficiency.*\d+%',  # Efficiency metrics
        ]
        
        achievements = []
        for pattern in number_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            achievements.extend(matches)
        
        # Look for specific achievement indicators with context
        achievement_indicators = [
            'achieved', 'accomplished', 'delivered', 'completed', 'launched', 'implemented',
            'increased', 'decreased', 'improved', 'reduced', 'grew', 'expanded', 'optimized',
            'engineered', 'architected', 'developed', 'built', 'created', 'designed'
        ]
        
        achievement_sentences = []
        sentences = text.split('.')
        for sentence in sentences:
            sentence_lower = sentence.lower()
            # Check if sentence contains both achievement indicators and numbers
            has_indicator = any(indicator in sentence_lower for indicator in achievement_indicators)
            has_number = bool(re.search(r'\d+', sentence))
            
            if has_indicator and has_number:
                achievement_sentences.append(sentence.strip())
        
        # Calculate achievement score based on both quantifiable metrics and achievement sentences
        total_achievements = len(achievements) + len(achievement_sentences)
        achievement_score = min(total_achievements / 8, 1.0)  # Normalize to 0-1
        
        return {
            'quantifiable_achievements': achievements,
            'achievement_sentences': achievement_sentences[:5],  # Top 5
            'achievement_score': achievement_score
        }
    
    def check_section_completeness(self, text: str) -> Dict[str, Any]:
        """Check for required resume sections with improved parsing"""
        text_lower = text.lower()
        
        section_scores = {}
        section_mappings = {
            'experience': [
                'experience', 'work experience', 'professional experience', 'employment history',
                'work history', 'career history', 'employment', 'work', 'e x p e r i e n c e'
            ],
            'education': [
                'education', 'academic background', 'academic history', 'educational background',
                'degrees', 'qualifications', 'academic', 'e d u c a t i o n'
            ],
            'skills': [
                'skills', 'technical skills', 'competencies', 'expertise', 'proficiencies',
                'capabilities', 'skill set', 's k i l l s', 'tools & technologies'
            ],
            'contact': [
                'contact', 'contact information', 'personal information', 'contact details',
                'address', 'phone', 'email', 'linkedin', 'github'
            ],
            'summary': [
                'summary', 'profile', 'objective', 'personal statement', 'career objective',
                'professional summary', 'executive summary', 'overview'
            ],
            'objective': [
                'objective', 'career objective', 'professional objective', 'goal',
                'career goal', 'professional goal'
            ]
        }
        
        for section, indicators in section_mappings.items():
            # Check for section headers with various formats
            found = False
            
            # Check for exact matches in the text
            for indicator in indicators:
                if indicator in text_lower:
                    found = True
                    break
            
            # If not found, check for section patterns in lines
            if not found:
                lines = text.split('\n')
                for line in lines:
                    line_lower = line.strip().lower()
                    for indicator in indicators:
                        # Check if line starts with or contains the indicator
                        if (line_lower.startswith(indicator) or 
                            line_lower.startswith(indicator + ':') or
                            line_lower.startswith(indicator + ' ') or
                            indicator in line_lower):
                            found = True
                            break
                    if found:
                        break
            
            section_scores[section] = 1.0 if found else 0.0
        
        # Enhanced contact information detection
        contact_patterns = [
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Email
            r'\(\d{3}\)\s*\d{3}-\d{4}',  # Phone (US format)
            r'\d{3}-\d{3}-\d{4}',  # Phone (dashed format)
            r'linkedin\.com',  # LinkedIn
            r'github\.com',  # GitHub
            r'@[a-zA-Z0-9_]+',  # Social media handles
        ]
        
        import re
        contact_found = any(re.search(pattern, text, re.IGNORECASE) for pattern in contact_patterns)
        
        # If contact section wasn't found but contact info exists, mark it as found
        if contact_found and section_scores.get('contact', 0) == 0:
            section_scores['contact'] = 1.0
        
        # Special handling for summary/objective - if one is found, mark both as present
        if section_scores.get('summary', 0) == 1.0 or section_scores.get('objective', 0) == 1.0:
            section_scores['summary'] = 1.0
            section_scores['objective'] = 1.0
        
        completeness_score = sum(section_scores.values()) / len(section_scores)
        
        return {
            'section_scores': section_scores,
            'completeness_score': completeness_score,
            'missing_sections': [section for section, score in section_scores.items() if score == 0.0],
            'detected_sections': [section for section, score in section_scores.items() if score == 1.0]
        }
    
    def analyze_format_optimization(self, text: str) -> Dict[str, Any]:
        """Analyze ATS-friendly formatting"""
        # Check for problematic elements
        problematic_elements = []
        
        # Check for tables (basic detection)
        if '|' in text and text.count('|') > 10:
            problematic_elements.append('tables')
        
        # Check for excessive formatting
        if text.count('\t') > 20:
            problematic_elements.append('excessive_tabs')
        
        # Check for images/graphics indicators
        if any(indicator in text.lower() for indicator in ['[image]', '[graphic]', '[chart]', '[logo]']):
            problematic_elements.append('images')
        
        # Check for bullet points (good for ATS)
        bullet_points = text.count('•') + text.count('-') + text.count('*')
        bullet_score = min(bullet_points / 8, 1.0)  # Adjusted threshold
        
        # Check for proper spacing and structure
        lines = text.split('\n')
        empty_lines = sum(1 for line in lines if line.strip() == '')
        spacing_score = min(empty_lines / max(len(lines), 1), 1.0)
        
        # Check for section headers (good for ATS)
        section_headers = 0
        for line in lines:
            line_stripped = line.strip()
            if (line_stripped.isupper() and len(line_stripped) > 3 and 
                any(word in line_stripped.lower() for word in ['experience', 'education', 'skills', 'contact', 'summary'])):
                section_headers += 1
        
        header_score = min(section_headers / 4, 1.0)
        
        # Check for consistent formatting
        has_consistent_formatting = (
            bullet_score > 0.3 and 
            spacing_score > 0.05 and 
            header_score > 0.5 and
            len(problematic_elements) == 0
        )
        
        # Calculate overall format score
        format_score = (bullet_score + spacing_score + header_score) / 3
        if problematic_elements:
            format_score *= 0.5  # Penalize for problematic elements
        
        return {
            'problematic_elements': problematic_elements,
            'bullet_score': bullet_score,
            'spacing_score': spacing_score,
            'header_score': header_score,
            'format_score': format_score,
            'ats_friendly': has_consistent_formatting
        }
    
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
        
        # 6. NEW: ATS-specific analysis
        ats_analysis = analyzer.analyze_ats_keywords(request.resume, request.job)
        
        # 7. NEW: Quantifiable achievements detection
        achievements_analysis = analyzer.detect_quantifiable_achievements(request.resume)
        
        # 8. NEW: Section completeness check
        section_analysis = analyzer.check_section_completeness(request.resume)
        
        # 9. NEW: Format optimization analysis
        format_analysis = analyzer.analyze_format_optimization(request.resume)
        
        # 10. LLM insights (if available)
        llm_insights = analyzer.generate_llm_insights(request.resume, request.job, request.jobLevel)
        
        # 11. Calculate skill gap
        resume_skill_set = set(resume_skills['skills'])
        job_skill_set = set(job_skills['skills'])
        missing_skills = job_skill_set - resume_skill_set
        skill_gap_score = 1 - (len(missing_skills) / max(1, len(job_skill_set)))
        
        # 12. Calculate enhanced overall score with ATS components
        ats_score = (
            ats_analysis['overall_ats_score'] * 0.25 +
            achievements_analysis['achievement_score'] * 0.20 +
            section_analysis['completeness_score'] * 0.15 +
            format_analysis['format_score'] * 0.10
        )
        
        overall_score = (
            semantic_similarity * 0.25 +
            keyword_similarity * 0.20 +
            level_analysis['level_match_score'] * 0.15 +
            skill_gap_score * 0.10 +
            ats_score * 0.30  # ATS components get significant weight
        )
        
        # 13. Generate enhanced improvement suggestions
        suggestions = []
        
        # ATS-specific suggestions
        if ats_analysis['action_verb_score'] < 0.5:
            suggestions.append("Use more strong action verbs to make your achievements stand out")
        
        if achievements_analysis['achievement_score'] < 0.3:
            suggestions.append("Add quantifiable achievements with specific numbers and percentages")
        
        if section_analysis['completeness_score'] < 0.7:
            missing_sections = section_analysis['missing_sections']
            suggestions.append(f"Add missing sections: {', '.join(missing_sections[:3])}")
        
        if not format_analysis['ats_friendly']:
            suggestions.append("Optimize formatting for ATS compatibility - use simple fonts and avoid tables/graphics")
        
        # Original suggestions
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
            'ats_analysis': ats_analysis,
            'achievements_analysis': achievements_analysis,
            'section_analysis': section_analysis,
            'format_analysis': format_analysis,
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
            improvement_suggestions=suggestions[:7],  # Increased to accommodate more suggestions
            detailed_analysis=detailed_analysis,
            ats_score=ats_analysis['overall_ats_score'],
            achievement_score=achievements_analysis['achievement_score'],
            format_score=format_analysis['format_score'],
            section_completeness=section_analysis['completeness_score']
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