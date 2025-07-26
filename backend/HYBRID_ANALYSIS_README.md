# Hybrid Resume Analysis System

A comprehensive AI-powered resume analysis system that combines multiple machine learning techniques to provide detailed insights for job matching and career development.

## 🎯 Overview

This system analyzes resumes against job descriptions using a hybrid approach that combines:

- **Semantic Analysis** - Deep understanding of content meaning
- **Keyword Matching** - Technical skill extraction and matching
- **NLP Processing** - Natural language understanding
- **LLM Insights** - Advanced analysis using free language models

## 🏗️ Architecture

### Two-Service Architecture

```
┌─────────────────┐    ┌─────────────────────┐
│   Node.js API   │◄──►│  Python ML Service  │
│   (Port 3000)   │    │   (Port 8001)       │
└─────────────────┘    └─────────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────────┐
│   PostgreSQL    │    │   Ollama LLM        │
│   Database      │    │   (Optional)        │
└─────────────────┘    └─────────────────────┘
```

### Service Responsibilities

#### **Node.js Backend (Main API)**

- User authentication and management
- File upload and storage
- Database operations
- API routing and middleware
- Integration with Python ML service

#### **Python ML Service (Analysis Engine)**

- Semantic similarity computation
- Keyword extraction and matching
- Skills gap analysis
- Job level assessment
- LLM-powered insights

## 🔧 Technical Stack

### **Backend (Node.js)**

- **Framework:** Express.js with TypeScript
- **Database:** PostgreSQL with TypeORM
- **Authentication:** JWT + Passport.js
- **File Processing:** PDF parsing, document handling

### **ML Service (Python)**

- **Web Framework:** FastAPI
- **ML Libraries:**
  - Sentence Transformers (all-MiniLM-L6-v2)
  - spaCy (NLP processing)
  - scikit-learn (TF-IDF, similarity metrics)
- **LLM Integration:** Ollama (Llama 2, Mistral)
- **Data Processing:** NumPy, Pandas

## 📊 Analysis Components

### 1. **Semantic Similarity (40% weight)**

- Uses sentence transformers for meaning-based comparison
- Compares resume content with job descriptions at a conceptual level
- Handles synonyms, paraphrasing, and contextual understanding

### 2. **Keyword Matching (30% weight)**

- TF-IDF based technical keyword extraction
- Categorizes skills into:
  - **Programming:** Python, JavaScript, Java, C++, etc.
  - **Frameworks:** React, Angular, Django, Flask, etc.
  - **Databases:** MySQL, PostgreSQL, MongoDB, Redis, etc.
  - **Cloud:** AWS, Azure, GCP, Docker, Kubernetes, etc.
  - **ML/AI:** TensorFlow, PyTorch, scikit-learn, etc.
  - **Tools:** Git, Jira, Confluence, Slack, etc.

### 3. **Job Level Analysis (20% weight)**

- Analyzes experience indicators for different levels:
  - **Entry:** 0-2 years, junior, graduate, intern
  - **Mid:** 2-5 years, intermediate, experienced
  - **Senior:** 5+ years, lead, principal, architect
  - **Executive:** Director, VP, CTO, CEO

### 4. **Skills Gap Analysis (10% weight)**

- Identifies missing skills from job requirements
- Calculates skill coverage percentage
- Provides specific learning recommendations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.8+
- PostgreSQL
- Ollama (optional, for LLM features)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd resume-analysis

# Install Node.js dependencies
cd backend
npm install

# Setup Python environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements_clean.txt
python -m spacy download en_core_web_sm

# Optional: Install Ollama for LLM features
# Visit https://ollama.ai and follow installation instructions
ollama pull llama2
```

### Running the Services

```bash
# Start both services (development)
npm run start:full

# Start both services (production)
npm run start:prod

