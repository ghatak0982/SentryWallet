#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class SentryWalletAPITester:
    def __init__(self, base_url="https://973fb335-fd3d-4126-b372-80b883291d73.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)}")
                    return True, response_data
                except:
                    print(f"   Response: {response.text}")
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except requests.exceptions.ConnectionError:
            print(f"❌ Failed - Connection error")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test(
            "Root API Endpoint",
            "GET",
            "api/",
            200
        )

    def test_create_status_check(self):
        """Test creating a status check"""
        test_data = {
            "client_name": f"test_client_{datetime.now().strftime('%H%M%S')}"
        }
        return self.run_test(
            "Create Status Check",
            "POST",
            "api/status",
            200,
            data=test_data
        )

    def test_get_status_checks(self):
        """Test getting all status checks"""
        return self.run_test(
            "Get Status Checks",
            "GET",
            "api/status",
            200
        )

    def test_cors_headers(self):
        """Test CORS headers are present"""
        print(f"\n🔍 Testing CORS Headers...")
        try:
            response = requests.options(f"{self.base_url}/api/", timeout=10)
            self.tests_run += 1
            
            cors_headers = [
                'Access-Control-Allow-Origin',
                'Access-Control-Allow-Methods',
                'Access-Control-Allow-Headers'
            ]
            
            missing_headers = []
            for header in cors_headers:
                if header not in response.headers:
                    missing_headers.append(header)
            
            if not missing_headers:
                self.tests_passed += 1
                print(f"✅ Passed - CORS headers present")
                return True
            else:
                print(f"❌ Failed - Missing CORS headers: {missing_headers}")
                return False
                
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False

    def test_invalid_endpoints(self):
        """Test invalid endpoints return 404"""
        return self.run_test(
            "Invalid Endpoint",
            "GET",
            "api/nonexistent",
            404
        )

def main():
    print("🚀 Starting SentryWallet Backend API Tests")
    print("=" * 50)
    
    # Setup
    tester = SentryWalletAPITester()
    
    # Run tests
    print("\n📋 Running Basic API Tests...")
    
    # Test root endpoint
    tester.test_root_endpoint()
    
    # Test status check creation
    tester.test_create_status_check()
    
    # Test getting status checks
    tester.test_get_status_checks()
    
    # Test CORS
    tester.test_cors_headers()
    
    # Test invalid endpoint
    tester.test_invalid_endpoints()
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())