#!/usr/bin/env python3
"""
Improved ATS Analysis Service
Enhanced section detection, keyword matching, and scoring algorithms
"""

import re
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SectionType(Enum):
    CONTACT = "contact"
    SUMMARY = "summary"
    EXPERIENCE = "experience"
    EDUCATION = "education"
    SKILLS = "skills"
    PROJECTS = "projects"
    CERTIFICATIONS = "certifications"
    LANGUAGES = "languages"
    AWARDS = "awards"
    VOLUNTEER = "volunteer"

@dataclass
class SectionInfo:
    name: str
    confidence: float
    content: str
    start_line: int
    end_line: int

class ImprovedATSAnalyzer:
    def __init__(self):
        # Enhanced section patterns with multiple detection strategies
        self.section_patterns = {
            SectionType.CONTACT: {
                'headers': [
                    r'contact\s*information?', r'personal\s*information?', r'contact\s*details?',
                    r'address', r'phone', r'email', r'linkedin', r'github', r'portfolio',
                    r'personal\s*details?', r'contact\s*info'
                ],
                'content_indicators': [
                    r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Email
                    r'\(\d{3}\)\s*\d{3}-\d{4}',  # Phone (US format)
                    r'\d{3}-\d{3}-\d{4}',  # Phone (dashed format)
                    r'\d{10}',  # Phone (10 digits)
                    r'linkedin\.com',  # LinkedIn
                    r'github\.com',  # GitHub
                    r'@[a-zA-Z0-9_]+',  # Social media handles
                ]
            },
            SectionType.SUMMARY: {
                'headers': [
                    r'summary', r'profile', r'objective', r'personal\s*statement', r'career\s*objective',
                    r'professional\s*summary', r'executive\s*summary', r'overview', r'profile\s*summary',
                    r'career\s*summary', r'professional\s*profile', r'introduction'
                ],
                'content_indicators': [
                    r'experienced', r'professional', r'passionate', r'dedicated', r'results?[- ]oriented',
                    r'years?\s+of\s+experience', r'background\s+in', r'expertise\s+in'
                ]
            },
            SectionType.EXPERIENCE: {
                'headers': [
                    r'experience', r'work\s+experience', r'professional\s+experience', r'employment\s+history',
                    r'work\s+history', r'career\s+history', r'employment', r'work', r'professional\s+background',
                    r'career\s+experience', r'work\s+experience', r'professional\s+background', r'employment\s+record'
                ],
                'content_indicators': [
                    r'\d{4}\s*[-–]\s*\d{4}', r'\d{4}\s*[-–]\s*present', r'\d{4}\s*[-–]\s*current',
                    r'years?\s+experience', r'worked\s+at', r'employed\s+at', r'position\s+at',
                    r'role\s+at', r'job\s+at', r'company', r'corporation', r'inc\.', r'llc'
                ]
            },
            SectionType.EDUCATION: {
                'headers': [
                    r'education', r'academic\s+background', r'academic\s+history', r'educational\s+background',
                    r'degrees?', r'qualifications?', r'academic', r'educational', r'degree',
                    r'university', r'college', r'school', r'graduation', r'studies'
                ],
                'content_indicators': [
                    r'bachelor', r'master', r'phd', r'doctorate', r'associate', r'diploma',
                    r'certificate', r'degree', r'university', r'college', r'institute',
                    r'gpa', r'grade\s+point\s+average', r'graduated', r'graduation'
                ]
            },
            SectionType.SKILLS: {
                'headers': [
                    r'skills', r'technical\s+skills', r'competencies', r'expertise', r'proficiencies',
                    r'capabilities', r'skill\s+set', r'technologies', r'tools', r'programming\s+languages',
                    r'technical\s+expertise', r'competencies', r'proficiencies', r'technologies'
                ],
                'content_indicators': [
                    r'python', r'javascript', r'java', r'c\+\+', r'c#', r'go', r'rust', r'php', r'ruby',
                    r'react', r'angular', r'vue', r'django', r'flask', r'express', r'spring',
                    r'mysql', r'postgresql', r'mongodb', r'redis', r'aws', r'azure', r'gcp',
                    r'git', r'jira', r'jenkins', r'docker', r'kubernetes'
                ]
            },
            SectionType.PROJECTS: {
                'headers': [
                    r'projects', r'project\s+experience', r'portfolio', r'personal\s+projects',
                    r'academic\s+projects', r'research\s+projects', r'project\s+work', r'portfolio\s+projects'
                ],
                'content_indicators': [
                    r'project', r'developed', r'built', r'created', r'designed', r'implemented',
                    r'portfolio', r'github\.com', r'deployed', r'launched'
                ]
            },
            SectionType.CERTIFICATIONS: {
                'headers': [
                    r'certifications', r'certificates', r'professional\s+certifications',
                    r'licenses', r'accreditations', r'professional\s+development', r'certifications?'
                ],
                'content_indicators': [
                    r'certified', r'certification', r'license', r'accredited', r'aws\s+certified',
                    r'azure\s+certified', r'google\s+certified', r'cisco\s+certified'
                ]
            },
            SectionType.LANGUAGES: {
                'headers': [
                    r'languages', r'language\s+skills', r'foreign\s+languages', r'language\s+proficiency',
                    r'bilingual', r'multilingual', r'language\s+competencies'
                ],
                'content_indicators': [
                    r'english', r'spanish', r'french', r'german', r'chinese', r'japanese', r'korean',
                    r'portuguese', r'italian', r'russian', r'arabic', r'hindi', r'bilingual',
                    r'fluent', r'native', r'proficient', r'intermediate', r'beginner'
                ]
            },
            SectionType.AWARDS: {
                'headers': [
                    r'awards', r'honors', r'recognition', r'achievements', r'prizes',
                    r'scholarships', r'grants', r'commendations', r'accolades'
                ],
                'content_indicators': [
                    r'award', r'honor', r'recognition', r'scholarship', r'prize', r'grant',
                    r'commendation', r'accolade', r'achievement', r'excellence'
                ]
            },
            SectionType.VOLUNTEER: {
                'headers': [
                    r'volunteer', r'volunteer\s+work', r'community\s+service', r'charity',
                    r'non-profit', r'community\s+involvement', r'volunteering'
                ],
                'content_indicators': [
                    r'volunteer', r'community', r'charity', r'non-profit', r'ngo',
                    r'volunteering', r'community\s+service', r'pro\s+bono'
                ]
            }
        }
        
        # Enhanced technical keywords by category
        self.technical_keywords = {
            'programming': [
                'python', 'javascript', 'java', 'c++', 'c#', 'go', 'rust', 'php', 'ruby', 'swift', 
                'kotlin', 'typescript', 'scala', 'r', 'matlab', 'perl', 'haskell', 'clojure', 'elixir'
            ],
            'frameworks': [
                'react', 'angular', 'vue', 'django', 'flask', 'express', 'spring', 'laravel', 'rails', 
                'node.js', 'asp.net', 'jquery', 'bootstrap', 'tailwind', 'svelte', 'next.js', 'nuxt.js'
            ],
            'databases': [
                'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb', 
                'oracle', 'sql server', 'sqlite', 'neo4j', 'couchdb', 'influxdb', 'mariadb'
            ],
            'cloud': [
                'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'gitlab', 
                'github actions', 'ci/cd', 'microservices', 'serverless', 'lambda', 'ec2', 's3'
            ],
            'ml_ai': [
                'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'opencv', 
                'keras', 'xgboost', 'spark', 'hadoop', 'jupyter', 'notebook', 'machine learning', 'ai'
            ],
            'tools': [
                'git', 'jira', 'confluence', 'slack', 'figma', 'postman', 'swagger', 'maven', 'gradle', 
                'npm', 'yarn', 'webpack', 'babel', 'eslint', 'prettier', 'sonarqube'
            ]
        }
        
        # Enhanced ATS action verbs
        self.ats_action_verbs = {
            'leadership': [
                'led', 'managed', 'supervised', 'directed', 'coordinated', 'oversaw', 'headed', 
                'chaired', 'mentored', 'trained', 'guided', 'facilitated', 'orchestrated', 'spearheaded'
            ],
            'achievement': [
                'increased', 'decreased', 'improved', 'enhanced', 'optimized', 'streamlined', 'reduced', 
                'grew', 'boosted', 'accelerated', 'achieved', 'delivered', 'exceeded', 'surpassed'
            ],
            'technical': [
                'developed', 'implemented', 'designed', 'architected', 'built', 'created', 'programmed', 
                'coded', 'debugged', 'deployed', 'integrated', 'engineered', 'constructed', 'assembled'
            ],
            'analysis': [
                'analyzed', 'evaluated', 'assessed', 'researched', 'investigated', 'examined', 'studied', 
                'diagnosed', 'troubleshot', 'optimized', 'audited', 'reviewed', 'scrutinized'
            ],
            'communication': [
                'presented', 'communicated', 'collaborated', 'coordinated', 'liaised', 'negotiated', 
                'facilitated', 'documented', 'reported', 'presented', 'conveyed', 'articulated'
            ],
            'project_management': [
                'planned', 'organized', 'scheduled', 'budgeted', 'executed', 'delivered', 'completed', 
                'launched', 'maintained', 'monitored', 'tracked', 'supervised', 'administered'
            ]
        }
        
        # Quantifiable achievement patterns
        self.achievement_patterns = [
            r'\d+%',  # Percentages
            r'\$\d+[,\d]*',  # Dollar amounts
            r'\d+[,\d]*\s*(users?|customers?|clients?|projects?|team\s+members?|people)',  # Counts
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
            r'response\s+time.*\d+%',  # Performance metrics
            r'efficiency.*\d+%',  # Efficiency metrics
            r'\d+\s+team\s+members',  # Team size
            r'\d+\s+projects',  # Project count
            r'\d+\s+clients',  # Client count
            r'\d+\s+users',  # User count
            r'\d+\s+requests?',  # Request count
            r'\d+\s+lines?\s+of\s+code',  # Code metrics
            r'\d+\s+bugs?\s+fixed',  # Bug fixes
            r'\d+\s+features?\s+implemented',  # Features
            r'\d+\s+hours?\s+saved',  # Time savings
            r'\d+\s+cost\s+reduction',  # Cost savings
        ]
    
    def detect_sections(self, text: str) -> Dict[str, Any]:
        """Enhanced section detection with multiple strategies"""
        lines = text.split('\n')
        detected_sections = {}
        section_scores = {}
        
        # Strategy 1: Header-based detection
        for section_type, patterns in self.section_patterns.items():
            section_name = section_type.value
            confidence = 0.0
            section_content = ""
            start_line = -1
            end_line = -1
            
            # Check for section headers
            for i, line in enumerate(lines):
                line_stripped = line.strip()
                if len(line_stripped) > 2 and len(line_stripped) < 100:
                    line_lower = line_stripped.lower()
                    
                    # Check if line matches any header pattern
                    for header_pattern in patterns['headers']:
                        if re.search(header_pattern, line_lower, re.IGNORECASE):
                            confidence += 0.6
                            start_line = i
                            break
                    
                    # Check for all-caps headers (common in resumes)
                    if line_stripped.isupper() and len(line_stripped) > 3:
                        for header_pattern in patterns['headers']:
                            if re.search(header_pattern, line_lower, re.IGNORECASE):
                                confidence += 0.4
                                if start_line == -1:
                                    start_line = i
                                break
            
            # Strategy 2: Content-based detection
            text_lower = text.lower()
            content_matches = 0
            for indicator in patterns['content_indicators']:
                if re.search(indicator, text_lower, re.IGNORECASE):
                    content_matches += 1
            
            if content_matches > 0:
                confidence += min(content_matches * 0.2, 0.4)
            
            # Strategy 3: Special detection for contact info
            if section_type == SectionType.CONTACT:
                contact_found = self._detect_contact_info(text)
                if contact_found:
                    confidence = max(confidence, 0.8)
            
            # Strategy 4: Special detection for skills
            if section_type == SectionType.SKILLS:
                skills_found = self._detect_skills_content(text)
                if skills_found:
                    confidence += 0.3
            
            # Store section information
            if confidence > 0.3:
                detected_sections[section_name] = SectionInfo(
                    name=section_name,
                    confidence=confidence,
                    content=section_content,
                    start_line=start_line,
                    end_line=end_line
                )
                section_scores[section_name] = confidence
        
        # Calculate completeness score
        total_sections = len(self.section_patterns)
        detected_count = len(detected_sections)
        completeness_score = detected_count / total_sections
        
        # Identify missing sections
        all_section_names = [section_type.value for section_type in SectionType]
        detected_names = list(detected_sections.keys())
        missing_sections = [name for name in all_section_names if name not in detected_names]
        
        return {
            'detected_sections': detected_sections,
            'section_scores': section_scores,
            'completeness_score': completeness_score,
            'missing_sections': missing_sections,
            'total_sections': total_sections,
            'detected_count': detected_count
        }
    
    def _detect_contact_info(self, text: str) -> bool:
        """Enhanced contact information detection"""
        contact_patterns = [
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Email
            r'\(\d{3}\)\s*\d{3}-\d{4}',  # Phone (US format)
            r'\d{3}-\d{3}-\d{4}',  # Phone (dashed format)
            r'\d{10}',  # Phone (10 digits)
            r'linkedin\.com',  # LinkedIn
            r'github\.com',  # GitHub
            r'@[a-zA-Z0-9_]+',  # Social media handles
            r'\b\d{1,3}\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b',  # Address
        ]
        
        return any(re.search(pattern, text, re.IGNORECASE) for pattern in contact_patterns)
    
    def _detect_skills_content(self, text: str) -> bool:
        """Detect if resume contains skills content"""
        # Check for technical skills
        all_skills = []
        for category, skills in self.technical_keywords.items():
            all_skills.extend(skills)
        
        text_lower = text.lower()
        found_skills = [skill for skill in all_skills if skill in text_lower]
        
        # Also check for skill-like patterns
        skill_patterns = [
            r'\b(?:proficient|experienced|skilled|expert|advanced|intermediate|beginner)\s+(?:in|with)\b',
            r'\b(?:programming|coding|development|design|analysis|management)\s+(?:skills|experience)\b',
            r'\b(?:tools|technologies|frameworks|languages|platforms)\b'
        ]
        
        pattern_matches = any(re.search(pattern, text_lower) for pattern in skill_patterns)
        
        return len(found_skills) > 2 or pattern_matches
    
    def extract_keywords(self, text: str) -> Dict[str, List[str]]:
        """Extract technical keywords from text with enhanced matching"""
        text_lower = text.lower()
        extracted_keywords = {}
        
        for category, keywords in self.technical_keywords.items():
            found_keywords = []
            for keyword in keywords:
                # Use word boundary matching for more accurate detection
                pattern = r'\b' + re.escape(keyword) + r'\b'
                if re.search(pattern, text_lower):
                    found_keywords.append(keyword)
            
            if found_keywords:
                extracted_keywords[category] = found_keywords
        
        return extracted_keywords
    
    def detect_action_verbs(self, text: str) -> Dict[str, List[str]]:
        """Detect ATS action verbs by category"""
        text_lower = text.lower()
        detected_verbs = {}
        
        for category, verbs in self.ats_action_verbs.items():
            found_verbs = []
            for verb in verbs:
                # Use word boundary matching for more accurate detection
                pattern = r'\b' + re.escape(verb) + r'\b'
                if re.search(pattern, text_lower):
                    found_verbs.append(verb)
            
            if found_verbs:
                detected_verbs[category] = found_verbs
        
        return detected_verbs
    
    def detect_quantifiable_achievements(self, text: str) -> Dict[str, Any]:
        """Enhanced quantifiable achievements detection"""
        achievements = []
        achievement_sentences = []
        
        # Find all quantifiable achievements
        for pattern in self.achievement_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            achievements.extend(matches)
        
        # Look for achievement sentences with context
        achievement_indicators = [
            'achieved', 'accomplished', 'delivered', 'completed', 'launched', 'implemented',
            'increased', 'decreased', 'improved', 'reduced', 'grew', 'expanded', 'optimized',
            'engineered', 'architected', 'developed', 'built', 'created', 'designed'
        ]
        
        sentences = text.split('.')
        for sentence in sentences:
            sentence_lower = sentence.lower()
            # Check if sentence contains both achievement indicators and numbers
            has_indicator = any(indicator in sentence_lower for indicator in achievement_indicators)
            has_number = bool(re.search(r'\d+', sentence))
            
            if has_indicator and has_number:
                achievement_sentences.append(sentence.strip())
        
        # Calculate achievement score
        total_achievements = len(achievements) + len(achievement_sentences)
        achievement_score = min(total_achievements / 8, 1.0)  # Adjusted threshold
        
        return {
            'quantifiable_achievements': achievements,
            'achievement_sentences': achievement_sentences[:5],  # Top 5
            'achievement_score': achievement_score,
            'total_achievements': total_achievements
        }
    
    def analyze_format_optimization(self, text: str) -> Dict[str, Any]:
        """Enhanced ATS-friendly formatting analysis"""
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
        
        header_score = min(section_headers / 4, 1.0)  # Adjusted threshold
        
        # Check for consistent formatting
        has_consistent_formatting = (
            bullet_score > 0.2 and 
            spacing_score > 0.03 and 
            header_score > 0.3 and
            len(problematic_elements) == 0
        )
        
        # Calculate overall format score
        format_score = (bullet_score + spacing_score + header_score) / 3
        if problematic_elements:
            format_score *= 0.7  # Reduced penalty
        
        return {
            'problematic_elements': problematic_elements,
            'bullet_score': bullet_score,
            'spacing_score': spacing_score,
            'header_score': header_score,
            'format_score': format_score,
            'ats_friendly': has_consistent_formatting
        }
    
    def calculate_standalone_score(self, resume_text: str) -> Dict[str, Any]:
        """Calculate comprehensive standalone score without job description"""
        text_lower = resume_text.lower()
        
        # 1. Content richness score
        word_count = len(resume_text.split())
        content_score = min(word_count / 400, 1.0)  # Adjusted threshold
        
        # 2. Skills diversity score
        all_skills = []
        for category, skills in self.technical_keywords.items():
            all_skills.extend(skills)
        
        found_skills = [skill for skill in all_skills if skill in text_lower]
        skills_diversity = min(len(found_skills) / 20, 1.0)  # Adjusted threshold
        
        # 3. Action verbs score
        detected_verbs = self.detect_action_verbs(resume_text)
        total_verbs = sum(len(verbs) for verbs in detected_verbs.values())
        action_verb_score = min(total_verbs / 15, 1.0)  # Adjusted threshold
        
        # 4. Achievement score
        achievements = self.detect_quantifiable_achievements(resume_text)
        achievement_score = achievements['achievement_score']
        
        # 5. Section completeness
        section_analysis = self.detect_sections(resume_text)
        section_score = section_analysis['completeness_score']
        
        # 6. Format quality score
        format_analysis = self.analyze_format_optimization(resume_text)
        format_score = format_analysis['format_score']
        
        # 7. Experience indicators
        experience_indicators = ['years', 'experience', 'worked', 'developed', 'implemented', 'managed', 'led']
        experience_count = sum(1 for word in text_lower.split() if word in experience_indicators)
        experience_score = min(experience_count / 12, 1.0)  # Adjusted threshold
        
        # Calculate overall standalone score with improved weights
        standalone_score = (
            content_score * 0.15 +
            skills_diversity * 0.25 +
            action_verb_score * 0.20 +
            achievement_score * 0.25 +
            section_score * 0.10 +
            format_score * 0.05
        )
        
        return {
            'standalone_score': standalone_score,
            'content_score': content_score,
            'skills_diversity': skills_diversity,
            'action_verb_score': action_verb_score,
            'achievement_score': achievement_score,
            'section_score': section_score,
            'format_score': format_score,
            'experience_score': experience_score,
            'found_skills': found_skills[:15],  # Top 15
            'detected_verbs': detected_verbs,
            'section_analysis': section_analysis,
            'format_analysis': format_analysis,
            'achievements_analysis': achievements
        }

