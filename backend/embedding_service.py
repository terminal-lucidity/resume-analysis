from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util

app = FastAPI()
model = SentenceTransformer('all-MiniLM-L6-v2')

class AnalysisRequest(BaseModel):
    resume: str
    job: str
    jobLevel: str

@app.post('/analyze')
async def analyze(request: AnalysisRequest):
    resume_emb = model.encode(request.resume, convert_to_tensor=True)
    job_emb = model.encode(request.job, convert_to_tensor=True)
    similarity = util.pytorch_cos_sim(resume_emb, job_emb).item()
    
    # For now, return similarity and job level for future use
    return {
        "similarity": similarity,
        "jobLevel": request.jobLevel
    } 