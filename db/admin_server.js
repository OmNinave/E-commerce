const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables
const { rateLimit, initializeRateLimitCleanup } = require('../middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development_only';
const JWT_EXPIRES_IN = '24h'; // 24 hours

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
}));

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// HTTP request logging (combined format). Install `morgan` in dependencies.
app.use(morgan('combined'));

// Rate limiting middleware for auth endpoints
app.use(rateLimit.middleware());

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
  // Allow only configured origins in production; development allows all for convenience
  if (process.env.NODE_ENV === 'production') {
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    // If origin is not allowed, do not set Access-Control-Allow-Origin header
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

// Health check endpoint - useful for uptime monitoring and load balancers
app.get('/health', (req, res) => {
  try {
    // Basic checks: file system and JSON DB readability
    const db = loadUnifiedDb();
    const admin = loadAdminDb();
    res.json({ status: 'ok', users: (db.users || []).length, products: (db.products || []).length, admins: (admin.admin_users || []).length });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Load databases - Single source of truth: unified_database.json
const adminDbPath = path.join(__dirname, 'admin_database.json');
const unifiedDbPath = path.join(__dirname, 'unified_database.json');

function loadAdminDb() {
  try {
    return JSON.parse(fs.readFileSync(adminDbPath, 'utf8'));
  } catch (err) {
    console.warn('⚠️ admin_database.json not found or unreadable - creating default admin DB');
    const defaultAdminDb = { admin_users: [] };
    try {
      fs.writeFileSync(adminDbPath, JSON.stringify(defaultAdminDb, null, 2));
    } catch (writeErr) {
      console.error('Failed to create default admin database file:', writeErr);
    }
    return defaultAdminDb;
  }
}

function loadUnifiedDb() {
  try {
    const data = fs.readFileSync(unifiedDbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn('⚠️ unified_database.json not found - creating default unified DB');
      const defaultUnifiedDb = {
        products: [],
        users: [],
        orders: [],
        purchaseHistory: []
      };
      try {
        fs.writeFileSync(unifiedDbPath, JSON.stringify(defaultUnifiedDb, null, 2));
        console.log('✓ Created default unified_database.json');
        return defaultUnifiedDb;
      } catch (writeErr) {
        console.error('Failed to create default unified database file:', writeErr);
        throw new Error('Database file not found and could not be created');
      }
    } else {
      console.error('❌ Failed to read unified_database.json:', error.message);
      throw new Error('Database file could not be read: ' + error.message);
    }
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

// Clean up expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(token);
    }
  }
}, 5 * 60 * 1000);

// JWT Helper Functions
function generateJWT(adminId) {
  const payload = { adminId, iat: Math.floor(Date.now() / 1000) };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyJWT(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, adminId: decoded.adminId };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function createSession(adminId) {
  const token = generateSessionToken();
  const expiresAt = Date.now() + SESSION_TIMEOUT;
  sessions.set(token, { adminId, expiresAt });
  return { sessionToken: token, jwtToken: generateJWT(adminId) };
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

// Middleware to verify session (supports both legacy sessions and JWT)
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: No authorization header' });
  }
  
  // Check if it's a Bearer token (JWT) or legacy token
  if (authHeader.startsWith('Bearer ')) {
    // JWT token
    const token = authHeader.substring(7); // Remove 'Bearer '
    const result = verifyJWT(token);
    
    if (!result.valid) {
      return res.status(401).json({ error: 'Unauthorized: Invalid JWT token' });
    }
    
    req.adminId = result.adminId;
    next();
  } else {
    // Legacy session token
    const session = validateSession(authHeader);
    if (!session) {
      return res.status(401).json({ error: 'Session expired' });
    }
    
    req.adminId = session.adminId;
    next();
  }
}

// Middleware to verify admin role
function requireAdminRole(req, res, next) {
  try {
    const adminDb = loadAdminDb();
    const admin = adminDb.admin_users.find(u => u.admin_id === req.adminId);
    
    if (!admin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    // Optionally check role field if it exists
    if (admin.role && admin.role !== 'admin' && admin.role !== 'superadmin') {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin role verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
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
    
    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const now = new Date();
    const newUser = {
      id: `user${String((db.users || []).length + 1).padStart(3, '0')}`,
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
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
    
    // Find user
    const user = (db.users || []).find(u => u.email === normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password using bcrypt. Support legacy SHA256 hashes by falling
    // back to SHA256 and re-hashing to bcrypt on successful match.
    let passwordMatches = false;
    try {
      passwordMatches = await bcrypt.compare(password, user.password);
    } catch (e) {
      passwordMatches = false;
    }

    if (!passwordMatches) {
      // Legacy SHA256 fallback
      const crypto = require('crypto');
      const legacyHash = crypto.createHash('sha256').update(password).digest('hex');
      if (user.password === legacyHash) {
        // Re-hash with bcrypt and save
        try {
          const newHash = await bcrypt.hash(password, 10);
          user.password = newHash;
          saveUnifiedDb(db);
          passwordMatches = true;
        } catch (e) {
          // If rehash/save fails, still allow login for legacy match
          passwordMatches = true;
        }
      }
    }

    if (!passwordMatches) {
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

    // Validate items against product catalog and stock, and compute authoritative totals
    let computedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item || !item.id || !item.quantity) {
        return res.status(400).json({ error: 'Each item must include id and quantity' });
      }

      const product = (db.products || []).find(p => p.id === item.id || p.productId === item.id);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.id}` });
      }

      // Determine authoritative price from product record
      const productPrice = Number(product.price ?? product.currentPrice ?? item.price ?? 0);
      if (isNaN(productPrice) || productPrice <= 0) {
        return res.status(400).json({ error: `Invalid price for product ${product.id}` });
      }

      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty <= 0) {
        return res.status(400).json({ error: `Invalid quantity for product ${product.id}` });
      }

      // Stock check - ensure currentQuantity field exists and is valid
      const currentStock = product.currentQuantity !== undefined && product.currentQuantity !== null 
        ? Number(product.currentQuantity) 
        : 0;
      
      if (isNaN(currentStock) || currentStock < 0) {
        return res.status(500).json({ error: `Invalid stock data for product ${product.id}` });
      }
      
      if (currentStock < qty) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${currentStock}, Requested: ${qty}` 
        });
      }

      const subtotal = Math.round((productPrice * qty) * 100) / 100;
      computedTotal += subtotal;

      validatedItems.push({
        productId: product.productId || product.id,
        productName: product.name || item.name || product.productName || 'Unknown Product',
        quantity: qty,
        price: productPrice,
        subtotal
      });
    }

    // Round computed total to 2 decimals
    computedTotal = Math.round(computedTotal * 100) / 100;

    // If client supplied a totalAmount, ensure it matches authoritative computedTotal (allow tiny rounding differences)
    if (totalAmount !== undefined && totalAmount !== null) {
      const supplied = Math.round(Number(totalAmount) * 100) / 100;
      if (isNaN(supplied) || Math.abs(supplied - computedTotal) > 0.5) {
        return res.status(400).json({ error: 'Total amount mismatch. Please refresh your cart.' });
      }
    }

    // Generate order ID
    const orderId = `ORD${String((db.orders || []).length + 1).padStart(6, '0')}`;
    const now = new Date();
    const orderDate = now.toISOString().split('T')[0];

    // Determine order status (start as pending, can be updated by admin)
    const orderStatus = 'pending'; // New orders start as pending

    // Create order with authoritative totals
    const order = {
      orderId: orderId,
      userId: userId,
      userName: user.fullName || user.name || user.email || 'Customer',
      userEmail: user.email,
      orderDate: orderDate,
      status: orderStatus, // pending -> processing -> shipped -> completed
      totalAmount: computedTotal,
      shippingInfo: null, // Will be added when order is shipped
      items: validatedItems
    };
    
    // Add order to database
    if (!db.orders) db.orders = [];
    db.orders.push(order);
    
    // Add to purchase history and update product/user data
    if (!db.purchaseHistory) db.purchaseHistory = [];
    
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const purchaseDateObj = new Date(orderDate);
    
    validatedItems.forEach(item => {
      // Add to purchase history
      db.purchaseHistory.push({
        orderId: orderId,
        userId: userId,
        productId: item.productId,
        productName: item.productName,
        purchaseDate: orderDate,
        quantity: item.quantity,
        price: item.price
      });
      
      // Update product: sales, stock, and history
      const product = (db.products || []).find(p => p.id === item.productId || p.productId === item.productId);
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
        productId: item.productId,
        productName: item.productName,
        purchaseDate: orderDate,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      });
      user.totalSpent = (user.totalSpent || 0) + item.subtotal;
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
    
    // Validate admin password. Prefer bcrypt stored hash. If not present,
    // allow a configured environment admin password as a temporary fallback.
    let isValidPassword = false;
    try {
      // admin.password_hash or admin.password may be present depending on legacy data
      const stored = admin.password_hash || admin.password;
      if (stored) {
        isValidPassword = await bcrypt.compare(password, stored);
      }
    } catch (e) {
      isValidPassword = false;
    }

    // Fallback to environment variable (temporary).
    // Only allow this in development to avoid accidental backdoors in production.
    if (!isValidPassword && process.env.ADMIN_PASSWORD && process.env.NODE_ENV === 'development' && password === process.env.ADMIN_PASSWORD) {
      console.warn('⚠️ Admin login using environment fallback password (development only)');
      isValidPassword = true;
    } else if (!isValidPassword && process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
      // Attempted use of ADMIN_PASSWORD in non-development environment — reject for security.
      console.warn('⚠️ ADMIN_PASSWORD was provided but will not be accepted in non-development environments');
    }

    if (!isValidPassword) {
      // Legacy plaintext or SHA256 check as a last resort: try SHA256 compare
      try {
        const crypto = require('crypto');
        const legacyHash = crypto.createHash('sha256').update(password).digest('hex');
        if (admin.password === legacyHash || admin.password === password) {
          // Re-hash admin password and store in admin DB
          try {
            const newHash = await bcrypt.hash(password, 10);
            admin.password_hash = newHash;
            // Remove legacy plain password if present
            delete admin.password;
            saveAdminDb(adminDb);
            isValidPassword = true;
          } catch (e) {
            isValidPassword = true; // allow login despite rehash failure
          }
        }
      } catch (e) {
        // ignore
      }
    }

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const tokens = createSession(admin.admin_id);
    
    res.json({
      success: true,
      token: tokens.sessionToken, // For backward compatibility
      jwtToken: tokens.jwtToken,   // New JWT token
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
  const authHeader = req.headers.authorization;
  
  if (authHeader && !authHeader.startsWith('Bearer ')) {
    // Legacy session token
    sessions.delete(authHeader);
  }
  // For JWT, we don't need to do anything as it's stateless
  // In a production system, you might want to maintain a blacklist
  
  res.json({ success: true });
});

// Verify session
app.get('/api/admin/verify', requireAuth, (req, res) => {
  const adminDb = loadAdminDb();
  const admin = adminDb.admin_users.find(u => u.admin_id === req.adminId);
  
  if (!admin) {
    return res.status(404).json({ error: 'Admin not found' });
  }
  
  // Generate new JWT for continued use
  const newJwtToken = generateJWT(req.adminId);
  
  res.json({
    valid: true,
    admin: {
      admin_id: admin.admin_id,
      email: admin.email,
      full_name: admin.full_name
    },
    jwtToken: newJwtToken // Provide fresh JWT
  });
});

// Get dashboard analytics with time filtering
app.get('/api/admin/analytics', requireAuth, (req, res) => {
  try {
    const mainDb = loadMainDb();
    const { timeRange = 'month', year, month, week } = req.query;
    
    // Use provided year/month/week or default to current
    const now = new Date();
    const selectedYear = year ? parseInt(year, 10) : now.getFullYear();
    const selectedMonth = month ? parseInt(month, 10) : now.getMonth() + 1;
    const selectedWeek = week ? parseInt(week, 10) : Math.floor((now.getDate() - 1) / 7) + 1;
    
    // Calculate date range based on filter
    let startDate = new Date();
    let endDate = new Date();
    
    if (timeRange === 'week') {
      // Calculate specific week in specific month
      const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
      const dayOfWeekOffset = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const firstSundayOffset = (7 - dayOfWeekOffset) % 7;
      
      // Start of the selected week
      const weekStartDate = selectedWeek === 1 
        ? firstDayOfMonth
        : new Date(selectedYear, selectedMonth - 1, 1 + firstSundayOffset + (selectedWeek - 2) * 7);
      
      startDate = new Date(weekStartDate);
      startDate.setHours(0, 0, 0, 0);
      
      // End of week (Saturday)
      endDate = new Date(weekStartDate);
      endDate.setDate(weekStartDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (timeRange === 'month') {
      // Specific month in specific year
      startDate = new Date(selectedYear, selectedMonth - 1, 1);
      endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);
    } else if (timeRange === 'year') {
      // Specific year
      startDate = new Date(selectedYear, 0, 1);
      endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
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
        const dayKey = new Date(purchase.purchaseDate).toISOString().split('T')[0];
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
app.get('/api/admin/users', requireAuth, requireAdminRole, (req, res) => {
  try {
    const mainDb = loadMainDb();
    res.json({ users: mainDb.users });
  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get purchase history
app.get('/api/admin/purchases', requireAuth, requireAdminRole, (req, res) => {
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
    
    // Group by date for chart based on timeRange
    let chartData = [];
    
    if (timeRange === 'week') {
      // Show 7 days (Sunday to Saturday)
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dailyData = {};
      
      // Initialize all 7 days
      for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        const dayKey = day.toISOString().split('T')[0];
        dailyData[dayKey] = { date: dayKey, count: 0, revenue: 0, dayName: dayNames[day.getDay()] };
      }
      
      // Aggregate orders by day
      orders.forEach(order => {
        const orderDate = new Date(order.date).toISOString().split('T')[0];
        if (dailyData[orderDate]) {
          dailyData[orderDate].count += 1;
          dailyData[orderDate].revenue += order.totalAmount;
        }
      });
      
      // Convert to array with day names
      chartData = Object.keys(dailyData).sort().map(dayKey => ({
        date: dailyData[dayKey].dayName,
        count: dailyData[dayKey].count,
        revenue: dailyData[dayKey].revenue
      }));
      
    } else if (timeRange === 'month') {
      // Show weeks in the month
      const weeklyData = {};
      
      orders.forEach(order => {
        const orderDate = new Date(order.date);
        const weekStart = new Date(orderDate);
        weekStart.setDate(orderDate.getDate() - orderDate.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { date: weekKey, count: 0, revenue: 0, weekIndex: 0 };
        }
        weeklyData[weekKey].count += 1;
        weeklyData[weekKey].revenue += order.totalAmount;
      });
      
      // Convert to arrays with week labels
      const weeks = Object.keys(weeklyData).sort();
      chartData = weeks.map((weekKey, index) => ({
        date: `Week ${index + 1}`,
        count: weeklyData[weekKey].count,
        revenue: weeklyData[weekKey].revenue
      }));
      
    } else if (timeRange === 'year') {
      // Show all 12 months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyData = {};
      
      // Initialize all 12 months
      for (let i = 0; i < 12; i++) {
        monthlyData[i] = { date: monthNames[i], count: 0, revenue: 0 };
      }
      
      // Aggregate orders by month
      orders.forEach(order => {
        const orderDate = new Date(order.date);
        const monthIndex = orderDate.getMonth();
        monthlyData[monthIndex].count += 1;
        monthlyData[monthIndex].revenue += order.totalAmount;
      });
      
      // Convert to array
      chartData = Object.values(monthlyData);
    } else {
      // Default: group by date
      const ordersByDate = {};
      orders.forEach(order => {
        const date = new Date(order.date).toISOString().split('T')[0];
        if (!ordersByDate[date]) {
          ordersByDate[date] = { date, count: 0, revenue: 0 };
        }
        ordersByDate[date].count += 1;
        ordersByDate[date].revenue += order.totalAmount;
      });
      
      chartData = Object.keys(ordersByDate).sort().map(date => ordersByDate[date]);
    }
    
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
      },
      timeRange: timeRange
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

// Initialize rate limit cleanup (runs every 30 minutes)
initializeRateLimitCleanup();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Admin API server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
});