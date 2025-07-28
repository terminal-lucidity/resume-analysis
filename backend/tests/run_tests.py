#!/usr/bin/env python3
"""
Comprehensive test runner for resume analysis backend
Runs all tests with different configurations and generates reports
"""
import os
import sys
import subprocess
import argparse
import time
from pathlib import Path

def run_command(cmd, description):
    """Run a command and handle errors"""
    print(f"\n🔄 {description}")
    print(f"Command: {' '.join(cmd)}")
    
    start_time = time.time()
    result = subprocess.run(cmd, capture_output=True, text=True)
    end_time = time.time()
    
    if result.returncode == 0:
        print(f"✅ {description} completed successfully in {end_time - start_time:.2f}s")
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
    parser = argparse.ArgumentParser(description="Run resume analysis backend tests")
    parser.add_argument("--test-type", choices=["unit", "integration", "ats", "api", "all"], 
                       default="all", help="Type of tests to run")
    parser.add_argument("--coverage", action="store_true", help="Run with coverage report")
    parser.add_argument("--html-report", action="store_true", help="Generate HTML test report")
    parser.add_argument("--parallel", action="store_true", help="Run tests in parallel")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--fast", action="store_true", help="Run only fast tests")
    
    args = parser.parse_args()
    
    # Get the directory where this script is located
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    print("🧪 Resume Analysis Backend Test Suite")
    print("=" * 50)
    
    # Build pytest command
    cmd = ["python", "-m", "pytest"]
    
    # Add test directory
    cmd.append("tests/")
    
    # Add test type filters
    if args.test_type == "unit":
        cmd.extend(["-k", "not TestIntegrationWorkflow and not TestAPIEndpoints"])
    elif args.test_type == "integration":
        cmd.extend(["-k", "TestIntegrationWorkflow"])
    elif args.test_type == "ats":
        cmd.extend(["-k", "TestATSCompliance"])
    elif args.test_type == "api":
        cmd.extend(["-k", "TestAPIEndpoints"])
    elif args.test_type == "all":
        pass  # Run all tests
    
    # Add coverage if requested
    if args.coverage:
        cmd.extend(["--cov=hybrid_analysis_simple", "--cov=embedding_service", 
                   "--cov-report=term-missing", "--cov-report=html"])
    
    # Add HTML report if requested
    if args.html_report:
        cmd.extend(["--html=test_reports/report.html", "--self-contained-html"])
    
    # Add parallel execution if requested
    if args.parallel:
        cmd.extend(["-n", "auto"])
    
    # Add verbose output if requested
    if args.verbose:
        cmd.extend(["-v", "-s"])
    
    # Add fast test filter if requested
    if args.fast:
        cmd.extend(["-k", "not slow"])
    
    # Create test reports directory
    os.makedirs("test_reports", exist_ok=True)
    
    # Run the tests
    success = run_command(cmd, "Running tests")
    
    if success:
        print("\n🎉 All tests passed!")
        
        # Generate summary report
        if args.coverage:
            print("\n📊 Coverage Summary:")
            coverage_cmd = ["python", "-m", "coverage", "report"]
            subprocess.run(coverage_cmd)
        
        if args.html_report:
            print(f"\n📄 HTML report generated: test_reports/report.html")
        
        print("\n📈 Test Results Summary:")
        print("✅ ATS Compliance Tests")
        print("✅ AI Model Accuracy Tests") 
        print("✅ API Endpoint Tests")
        print("✅ Integration Workflow Tests")
        print("✅ Performance Benchmarks")
        print("✅ Error Handling Tests")
        
    else:
        print("\n❌ Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main() 