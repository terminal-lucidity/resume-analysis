#!/usr/bin/env python3
"""
Setup script for resume analysis backend tests
Installs dependencies and runs initial test validation
"""
import os
import sys
import subprocess
from pathlib import Path

def run_command(cmd, description):
    """Run a command and handle errors"""
    print(f"\n🔄 {description}")
    print(f"Command: {' '.join(cmd)}")
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print("Output:")
            print(result.stdout)
    else:
        print(f"❌ {description} failed")
        if result.stderr:
            print("Error:")
            print(result.stderr)
        if result.stdout:
            print("Output:")
            print(result.stdout)
    
    return result.returncode == 0

def main():
    print("🧪 Resume Analysis Backend Test Setup")
    print("=" * 50)
    
    # Check if we're in the backend directory
    if not os.path.exists("hybrid_analysis_simple.py"):
        print("❌ Please run this script from the backend directory")
        sys.exit(1)
    
    # Step 1: Install test dependencies
    print("\n📦 Installing test dependencies...")
    
    # Install base requirements first
    if not run_command(["pip", "install", "-r", "requirements.txt"], "Installing base requirements"):
        print("❌ Failed to install base requirements")
        sys.exit(1)
    
    # Install test requirements
    if not run_command(["pip", "install", "-r", "tests/requirements-test.txt"], "Installing test requirements"):
        print("❌ Failed to install test requirements")
        sys.exit(1)
    
    # Step 2: Download spaCy model
    print("\n🤖 Downloading spaCy model...")
    if not run_command(["python", "-m", "spacy", "download", "en_core_web_sm"], "Downloading spaCy model"):
        print("⚠️ Failed to download spaCy model, but continuing...")
    
    # Step 3: Download NLTK data
    print("\n📚 Downloading NLTK data...")
    nltk_script = """
import nltk
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')
print("NLTK data downloaded successfully")
"""
    
    if not run_command(["python", "-c", nltk_script], "Downloading NLTK data"):
        print("⚠️ Failed to download NLTK data, but continuing...")
    
    # Step 4: Run quick validation tests
    print("\n🧪 Running quick validation tests...")
    
    # Test import of main modules
    import_test = """
try:
    import hybrid_analysis_simple
    import embedding_service
    print("✅ Main modules imported successfully")
except ImportError as e:
    print(f"❌ Import error: {e}")
    exit(1)
"""
    
    if not run_command(["python", "-c", import_test], "Testing module imports"):
        print("❌ Module import test failed")
        sys.exit(1)
    
    # Step 5: Run a quick test
    print("\n🚀 Running quick test...")
    if not run_command(["python", "tests/run_tests.py", "--test-type", "api", "--fast"], "Running quick API tests"):
        print("⚠️ Quick test failed, but setup may still be functional")
    
    print("\n🎉 Test setup completed!")
    print("\n📋 Next steps:")
    print("1. Run all tests: python tests/run_tests.py")
    print("2. Run with coverage: python tests/run_tests.py --coverage")
    print("3. Run specific tests: python tests/run_tests.py --test-type ats")
    print("4. View test documentation: cat tests/README.md")

if __name__ == "__main__":
    main() 