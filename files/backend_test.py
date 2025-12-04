import requests
import sys
import json
from datetime import datetime

class RelaxRPAPITester:
    def __init__(self, base_url="https://rpshop-official.preview.emergentagent.com"):
        self.base_url = base_url
        self.user_token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{status} - {name}")
        if details:
            print(f"   Details: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if success:
                try:
                    response_data = response.json()
                    details += f", Response: {json.dumps(response_data, ensure_ascii=False)[:200]}..."
                    self.log_test(name, True, details)
                    return True, response_data
                except:
                    self.log_test(name, True, details)
                    return True, {}
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data}"
                except:
                    details += f", Error: {response.text[:200]}"
                self.log_test(name, False, details)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        success, response = self.run_test("Health Check", "GET", "", 200)
        return success

    def test_user_registration(self):
        """Test user registration"""
        test_user_data = {
            "email": f"testuser_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "full_name": "Test User"
        }
        
        success, response = self.run_test(
            "User Registration", 
            "POST", 
            "auth/register", 
            200, 
            test_user_data
        )
        
        if success and 'user' in response:
            self.test_user_email = test_user_data['email']
            return True
        return False

    def test_user_login(self):
        """Test user login"""
        if not hasattr(self, 'test_user_email'):
            self.log_test("User Login", False, "No test user created")
            return False
            
        login_data = {
            "email": self.test_user_email,
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Login", 
            "POST", 
            "auth/login", 
            200, 
            login_data
        )
        
        if success and 'user' in response:
            self.user_token = response['user']['email']
            return True
        return False

    def test_admin_login(self):
        """Test admin login"""
        admin_data = {
            "email": "admin@relaxrp.com",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login", 
            "POST", 
            "auth/login", 
            200, 
            admin_data
        )
        
        if success and 'user' in response and response['user'].get('is_admin'):
            self.admin_token = response['user']['email']
            return True
        return False

    def test_get_products(self):
        """Test getting all products"""
        success, response = self.run_test("Get All Products", "GET", "products", 200)
        
        if success and isinstance(response, list):
            self.products = response
            self.log_test("Products Count", len(response) > 0, f"Found {len(response)} products")
            return True
        return False

    def test_get_products_by_category(self):
        """Test getting products by category"""
        categories = ["רכבים", "מפות", "Peds"]
        
        for category in categories:
            success, response = self.run_test(
                f"Get Products - {category}", 
                "GET", 
                f"products?category={category}", 
                200
            )
            if not success:
                return False
        return True

    def test_get_single_product(self):
        """Test getting a single product"""
        if not hasattr(self, 'products') or not self.products:
            self.log_test("Get Single Product", False, "No products available")
            return False
            
        product_id = self.products[0]['id']
        success, response = self.run_test(
            "Get Single Product", 
            "GET", 
            f"products/{product_id}", 
            200
        )
        return success

    def test_create_product_admin(self):
        """Test creating a product (admin only)"""
        if not self.admin_token:
            self.log_test("Create Product (Admin)", False, "No admin token")
            return False
            
        product_data = {
            "name": "Test Product",
            "description": "This is a test product",
            "price": 99.99,
            "category": "רכבים",
            "image_url": "https://example.com/test.jpg",
            "images": ["https://example.com/test1.jpg"]
        }
        
        headers = {"user-email": self.admin_token}
        success, response = self.run_test(
            "Create Product (Admin)", 
            "POST", 
            "products", 
            200, 
            product_data, 
            headers
        )
        
        if success and 'id' in response:
            self.test_product_id = response['id']
            return True
        return False

    def test_update_product_admin(self):
        """Test updating a product (admin only)"""
        if not self.admin_token or not hasattr(self, 'test_product_id'):
            self.log_test("Update Product (Admin)", False, "No admin token or test product")
            return False
            
        update_data = {
            "name": "Updated Test Product",
            "description": "This is an updated test product",
            "price": 149.99,
            "category": "מפות",
            "image_url": "https://example.com/updated.jpg",
            "images": ["https://example.com/updated1.jpg"]
        }
        
        headers = {"user-email": self.admin_token}
        success, response = self.run_test(
            "Update Product (Admin)", 
            "PUT", 
            f"products/{self.test_product_id}", 
            200, 
            update_data, 
            headers
        )
        return success

    def test_delete_product_admin(self):
        """Test deleting a product (admin only)"""
        if not self.admin_token or not hasattr(self, 'test_product_id'):
            self.log_test("Delete Product (Admin)", False, "No admin token or test product")
            return False
            
        headers = {"user-email": self.admin_token}
        success, response = self.run_test(
            "Delete Product (Admin)", 
            "DELETE", 
            f"products/{self.test_product_id}", 
            200, 
            None, 
            headers
        )
        return success

    def test_create_ticket(self):
        """Test creating a support ticket"""
        if not self.user_token:
            self.log_test("Create Ticket", False, "No user token")
            return False
            
        ticket_data = {
            "subject": "Test Support Ticket",
            "message": "This is a test support ticket message"
        }
        
        headers = {"user-email": self.user_token}
        success, response = self.run_test(
            "Create Ticket", 
            "POST", 
            "tickets", 
            200, 
            ticket_data, 
            headers
        )
        
        if success and 'id' in response:
            self.test_ticket_id = response['id']
            return True
        return False

    def test_get_user_tickets(self):
        """Test getting user tickets"""
        if not self.user_token:
            self.log_test("Get User Tickets", False, "No user token")
            return False
            
        headers = {"user-email": self.user_token}
        success, response = self.run_test(
            "Get User Tickets", 
            "GET", 
            "tickets", 
            200, 
            None, 
            headers
        )
        return success

    def test_get_all_tickets_admin(self):
        """Test getting all tickets (admin only)"""
        if not self.admin_token:
            self.log_test("Get All Tickets (Admin)", False, "No admin token")
            return False
            
        headers = {"user-email": self.admin_token}
        success, response = self.run_test(
            "Get All Tickets (Admin)", 
            "GET", 
            "tickets/all", 
            200, 
            None, 
            headers
        )
        return success

    def test_checkout_session(self):
        """Test creating checkout session"""
        if not self.user_token or not hasattr(self, 'products') or not self.products:
            self.log_test("Create Checkout Session", False, "No user token or products")
            return False
            
        checkout_data = {
            "items": [{
                "product_id": self.products[0]['id'],
                "product_name": self.products[0]['name'],
                "price": self.products[0]['price'],
                "quantity": 1
            }],
            "origin_url": "https://rpshop-official.preview.emergentagent.com"
        }
        
        headers = {"user-email": self.user_token}
        success, response = self.run_test(
            "Create Checkout Session", 
            "POST", 
            "checkout/session", 
            200, 
            checkout_data, 
            headers
        )
        
        if success and 'url' in response and 'session_id' in response:
            self.test_session_id = response['session_id']
            return True
        return False

    def test_get_user_orders(self):
        """Test getting user orders"""
        if not self.user_token:
            self.log_test("Get User Orders", False, "No user token")
            return False
            
        headers = {"user-email": self.user_token}
        success, response = self.run_test(
            "Get User Orders", 
            "GET", 
            "orders", 
            200, 
            None, 
            headers
        )
        return success

    def test_get_all_orders_admin(self):
        """Test getting all orders (admin only)"""
        if not self.admin_token:
            self.log_test("Get All Orders (Admin)", False, "No admin token")
            return False
            
        headers = {"user-email": self.admin_token}
        success, response = self.run_test(
            "Get All Orders (Admin)", 
            "GET", 
            "orders/all", 
            200, 
            None, 
            headers
        )
        return success

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Relax RP API Tests...")
        print("=" * 50)
        
        # Basic tests
        self.test_health_check()
        
        # Auth tests
        self.test_user_registration()
        self.test_user_login()
        self.test_admin_login()
        
        # Product tests
        self.test_get_products()
        self.test_get_products_by_category()
        self.test_get_single_product()
        
        # Admin product management
        self.test_create_product_admin()
        self.test_update_product_admin()
        self.test_delete_product_admin()
        
        # Ticket tests
        self.test_create_ticket()
        self.test_get_user_tickets()
        self.test_get_all_tickets_admin()
        
        # Order and checkout tests
        self.test_checkout_session()
        self.test_get_user_orders()
        self.test_get_all_orders_admin()
        
        # Print results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Return results for further processing
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "success_rate": (self.tests_passed/self.tests_run)*100,
            "test_details": self.test_results
        }

def main():
    tester = RelaxRPAPITester()
    results = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if results["success_rate"] > 80 else 1

if __name__ == "__main__":
    sys.exit(main())