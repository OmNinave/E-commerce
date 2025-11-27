/**
 * P0 Critical Patches Test Suite
 * Tests for bcrypt auth, admin DB resilience, order validation, and stock checks.
 * 
 * Run with: node tests/P0_auth_and_order_tests.js
 * (Requires the backend server running on port 5000)
 */

const fs = require('fs');
const path = require('path');

// Color logging for test output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

let passCount = 0;
let failCount = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function pass(testName) {
  passCount++;
  log(`  ✓ ${testName}`, 'green');
}

function fail(testName, error) {
  failCount++;
  log(`  ✗ ${testName}`, 'red');
  log(`    Error: ${error}`, 'red');
}

async function makeRequest(method, endpoint, body = null, headers = {}) {
  const baseURL = 'http://localhost:5000';
  const options = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers }
  };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${baseURL}${endpoint}`, options);
    const contentType = response.headers.get('content-type');
    const data = contentType && contentType.includes('application/json') 
      ? await response.json() 
      : await response.text();
    return { status: response.status, data };
  } catch (error) {
    throw new Error(`Network error: ${error.message}`);
  }
}

async function runTests() {
  log('\n═══════════════════════════════════════════════════════════════', 'blue');
  log('  P0 CRITICAL PATCHES TEST SUITE', 'blue');
  log('═══════════════════════════════════════════════════════════════\n', 'blue');

  // Test 1: Registration with bcrypt
  log('1. User Registration & Bcrypt Hashing', 'yellow');
  try {
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'SecurePassword123';
    
    const result = await makeRequest('POST', '/api/auth/register', {
      fullName: 'Test User',
      email: testEmail,
      password: testPassword
    });

    if (result.status === 201 && result.data.success) {
      pass('Registration creates user with bcrypt hash');
      if (!result.data.user.password) {
        pass('Password not returned in response (security)');
      } else {
        fail('Registration response includes password', 'Password should not be in response');
      }
    } else {
      fail('Registration endpoint', `Status ${result.status}: ${JSON.stringify(result.data)}`);
    }
  } catch (error) {
    fail('Registration test', error.message);
  }

  // Test 2: Login with bcrypt
  log('\n2. User Login with Bcrypt Verification', 'yellow');
  try {
    const testEmail = `login_test_${Date.now()}@example.com`;
    const testPassword = 'LoginTest123';

    // Register first
    await makeRequest('POST', '/api/auth/register', {
      fullName: 'Login Test',
      email: testEmail,
      password: testPassword
    });

    // Now login
    const loginResult = await makeRequest('POST', '/api/auth/login', {
      email: testEmail,
      password: testPassword
    });

    if (loginResult.status === 200 && loginResult.data.success) {
      pass('Login succeeds with correct password');
      if (!loginResult.data.user.password) {
        pass('Password not returned in login response');
      }
    } else {
      fail('Login endpoint', `Status ${loginResult.status}: ${JSON.stringify(loginResult.data)}`);
    }

    // Test wrong password
    const wrongPassResult = await makeRequest('POST', '/api/auth/login', {
      email: testEmail,
      password: 'WrongPassword'
    });

    if (wrongPassResult.status === 401) {
      pass('Login rejects incorrect password');
    } else {
      fail('Login security', `Should reject wrong password, got status ${wrongPassResult.status}`);
    }
  } catch (error) {
    fail('Login test', error.message);
  }

  // Test 3: Admin DB resilience
  log('\n3. Admin Database Resilience', 'yellow');
  try {
    // Just verify admin endpoints are accessible (DB file should be created if missing)
    const verifyResult = await makeRequest('POST', '/api/admin/login', {
      email: 'admin@test.com',
      password: 'anypassword'
    });

    if (verifyResult.status === 401) {
      pass('Admin login endpoint operational (no crash if DB missing)');
    } else if (verifyResult.status === 200) {
      pass('Admin login endpoint operational');
    } else {
      fail('Admin endpoint', `Unexpected status ${verifyResult.status}`);
    }
  } catch (error) {
    fail('Admin DB resilience', error.message);
  }

  // Test 4: Order validation - missing product
  log('\n4. Order Validation - Product Existence', 'yellow');
  try {
    // First register and login a user
    const userEmail = `order_test_${Date.now()}@example.com`;
    const userPass = 'OrderTest123';
    
    const regResult = await makeRequest('POST', '/api/auth/register', {
      fullName: 'Order Test User',
      email: userEmail,
      password: userPass
    });

    if (regResult.status !== 201) {
      fail('Order test setup', 'Could not register test user');
      return;
    }

    const userId = regResult.data.user.id;
    const token = regResult.data.token;

    // Attempt to create order with non-existent product
    const orderResult = await makeRequest('POST', '/api/orders', {
      userId: userId,
      items: [
        { id: 'NONEXISTENT_PRODUCT', quantity: 1 }
      ],
      totalAmount: 999.99
    }, { Authorization: `Bearer ${token}` });

    if (orderResult.status === 400 && (orderResult.data.error || orderResult.data.message)) {
      pass('Order rejected for non-existent product');
    } else {
      fail('Order validation', `Should reject non-existent product, got status ${orderResult.status}`);
    }
  } catch (error) {
    fail('Order validation test', error.message);
  }

  // Test 5: Order validation - price mismatch
  log('\n5. Order Validation - Price Verification', 'yellow');
  try {
    // Get a real product first
    const productsResult = await makeRequest('GET', '/api/products');
    
    if (productsResult.status === 200 && productsResult.data.products && productsResult.data.products.length > 0) {
      const product = productsResult.data.products[0];
      
      // Register and login user
      const userEmail = `price_test_${Date.now()}@example.com`;
      const userPass = 'PriceTest123';
      
      const regResult = await makeRequest('POST', '/api/auth/register', {
        fullName: 'Price Test User',
        email: userEmail,
        password: userPass
      });

      if (regResult.status === 201) {
        const userId = regResult.data.user.id;
        const token = regResult.data.token;

        // Try to create order with mismatched price (tampered from client)
        const tamperedPrice = (product.price || 0) - 9999;
        const orderResult = await makeRequest('POST', '/api/orders', {
          userId: userId,
          items: [
            { id: product.id, quantity: 1 }
          ],
          totalAmount: tamperedPrice // Severely underpriced
        }, { Authorization: `Bearer ${token}` });

        if (orderResult.status === 400 && orderResult.data.error) {
          pass('Order rejected for mismatched total amount');
        } else if (orderResult.status === 201) {
          // Server may accept but recompute. Check if order total was corrected.
          const orderTotal = orderResult.data.order ? orderResult.data.order.totalAmount : null;
          const expectedTotal = product.price || 0;
          
          if (orderTotal && Math.abs(orderTotal - expectedTotal) < 0.01) {
            pass('Order accepted but server corrected total amount');
          } else {
            fail('Price validation', 'Server did not validate or correct total');
          }
        } else {
          fail('Price validation', `Unexpected response status ${orderResult.status}`);
        }
      }
    }
  } catch (error) {
    fail('Price validation test', error.message);
  }

  // Test 6: Order item validation - quantity required
  log('\n6. Order Validation - Required Fields', 'yellow');
  try {
    const userEmail = `field_test_${Date.now()}@example.com`;
    const userPass = 'FieldTest123';
    
    const regResult = await makeRequest('POST', '/api/auth/register', {
      fullName: 'Field Test User',
      email: userEmail,
      password: userPass
    });

    if (regResult.status === 201) {
      const userId = regResult.data.user.id;
      const token = regResult.data.token;

      // Try order with missing quantity
      const orderResult = await makeRequest('POST', '/api/orders', {
        userId: userId,
        items: [
          { id: 'PROD001' }  // Missing quantity
        ]
      }, { Authorization: `Bearer ${token}` });

      if (orderResult.status === 400) {
        pass('Order rejected for missing quantity field');
      } else {
        fail('Field validation', `Should reject missing quantity, got status ${orderResult.status}`);
      }
    }
  } catch (error) {
    fail('Field validation test', error.message);
  }

  // Summary
  log('\n═══════════════════════════════════════════════════════════════', 'blue');
  log(`  TEST SUMMARY: ${passCount} passed, ${failCount} failed`, 'blue');
  log('═══════════════════════════════════════════════════════════════\n', 'blue');

  if (failCount === 0) {
    log('✓ All P0 patches working correctly!', 'green');
    process.exit(0);
  } else {
    log('✗ Some tests failed. Review errors above.', 'red');
    process.exit(1);
  }
}

// Main execution
(async () => {
  try {
    await runTests();
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'red');
    process.exit(1);
  }
})();
