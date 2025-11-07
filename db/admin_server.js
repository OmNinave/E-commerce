const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware - Allow both local and production origins
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5000',
    'https://ecommerce-admin-backend.onrender.com',
    process.env.FRONTEND_URL
  ].filter(Boolean);
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Load databases - Handle both local and Render paths
const adminDbPath = path.join(__dirname, 'admin_database.json');
const mainDbPath = path.join(__dirname, 'full_database.json');

function loadAdminDb() {
  return JSON.parse(fs.readFileSync(adminDbPath, 'utf8'));
}

function loadMainDb() {
  return JSON.parse(fs.readFileSync(mainDbPath, 'utf8'));
}

function saveAdminDb(data) {
  fs.writeFileSync(adminDbPath, JSON.stringify(data, null, 2));
}

// Session management
const sessions = new Map();
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function createSession(adminId) {
  const token = generateSessionToken();
  const expiresAt = Date.now() + SESSION_TIMEOUT;
  sessions.set(token, { adminId, expiresAt });
  return token;
}

function validateSession(token) {
  const session = sessions.get(token);
  if (!session) return null;
  
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  
  // Refresh session timeout
  session.expiresAt = Date.now() + SESSION_TIMEOUT;
  return session;
}

// Middleware to verify session
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const session = validateSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired' });
  }
  
  req.adminId = session.adminId;
  next();
}