# Start services individually
npm run dev                    # Node.js backend only
npm run start:analysis         # Python ML service only
```

## 📡 API Endpoints

### POST `/api/analyze`

Analyzes a resume against a job description.

**Request:**

```json
{
  "resumeId": "uuid",
  "jobTitle": "Senior Software Engineer",
  "jobDescription": "We are looking for...",
  "jobLevel": "senior"
}
```

**Response:**

```json
{
  "similarity": 0.85,
  "overallScore": 0.78,
  "keywordMatchScore": 0.72,
  "skillGapAnalysis": {
    "missing_skills": ["kubernetes", "docker"],
    "skill_gap_score": 0.8,
    "resume_skills_count": 15,
    "job_skills_count": 12
  },
  "improvementSuggestions": [
    "Consider adding more relevant keywords from the job description",
    "Include more technical skills mentioned in the job posting"
  ],
  "detailedAnalysis": {
    "semantic_similarity": 0.85,
    "keyword_similarity": 0.72,
    "level_analysis": {
      "best_fit_level": "senior",
      "level_match_score": 0.8
    },
    "llm_insights": {
      "strengths": ["Strong technical background"],
      "weaknesses": ["Limited cloud experience"],
      "suggestions": ["Add cloud certifications"]
    }
  }
}
```

## 🎯 Key Features

### **Intelligent Analysis**

- Multi-dimensional scoring system
- Context-aware skill matching
- Experience level assessment
- Personalized improvement suggestions

### **Free LLM Integration**

- Uses Ollama with open-source models
- No API costs or rate limits
- Supports multiple models (Llama 2, Mistral, CodeLlama)
- Graceful fallback when LLM unavailable

### **Scalable Architecture**

- Microservice design
- Independent scaling of services
- Easy to add new analysis components
- Modular and maintainable codebase

### **Production Ready**

- Comprehensive error handling
- Health check endpoints
- Logging and monitoring
- Database persistence of results

## 🔍 Technical Deep Dive

### **Semantic Analysis Implementation**

```python
# Uses sentence transformers for semantic similarity
model = SentenceTransformer('all-MiniLM-L6-v2')
resume_emb = model.encode(resume_text, convert_to_tensor=True)
job_emb = model.encode(job_text, convert_to_tensor=True)
similarity = util.pytorch_cos_sim(resume_emb, job_emb).item()
```

### **Keyword Extraction Process**

```python
# Technical keyword categorization
technical_keywords = {
    'programming': ['python', 'javascript', 'java'],
    'frameworks': ['react', 'django', 'express'],
    'databases': ['mysql', 'postgresql', 'mongodb'],
    # ... more categories
}
```

### **Scoring Algorithm**

```python
overall_score = (
    semantic_similarity * 0.4 +
    keyword_similarity * 0.3 +
    level_match_score * 0.2 +
    skill_gap_score * 0.1
)
```

## 🧪 Testing

### **Service Health Checks**

```bash
# Check Node.js backend
curl http://localhost:3000/health

# Check Python ML service
curl http://localhost:8001/health
```

### **Analysis Testing**

```bash
# Run comprehensive tests
python test_hybrid_analysis.py

# Test individual components
python -c "from hybrid_analysis_simple import SimpleAnalyzer; print('Service ready')"
```

## 📈 Performance Considerations

### **Optimization Strategies**

- Model caching for sentence transformers
- Efficient keyword matching algorithms
- Async processing for LLM calls
- Database indexing for fast queries

### **Scalability Features**

- Stateless service design
- Horizontal scaling capability
- Load balancing ready
- Resource-efficient ML models

## 🔒 Security & Privacy

### **Data Protection**

- Secure file upload handling
- Input validation and sanitization
- No external API calls for sensitive data
- Local processing of resume content

### **Authentication**

- JWT-based authentication
- Role-based access control
- Secure session management
- API rate limiting

## 🚀 Deployment

### **Development**

```bash
npm run start:full
```

### **Production**

```bash
# Build the application
npm run build

# Start production services
npm run start:prod
```

### **Docker Support**

```dockerfile
# Example Dockerfile for Python service
FROM python:3.9-slim
WORKDIR /app
COPY requirements_clean.txt .
RUN pip install -r requirements_clean.txt
COPY . .
CMD ["python", "hybrid_analysis_simple.py"]
```

## 📚 Learning Resources

### **Technologies Used**

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Sentence Transformers](https://www.sbert.net/)
- [spaCy NLP](https://spacy.io/)
- [Ollama](https://ollama.ai/)

### **ML Concepts**

- Semantic Similarity
- TF-IDF Vectorization
- Cosine Similarity
- Natural Language Processing

## 🤝 Contributing

### **Adding New Analysis Components**

1. Extend the `SimpleAnalyzer` class
2. Add new scoring weights
3. Update the API response schema
4. Include comprehensive tests

### **Code Standards**

- TypeScript for Node.js code
- Python type hints
- Comprehensive error handling
- Detailed documentation

## 📞 Support

For questions or issues:

- Check the troubleshooting section
- Review the test files
- Examine the health check endpoints
- Consult the detailed API documentation

---

**Built with ❤️ using modern AI/ML technologies**
