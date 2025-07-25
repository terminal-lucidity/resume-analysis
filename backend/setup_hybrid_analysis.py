#!/usr/bin/env python3
"""
Setup script for the Hybrid Resume Analysis Service
This script helps set up all dependencies and configurations needed for the hybrid analysis.
"""

import subprocess
import sys
import os
import requests
import time

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True

def install_python_dependencies():
    """Install Python dependencies"""
    return run_command("pip install -r requirements.txt", "Installing Python dependencies")

def install_spacy_model():
    """Install spaCy English model"""
    return run_command("python -m spacy download en_core_web_sm", "Installing spaCy English model")

def check_ollama_installation():
    """Check if Ollama is installed and running"""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            print("✅ Ollama is running")
            return True
    except requests.exceptions.RequestException:
        pass
    
    print("⚠️  Ollama is not running or not installed")
    print("📋 To install Ollama:")
    print("   1. Visit https://ollama.ai")
    print("   2. Download and install Ollama")
    print("   3. Run: ollama pull llama2")
    print("   4. Start Ollama service")
    return False

def download_ollama_model():
    """Download a free LLM model for Ollama"""
    print("🔄 Downloading Llama 2 model (this may take a while)...")
    return run_command("ollama pull llama2", "Downloading Llama 2 model")

def create_startup_script():
    """Create a startup script for the service"""
    script_content = """#!/bin/bash
# Startup script for Hybrid Resume Analysis Service

echo "Starting Hybrid Resume Analysis Service..."

# Check if Python dependencies are installed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
pip install -r requirements.txt

# Start the service
python embedding_service.py
"""
    
    with open("start_analysis_service.sh", "w") as f:
        f.write(script_content)
    
    # Make it executable
    os.chmod("start_analysis_service.sh", 0o755)
    print("✅ Created startup script: start_analysis_service.sh")

def main():
    """Main setup function"""
    print("🚀 Setting up Hybrid Resume Analysis Service")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install Python dependencies
    if not install_python_dependencies():
        print("❌ Failed to install Python dependencies")
        sys.exit(1)
    
    # Install spaCy model
    if not install_spacy_model():
        print("❌ Failed to install spaCy model")
        sys.exit(1)
    
    # Check Ollama
    ollama_available = check_ollama_installation()
    
    if ollama_available:
        # Download model if needed
        download_ollama_model()
    else:
        print("⚠️  LLM features will be limited without Ollama")
    
    # Create startup script
    create_startup_script()
    
    print("\n🎉 Setup completed!")
    print("\n📋 Next steps:")
    print("1. Start the analysis service: ./start_analysis_service.sh")
    print("2. Or run manually: python embedding_service.py")
    print("3. The service will be available at: http://localhost:8001")
    print("4. Health check: http://localhost:8001/health")
    
    if not ollama_available:
        print("\n💡 To enable LLM features:")
        print("   - Install Ollama from https://ollama.ai")
        print("   - Run: ollama pull llama2")
        print("   - Start Ollama service")

if __name__ == "__main__":
    main() 