// Routes

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const adminDb = loadAdminDb();
    const admin = adminDb.admin_users.find(u => u.email === email);
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // For demo purposes, accept "admin123" as password for all accounts
    // In production, use: await bcrypt.compare(password, admin.password_hash)
    const isValidPassword = password === 'admin123';
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = createSession(admin.admin_id);
    
    res.json({
      success: true,
      token,
      admin: {
        admin_id: admin.admin_id,
        email: admin.email,
        full_name: admin.full_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin logout
app.post('/api/admin/logout', requireAuth, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  sessions.delete(token);
  res.json({ success: true });
});

// Verify session
app.get('/api/admin/verify', requireAuth, (req, res) => {
  const adminDb = loadAdminDb();
  const admin = adminDb.admin_users.find(u => u.admin_id === req.adminId);
  
  res.json({
    valid: true,
    admin: {
      admin_id: admin.admin_id,
      email: admin.email,
      full_name: admin.full_name
    }
  });
});

// Get dashboard analytics with time filtering
app.get('/api/admin/analytics', requireAuth, (req, res) => {
  try {
    const mainDb = loadMainDb();
    const { timeRange = 'month' } = req.query;
    
    // Calculate date range based on filter (always current period)
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();
    
    if (timeRange === 'week') {
      // Current week (Sunday to Saturday)
      const currentDay = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - currentDay);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (timeRange === 'month') {
      // Current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (timeRange === 'year') {
      // Current year
      const currentYear = now.getFullYear();
      startDate = new Date(currentYear, 0, 1);
      endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
    }
    
    // Filter purchases by date range
    const filteredPurchases = mainDb.purchaseHistory.filter(p => {
      const purchaseDate = new Date(p.purchaseDate);
      return purchaseDate >= startDate && purchaseDate <= endDate;
    });
    
    // Calculate summary statistics (price = 0, so revenue = 0)
    const totalSales = 0; // All prices are 0
    const totalQuantitySold = filteredPurchases.reduce((sum, p) => sum + p.quantity, 0);
    const uniqueUsers = new Set(filteredPurchases.map(p => p.userId)).size;
    
    // New vs Old Users Analysis
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const newUsers = mainDb.users.filter(u => {
      const createdDate = new Date(u.accountCreatedDate || u.registrationDate);
      return createdDate >= thirtyDaysAgo;
    });
    
    const oldUsers = mainDb.users.filter(u => {
      const createdDate = new Date(u.accountCreatedDate || u.registrationDate);
      return createdDate < thirtyDaysAgo;
    });
    
    // New users in current period
    const newUsersInPeriod = mainDb.users.filter(u => {
      const regDate = new Date(u.accountCreatedDate || u.registrationDate);
      return regDate >= startDate && regDate <= endDate;
    });
    
    // Aggregate data based on time range
    let dates = [];
    let quantityData = [];
    let salesData = [];
    let trafficData = [];
    
    if (timeRange === 'week') {
      // Show 7 days (Sunday to Saturday)
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dailyData = {};
      
      // Initialize all 7 days
      for (let i = 0; i < 7; i++) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        const dayKey = day.toISOString().split('T')[0];
        dailyData[dayKey] = { quantity: 0, users: new Set(), dayName: dayNames[day.getDay()] };
      }
      
      // Aggregate purchases by day
      filteredPurchases.forEach(purchase => {
        const dayKey = purchase.purchaseDate;
        if (dailyData[dayKey]) {
          dailyData[dayKey].quantity += purchase.quantity;
          dailyData[dayKey].users.add(purchase.userId);
        }
      });
      
      // Convert to arrays
      Object.keys(dailyData).sort().forEach(dayKey => {
        dates.push(dailyData[dayKey].dayName);
        quantityData.push(dailyData[dayKey].quantity);
        salesData.push(0);
        trafficData.push(dailyData[dayKey].users.size);
      });
      
    } else if (timeRange === 'month') {
      // Show weeks in the month
      const weeklyData = {};
      
      filteredPurchases.forEach(purchase => {
        const pDate = new Date(purchase.purchaseDate);
        const weekStart = new Date(pDate);
        weekStart.setDate(pDate.getDate() - pDate.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { quantity: 0, users: new Set() };
        }
        weeklyData[weekKey].quantity += purchase.quantity;
        weeklyData[weekKey].users.add(purchase.userId);
      });
      
      // Convert to arrays with week labels
      const weeks = Object.keys(weeklyData).sort();
      weeks.forEach((weekKey, index) => {
        const weekDate = new Date(weekKey);
        dates.push(`Week ${index + 1}`);
        quantityData.push(weeklyData[weekKey].quantity);
        salesData.push(0);
        trafficData.push(weeklyData[weekKey].users.size);
      });
      
    } else if (timeRange === 'year') {
      // Show all 12 months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyData = {};
      
      // Initialize all 12 months
      for (let i = 0; i < 12; i++) {
        monthlyData[i] = { quantity: 0, users: new Set(), monthName: monthNames[i] };
      }
      
      // Aggregate purchases by month
      filteredPurchases.forEach(purchase => {
        const pDate = new Date(purchase.purchaseDate);
        const monthIndex = pDate.getMonth();
        monthlyData[monthIndex].quantity += purchase.quantity;
        monthlyData[monthIndex].users.add(purchase.userId);
      });
      
      // Convert to arrays
      for (let i = 0; i < 12; i++) {
        dates.push(monthlyData[i].monthName);
        quantityData.push(monthlyData[i].quantity);
        salesData.push(0);
        trafficData.push(monthlyData[i].users.size);
      }
    }
    
    // Week-wise aggregation for last 2 months
    const weeklyData = {};
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(now.getMonth() - 2);
    
    const last2MonthsPurchases = mainDb.purchaseHistory.filter(p => {
      const pDate = new Date(p.purchaseDate);
      return pDate >= twoMonthsAgo;
    });
    
    // Group by week
    last2MonthsPurchases.forEach(purchase => {
      const pDate = new Date(purchase.purchaseDate);
      const weekStart = new Date(pDate);
      weekStart.setDate(pDate.getDate() - pDate.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { sales: 0, quantity: 0, orders: 0 };
      }
      weeklyData[weekKey].quantity += purchase.quantity;
      weeklyData[weekKey].orders += 1;
    });
    
    const weeklyDates = Object.keys(weeklyData).sort();
    const weeklySales = weeklyDates.map(date => 0); // All sales are 0
    const weeklyQuantity = weeklyDates.map(date => weeklyData[date].quantity);
    const weeklyOrders = weeklyDates.map(date => weeklyData[date].orders);
    
    console.log(`📊 Analytics Response:`, {
      timeRange,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      filteredPurchases: filteredPurchases.length,
      totalQuantity: totalQuantitySold,
      chartDataPoints: dates.length,
      chartLabels: dates
    });
    
    // User registrations by date
    const userRegistrations = {};
    newUsersInPeriod.forEach(user => {
      const date = user.accountCreatedDate || user.registrationDate;
      userRegistrations[date] = (userRegistrations[date] || 0) + 1;
    });
    
    const userDates = Object.keys(userRegistrations).sort();
    const userCounts = userDates.map(date => userRegistrations[date]);
    
    // Top selling products
    const productSales = {};
    filteredPurchases.forEach(purchase => {
      if (!productSales[purchase.productId]) {
        productSales[purchase.productId] = {
          productId: purchase.productId,
          productName: purchase.productName,
          quantitySold: 0,
          revenue: 0
        };
      }
      productSales[purchase.productId].quantitySold += purchase.quantity;
    });
    
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantitySold - b.quantitySold)
      .slice(0, 10);
    
    // Category-wise sales
    const categoryData = {};
    filteredPurchases.forEach(purchase => {
      const product = mainDb.products.find(p => p.productId === purchase.productId);
      if (product) {
        const category = product.category || 'Other';
        if (!categoryData[category]) {
          categoryData[category] = { quantity: 0, orders: 0 };
        }
        categoryData[category].quantity += purchase.quantity;
        categoryData[category].orders += 1;
      }
    });
    
    res.json({
      summary: {
        totalSales: 0,
        totalQuantitySold,
        totalUserTraffic: uniqueUsers,
        totalOrders: filteredPurchases.length,
        newUsers: newUsers.length,
        oldUsers: oldUsers.length,
        newUsersInPeriod: newUsersInPeriod.length,
        averageOrderValue: 0
      },
      charts: {
        dates,
        salesData,
        quantityData,
        trafficData,
        userDates,
        userCounts
      },
      weeklyData: {
        dates: weeklyDates,
        sales: weeklySales,
        quantity: weeklyQuantity,
        orders: weeklyOrders
      },
      userComparison: {
        newUsers: newUsers.length,
        oldUsers: oldUsers.length
      },
      categoryData: Object.keys(categoryData).map(category => ({
        category,
        quantity: categoryData[category].quantity,
        orders: categoryData[category].orders
      })),
      topProducts,
      timeRange,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get products with sales data
app.get('/api/admin/products', requireAuth, (req, res) => {
  try {
    const mainDb = loadMainDb();
    
    // Merge product data with sales information
    const productsWithSales = mainDb.products.map(product => {
      // Find purchase history for this product
      const productPurchases = mainDb.purchaseHistory.filter(
        p => p.productId === product.productId
      );
      
      const totalRevenue = productPurchases.reduce(
        (sum, p) => sum + (p.price * p.quantity), 0
      );
      
      return {
        ...product,
        totalRevenue,
        orderCount: productPurchases.length
      };
    });
    
    res.json({ products: productsWithSales });
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get users
app.get('/api/admin/users', requireAuth, (req, res) => {
  try {
    const mainDb = loadMainDb();
    res.json({ users: mainDb.users });
  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get purchase history
app.get('/api/admin/purchases', requireAuth, (req, res) => {
  try {
    const mainDb = loadMainDb();
    res.json({ purchases: mainDb.purchaseHistory });
  } catch (error) {
    console.error('Purchases error:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// Clean up expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(token);
    }
  }
}, 5 * 60 * 1000);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Admin API server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
});