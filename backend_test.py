#!/usr/bin/env python3
"""
Backend API Test Suite for JSON Import Functionality
Tests the new JSON import/export endpoints and HTML import tool
"""

import requests
import json
import os
import sys
from typing import Dict, Any, List
import time

# Get backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://a69b6f37-383b-4234-9875-3afdd333ccfa.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_test_header(test_name: str):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}Testing: {test_name}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")

def print_success(message: str):
    print(f"{Colors.GREEN}✅ {message}{Colors.ENDC}")

def print_error(message: str):
    print(f"{Colors.RED}❌ {message}{Colors.ENDC}")

def print_warning(message: str):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.ENDC}")

def print_info(message: str):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.ENDC}")

class BackendTester:
    def __init__(self):
        self.test_results = []
        self.sample_data = None
        
    def load_sample_data(self):
        """Load sample data from file"""
        try:
            with open('/app/sample-import-data.json', 'r') as f:
                self.sample_data = json.load(f)
            print_success("Sample data loaded successfully")
            return True
        except Exception as e:
            print_error(f"Failed to load sample data: {e}")
            return False

    def test_api_health(self):
        """Test basic API connectivity"""
        print_test_header("API Health Check")
        try:
            response = requests.get(f"{API_BASE}/", timeout=10)
            if response.status_code == 200:
                print_success(f"API is accessible at {API_BASE}")
                print_info(f"Response: {response.json()}")
                return True
            else:
                print_error(f"API returned status {response.status_code}")
                return False
        except Exception as e:
            print_error(f"Failed to connect to API: {e}")
            return False

    def test_html_import_tool(self):
        """Test HTML import tool endpoint"""
        print_test_header("HTML Import Tool")
        try:
            response = requests.get(f"{BACKEND_URL}/import-tool", timeout=10)
            if response.status_code == 200:
                content = response.text
                if "Database Import Tool" in content and "Import Data" in content:
                    print_success("HTML import tool is accessible and contains expected content")
                    return True
                else:
                    print_error("HTML import tool missing expected content")
                    return False
            else:
                print_error(f"HTML import tool returned status {response.status_code}")
                return False
        except Exception as e:
            print_error(f"Failed to access HTML import tool: {e}")
            return False

    def test_sample_data_endpoint(self):
        """Test sample data JSON endpoint"""
        print_test_header("Sample Data Endpoint")
        try:
            response = requests.get(f"{BACKEND_URL}/sample-import-data.json", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "products" in data and "culture_stories" in data:
                    print_success("Sample data endpoint is accessible and contains expected structure")
                    print_info(f"Products: {len(data['products'])}, Culture Stories: {len(data['culture_stories'])}")
                    return True
                else:
                    print_error("Sample data missing expected structure")
                    return False
            else:
                print_error(f"Sample data endpoint returned status {response.status_code}")
                return False
        except Exception as e:
            print_error(f"Failed to access sample data endpoint: {e}")
            return False

    def test_export_products(self):
        """Test products export endpoint"""
        print_test_header("Export Products")
        try:
            response = requests.get(f"{API_BASE}/export/products", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "products" in data and isinstance(data["products"], list):
                    print_success(f"Products export successful - {len(data['products'])} products")
                    return True, data
                else:
                    print_error("Export response missing 'products' array")
                    return False, None
            else:
                print_error(f"Export products returned status {response.status_code}")
                return False, None
        except Exception as e:
            print_error(f"Failed to export products: {e}")
            return False, None

    def test_export_culture_stories(self):
        """Test culture stories export endpoint"""
        print_test_header("Export Culture Stories")
        try:
            response = requests.get(f"{API_BASE}/export/culture-stories", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "stories" in data and isinstance(data["stories"], list):
                    print_success(f"Culture stories export successful - {len(data['stories'])} stories")
                    return True, data
                else:
                    print_error("Export response missing 'stories' array")
                    return False, None
            else:
                print_error(f"Export culture stories returned status {response.status_code}")
                return False, None
        except Exception as e:
            print_error(f"Failed to export culture stories: {e}")
            return False, None

    def test_import_products_only(self):
        """Test importing products only"""
        print_test_header("Import Products Only")
        if not self.sample_data:
            print_error("Sample data not loaded")
            return False
            
        try:
            import_data = {"products": self.sample_data["products"]}
            response = requests.post(
                f"{API_BASE}/import/products",
                json=import_data,
                headers={"Content-Type": "application/json"},
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                if "imported_count" in result:
                    print_success(f"Products import successful - {result['imported_count']} products imported")
                    print_info(f"Message: {result.get('message', 'No message')}")
                    return True
                else:
                    print_error("Import response missing 'imported_count'")
                    return False
            else:
                print_error(f"Import products returned status {response.status_code}")
                try:
                    error_detail = response.json()
                    print_error(f"Error detail: {error_detail}")
                except:
                    print_error(f"Response text: {response.text}")
                return False
        except Exception as e:
            print_error(f"Failed to import products: {e}")
            return False

    def test_import_culture_stories_only(self):
        """Test importing culture stories only"""
        print_test_header("Import Culture Stories Only")
        if not self.sample_data:
            print_error("Sample data not loaded")
            return False
            
        try:
            import_data = {"stories": self.sample_data["culture_stories"]}
            response = requests.post(
                f"{API_BASE}/import/culture-stories",
                json=import_data,
                headers={"Content-Type": "application/json"},
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                if "imported_count" in result:
                    print_success(f"Culture stories import successful - {result['imported_count']} stories imported")
                    print_info(f"Message: {result.get('message', 'No message')}")
                    return True
                else:
                    print_error("Import response missing 'imported_count'")
                    return False
            else:
                print_error(f"Import culture stories returned status {response.status_code}")
                try:
                    error_detail = response.json()
                    print_error(f"Error detail: {error_detail}")
                except:
                    print_error(f"Response text: {response.text}")
                return False
        except Exception as e:
            print_error(f"Failed to import culture stories: {e}")
            return False

    def test_import_complete_data(self):
        """Test importing complete data (products + culture stories)"""
        print_test_header("Import Complete Data")
        if not self.sample_data:
            print_error("Sample data not loaded")
            return False
            
        try:
            response = requests.post(
                f"{API_BASE}/import/complete-data",
                json=self.sample_data,
                headers={"Content-Type": "application/json"},
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                if "imported_products" in result and "imported_stories" in result:
                    print_success(f"Complete data import successful")
                    print_info(f"Products: {result['imported_products']}, Stories: {result['imported_stories']}")
                    print_info(f"Message: {result.get('message', 'No message')}")
                    return True
                else:
                    print_error("Import response missing expected fields")
                    return False
            else:
                print_error(f"Import complete data returned status {response.status_code}")
                try:
                    error_detail = response.json()
                    print_error(f"Error detail: {error_detail}")
                except:
                    print_error(f"Response text: {response.text}")
                return False
        except Exception as e:
            print_error(f"Failed to import complete data: {e}")
            return False

    def test_data_validation(self):
        """Test data validation with invalid JSON"""
        print_test_header("Data Validation Tests")
        
        # Test 1: Invalid JSON structure
        print_info("Testing invalid JSON structure...")
        try:
            invalid_data = {"invalid": "structure"}
            response = requests.post(
                f"{API_BASE}/import/complete-data",
                json=invalid_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("imported_products", 0) == 0 and result.get("imported_stories", 0) == 0:
                    print_success("Invalid JSON handled correctly - no data imported")
                else:
                    print_warning("Invalid JSON imported some data unexpectedly")
            else:
                print_success("Invalid JSON rejected with appropriate error")
        except Exception as e:
            print_error(f"Error testing invalid JSON: {e}")
            
        # Test 2: Invalid product data
        print_info("Testing invalid product data...")
        try:
            invalid_product_data = {
                "products": [
                    {
                        "name": "Test Product",
                        # Missing required fields
                        "price": "invalid_price"  # Should be number
                    }
                ]
            }
            response = requests.post(
                f"{API_BASE}/import/products",
                json=invalid_product_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code != 200:
                print_success("Invalid product data rejected appropriately")
            else:
                print_warning("Invalid product data was accepted")
        except Exception as e:
            print_error(f"Error testing invalid product data: {e}")

    def test_data_replacement(self):
        """Test that existing data is replaced correctly"""
        print_test_header("Data Replacement Test")
        
        # First, import sample data
        if not self.test_import_complete_data():
            print_error("Failed to import initial data for replacement test")
            return False
            
        # Wait a moment for data to be processed
        time.sleep(1)
        
        # Export to verify initial data
        success, initial_data = self.test_export_products()
        if not success:
            print_error("Failed to export initial data")
            return False
            
        initial_count = len(initial_data["products"])
        print_info(f"Initial product count: {initial_count}")
        
        # Import different data (fewer products)
        modified_data = {
            "products": [self.sample_data["products"][0]],  # Only first product
            "culture_stories": self.sample_data["culture_stories"]
        }
        
        try:
            response = requests.post(
                f"{API_BASE}/import/complete-data",
                json=modified_data,
                headers={"Content-Type": "application/json"},
                timeout=15
            )
            
            if response.status_code == 200:
                # Wait for processing
                time.sleep(1)
                
                # Export again to verify replacement
                success, final_data = self.test_export_products()
                if success:
                    final_count = len(final_data["products"])
                    print_info(f"Final product count: {final_count}")
                    
                    if final_count == 1:
                        print_success("Data replacement working correctly - old data replaced")
                        return True
                    else:
                        print_error(f"Data replacement failed - expected 1 product, got {final_count}")
                        return False
                else:
                    print_error("Failed to verify data replacement")
                    return False
            else:
                print_error("Failed to import modified data for replacement test")
                return False
        except Exception as e:
            print_error(f"Error testing data replacement: {e}")
            return False

    def run_all_tests(self):
        """Run all tests and return summary"""
        print(f"{Colors.BOLD}🧪 Starting Backend JSON Import Tests{Colors.ENDC}")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        
        tests = [
            ("API Health Check", self.test_api_health),
            ("Load Sample Data", self.load_sample_data),
            ("HTML Import Tool", self.test_html_import_tool),
            ("Sample Data Endpoint", self.test_sample_data_endpoint),
            ("Export Products", lambda: self.test_export_products()[0]),
            ("Export Culture Stories", lambda: self.test_export_culture_stories()[0]),
            ("Import Products Only", self.test_import_products_only),
            ("Import Culture Stories Only", self.test_import_culture_stories_only),
            ("Import Complete Data", self.test_import_complete_data),
            ("Data Validation", self.test_data_validation),
            ("Data Replacement", self.test_data_replacement),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            try:
                result = test_func()
                if result:
                    passed += 1
                    self.test_results.append((test_name, "PASS"))
                else:
                    failed += 1
                    self.test_results.append((test_name, "FAIL"))
            except Exception as e:
                failed += 1
                self.test_results.append((test_name, f"ERROR: {e}"))
                print_error(f"Test '{test_name}' threw exception: {e}")
        
        # Print summary
        print(f"\n{Colors.BOLD}{'='*60}{Colors.ENDC}")
        print(f"{Colors.BOLD}TEST SUMMARY{Colors.ENDC}")
        print(f"{Colors.BOLD}{'='*60}{Colors.ENDC}")
        
        for test_name, result in self.test_results:
            if result == "PASS":
                print_success(f"{test_name}: {result}")
            else:
                print_error(f"{test_name}: {result}")
        
        print(f"\n{Colors.BOLD}Total Tests: {len(tests)}{Colors.ENDC}")
        print(f"{Colors.GREEN}Passed: {passed}{Colors.ENDC}")
        print(f"{Colors.RED}Failed: {failed}{Colors.ENDC}")
        
        if failed == 0:
            print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 All tests passed!{Colors.ENDC}")
            return True
        else:
            print(f"\n{Colors.RED}{Colors.BOLD}❌ {failed} test(s) failed{Colors.ENDC}")
            return False

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)