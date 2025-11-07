// Test script to verify admin API endpoints

const testLogin = async () => {
  console.log('Testing admin login...');
  
  try {
    const response = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@ecommerce.com',
        password: 'admin123'
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('Token:', data.token);
      console.log('Admin:', data.admin);
      return data.token;
    } else {
      console.log('❌ Login failed:', data.error);
      return null;
    }
  } catch (err) {
    console.log('❌ Connection error:', err.message);
    return null;
  }
};

const testAnalytics = async (token) => {
  console.log('\nTesting analytics endpoint...');
  
  try {
    const response = await fetch('http://localhost:5000/api/admin/analytics', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Analytics retrieved successfully!');
      console.log('Total Sales:', data.summary.totalSales);
      console.log('Total Quantity Sold:', data.summary.totalQuantitySold);
      console.log('User Traffic:', data.summary.totalUserTraffic);
    } else {
      console.log('❌ Analytics failed:', data.error);
    }
  } catch (err) {
    console.log('❌ Connection error:', err.message);
  }
};

// Run tests
(async () => {
  console.log('=====================================');
  console.log('  Admin API Test Suite');
  console.log('=====================================\n');
  
  const token = await testLogin();
  
  if (token) {
    await testAnalytics(token);
  }
  
  console.log('\n=====================================');
  console.log('  Tests Complete');
  console.log('=====================================');
})();