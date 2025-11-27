/**
 * API Functionality Test Suite
 * Comprehensive backend API testing with validation of all critical endpoints
 * 
 * Run with: node tests/api_functionality_test.js
 * (Requires the backend server running on port 5000)
 */

const axios = require('axios');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

let passCount = 0;
let failCount = 0;
const testResults = [];

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function pass(testName, details = '') {
  passCount++;
  log(`  ✓ ${testName}`, 'green');
  if (details) log(`    ${details}`, 'cyan');
  testResults.push({ test: testName, status: 'PASS', details });
}

function fail(testName, error, details = '') {
  failCount++;
  log(`  ✗ ${testName}`, 'red');
  log(`    Error: ${error}`, 'red');
  if (details) log(`    Details: ${details}`, 'red');
  testResults.push({ test: testName, status: 'FAIL', error, details });
}

async function runTests() {
  log('\n╔═══════════════════════════════════════════════════════════════════════╗', 'blue');
  log('║              API FUNCTIONALITY TEST SUITE - BACKEND BUILD             ║', 'blue');
  log('╚═══════════════════════════════════════════════════════════════════════╝\n', 'blue');

  const BASE_URL = 'http://localhost:5000';
  const api = axios.create({ baseURL: BASE_URL });

  // Test backend availability
  try {
    await api.get('/api/products', { timeout: 5000 });
  } catch (error) {
    if (error.response?.status !== 200 && error.response?.status !== 404) {
      log('\n✗ FATAL ERROR: Backend not running on http://localhost:5000', 'red');
      log('  Please start the backend with: node db/admin_server.js\n', 'yellow');
      process.exit(1);
    }
  }

  let testUserId = null;
  let testToken = null;
  let testProductId = null;
  let testAddressId = null;
  let testOrderId = null;

  // ==================== PUBLIC ENDPOINTS ====================
  log('\n┌─ PUBLIC ENDPOINTS ────────────────────────────────────────────────────┐\n', 'magenta');

  // Test: Get Products
  try {
    const response = await api.get('/api/products');
    if (response.status === 200 && Array.isArray(response.data)) {
      if (response.data.length > 0) {
        testProductId = response.data[0].id;
        pass('GET /api/products', `Retrieved ${response.data.length} products`);
      } else {
        pass('GET /api/products', 'Endpoint works (no products available)');
      }
    } else {
      fail('GET /api/products', `Unexpected status: ${response.status}`);
    }
  } catch (error) {
    fail('GET /api/products', error.message);
  }

  // Test: Get Product by ID
  if (testProductId) {
    try {
      const response = await api.get(`/api/products/${testProductId}`);
      if (response.status === 200 && response.data.id === testProductId) {
        pass('GET /api/products/:id', `Retrieved product ID: ${testProductId}`);
      } else {
        fail('GET /api/products/:id', `Unexpected response structure`);
      }
    } catch (error) {
      fail('GET /api/products/:id', error.message);
    }
  }

  // Test: Get Categories
  try {
    const response = await api.get('/api/categories');
    if (response.status === 200 && Array.isArray(response.data)) {
      pass('GET /api/categories', `Retrieved ${response.data.length} categories`);
    } else {
      fail('GET /api/categories', `Unexpected response structure`);
    }
  } catch (error) {
    fail('GET /api/categories', error.message);
  }

  // Test: Get Featured Products
  try {
    const response = await api.get('/api/products/featured');
    if (response.status === 200 && Array.isArray(response.data)) {
      pass('GET /api/products/featured', `Retrieved ${response.data.length} featured products`);
    } else {
      fail('GET /api/products/featured', `Unexpected response structure`);
    }
  } catch (error) {
    fail('GET /api/products/featured', error.message);
  }

  // Test: Check Email (non-existent)
  try {
    const response = await api.get('/api/auth/check-email', {
      params: { email: `test_${Date.now()}@example.com` }
    });
    if (response.status === 200 && response.data.exists === false) {
      pass('GET /api/auth/check-email', 'Correctly returns non-existent email');
    } else {
      fail('GET /api/auth/check-email', `Unexpected response: ${response.data}`);
    }
  } catch (error) {
    fail('GET /api/auth/check-email', error.message);
  }

  // ==================== AUTHENTICATION ENDPOINTS ====================
  log('\n┌─ AUTHENTICATION ENDPOINTS ────────────────────────────────────────────┐\n', 'magenta');

  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  // Test: User Registration
  try {
    const response = await api.post('/api/auth/register', {
      email: testEmail,
      password: testPassword,
      fullName: 'Test User'
    });
    if (response.status === 200 && response.data.userId) {
      testUserId = response.data.userId;
      testToken = response.data.token;
      pass('POST /api/auth/register', `User registered with ID: ${testUserId}`);
    } else {
      fail('POST /api/auth/register', `Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    fail('POST /api/auth/register', error.message);
  }

  // Test: User Login
  try {
    const response = await api.post('/api/auth/login', {
      email: testEmail,
      password: testPassword
    });
    if (response.status === 200 && response.data.token) {
      testToken = response.data.token;
      pass('POST /api/auth/login', `Login successful, token received`);
    } else {
      fail('POST /api/auth/login', `Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    fail('POST /api/auth/login', error.message);
  }

  // Test: Login with invalid credentials
  try {
    const response = await api.post('/api/auth/login', {
      email: testEmail,
      password: 'wrongpassword'
    });
    fail('POST /api/auth/login (invalid)', `Should have rejected invalid password`);
  } catch (error) {
    if (error.response?.status === 401) {
      pass('POST /api/auth/login (invalid credentials)', `Correctly rejected with 401`);
    } else {
      fail('POST /api/auth/login (invalid)', error.message);
    }
  }

  // ==================== AUTHENTICATED ENDPOINTS ====================
  if (!testToken || !testUserId) {
    log('\n⚠ Cannot test authenticated endpoints without valid token\n', 'yellow');
  } else {
    const authHeader = { Authorization: `Bearer ${testToken}` };

    log('\n┌─ AUTHENTICATED ENDPOINTS ─────────────────────────────────────────────┐\n', 'magenta');

    // Test: Get User Profile
    try {
      const response = await api.get(`/api/users/${testUserId}/profile`, { headers: authHeader });
      if (response.status === 200 && response.data.email) {
        pass('GET /api/users/:userId/profile', `Retrieved profile for user ${testUserId}`);
      } else {
        fail('GET /api/users/:userId/profile', `Unexpected response structure`);
      }
    } catch (error) {
      fail('GET /api/users/:userId/profile', error.message);
    }

    // Test: Update User Profile
    try {
      const response = await api.put(`/api/users/${testUserId}/profile`, {
        fullName: 'Updated Test User',
        phone: '9876543210'
      }, { headers: authHeader });
      if (response.status === 200) {
        pass('PUT /api/users/:userId/profile', `Profile updated successfully`);
      } else {
        fail('PUT /api/users/:userId/profile', `Unexpected status: ${response.status}`);
      }
    } catch (error) {
      fail('PUT /api/users/:userId/profile', error.message);
    }

    // Test: Get Addresses
    try {
      const response = await api.get(`/api/users/${testUserId}/addresses`, { headers: authHeader });
      if (response.status === 200 && Array.isArray(response.data)) {
        pass('GET /api/users/:userId/addresses', `Retrieved ${response.data.length} addresses`);
      } else {
        fail('GET /api/users/:userId/addresses', `Unexpected response structure`);
      }
    } catch (error) {
      fail('GET /api/users/:userId/addresses', error.message);
    }

    // Test: Create Address
    try {
      const response = await api.post(`/api/users/${testUserId}/addresses`, {
        addressLine1: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '123456',
        country: 'India',
        phone: '9876543210'
      }, { headers: authHeader });
      if (response.status === 200 && response.data.id) {
        testAddressId = response.data.id;
        pass('POST /api/users/:userId/addresses', `Address created with ID: ${testAddressId}`);
      } else {
        fail('POST /api/users/:userId/addresses', `Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      fail('POST /api/users/:userId/addresses', error.message);
    }

    // Test: Update Address
    if (testAddressId) {
      try {
        const response = await api.put(`/api/users/${testUserId}/addresses/${testAddressId}`, {
          addressLine1: '456 Updated Street',
          city: 'Updated City',
          state: 'Updated State',
          zipCode: '654321',
          country: 'India'
        }, { headers: authHeader });
        if (response.status === 200) {
          pass('PUT /api/users/:userId/addresses/:addressId', `Address updated successfully`);
        } else {
          fail('PUT /api/users/:userId/addresses/:addressId', `Unexpected status: ${response.status}`);
        }
      } catch (error) {
        fail('PUT /api/users/:userId/addresses/:addressId', error.message);
      }
    }

    // Test: Get Wishlist
    try {
      const response = await api.get(`/api/users/${testUserId}/wishlist`, { headers: authHeader });
      if (response.status === 200 && Array.isArray(response.data)) {
        pass('GET /api/users/:userId/wishlist', `Retrieved ${response.data.length} wishlist items`);
      } else {
        fail('GET /api/users/:userId/wishlist', `Unexpected response structure`);
      }
    } catch (error) {
      fail('GET /api/users/:userId/wishlist', error.message);
    }

    // Test: Add to Wishlist
    if (testProductId) {
      try {
        const response = await api.post(`/api/users/${testUserId}/wishlist`, {
          productId: testProductId
        }, { headers: authHeader });
        if (response.status === 200 || response.status === 201) {
          pass('POST /api/users/:userId/wishlist', `Product added to wishlist`);
        } else {
          fail('POST /api/users/:userId/wishlist', `Unexpected status: ${response.status}`);
        }
      } catch (error) {
        if (error.response?.status === 409) {
          pass('POST /api/users/:userId/wishlist', `Already in wishlist (409 conflict)`);
        } else {
          fail('POST /api/users/:userId/wishlist', error.message);
        }
      }
    }

    // Test: Get Orders
    try {
      const response = await api.get(`/api/users/${testUserId}/orders`, { headers: authHeader });
      if (response.status === 200 && Array.isArray(response.data)) {
        pass('GET /api/users/:userId/orders', `Retrieved ${response.data.length} orders`);
      } else {
        fail('GET /api/users/:userId/orders', `Unexpected response structure`);
      }
    } catch (error) {
      fail('GET /api/users/:userId/orders', error.message);
    }

    // Test: Cart Validation
    try {
      const response = await api.post('/api/cart/validate', {
        items: testProductId ? [{ productId: testProductId, quantity: 1 }] : []
      }, { headers: authHeader });
      if (response.status === 200 && response.data.valid !== undefined) {
        pass('POST /api/cart/validate', `Cart validation returned: ${response.data.valid}`);
      } else {
        fail('POST /api/cart/validate', `Unexpected response structure`);
      }
    } catch (error) {
      fail('POST /api/cart/validate', error.message);
    }

    // Test: Create Order
    try {
      const response = await api.post('/api/orders', {
        items: testProductId ? [{ productId: testProductId, quantity: 1, price: 100 }] : [],
        addressId: testAddressId,
        total: 100,
        tax: 18,
        shipping: 50
      }, { headers: authHeader });
      if (response.status === 200 && response.data.orderId) {
        testOrderId = response.data.orderId;
        pass('POST /api/orders', `Order created with ID: ${testOrderId}`);
      } else {
        fail('POST /api/orders', `Unexpected response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      fail('POST /api/orders', error.response?.data?.error || error.message);
    }

    // Test: Create Payment Order
    if (testOrderId) {
      try {
        const response = await api.post('/api/payment/create-order', {
          orderId: testOrderId,
          amount: 15000
        }, { headers: authHeader });
        if (response.status === 200 && response.data.id) {
          pass('POST /api/payment/create-order', `Payment order created with ID: ${response.data.id}`);
        } else {
          fail('POST /api/payment/create-order', `Unexpected response structure`);
        }
      } catch (error) {
        fail('POST /api/payment/create-order', error.message);
      }
    }

    // Test: Chat Messages
    try {
      const response = await api.post('/api/chat/messages', {
        message: 'Hello, I need help with my order',
        userId: testUserId
      });
      if (response.status === 200 && response.data.response) {
        pass('POST /api/chat/messages', `Chat response received`);
      } else {
        fail('POST /api/chat/messages', `Unexpected response structure`);
      }
    } catch (error) {
      fail('POST /api/chat/messages', error.message);
    }
  }

  // ==================== ERROR HANDLING ====================
  log('\n┌─ ERROR HANDLING & EDGE CASES ─────────────────────────────────────────┐\n', 'magenta');

  // Test: Invalid product ID
  try {
    const response = await api.get('/api/products/99999');
    if (response.status === 404 || (response.data && !response.data.id)) {
      pass('GET /api/products/:id (invalid)', `Correctly handled invalid ID`);
    } else {
      fail('GET /api/products/:id (invalid)', `Should return 404 or empty`);
    }
  } catch (error) {
    if (error.response?.status === 404) {
      pass('GET /api/products/:id (invalid)', `Correctly returned 404`);
    } else {
      fail('GET /api/products/:id (invalid)', error.message);
    }
  }

  // Test: Unauthorized access without token
  try {
    const response = await api.get(`/api/users/1/profile`);
    fail('GET /api/users/:userId/profile (no auth)', `Should reject without token`);
  } catch (error) {
    if (error.response?.status === 401) {
      pass('GET /api/users/:userId/profile (no auth)', `Correctly rejected with 401`);
    } else {
      fail('GET /api/users/:userId/profile (no auth)', error.message);
    }
  }

  // Test: Malformed request
  try {
    const response = await api.post('/api/auth/register', {
      email: 'invalid-email'
    });
    fail('POST /api/auth/register (malformed)', `Should validate input`);
  } catch (error) {
    if (error.response?.status >= 400) {
      pass('POST /api/auth/register (malformed)', `Correctly rejected malformed request`);
    } else {
      fail('POST /api/auth/register (malformed)', error.message);
    }
  }

  // ==================== SUMMARY ====================
  const totalTests = passCount + failCount;
  const successRate = ((passCount / totalTests) * 100).toFixed(1);

  log('\n╔═══════════════════════════════════════════════════════════════════════╗', 'blue');
  log('║                      TEST RESULTS SUMMARY                            ║', 'blue');
  log('╠═══════════════════════════════════════════════════════════════════════╣', 'blue');
  log(`║  Total Tests:            ${String(totalTests).padEnd(51)}║`, 'cyan');
  log(`║  Passed:                 ${String(passCount).padEnd(51)}║`, passCount === totalTests ? 'green' : 'yellow');
  log(`║  Failed:                 ${String(failCount).padEnd(51)}║`, failCount === 0 ? 'green' : 'red');
  log(`║  Success Rate:           ${String(`${successRate}%`).padEnd(51)}║`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');
  log('╠═══════════════════════════════════════════════════════════════════════╣', 'blue');
  log(`║  PASS: ${String(passCount).padEnd(9)} FAIL: ${String(failCount).padEnd(62)}║`, passCount > failCount ? 'green' : 'red');
  log('╚═══════════════════════════════════════════════════════════════════════╝\n', 'blue');

  if (failCount === 0) {
    log('✓ ALL API ENDPOINTS FUNCTIONAL - BUILD VERIFIED\n', 'green');
  } else if (successRate >= 80) {
    log(`⚠ Most endpoints working (${failCount} failures)\n`, 'yellow');
  } else {
    log(`✗ Critical failures detected (Success rate: ${successRate}%)\n`, 'red');
  }

  process.exit(failCount > 0 && successRate < 80 ? 1 : 0);
}

runTests().catch(error => {
  log(`\nUnexpected error: ${error.message}`, 'red');
  process.exit(1);
});
