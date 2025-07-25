#!/usr/bin/env python3
"""
Simple test service to verify basic functionality
"""

from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="Simple Test Service")

class TestRequest(BaseModel):
    text: str

@app.get('/health')
async def health_check():
    return {"status": "healthy", "service": "simple-test"}

@app.post('/test')
async def test_endpoint(request: TestRequest):
    return {"message": f"Received: {request.text}", "status": "success"}

if __name__ == "__main__":
    print("Starting simple test service...")
    uvicorn.run(app, host="0.0.0.0", port=8001) 