def test_improved_ats():
    """Test the improved ATS analyzer"""
    analyzer = ImprovedATSAnalyzer()
    
    # Test resume with all required sections
    complete_resume = """
    JOHN DOE
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
    
    EDUCATION:
    Bachelor of Computer Science | University of Technology | 2015
    
    SKILLS:
    Programming: Python, JavaScript, Java, SQL, TypeScript
    Frameworks: Django, React, Express, Spring Boot, Angular
    Databases: PostgreSQL, MongoDB, Redis, MySQL
    Cloud: AWS, Docker, Kubernetes, Terraform
    Tools: Git, Jira, Jenkins, Postman, Figma
    """
    
    print("=== Testing Improved ATS Analysis ===")
    
    # Test section detection
    print("\n1. Enhanced Section Detection:")
    section_analysis = analyzer.detect_sections(complete_resume)
    print(f"Completeness Score: {section_analysis['completeness_score']:.2f}")
    print(f"Detected Sections: {list(section_analysis['detected_sections'].keys())}")
    print(f"Missing Sections: {section_analysis['missing_sections']}")
    
    # Test standalone scoring
    print("\n2. Enhanced Standalone Scoring:")
    standalone_analysis = analyzer.calculate_standalone_score(complete_resume)
    print(f"Overall Score: {standalone_analysis['standalone_score']:.2f}")
    print(f"Content Score: {standalone_analysis['content_score']:.2f}")
    print(f"Skills Diversity: {standalone_analysis['skills_diversity']:.2f}")
    print(f"Action Verb Score: {standalone_analysis['action_verb_score']:.2f}")
    print(f"Achievement Score: {standalone_analysis['achievement_score']:.2f}")
    
    # Test action verbs detection
    print("\n3. Action Verbs Detection:")
    detected_verbs = analyzer.detect_action_verbs(complete_resume)
    for category, verbs in detected_verbs.items():
        print(f"{category.capitalize()}: {verbs}")
    
    # Test keyword extraction
    print("\n4. Enhanced Keyword Extraction:")
    keywords = analyzer.extract_keywords(complete_resume)
    for category, found_keywords in keywords.items():
        print(f"{category.capitalize()}: {found_keywords}")
    
    # Test with incomplete resume
    print("\n=== Testing Incomplete Resume ===")
    incomplete_resume = """
    John Doe
    Software Engineer
    
    EXPERIENCE:
    Software Engineer | TechCorp | 2020-2023
    - Developed web applications
    """
    
    incomplete_section = analyzer.detect_sections(incomplete_resume)
    incomplete_standalone = analyzer.calculate_standalone_score(incomplete_resume)
    
    print(f"Incomplete Resume - Completeness: {incomplete_section['completeness_score']:.2f}")
    print(f"Incomplete Resume - Standalone Score: {incomplete_standalone['standalone_score']:.2f}")
    
    # Compare scores
    print(f"\nScore Comparison:")
    print(f"Complete Resume Score: {standalone_analysis['standalone_score']:.2f}")
    print(f"Incomplete Resume Score: {incomplete_standalone['standalone_score']:.2f}")
    print(f"Score Difference: {standalone_analysis['standalone_score'] - incomplete_standalone['standalone_score']:.2f}")

if __name__ == "__main__":
    test_improved_ats() 