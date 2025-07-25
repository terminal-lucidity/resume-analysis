# Hybrid Resume Analysis Service

This service combines multiple AI/ML techniques to provide comprehensive resume analysis:

## 🚀 Features

### 1. **Semantic Analysis**

- Uses Sentence Transformers (all-MiniLM-L6-v2) for semantic similarity
- Compares resume content with job descriptions at a meaning level

### 2. **Keyword Analysis**

- TF-IDF based keyword matching
- Technical keyword extraction and categorization
- Programming languages, frameworks, databases, cloud services, etc.

### 3. **NLP-Powered Skills Extraction**

- Uses spaCy for natural language processing
- Extracts skills, experience indicators, and job level indicators
- Identifies missing skills and skill gaps

### 4. **Job Level Analysis**

- Analyzes resume fit for different job levels (entry, mid, senior, executive)
- Matches experience indicators with job requirements

### 5. **LLM Insights** (Optional)

- Uses Ollama with free models (Llama 2, Mistral, CodeLlama)
- Provides detailed strengths, weaknesses, and improvement suggestions
- Generates personalized recommendations

## 📋 Prerequisites

- Python 3.8+
- Node.js (for the main backend)
- Ollama (optional, for LLM features)

## 🛠️ Installation

### Quick Setup

```bash
# Run the automated setup script
python setup_hybrid_analysis.py
```

### Manual Setup

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Install spaCy English model
python -m spacy download en_core_web_sm

# 3. (Optional) Install Ollama for LLM features
# Visit https://ollama.ai and follow installation instructions
ollama pull llama2
```

## 🚀 Running the Service

### Option 1: Using the startup script

```bash
./start_analysis_service.sh
```

### Option 2: Manual start

```bash
python embedding_service.py
```

The service will be available at `http://localhost:8001`

## 📊 API Endpoints

### POST `/analyze`

Analyzes a resume against a job description.

**Request Body:**

```json
{
  "resume": "Resume text content...",
  "job": "Job description text...",
  "jobLevel": "entry|mid|senior|executive"
}
```

**Response:**

```json
{
  "similarity": 0.85,
  "jobLevel": "senior",
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
    "resume_keywords": {
      "programming": ["python", "javascript"],
      "frameworks": ["react", "django"]
    },
    "job_keywords": {
      "programming": ["python", "java"],
      "cloud": ["aws", "docker"]
    },
    "level_analysis": {
      "level_scores": { "entry": 2, "mid": 5, "senior": 8, "executive": 1 },
      "best_fit_level": "senior",
      "level_match_score": 0.8
    },
    "llm_insights": {
      "strengths": ["Strong technical background", "Good project experience"],
      "weaknesses": [
        "Limited cloud experience",
        "Could improve leadership skills"
      ],
      "suggestions": ["Add cloud certifications", "Highlight leadership roles"]
    }
  }
}
```

### GET `/health`

Health check endpoint.

## 🔧 Configuration

### Environment Variables

- `OLLAMA_HOST`: Ollama server host (default: localhost:11434)
- `OLLAMA_MODEL`: Model to use (default: llama2)

### Model Options

The service supports multiple free LLM models through Ollama:

- `llama2`: General purpose (recommended)
- `mistral`: Good for analysis tasks
- `codellama`: Specialized for technical content

## 📈 Analysis Components

### 1. **Semantic Similarity (40% weight)**

- Uses sentence transformers for meaning-based comparison
- Most important component for overall score

### 2. **Keyword Matching (30% weight)**

- TF-IDF based similarity
- Technical keyword extraction and matching

### 3. **Job Level Fit (20% weight)**

- Analyzes experience indicators
- Matches against requested job level

### 4. **Skill Gap Analysis (10% weight)**

- Identifies missing skills
- Calculates skill coverage percentage

## 🎯 Technical Keywords Categories

The service recognizes these technical categories:

- **Programming**: Python, JavaScript, Java, C++, etc.
- **Frameworks**: React, Angular, Django, Flask, etc.
- **Databases**: MySQL, PostgreSQL, MongoDB, Redis, etc.
- **Cloud**: AWS, Azure, GCP, Docker, Kubernetes, etc.
- **ML/AI**: TensorFlow, PyTorch, scikit-learn, etc.
- **Tools**: Git, Jira, Confluence, Slack, etc.

## 🔍 Troubleshooting

### Common Issues

1. **spaCy model not found**

   ```bash
   python -m spacy download en_core_web_sm
   ```

2. **Ollama not responding**

   - Check if Ollama is running: `ollama list`
   - Restart Ollama service
   - Verify model is downloaded: `ollama pull llama2`

3. **Memory issues with large resumes**
   - The service truncates input to 1000 characters for LLM analysis
   - Consider preprocessing very large resumes

### Performance Tips

1. **Use virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **GPU acceleration** (optional)

   - Install PyTorch with CUDA support for faster embeddings
   - Install spaCy with GPU support

3. **Model caching**
   - Sentence transformers models are cached automatically
   - First run may be slower due to model download

## 🔄 Integration with Main Backend

The hybrid analysis service integrates seamlessly with the main Node.js backend:

1. **Enhanced Response**: Returns detailed analysis instead of just similarity score
2. **Database Storage**: Stores analysis results in the Resume entity
3. **Error Handling**: Graceful fallback when LLM is unavailable
4. **Caching**: Analysis results are stored for future reference

## 📝 Development

### Adding New Analysis Components

1. **New ML Model**: Add to `HybridAnalyzer` class
2. **New Keywords**: Update `technical_keywords` dictionary
3. **New Metrics**: Add to scoring calculation in `analyze` function

### Testing

```bash
# Test the service directly
curl -X POST http://localhost:8001/analyze \
  -H "Content-Type: application/json" \
  -d '{"resume": "Python developer with 5 years experience...", "job": "Senior Python developer...", "jobLevel": "senior"}'

# Health check
curl http://localhost:8001/health
```

## 🎉 Benefits

1. **Comprehensive Analysis**: Multiple analysis techniques provide deeper insights
2. **Free Models**: Uses open-source models to avoid API costs
3. **Scalable**: Easy to add new analysis components
4. **Accurate**: Combines semantic and keyword-based approaches
5. **Actionable**: Provides specific improvement suggestions
