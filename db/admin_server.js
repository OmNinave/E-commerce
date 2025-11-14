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
    'https://ecom-update-dzhp.onrender.com',
    'https://ecommerceadminweb.netlify.app',
    process.env.FRONTEND_URL
  ].filter(Boolean);
  
  const origin = req.headers.origin;
  // Allow all origins in development, or specific ones in production
  if (process.env.NODE_ENV === 'production') {
    if (allowedOrigins.includes(origin) || !origin) {
      res.header('Access-Control-Allow-Origin', origin || '*');
    }
  } else {
    // Development: allow all origins
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

// Load databases - Single source of truth: unified_database.json
const adminDbPath = path.join(__dirname, 'admin_database.json');
const unifiedDbPath = path.join(__dirname, 'unified_database.json');

function loadAdminDb() {
  return JSON.parse(fs.readFileSync(adminDbPath, 'utf8'));
}

function loadUnifiedDb() {
  try {
    return JSON.parse(fs.readFileSync(unifiedDbPath, 'utf8'));
  } catch (error) {
    console.error('❌ Unified database not found! Please run: node db/generate_unified_db.js');
    throw new Error('Database file not found');
  }
}

function saveUnifiedDb(data) {
  fs.writeFileSync(unifiedDbPath, JSON.stringify(data, null, 2));
}

function loadMainDb() {
  return loadUnifiedDb(); // Use unified database
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

// ========== PUBLIC API ENDPOINTS ==========

// Get all products (public endpoint for frontend)
app.get('/api/products', (req, res) => {
  try {
    const db = loadUnifiedDb();
    res.json({ 
      success: true,
      products: db.products || [],
      total: (db.products || []).length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product by ID (public endpoint)
app.get('/api/products/:id', (req, res) => {
  try {
    const db = loadUnifiedDb();
    const product = (db.products || []).find(p => p.id === req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// ========== USER AUTHENTICATION ENDPOINTS ==========

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const db = loadUnifiedDb();
    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if user already exists
    const existingUser = (db.users || []).find(u => u.email === normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'An account already exists with this email' });
    }
    
    // Hash password (simple hash for demo - use bcrypt in production)
    const crypto = require('crypto');
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    // Create new user
    const now = new Date();
    const newUser = {
      id: `user${String((db.users || []).length + 1).padStart(3, '0')}`,
      name: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword, // In production, use bcrypt
      registrationDate: now.toISOString().split('T')[0],
      accountCreatedDate: now.toISOString().split('T')[0],
      isNewUser: true,
      lastLoginDate: now.toISOString().split('T')[0]
    };
    
    // Add user to database
    if (!db.users) db.users = [];
    db.users.push(newUser);
    saveUnifiedDb(db);
    
    // Return user without password
    const { password: _, ...userResponse } = newUser;
    
    res.status(201).json({
      success: true,
      user: userResponse,
      message: 'Account created successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const db = loadUnifiedDb();
    const normalizedEmail = email.trim().toLowerCase();
    
    // Hash password to compare
    const crypto = require('crypto');
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    // Find user
    const user = (db.users || []).find(u => u.email === normalizedEmail);
    if (!user || user.password !== hashedPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Update last login
    const now = new Date();
    user.lastLoginDate = now.toISOString().split('T')[0];
    saveUnifiedDb(db);
    
    // Return user without password
    const { password: _, ...userResponse } = user;
    
    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Create Order (from cart)
app.post('/api/orders', (req, res) => {
  try {
    const { userId, items, totalAmount } = req.body;
    
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'User ID and items are required' });
    }
    
    const db = loadUnifiedDb();
    
    // Verify user exists
    const user = (db.users || []).find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate order ID
    const orderId = `ORD${String((db.orders || []).length + 1).padStart(6, '0')}`;
    const now = new Date();
    const orderDate = now.toISOString().split('T')[0];
    
    // Determine order status (start as pending, can be updated by admin)
    const orderStatus = 'pending'; // New orders start as pending
    
    // Create order with enhanced fields
    const order = {
      orderId: orderId,
      userId: userId,
      userName: user.name,
      userEmail: user.email,
      orderDate: orderDate,
      status: orderStatus, // pending -> processing -> shipped -> completed
      totalAmount: totalAmount || items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      shippingInfo: null, // Will be added when order is shipped
      items: items.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      }))
    };
    
    // Add order to database
    if (!db.orders) db.orders = [];
    db.orders.push(order);
    
    // Add to purchase history and update product/user data
    if (!db.purchaseHistory) db.purchaseHistory = [];
    
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const purchaseDateObj = new Date(orderDate);
    
    items.forEach(item => {
      // Add to purchase history
      db.purchaseHistory.push({
        orderId: orderId,
        userId: userId,
        productId: item.id,
        productName: item.name,
        purchaseDate: orderDate,
        quantity: item.quantity,
        price: item.price
      });
      
      // Update product: sales, stock, and history
      const product = (db.products || []).find(p => p.id === item.id || p.productId === item.id);
      if (product) {
        // Update totals
        product.totalSold = (product.totalSold || 0) + item.quantity;
        
        // Update stock
        if (product.currentQuantity !== undefined) {
          product.currentQuantity = Math.max(0, product.currentQuantity - item.quantity);
        }
        
        // Add individual unit sales to salesHistory (last 2 months only)
        if (purchaseDateObj >= twoMonthsAgo) {
          if (!product.salesHistory) product.salesHistory = [];
          for (let u = 0; u < item.quantity; u++) {
            product.salesHistory.push({
              unitSaleDate: orderDate,
              orderId: orderId,
              userId: userId,
              price: item.price
            });
          }
        }
        
        // Add to in-process orders if status is processing/pending
        if (order.status === 'processing' || order.status === 'pending') {
          if (!product.inProcessOrders) product.inProcessOrders = [];
          product.inProcessOrders.push({
            orderId: orderId,
            userId: userId,
            quantity: item.quantity,
            orderDate: orderDate
          });
        }
      }
      
      // Update user purchase history
      if (!user.purchaseHistory) user.purchaseHistory = [];
      user.purchaseHistory.push({
        orderId: orderId,
        productId: item.id,
        productName: item.name,
        purchaseDate: orderDate,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      });
      user.totalSpent = (user.totalSpent || 0) + (item.price * item.quantity);
      user.totalOrders = (user.totalOrders || 0) + 1;
    });
    
    // Save database
    saveUnifiedDb(db);
    
    res.status(201).json({
      success: true,
      order: order,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// ========== ADMIN API ENDPOINTS ==========

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
    
    // Calculate summary statistics with actual prices
    const totalSales = filteredPurchases.reduce((sum, p) => sum + (p.price * p.quantity), 0);
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
        dailyData[dayKey] = { quantity: 0, sales: 0, users: new Set(), dayName: dayNames[day.getDay()] };
      }
      
      // Aggregate purchases by day
      filteredPurchases.forEach(purchase => {
        const dayKey = purchase.purchaseDate;
        if (dailyData[dayKey]) {
          dailyData[dayKey].quantity += purchase.quantity;
          dailyData[dayKey].sales += purchase.price * purchase.quantity;
          dailyData[dayKey].users.add(purchase.userId);
        }
      });
      
      // Convert to arrays
      Object.keys(dailyData).sort().forEach(dayKey => {
        dates.push(dailyData[dayKey].dayName);
        quantityData.push(dailyData[dayKey].quantity);
        salesData.push(dailyData[dayKey].sales);
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
          weeklyData[weekKey] = { quantity: 0, sales: 0, users: new Set() };
        }
        weeklyData[weekKey].quantity += purchase.quantity;
        weeklyData[weekKey].sales += purchase.price * purchase.quantity;
        weeklyData[weekKey].users.add(purchase.userId);
      });
      
      // Convert to arrays with week labels
      const weeks = Object.keys(weeklyData).sort();
      weeks.forEach((weekKey, index) => {
        const weekDate = new Date(weekKey);
        dates.push(`Week ${index + 1}`);
        quantityData.push(weeklyData[weekKey].quantity);
        salesData.push(weeklyData[weekKey].sales);
        trafficData.push(weeklyData[weekKey].users.size);
      });
      
    } else if (timeRange === 'year') {
      // Show all 12 months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyData = {};
      
      // Initialize all 12 months
      for (let i = 0; i < 12; i++) {
        monthlyData[i] = { quantity: 0, sales: 0, users: new Set(), monthName: monthNames[i] };
      }
      
      // Aggregate purchases by month
      filteredPurchases.forEach(purchase => {
        const pDate = new Date(purchase.purchaseDate);
        const monthIndex = pDate.getMonth();
        monthlyData[monthIndex].quantity += purchase.quantity;
        monthlyData[monthIndex].sales += purchase.price * purchase.quantity;
        monthlyData[monthIndex].users.add(purchase.userId);
      });
      
      // Convert to arrays
      for (let i = 0; i < 12; i++) {
        dates.push(monthlyData[i].monthName);
        quantityData.push(monthlyData[i].quantity);
        salesData.push(monthlyData[i].sales);
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
      weeklyData[weekKey].sales += purchase.price * purchase.quantity;
      weeklyData[weekKey].orders += 1;
    });
    
    const weeklyDates = Object.keys(weeklyData).sort();
    const weeklySales = weeklyDates.map(date => weeklyData[date].sales);
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
      const productId = purchase.productId;
      if (!productSales[productId]) {
        // Find product to get name
        const product = mainDb.products.find(p => 
          p.id === productId || p.productId === productId
        );
        productSales[productId] = {
          productId: productId,
          id: productId,
          productName: purchase.productName || product?.name || 'Unknown Product',
          name: product?.name || purchase.productName || 'Unknown Product',
          quantitySold: 0,
          revenue: 0
        };
      }
      productSales[productId].quantitySold += purchase.quantity;
      productSales[productId].revenue += purchase.price * purchase.quantity;
    });
    
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10);
    
    // Category-wise sales
    const categoryData = {};
    filteredPurchases.forEach(purchase => {
      // Match by both id and productId
      const product = mainDb.products.find(p => 
        p.id === purchase.productId || p.productId === purchase.productId
      );
      if (product) {
        const category = product.category || 'Other';
        if (!categoryData[category]) {
          categoryData[category] = { quantity: 0, orders: 0 };
        }
        categoryData[category].quantity += purchase.quantity;
        categoryData[category].orders += 1;
      }
    });
    
    // Get orders for the selected time range with status breakdown
    const filteredOrders = (mainDb.orders || []).filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= startDate && orderDate <= endDate;
    }).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)).slice(0, 100); // Limit to 100 most recent
    
    // Categorize orders by status
    const ordersByStatus = {
      pending: filteredOrders.filter(o => o.status === 'pending'),
      processing: filteredOrders.filter(o => o.status === 'processing'),
      shipped: filteredOrders.filter(o => o.status === 'shipped'),
      completed: filteredOrders.filter(o => o.status === 'completed')
    };
    
    const totalPending = ordersByStatus.pending.length;
    const totalProcessing = ordersByStatus.processing.length;
    const totalShipped = ordersByStatus.shipped.length;
    const totalCompleted = ordersByStatus.completed.length;

    res.json({
      summary: {
        totalSales: totalSales,
        totalQuantitySold,
        totalUserTraffic: uniqueUsers,
        totalOrders: filteredOrders.length,
        ordersByStatus: {
          pending: totalPending,
          processing: totalProcessing,
          shipped: totalShipped,
          completed: totalCompleted
        },
        newUsers: newUsers.length,
        oldUsers: oldUsers.length,
        newUsersInPeriod: newUsersInPeriod.length,
        averageOrderValue: filteredOrders.length > 0 ? totalSales / filteredOrders.length : 0
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
      orders: filteredOrders, // Add orders array for orders view
      ordersByStatus: ordersByStatus, // Orders categorized by status
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

// Get products with sales data (admin endpoint - returns all product details)
app.get('/api/admin/products', requireAuth, (req, res) => {
  try {
    const mainDb = loadMainDb();
    
    // Merge product data with sales information
    // Include ALL product fields (overview, features, specifications, etc.)
    const productsWithSales = (mainDb.products || []).map(product => {
      // Find purchase history for this product (match by id or productId)
      const productPurchases = (mainDb.purchaseHistory || []).filter(
        p => p.productId === product.id || p.productId === product.productId
      );
      
      const totalRevenue = productPurchases.reduce(
        (sum, p) => sum + (p.price * p.quantity), 0
      );
      
      // Get in-process orders count
      const inProcessCount = (product.inProcessOrders || []).length;
      
      // Return complete product data with sales info
      return {
        ...product, // Include all fields: overview, features, specifications, applications, etc.
        productId: product.productId || product.id, // Ensure productId exists
        totalRevenue,
        orderCount: productPurchases.length,
        inProcessOrdersCount: inProcessCount,
        // Enhanced analytics fields
        salesHistory: product.salesHistory || [], // Individual unit sales (last 2 months)
        restockHistory: product.restockHistory || [], // Restock dates and quantities
        inProcessOrders: product.inProcessOrders || [], // Currently processing orders
        // Ensure all detail fields are included
        overview: product.overview || '',
        features: product.features || [],
        specifications: product.specifications || {},
        applications: product.applications || [],
        operation: product.operation || '',
        advantages: product.advantages || [],
        considerations: product.considerations || [],
        compliance: product.compliance || '',
        commitment: product.commitment || ''
      };
    });
    
    console.log(`📦 Admin Products: Returning ${productsWithSales.length} products with full details`);
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

// Get products sales analytics with date range
app.get('/api/admin/analytics/products', requireAuth, (req, res) => {
  try {
    const mainDb = loadMainDb();
    const { startDate, endDate, timeRange = 'month' } = req.query;
    
    let start, end;
    
    if (startDate && endDate) {
      // Custom date range
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      // Default to timeRange
      const now = new Date();
      if (timeRange === 'week') {
        const currentDay = now.getDay();
        start = new Date(now);
        start.setDate(now.getDate() - currentDay);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
      } else if (timeRange === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      } else if (timeRange === 'year') {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      }
    }
    
    // Filter purchases by date range
    const filteredPurchases = (mainDb.purchaseHistory || []).filter(p => {
      const purchaseDate = new Date(p.purchaseDate);
      return purchaseDate >= start && purchaseDate <= end;
    });
    
    // Group by date for chart
    const salesByDate = {};
    filteredPurchases.forEach(purchase => {
      const date = new Date(purchase.purchaseDate).toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = { date, quantity: 0, revenue: 0, orders: 0 };
      }
      salesByDate[date].quantity += purchase.quantity;
      salesByDate[date].revenue += purchase.price * purchase.quantity;
      salesByDate[date].orders += 1;
    });
    
    const chartData = Object.keys(salesByDate).sort().map(date => salesByDate[date]);
    
    // Group by product
    const productSales = {};
    filteredPurchases.forEach(purchase => {
      const productId = purchase.productId;
      if (!productSales[productId]) {
        const product = mainDb.products.find(p => p.id === productId || p.productId === productId);
        productSales[productId] = {
          productId,
          name: product?.name || purchase.productName || 'Unknown',
          quantity: 0,
          revenue: 0,
          orders: 0
        };
      }
      productSales[productId].quantity += purchase.quantity;
      productSales[productId].revenue += purchase.price * purchase.quantity;
      productSales[productId].orders += 1;
    });
    
    res.json({
      chartData,
      productSales: Object.values(productSales),
      summary: {
        totalQuantity: filteredPurchases.reduce((sum, p) => sum + p.quantity, 0),
        totalRevenue: filteredPurchases.reduce((sum, p) => sum + (p.price * p.quantity), 0),
        totalOrders: new Set(filteredPurchases.map(p => p.orderId || p.purchaseDate)).size
      },
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Products analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch products analytics' });
  }
});

// Get user registrations analytics with date range
app.get('/api/admin/analytics/users', requireAuth, (req, res) => {
  try {
    const mainDb = loadMainDb();
    const { startDate, endDate, timeRange = 'month' } = req.query;
    
    let start, end;
    
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      const now = new Date();
      if (timeRange === 'week') {
        const currentDay = now.getDay();
        start = new Date(now);
        start.setDate(now.getDate() - currentDay);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
      } else if (timeRange === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      } else if (timeRange === 'year') {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      }
    }
    
    // Filter users by registration date
    const filteredUsers = (mainDb.users || []).filter(user => {
      const regDate = new Date(user.registrationDate || user.accountCreatedDate);
      return regDate >= start && regDate <= end;
    });
    
    // Group by date for chart
    const registrationsByDate = {};
    filteredUsers.forEach(user => {
      const date = new Date(user.registrationDate || user.accountCreatedDate).toISOString().split('T')[0];
      registrationsByDate[date] = (registrationsByDate[date] || 0) + 1;
    });
    
    const chartData = Object.keys(registrationsByDate).sort().map(date => ({
      date,
      registrations: registrationsByDate[date]
    }));
    
    res.json({
      chartData,
      summary: {
        totalUsers: filteredUsers.length,
        newUsers: filteredUsers.filter(u => u.isNewUser).length
      },
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Users analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch users analytics' });
  }
});

// Get orders analytics with date range
app.get('/api/admin/analytics/orders', requireAuth, (req, res) => {
  try {
    const mainDb = loadMainDb();
    const { startDate, endDate, timeRange = 'month' } = req.query;
    
    let start, end;
    
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      const now = new Date();
      if (timeRange === 'week') {
        const currentDay = now.getDay();
        start = new Date(now);
        start.setDate(now.getDate() - currentDay);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
      } else if (timeRange === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      } else if (timeRange === 'year') {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      }
    }
    
    // Get orders from purchase history grouped by orderId or date
    const ordersMap = {};
    (mainDb.purchaseHistory || []).forEach(purchase => {
      const orderDate = new Date(purchase.purchaseDate);
      if (orderDate >= start && orderDate <= end) {
        const orderId = purchase.orderId || purchase.purchaseDate;
        if (!ordersMap[orderId]) {
          ordersMap[orderId] = {
            orderId,
            date: purchase.purchaseDate,
            items: [],
            totalAmount: 0,
            userId: purchase.userId,
            userName: purchase.userName || 'Unknown'
          };
        }
        ordersMap[orderId].items.push(purchase);
        ordersMap[orderId].totalAmount += purchase.price * purchase.quantity;
      }
    });
    
    const orders = Object.values(ordersMap);
    
    // Group by date for chart
    const ordersByDate = {};
    orders.forEach(order => {
      const date = new Date(order.date).toISOString().split('T')[0];
      if (!ordersByDate[date]) {
        ordersByDate[date] = { date, count: 0, revenue: 0 };
      }
      ordersByDate[date].count += 1;
      ordersByDate[date].revenue += order.totalAmount;
    });
    
    const chartData = Object.keys(ordersByDate).sort().map(date => ordersByDate[date]);
    
    res.json({
      chartData,
      orders: orders.sort((a, b) => new Date(b.date) - new Date(a.date)),
      summary: {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
        averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length : 0
      },
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Orders analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch orders analytics' });
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