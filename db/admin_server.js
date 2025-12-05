const express = require('express');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
require('dotenv').config();
const { migrateToProfessionalWorkflow } = require('./migration_professional_workflow');
const { migrateDatabase } = require('../migrate_to_postgres');
const { sendTransactionalEmail, sendOrderStatusEmail, sendOrderEmails } = require('./emailService');

// Import SQLite Database API
const dbAPI = require('./api');
const { db, usePostgres } = require('./database');

// Import Validation Middleware
const {
  validateRegistration,
  validateLogin,
  validateProduct,
  validateOrder,
  validateCart,
  validateProfileUpdate,
  validatePasswordChange,
  validateReview
} = require('./middleware/validation');


const app = express();
// Use fixed port for consistency
const PORT = 5000;
console.log('Using port:', PORT);




// Migration logic moved to startServer()

async function ensureUserProfileColumns() {
  try {
    let columnNames = [];

    if (usePostgres) {
      // PostgreSQL
      const result = await db.prepare("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'").all();
      columnNames = result.map(row => row.column_name);
    } else {
      // SQLite
      const columns = await db.prepare("PRAGMA table_info('users')").all();
      columnNames = columns.map((col) => col.name);
    }

    if (!columnNames.includes('company')) {
      const sql = 'ALTER TABLE users ADD COLUMN company TEXT';
      usePostgres ? await db.prepare(sql).run() : await db.prepare(sql).run();
    }
    if (!columnNames.includes('bio')) {
      const sql = 'ALTER TABLE users ADD COLUMN bio TEXT';
      usePostgres ? await db.prepare(sql).run() : await db.prepare(sql).run();
    }

    // Ensure products table has is_featured
    let productColumns = [];
    if (usePostgres) {
      const result = await db.prepare("SELECT column_name FROM information_schema.columns WHERE table_name = 'products'").all();
      productColumns = result.map(row => row.column_name);
    } else {
      const columns = await db.prepare("PRAGMA table_info('products')").all();
      productColumns = columns.map((col) => col.name);
    }

    if (!productColumns.includes('is_featured')) {
      console.log('🔄 Adding is_featured to products table...');
      const sql = usePostgres
        ? 'ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE'
        : 'ALTER TABLE products ADD COLUMN is_featured INTEGER DEFAULT 0';
      await db.prepare(sql).run();
      console.log('✅ Added is_featured column');
    }
  } catch (error) {
    console.error('Failed to ensure user profile columns:', error);
  }
}

// ensureUserProfileColumns called in startServer()

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const JWT_EXPIRES_IN = '24h';

// ==================== MIDDLEWARE ====================

const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { error: 'Too many login attempts, please try again after 15 minutes' }
});

// CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:5173', // Vite default
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing (required for CSRF)
app.use(cookieParser());

// CSRF Protection
const csrfProtection = csrf({ cookie: true });

// Logging
app.use(morgan('combined'));

// ==================== AUTH HELPERS ====================

function generateJWT(userId, isAdmin = false) {
  return jwt.sign({ userId, isAdmin }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Auth Middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  console.log('=== AUTH MIDDLEWARE DEBUG ===');
  console.log('Path:', req.method, req.path);
  console.log('Auth Header:', authHeader ? 'Present' : 'Missing');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No Bearer token');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyJWT(token);

  console.log('Token decoded:', decoded ? 'Success' : 'Failed');
  if (decoded) {
    console.log('User ID from token:', decoded.userId, 'Type:', typeof decoded.userId);
    console.log('Is Admin:', decoded.isAdmin);
  }

  if (!decoded) {
    console.log('❌ Invalid token');
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.userId = decoded.userId;
  req.isAdmin = decoded.isAdmin;
  console.log('✅ Auth successful, userId set to:', req.userId);
  next();
}

// Admin Middleware
function requireAdmin(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// ==================== DATABASE COMPATIBILITY LAYER ====================

/**
 * Load main database in JSON format (compatibility layer for analytics)
 * Converts SQLite data to JSON structure expected by analytics endpoint
 */
async function loadMainDb() {
  try {
    // Get all data from SQLite and convert to JSON format
    const products = await dbAPI.getAllProducts();
    const orders = await dbAPI.getAllOrders();
    const users = await db.prepare('SELECT * FROM users').all();

    // Get purchase history from order_items joined with orders
    const purchaseHistory = await db.prepare(`
      SELECT 
        oi.order_id as orderId,
        o.user_id as userId,
        oi.product_id as productId,
        COALESCE(oi.product_name, p.name, 'Unknown Product') as productName,
        DATE(o.created_at) as purchaseDate,
        oi.quantity,
        oi.unit_price as price
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      LEFT JOIN products p ON oi.product_id = p.id
      ORDER BY o.created_at DESC
    `).all();

    return {
      products: products || [],
      orders: orders.map(order => ({
        ...order,
        orderId: order.id,
        orderDate: order.created_at ? order.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        status: order.status || 'pending'
      })) || [],
      users: users.map(user => ({
        ...user,
        accountCreatedDate: user.created_at ? user.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        registrationDate: user.created_at ? user.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
      })) || [],
      purchaseHistory: purchaseHistory || []
    };
  } catch (error) {
    console.error('Error loading main database:', error);
    return {
      products: [],
      orders: [],
      users: [],
      purchaseHistory: []
    };
  }
}

const MAX_ITEM_QUANTITY = 25;

function sanitizeTextField(value, maxLength = 255) {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function sanitizePhoneField(value) {
  if (!value) {
    return '';
  }
  return String(value).replace(/[^0-9+]/g, '').slice(0, 20);
}

function sanitizePostalCode(value) {
  if (!value) {
    return '';
  }
  return String(value).replace(/[^0-9A-Za-z]/g, '').slice(0, 12).toUpperCase();
}

const SHIPPING_METHODS = {
  standard: {
    key: 'standard',
    label: 'Standard Shipping (3-5 days)',
    eta: 'Arrives in 3-5 business days',
    cost: 499,
    freeThreshold: 50000
  },
  express: {
    key: 'express',
    label: 'Express Shipping (1-2 days)',
    eta: 'Arrives in 1-2 business days',
    cost: 999,
    freeThreshold: 100000
  }
};

function resolveShippingMethod(method = 'standard') {
  const normalized = String(method || '').toLowerCase();
  return SHIPPING_METHODS[normalized] || SHIPPING_METHODS.standard;
}

function calculateShippingCost(methodConfig, subtotal) {
  if (subtotal >= methodConfig.freeThreshold) {
    return 0;
  }
  return methodConfig.cost;
}

const ORDER_STATUS_EMAILS = {
  shipped: {
    label: 'Shipped',
    message: 'Your package is on the way. You will receive it soon.'
  },
  delivered: {
    label: 'Delivered',
    message: 'We hope you enjoy your purchase! Let us know if you need any assistance.'
  },
  cancelled: {
    label: 'Cancelled',
    message: 'This order has been cancelled. If this was unexpected, please contact support.'
  }
};

function queueOrderStatusEmail(orderId, status) {
  const meta = ORDER_STATUS_EMAILS[status];
  if (!meta) {
    return;
  }

  setImmediate(async () => {
    try {
      const order = await dbAPI.getOrderById(orderId);
      if (!order) {
        return;
      }
      const user = await dbAPI.getUserById(order.user_id);
      if (!user?.email) {
        return;
      }

      const shippingDetails = resolveShippingMethod(order.shipping_method);
      const recipientName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

      sendOrderStatusEmail({
        to: user.email,
        name: recipientName,
        order: {
          ...order,
          shipping_details: shippingDetails
        },
        statusLabel: meta.label,
        message: meta.message
      }).catch((error) => {
        console.error('Failed to send order status email:', error);
      });
    } catch (error) {
      console.error('Error preparing status email:', error);
    }
  });
}

function normalizeCartPayloadItems(items = []) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      product_id: Number(item.product_id || item.productId || item.id),
      quantity: Number(item.quantity)
    }))
    .filter(
      (item) =>
        Number.isInteger(item.product_id) &&
        item.product_id > 0 &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0
    )
    .map((item) => ({
      product_id: item.product_id,
      quantity: Math.floor(item.quantity)
    }));
}

function calculateFinalPrice(product, discount) {
  const basePrice = Number(product?.selling_price);

  if (!Number.isFinite(basePrice) || basePrice < 0) {
    throw new Error(`Invalid price configuration for ${product?.name || 'product'}`);
  }

  let finalPrice = basePrice;

  if (discount) {
    const discountValue = Number(discount.discount_value);

    if (!Number.isFinite(discountValue)) {
      throw new Error(`Invalid discount configuration for ${product?.name || 'product'}`);
    }

    if (discount.discount_type === 'percentage') {
      finalPrice = finalPrice * (1 - discountValue / 100);
    } else {
      finalPrice = finalPrice - discountValue;
    }
  }

  return Number(Math.max(0, finalPrice).toFixed(2));
}

async function validateCartItems(items = []) {
  const sanitizedItems = [];
  const errors = [];
  let subtotal = 0;

  const normalizedItems = normalizeCartPayloadItems(items);

  for (const item of normalizedItems) {
    if (item.quantity > MAX_ITEM_QUANTITY) {
      errors.push(`Maximum ${MAX_ITEM_QUANTITY} units allowed per product. Quantity adjusted for ${item.product_id}.`);
    }

    const product = await dbAPI.getProductById(item.product_id);

    if (!product) {
      errors.push(`Product not found: ${item.product_id}`);
      continue;
    }

    const availableStock = Number.isInteger(product.stock_quantity)
      ? product.stock_quantity
      : Number(product.current_quantity || 0);

    if (availableStock <= 0) {
      errors.push(`${product.name} is out of stock`);
      continue;
    }

    if (item.quantity > availableStock) {
      errors.push(
        `${product.name} has only ${availableStock} unit(s) available`
      );
    }

    const safeQuantity = Math.min(item.quantity, availableStock, MAX_ITEM_QUANTITY);
    const discount = await dbAPI.getActiveDiscount(product.id);
    let finalPrice;

    try {
      finalPrice = calculateFinalPrice(product, discount);
    } catch (priceError) {
      errors.push(priceError.message);
      continue;
    }
    const lineTotal = Number((finalPrice * safeQuantity).toFixed(2));
    subtotal += lineTotal;

    sanitizedItems.push({
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      quantity: safeQuantity,
      available_stock: availableStock,
      unit_price: finalPrice,
      base_price: product.base_price,
      discount,
      line_total: lineTotal,
      image: product.primary_image
    });
  }

  return {
    sanitizedItems,
    subtotal: Number(subtotal.toFixed(2)),
    errors
  };
}

function createOrderNumber() {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

async function createOrUpdateAddress(userId, addressPayload = {}) {
  if (!addressPayload) return null;

  if (addressPayload.id) {
    const existing = db
      .prepare('SELECT id FROM addresses WHERE id = ? AND user_id = ?')
      .get(addressPayload.id, userId);
    if (existing) {
      return existing.id;
    }
  }

  const safeAddress = {
    addressType: sanitizeTextField(addressPayload.addressType, 50) || 'Shipping',
    fullName: sanitizeTextField(addressPayload.fullName, 120),
    phone: sanitizePhoneField(addressPayload.phone),
    addressLine1: sanitizeTextField(addressPayload.addressLine1, 255),
    addressLine2: sanitizeTextField(addressPayload.addressLine2, 255),
    city: sanitizeTextField(addressPayload.city, 120),
    state: sanitizeTextField(addressPayload.state, 120),
    pincode: sanitizePostalCode(addressPayload.pincode),
    landmark: sanitizeTextField(addressPayload.landmark, 255),
    isDefault: Boolean(addressPayload.isDefault)
  };

  const stmt = await db.prepare(`
    INSERT INTO addresses (
      user_id, address_type, full_name, phone,
      address_line1, address_line2, city, state,
      pincode, landmark, is_default
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = await stmt.run(
    userId,
    safeAddress.addressType,
    safeAddress.fullName,
    safeAddress.phone,
    safeAddress.addressLine1,
    safeAddress.addressLine2,
    safeAddress.city,
    safeAddress.state,
    safeAddress.pincode,
    safeAddress.landmark,
    safeAddress.isDefault ? 1 : 0
  );

  return result.lastInsertRowid;
}


// ==================== PUBLIC API ROUTES ====================

// User Registration (moved to auth routes section below)
// User Login (moved to auth routes section below)

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const filters = {
      category_id: req.query.category_id,
      category: req.query.category,
      search: req.query.search,
      min_price: req.query.min_price,
      max_price: req.query.max_price,
      sort: req.query.sort,
      limit: limit,
      offset: offset
    };

    // Get total count for pagination
    const totalProducts = await dbAPI.getProductsCount(filters);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await dbAPI.getAllProducts(filters);

    // Add active discounts to products
    const productsWithDiscounts = await Promise.all(products.map(async product => {
      const discount = await dbAPI.getActiveDiscount(product.id);

      // Add price field for frontend compatibility
      const baseProduct = {
        ...product,
        price: product.selling_price,
        originalPrice: product.base_price
      };

      if (discount) {
        const discountedPrice = discount.discount_type === 'percentage'
          ? product.selling_price * (1 - discount.discount_value / 100)
          : product.selling_price - discount.discount_value;

        return {
          ...baseProduct,
          discount,
          price: Math.max(0, discountedPrice).toFixed(2),
          discounted_price: Math.max(0, discountedPrice).toFixed(2)
        };
      }
      return baseProduct;
    }));

    res.json({
      success: true,
      products: productsWithDiscounts,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalProducts: totalProducts,
        limit: limit
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await dbAPI.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Apply discount logic and field mapping
    const discount = await dbAPI.getActiveDiscount(product.id);

    // Add price field for frontend compatibility
    const baseProduct = {
      ...product,
      price: product.selling_price,
      originalPrice: product.base_price
    };

    let finalProduct = baseProduct;

    if (discount) {
      const discountedPrice = discount.discount_type === 'percentage'
        ? product.selling_price * (1 - discount.discount_value / 100)
        : product.selling_price - discount.discount_value;

      finalProduct = {
        ...baseProduct,
        discount,
        price: Math.max(0, discountedPrice).toFixed(2),
        discounted_price: Math.max(0, discountedPrice).toFixed(2)
      };
    }

    res.json({ success: true, product: finalProduct });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await dbAPI.getAllCategories();
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Chat Assistant API
app.post('/api/chat/messages', async (req, res) => {
  try {
    const { message } = req.body;
    let responseText = "I'm here to help! Please contact support@ecommerce.com for further assistance.";

    if (message) {
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('order')) {
        responseText = "You can view your orders in the 'My Orders' section of your profile.";
      } else if (lowerMsg.includes('product') || lowerMsg.includes('buy')) {
        responseText = "Check out our latest products on the Products page!";
      } else if (lowerMsg.includes('shipping') || lowerMsg.includes('delivery')) {
        responseText = "We offer free shipping on orders over ₹500. Standard delivery takes 3-5 business days.";
      } else if (lowerMsg.includes('return') || lowerMsg.includes('refund')) {
        responseText = "You can request a return within 7 days of delivery from your order history.";
      } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
        responseText = "Hello! How can I assist you with your shopping today?";
      }
    }

    // Simulate delay for realism
    setTimeout(() => {
      res.json({
        id: Date.now(),
        type: 'bot',
        text: responseText,
        timestamp: new Date()
      });
    }, 500);

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// User Login (duplicate removed - using the one with better logging below)

// ==================== ADMIN AUTH ROUTES ====================

// ==================== ADDRESS ROUTES ====================

// Get user addresses
app.get('/api/users/:userId/addresses', requireAuth, async (req, res) => {
  try {
    // Ensure user is accessing their own addresses or is admin
    if (req.userId !== parseInt(req.params.userId) && !req.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(req.params.userId);
    res.json({ success: true, addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// Add new address
app.post('/api/users/:userId/addresses', requireAuth, async (req, res) => {
  try {
    if (req.userId !== parseInt(req.params.userId) && !req.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const {
      fullName, phone, addressLine1, addressLine2,
      city, state, pincode, landmark, isDefault, addressType
    } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.params.userId);
    }

    const result = await db.prepare(`
      INSERT INTO addresses (
        user_id, full_name, phone, address_line1, address_line2,
        city, state, pincode, landmark, is_default, address_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.params.userId, fullName, phone, addressLine1, addressLine2 || '',
      city, state, pincode, landmark || '', isDefault ? 1 : 0, addressType || 'Home'
    );

    const newAddress = await db.prepare('SELECT * FROM addresses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, address: newAddress });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ error: 'Failed to add address' });
  }
});

// Update address
app.put('/api/users/:userId/addresses/:addressId', requireAuth, async (req, res) => {
  try {
    if (req.userId !== parseInt(req.params.userId) && !req.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const {
      fullName, phone, addressLine1, addressLine2,
      city, state, pincode, landmark, isDefault, addressType
    } = req.body;

    // Check if address belongs to user
    const address = await db.prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?').get(req.params.addressId, req.params.userId);
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.params.userId);
    }

    await db.prepare(`
      UPDATE addresses SET
        full_name = ?, phone = ?, address_line1 = ?, address_line2 = ?,
        city = ?, state = ?, pincode = ?, landmark = ?, is_default = ?, address_type = ?
      WHERE id = ?
    `).run(
      fullName, phone, addressLine1, addressLine2 || '',
      city, state, pincode, landmark || '', isDefault ? 1 : 0, addressType || 'Home',
      req.params.addressId
    );

    const updatedAddress = await db.prepare('SELECT * FROM addresses WHERE id = ?').get(req.params.addressId);
    res.json({ success: true, address: updatedAddress });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// Delete address
app.delete('/api/users/:userId/addresses/:addressId', requireAuth, async (req, res) => {
  try {
    if (req.userId !== parseInt(req.params.userId) && !req.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(req.params.addressId, req.params.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

// User profile
app.get('/api/users/:userId/profile', requireAuth, async (req, res) => {
  try {
    if (req.userId !== parseInt(req.params.userId) && !req.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const user = await dbAPI.getUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    delete user.password_hash;
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/api/users/:userId/profile', requireAuth, async (req, res) => {
  try {
    if (req.userId !== parseInt(req.params.userId) && !req.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { fullName, email, phone, company, bio } = req.body;
    const nameParts = (fullName || '').trim().split(' ');
    const firstName = nameParts.shift() || '';
    const lastName = nameParts.join(' ');

    await db.prepare(`
      UPDATE users SET
        first_name = ?, last_name = ?, email = ?, phone = ?, company = ?, bio = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      firstName,
      lastName,
      email || '',
      phone || '',
      company || '',
      bio || '',
      req.params.userId
    );

    const updatedUser = await dbAPI.getUserById(req.params.userId);
    delete updatedUser.password_hash;

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.put('/api/users/:userId/password', requireAuth, async (req, res) => {
  try {
    if (req.userId !== parseInt(req.params.userId) && !req.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new passwords are required' });
    }

    const user = await dbAPI.getUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(hashedPassword, req.params.userId);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// ==================== AUTH ROUTES ====================



// Email availability check
app.get('/api/auth/check-email', async (req, res) => {
  try {
    const email = (req.query.email || '').toLowerCase().trim();
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    const existingUser = await dbAPI.getUserByEmail(email);
    res.json({
      email,
      available: !existingUser
    });
  } catch (error) {
    console.error('Email availability check error:', error);
    res.status(500).json({ error: 'Failed to check email availability' });
  }
});

// CSRF Token Endpoint (must be called before any protected requests)
app.get('/api/csrf-token', csrfProtection, async (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Register
app.post('/api/auth/register', authLimiter, csrfProtection, validateRegistration, async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    console.log('Registration request received:', { email, firstName, lastName });

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if user exists
    console.log('Checking if user exists:', email.toLowerCase());
    const existingUser = await dbAPI.getUserByEmail(email.toLowerCase());
    console.log('Existing user check result:', existingUser);
    if (existingUser) {
      console.log('Email already registered:', email);
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    console.log('Hashing password for:', email);
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Create user
    console.log('Creating user with data:', {
      email: email.toLowerCase(),
      first_name: firstName || '',
      last_name: lastName || '',
      phone: phone || '',
      email_verified: 0,
      is_admin: 0
    });
    const result = await dbAPI.createUser({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      first_name: firstName || '',
      last_name: lastName || '',
      phone: phone || '',
      email_verified: 0,
      is_admin: 0
    });
    console.log('User creation result:', result);

    const user = await dbAPI.getUserById(result.lastInsertRowid);
    console.log('Retrieved created user:', user);
    const token = generateJWT(user.id, false);
    console.log('Generated JWT token');

    // Remove password from response
    delete user.password_hash;

    setImmediate(() => {
      sendTransactionalEmail({
        to: user.email,
        subject: 'Welcome to ProLab Equipment',
        template: 'welcome',
        data: {
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
        }
      }).catch((error) => {
        console.error('Failed to send welcome email:', error);
      });
    });

    res.status(201).json({
      success: true,
      user,
      token,
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// User Login
app.post('/api/auth/login', authLimiter, csrfProtection, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    console.log('User Login Attempt:', email.toLowerCase());
    const user = await dbAPI.getUserByEmail(email.toLowerCase());

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password with bcrypt
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isValid);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateJWT(user.id, false);

    // Remove password from response
    delete user.password_hash;

    res.json({
      success: true,
      user,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});


// Change Password
app.post('/api/auth/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await dbAPI.getUserById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid current password' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
      .run(hashedPassword, req.userId);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Delete Account
app.delete('/api/auth/delete-account', requireAuth, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await dbAPI.getUserById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password for security
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Delete user
    db.prepare('DELETE FROM users WHERE id = ?').run(req.userId);

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour

      await db.prepare('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?')
        .run(resetToken, resetTokenExpiry, user.id);

      // In a real app, send email here. For now, log to console.
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      console.log(`\n🔐 PASSWORD RESET LINK for ${email}:`);
      console.log(resetLink);
      console.log('---------------------------------------------------\n');
    }

    // Always return success to prevent email enumeration
    res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?')
      .get(token, Date.now());

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?')
      .run(hashedPassword, user.id);

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    console.log('Admin Login Attempt:', email);
    const user = await dbAPI.getUserByEmail(email.toLowerCase());

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    if (user.is_admin !== 1) {
      console.log('User is not admin:', user.is_admin);
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isValid);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = generateJWT(user.id, true);

    // Remove password from response
    delete user.password_hash;

    res.json({
      success: true,
      admin: user,
      token,
      jwtToken: token // For compatibility
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify Admin Token
app.get('/api/admin/verify', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await dbAPI.getUserById(req.userId);
    delete user.password_hash;

    res.json({
      valid: true,
      admin: user
    });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ==================== ADMIN PRODUCT ROUTES ====================

// Get all products (admin)
app.get('/api/admin/products', requireAuth, requireAdmin, async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      category_id: req.query.category,
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      include_inactive: true
    };

    const products = await dbAPI.getAllProducts(filters);

    // Enrich each product with full details (images, parsed JSON fields, discounts)
    const enrichedProducts = await Promise.all(products.map(async product => {
      const fullProduct = await dbAPI.getProductById(product.id);
      return fullProduct;
    }));

    res.json({
      success: true,
      products: enrichedProducts,
      total: enrichedProducts.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create product
app.post('/api/admin/products', requireAuth, requireAdmin, validateProduct, async (req, res) => {
  try {
    const productData = req.body;

    // Validate required fields
    if (!productData.name || !productData.selling_price) {
      return res.status(400).json({ error: 'Name and price required' });
    }

    // Generate slug if not provided
    if (!productData.slug) {
      productData.slug = productData.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Generate SKU if not provided
    if (!productData.sku) {
      const timestamp = Date.now();
      productData.sku = `PRD-${timestamp}`;
    }

    const productId = await dbAPI.createProduct(productData);

    // Add images if provided
    if (productData.images && Array.isArray(productData.images)) {
      for (let index = 0; index < productData.images.length; index++) {
        const img = productData.images[index];
        await dbAPI.addProductImage(productId, {
          image_url: img.url || img.image_url,
          alt_text: img.alt_text || productData.name,
          is_primary: index === 0 ? 1 : 0,
          display_order: index
        });
      }
    }

    const product = await dbAPI.getProductById(productId);

    res.status(201).json({
      success: true,
      product,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
app.put('/api/admin/products/:id', requireAuth, requireAdmin, validateProduct, async (req, res) => {
  try {
    const productId = req.params.id;
    const updates = req.body;

    await dbAPI.updateProduct(productId, updates);

    const product = await dbAPI.getProductById(productId);

    res.json({
      success: true,
      product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
app.delete('/api/admin/products/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await dbAPI.deleteProduct(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Add product image
app.post('/api/admin/products/:id/images', requireAuth, requireAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    const { image_url, alt_text, is_primary, display_order } = req.body;

    if (!image_url) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    await dbAPI.addProductImage(productId, {
      image_url,
      alt_text,
      is_primary: is_primary || 0,
      display_order: display_order || 0
    });

    const images = await dbAPI.getProductImages(productId);

    res.status(201).json({
      success: true,
      images,
      message: 'Image added successfully'
    });
  } catch (error) {
    console.error('Error adding product image:', error);
    res.status(500).json({ error: 'Failed to add product image' });
  }
});

// Delete product image
app.delete('/api/admin/products/:id/images/:imageId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id, imageId } = req.params;

    await dbAPI.deleteProductImage(imageId);

    const images = await dbAPI.getProductImages(id);

    res.json({
      success: true,
      images,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product image:', error);
    res.status(500).json({ error: 'Failed to delete product image' });
  }
});

// Set primary product image
app.put('/api/admin/products/:id/images/:imageId/primary', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id, imageId } = req.params;

    await dbAPI.setPrimaryProductImage(id, imageId);

    const images = await dbAPI.getProductImages(id);

    res.json({
      success: true,
      images,
      message: 'Primary image updated successfully'
    });
  } catch (error) {
    console.error('Error setting primary image:', error);
    res.status(500).json({ error: 'Failed to set primary image' });
  }
});

// ==================== ADMIN DISCOUNT ROUTES ====================

// Create discount
app.post('/api/admin/discounts', requireAuth, requireAdmin, async (req, res) => {
  try {
    const discountData = {
      ...req.body,
      created_by: req.userId
    };

    const result = await dbAPI.createDiscount(discountData);

    res.status(201).json({
      success: true,
      discount_id: result.lastInsertRowid,
      message: 'Discount created successfully'
    });
  } catch (error) {
    console.error('Error creating discount:', error);
    res.status(500).json({ error: 'Failed to create discount' });
  }
});

// Delete discount
app.delete('/api/admin/discounts/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await dbAPI.deleteDiscount(req.params.id);

    res.json({
      success: true,
      message: 'Discount removed successfully'
    });
  } catch (error) {
    console.error('Error deleting discount:', error);
    res.status(500).json({ error: 'Failed to delete discount' });
  }
});

// Admin logout
app.post('/api/admin/logout', requireAuth, async (req, res) => {
  const authHeader = req.headers.authorization;

  if (authHeader && !authHeader.startsWith('Bearer ')) {
    // Legacy session token
    sessions.delete(authHeader);
  }
  // For JWT, we don't need to do anything as it's stateless
  // In a production system, you might want to maintain a blacklist

  res.json({ success: true });
});

// ==================== ADMIN USER ROUTES ====================

// Get all users
app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = db.prepare(`
      SELECT 
        id,
        email,
        first_name,
        last_name,
        phone,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
    `).all();

    console.log(`📊 Fetched ${users.length} users`);

    res.json({
      success: true,
      users,
      total: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user
app.get('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await db.prepare(`
      SELECT
        id,
        email,
        first_name,
        last_name,
        phone,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
    `).get(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's orders
    const orders = await db.prepare(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
      `).all(req.params.id);

    res.json({
      success: true,
      user: {
        ...user,
        orders
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});


// ==================== ANALYTICS ROUTES ====================

// General Analytics (Dashboard)
app.get('/api/admin/analytics', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { timeRange } = req.query;
    let startDate;
    const now = new Date();

    if (timeRange === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
    } else if (timeRange === 'month') {
      startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
    } else if (timeRange === 'year') {
      startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
    } else {
      startDate = new Date(0).toISOString();
    }

    // Summary Stats
    const totalUsers = await db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const newUsers = await db.prepare('SELECT COUNT(*) as count FROM users WHERE created_at >= ?').get(startDate).count;
    const oldUsers = totalUsers - newUsers;

    // Sales & Orders
    const salesData = await db.prepare(`
      SELECT 
        DATE(created_at) as date, 
        COUNT(*) as count, 
        SUM(total_amount) as revenue 
      FROM orders 
      WHERE created_at >= ? 
      GROUP BY DATE(created_at)
    `).all(startDate);

    const totalRevenue = salesData.reduce((sum, day) => sum + (day.revenue || 0), 0);
    const totalOrders = salesData.reduce((sum, day) => sum + day.count, 0);

    // User Registrations Chart
    const userRegistrations = await db.prepare(`
      SELECT 
        DATE(created_at) as date, 
        COUNT(*) as count 
      FROM users 
      WHERE created_at >= ? 
      GROUP BY DATE(created_at)
    `).all(startDate);

    // Recent Orders (for dashboard list)
    const recentOrders = await db.prepare(`
      SELECT 
        o.id as orderId, 
        o.total_amount as totalAmount, 
        o.status, 
        o.created_at as orderDate,
        u.email as userEmail,
        u.first_name || ' ' || u.last_name as userName
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `).all();

    // Add item counts to recent orders
    const enrichedRecentOrders = await Promise.all(recentOrders.map(async order => {
      const itemCount = await db.prepare('SELECT COUNT(*) as count FROM order_items WHERE order_id = ?').get(order.orderId);
      return { ...order, items: { length: itemCount ? itemCount.count : 0 } };
    }));

    res.json({
      summary: {
        totalUserTraffic: totalUsers,
        newUsers,
        oldUsers,
        sales: totalRevenue,
        orders: totalOrders
      },
      charts: {
        sales: salesData.map(d => ({ date: d.date, sales: d.revenue, quantity: d.count })),
        userDates: userRegistrations.map(d => d.date),
        userCounts: userRegistrations.map(d => d.count)
      },
      orders: enrichedRecentOrders
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Orders Analytics & List
app.get('/api/admin/analytics/orders', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { timeRange } = req.query;
    let startDate;
    const now = new Date();

    if (timeRange === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
    } else if (timeRange === 'month') {
      startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
    } else if (timeRange === 'year') {
      startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
    } else {
      startDate = new Date(0).toISOString();
    }

    // Chart Data
    const chartData = await db.prepare(`
      SELECT 
        DATE(created_at) as date, 
        COUNT(*) as count, 
        SUM(total_amount) as revenue 
      FROM orders 
      WHERE created_at >= ? 
      GROUP BY DATE(created_at)
    `).all(startDate);

    // Full Orders List
    const orders = await db.prepare(`
      SELECT 
        o.id as orderId, 
        o.total_amount as totalAmount, 
        o.status, 
        o.created_at as date,
        u.email as userEmail,
        u.first_name || ' ' || u.last_name as userName
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.created_at >= ?
      ORDER BY o.created_at DESC
    `).all(startDate);

    // Add full item details for each order
    const ordersWithItems = await Promise.all(orders.map(async order => {
      const items = await dbAPI.getOrderItems(order.orderId);
      return { ...order, items: items || [] };
    }));

    res.json({
      chartData,
      orders: ordersWithItems
    });

  } catch (error) {
    console.error('Orders analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch orders analytics' });
  }
});



// Update Order Status
app.put('/api/admin/orders/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'replaced', 'return_requested', 'replace_requested'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, id);

    res.json({
      success: true,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ==================== WISHLIST ROUTES ====================

// Get Wishlist
app.get('/api/users/:userId/wishlist', requireAuth, async (req, res) => {
  try {
    if (req.params.userId != req.userId && !req.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const wishlist = db.prepare('SELECT * FROM wishlist WHERE user_id = ?').all(req.params.userId);

    // Map product_id to productId for frontend compatibility
    const formattedWishlist = wishlist.map(item => ({
      ...item,
      productId: item.product_id
    }));

    res.json({ success: true, wishlist: formattedWishlist });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add to Wishlist
app.post('/api/users/:userId/wishlist', requireAuth, async (req, res) => {
  try {
    if (req.params.userId != req.userId && !req.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { productId } = req.body;

    // Check if already exists
    const existing = await db.prepare('SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?')
      .get(req.params.userId, productId);

    if (existing) {
      return res.json({ success: true, message: 'Already in wishlist' });
    }

    db.prepare('INSERT INTO wishlist (user_id, product_id, created_at) VALUES (?, ?, ?)')
      .run(req.params.userId, productId, new Date().toISOString());

    res.json({ success: true, message: 'Added to wishlist' });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove from Wishlist
app.delete('/api/users/:userId/wishlist/:productId', requireAuth, async (req, res) => {
  try {
    if (req.params.userId != req.userId && !req.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    db.prepare('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?')
      .run(req.params.userId, req.params.productId);

    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// ==================== USER ORDER ROUTES ====================

// Create Order (Checkout)
app.post('/api/orders', requireAuth, csrfProtection, validateOrder, async (req, res) => {
  try {
    // Debug: Log incoming request body
    console.log('DEBUG /api/orders request body:', JSON.stringify(req.body, null, 2));
    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in order' });
    }

    // Create Address if needed
    let shippingAddressId = shippingAddress.id;
    if (!shippingAddressId && typeof shippingAddress === 'object') {
      shippingAddressId = await createOrUpdateAddress(req.userId, shippingAddress);
    }

    // Debug: Log order data before DB insert
    const orderDataForDb = {
      order_number: createOrderNumber(),
      user_id: req.userId,
      status: 'pending',
      payment_status: 'pending',
      payment_method: paymentMethod,
      subtotal: totalAmount,
      total_amount: totalAmount,
      shipping_address_id: shippingAddressId
    };
    console.log('DEBUG /api/orders orderDataForDb:', JSON.stringify(orderDataForDb, null, 2));

    // Create Order
    const orderId = await dbAPI.createOrder(orderDataForDb);

    // Add Items
    console.log('DEBUG: Items array:', JSON.stringify(items, null, 2));
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      console.log(`DEBUG: Processing item ${index}:`, JSON.stringify(item, null, 2));
      console.log(`DEBUG: item.productId = ${item.productId}, item.id = ${item.id}`);

      await dbAPI.addOrderItem({
        order_id: orderId,
        product_id: item.productId || item.id, // Try both fields
        product_name: item.name || '',
        product_sku: item.sku || 'SKU',
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      });
    }

    res.status(201).json({
      success: true,
      order_id: orderId,
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    // Debug: Log error stack if available
    if (error && error.stack) {
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ error: 'Failed to create order', details: error && error.message ? error.message : error });
  }
});

// Cancel Order (User)
app.put('/api/orders/:id/cancel', requireAuth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.userId;

    // Verify order belongs to user
    const order = await dbAPI.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Ensure user owns the order
    if (order.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to cancel this order' });
    }

    // Only pending orders can be cancelled
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot cancel order that is not pending' });
    }

    await dbAPI.updateOrderStatus(orderId, 'cancelled');

    // Log the cancellation
    console.log(`Order #${orderId} cancelled by user ${userId}`);

    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// Get User Orders
app.get('/api/orders', requireAuth, async (req, res) => {
  try {
    const orders = await dbAPI.getAllOrders({ user_id: req.userId });

    // Fetch items for each order
    const ordersWithItems = await Promise.all(orders.map(async order => {
      const items = await dbAPI.getOrderItems(order.id);
      return { ...order, items };
    }));

    res.json({
      success: true,
      orders: ordersWithItems
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get Single Order
app.get('/api/orders/:id', requireAuth, async (req, res) => {
  try {
    const order = await dbAPI.getOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Security check: ensure order belongs to user
    if (order.user_id !== req.userId && !req.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// ==================== ADMIN ORDER ROUTES ====================

// Get all orders
app.get('/api/admin/orders', requireAuth, requireAdmin, async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      limit: req.query.limit ? parseInt(req.query.limit) : null
    };

    const orders = await dbAPI.getAllOrders(filters);

    res.json({
      success: true,
      orders,
      total: orders.length
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
app.get('/api/admin/orders/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const order = await dbAPI.getOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status
app.put('/api/admin/orders/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }

    await dbAPI.updateOrderStatus(req.params.id, status, notes, req.userId);

    // Create notification for user
    const order = await dbAPI.getOrderById(req.params.id);
    if (order) {
      await dbAPI.createNotification({
        user_id: order.user_id,
        type: 'order_status_update',
        title: `Order ${status} `,
        message: `Your order #${order.order_number} is now ${status} `,
        link: `/ orders / ${order.id} `
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully'
    });

    if (ORDER_STATUS_EMAILS[status]) {
      queueOrderStatusEmail(req.params.id, status);
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ==================== ADMIN ANALYTICS ROUTES ====================

// Get dashboard analytics with time filtering
app.get('/api/admin/analytics', requireAuth, requireAdmin, async (req, res) => {
  try {
    const mainDb = await loadMainDb();
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
        dates.push(`Week ${index + 1} `);
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

    console.log(`📊 Analytics Response: `, {
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

// Orders Analytics Endpoint (for Orders tab)
app.get('/api/admin/analytics/orders', requireAuth, requireAdmin, async (req, res) => {
  try {
    const timeRange = req.query.timeRange || 'month';
    const mainDb = await loadMainDb();

    // Get date range
    const now = new Date();
    let startDate;

    if (timeRange === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    // Filter orders by date range
    const filteredOrders = mainDb.orders.filter(order => {
      const orderDate = new Date(order.created_at || order.orderDate);
      return orderDate >= startDate && orderDate <= now;
    });

    // Group orders by date for chart
    const ordersByDate = {};
    filteredOrders.forEach(order => {
      const date = (order.created_at || order.orderDate || '').split('T')[0];
      if (!ordersByDate[date]) {
        ordersByDate[date] = {
          count: 0,
          revenue: 0
        };
      }
      ordersByDate[date].count++;
      ordersByDate[date].revenue += parseFloat(order.total_amount || order.totalAmount || 0);
    });

    // Convert to chart data
    const chartData = Object.keys(ordersByDate)
      .sort()
      .map(date => ({
        date,
        count: ordersByDate[date].count,
        revenue: ordersByDate[date].revenue
      }));

    // Calculate summary stats
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) =>
      sum + parseFloat(order.total_amount || order.totalAmount || 0), 0
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Orders by status
    const ordersByStatus = {
      pending: filteredOrders.filter(o => o.status === 'pending').length,
      processing: filteredOrders.filter(o => o.status === 'processing').length,
      shipped: filteredOrders.filter(o => o.status === 'shipped').length,
      delivered: filteredOrders.filter(o => o.status === 'delivered').length,
      cancelled: filteredOrders.filter(o => o.status === 'cancelled').length
    };

    console.log(`📊 Orders Analytics: ${totalOrders} orders in ${timeRange} `);

    res.json({
      success: true,
      timeRange,
      summary: {
        totalOrders,
        totalRevenue,
        averageOrderValue
      },
      chartData,
      ordersByStatus,
      orders: filteredOrders.slice(0, 50) // Return latest 50 orders
    });
  } catch (error) {
    console.error('Orders analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch orders analytics' });
  }
});


// ==================== ADMIN NOTIFICATION ROUTES ====================

// Get unread notifications
app.get('/api/admin/notifications', requireAuth, requireAdmin, async (req, res) => {
  try {
    const notifications = await dbAPI.getUnreadNotifications(null); // null = admin notifications

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
app.put('/api/admin/notifications/:id/read', requireAuth, requireAdmin, async (req, res) => {
  try {
    await dbAPI.markNotificationAsRead(req.params.id);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification:', error);
    res.status(500).json({ error: 'Failed to mark notification' });
  }
});

// ==================== PAYMENT ROUTES (RAZORPAY) ====================

const Razorpay = require('razorpay');


// Initialize Razorpay (or use mock for testing)
// Set RAZORPAY_MODE=mock in .env to use mock implementation
const RAZORPAY_MODE = (process.env.RAZORPAY_MODE || 'mock') === 'mock' || !process.env.RAZORPAY_KEY_ID ? 'mock' : process.env.RAZORPAY_MODE;

let razorpay;

if (RAZORPAY_MODE === 'mock') {
  console.log('💳 Using MOCK Razorpay for testing (no real API calls)');
  // Mock Razorpay for testing without real credentials
  razorpay = {
    orders: {
      create: async (options) => {
        console.log('🎭 Mock: Creating Razorpay order', options);
        return {
          id: `order_mock_${Date.now()} `,
          entity: 'order',
          amount: options.amount,
          amount_paid: 0,
          amount_due: options.amount,
          currency: options.currency,
          receipt: options.receipt,
          status: 'created',
          attempts: 0,
          created_at: Math.floor(Date.now() / 1000)
        };
      }
    }
  };
} else {
  console.log('💳 Using REAL Razorpay with credentials');
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// Create Payment Order
app.post('/api/payment/create-order', requireAuth, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    console.log('💰 Creating payment order:', { amount, currency, receipt, mode: RAZORPAY_MODE });

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency,
      receipt: receipt || `order_${Date.now()} `,
      payment_capture: 1
    };

    console.log('📦 Razorpay order options:', options);

    const order = await razorpay.orders.create(options);

    console.log('✅ Razorpay order created:', order.id);

    res.json(order);
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    console.error('Error details:', error.error || error.message);
    res.status(500).json({
      error: 'Failed to create payment order',
      details: error.error?.description || error.message
    });
  }
});

// Verify Payment
app.post('/api/payment/verify-payment', requireAuth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id // Internal order ID
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update order status in database
      if (order_id) {
        try {
          await dbAPI.updateOrderStatus(order_id, 'paid', `Payment ID: ${razorpay_payment_id} `);

          // Create notification for admin
          await dbAPI.createNotification({
            user_id: null,
            type: 'new_order', // or 'payment_received'
            title: 'Payment Received',
            message: `Payment received for Order #${order_id}`,
            link: `/ admin / orders / ${order_id} `
          });
        } catch (dbError) {
          console.error('Error updating order status:', dbError);
        }
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment_id: razorpay_payment_id
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid signature'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ORDER ROUTES ====================

app.post('/api/cart/validate', requireAuth, csrfProtection, validateCart, async (req, res) => {
  try {
    const { items, shippingMethod } = req.body;
    const { sanitizedItems, subtotal, errors } = await validateCartItems(items);

    if (sanitizedItems.length === 0) {
      return res.status(400).json({
        success: false,
        errors: errors.length ? errors : ['Cart is empty'],
        items: []
      });
    }

    const methodConfig = resolveShippingMethod(shippingMethod);
    const taxAmount = Number((subtotal * 0.18).toFixed(2));
    const shippingCost = calculateShippingCost(methodConfig, subtotal);
    const total = Number((subtotal + taxAmount + shippingCost).toFixed(2));

    res.json({
      success: errors.length === 0,
      errors,
      items: sanitizedItems,
      subtotal,
      taxAmount,
      shippingCost,
      total,
      shippingDetails: {
        method: methodConfig.key,
        label: methodConfig.label,
        eta: methodConfig.eta,
        freeThreshold: methodConfig.freeThreshold
      }
    });
  } catch (error) {
    console.error('Cart validation error:', error);
    res.status(500).json({ error: 'Failed to validate cart' });
  }
});

// Create new order
app.post('/api/orders', requireAuth, async (req, res) => {
  try {
    const { items, shippingAddress, notes, shippingMethod } = req.body;
    const userId = req.userId;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items in order' });
    }

    const { sanitizedItems, subtotal, errors } = await validateCartItems(items);

    if (!sanitizedItems.length) {
      return res.status(400).json({ error: 'Unable to build order from cart items', details: errors });
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Cart validation failed', details: errors });
    }

    const methodConfig = resolveShippingMethod(shippingMethod);
    const taxAmount = Number((subtotal * 0.18).toFixed(2));
    const shippingCost = calculateShippingCost(methodConfig, subtotal);
    const totalAmount = Number((subtotal + taxAmount + shippingCost).toFixed(2));

    let shippingAddressId = null;
    try {
      console.log('Creating address with payload:', JSON.stringify(shippingAddress, null, 2));
      shippingAddressId = await createOrUpdateAddress(userId, shippingAddress);
      console.log('Address created with ID:', shippingAddressId);
    } catch (addressError) {
      console.error('Address creation failed:', addressError);
      throw new Error(`Failed to create shipping address: ${addressError.message}`);
    }

    const orderNumber = createOrderNumber();

    const runTransaction = db.transaction(async () => {
      for (const item of sanitizedItems) {
        const stockRow = db
          .prepare('SELECT stock_quantity FROM products WHERE id = ?')
          .get(item.product_id);

        if (!stockRow || stockRow.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${item.product_name}`);
        }

        db.prepare('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?')
          .run(item.quantity, item.product_id);
      }

      const orderResult = db.prepare(`
        INSERT INTO orders (
          order_number, user_id, status, payment_status, payment_method,
          subtotal, discount_amount, shipping_cost, tax_amount, total_amount,
          shipping_address_id, billing_address_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        orderNumber,
        userId,
        'pending',
        'pending',
        req.body.payment_method || 'razorpay',
        subtotal,
        0,
        shippingCost,
        taxAmount,
        totalAmount,
        shippingAddressId,
        shippingAddressId,
        notes || null
      );

      const insertItem = await db.prepare(`
        INSERT INTO order_items (
          order_id, product_id, product_name, product_sku, quantity, unit_price, total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      sanitizedItems.forEach((item) => {
        insertItem.run(
          orderResult.lastInsertRowid,
          item.product_id,
          item.product_name,
          item.product_sku,
          item.quantity,
          item.unit_price,
          item.line_total
        );
      });

      db.prepare(`
        INSERT INTO order_status_history (order_id, status, notes, created_by)
        VALUES (?, ?, ?, ?)
      `).run(orderResult.lastInsertRowid, 'pending', 'Order created', userId);

      return orderResult.lastInsertRowid;
    });

    const newOrderId = runTransaction();
    const newOrder = await dbAPI.getOrderById(newOrderId);
    const user = await dbAPI.getUserById(userId);
    if (user) {
      delete user.password_hash;
    }
    const shippingDetails = resolveShippingMethod(newOrder.shipping_method);

    await dbAPI.createNotification({
      user_id: null,
      type: 'new_order',
      title: 'New Order Placed',
      message: `Order ${newOrder.order_number} placed by ${user?.email || 'customer'}`,
      link: `/admin/orders/${newOrderId}`
    });

    sendOrderEmails(user, newOrder);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        ...newOrder,
        items: newOrder.items || sanitizedItems,
        shipping_details: shippingDetails
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    try {
      fs.appendFileSync('server_error.log', `[${new Date().toISOString()}] Create Order Error: ${error.stack || error.message}\n`);
    } catch (e) { console.error('Failed to write log:', e); }
    res.status(400).json({ error: error.message || 'Failed to create order' });
  }
});

// Get user orders
app.get('/api/orders', requireAuth, async (req, res) => {
  try {
    const orders = await dbAPI.getAllOrders({ user_id: req.userId });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get user orders (alias for frontend compatibility)
app.get('/api/users/:userId/orders', requireAuth, async (req, res) => {
  try {
    // Ensure user is accessing their own orders
    if (req.userId !== parseInt(req.params.userId) && !req.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const orders = await dbAPI.getAllOrders({ user_id: req.params.userId });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ==================== REVIEWS & FEATURED ROUTES ====================

// Get featured products
app.get('/api/products/featured', async (req, res) => {
  try {
    // Get 4 random active products with images
    const products = await db.prepare(`
      SELECT p.*,
  (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM products p
      WHERE p.is_active = 1
      ORDER BY RANDOM()
      LIMIT 4
  `).all();

    res.json({ success: true, products });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

// Get product reviews
app.get('/api/products/:productId/reviews', async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await db.prepare(`
      SELECT r.*, u.first_name || ' ' || u.last_name as author, r.created_at as date
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
  ORDER BY r.created_at DESC
    `).all(productId);

    // Format for frontend
    const formattedReviews = reviews.map(r => ({
      id: r.id,
      author: r.author,
      rating: r.rating,
      date: r.date,
      comment: r.comment,
      verified: !!r.is_verified_purchase
    }));

    res.json({ success: true, reviews: formattedReviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Add review
app.post('/api/products/:productId/reviews', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating' });
    }

    // Check if user bought the product (for verified badge)
    const orderItem = await db.prepare(`
      SELECT oi.id 
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'
  `).get(userId, productId);

    const isVerified = !!orderItem;

    const result = await db.prepare(`
      INSERT INTO reviews(product_id, user_id, rating, comment, is_verified_purchase)
VALUES(?, ?, ?, ?, ?)
    `).run(productId, userId, rating, comment, isVerified ? 1 : 0);

    const user = await db.prepare('SELECT first_name, last_name FROM users WHERE id = ?').get(userId);

    const newReview = {
      id: result.lastInsertRowid,
      author: `${user.first_name} ${user.last_name} `,
      rating,
      comment,
      date: new Date().toISOString(),
      verified: isVerified
    };

    res.json({ success: true, review: newReview });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});


// ==================== CHECKOUT FLOW ROUTES ====================
// Import and register checkout routes
const registerCheckoutRoutes = require('./checkout_routes');
registerCheckoutRoutes(app, requireAuth);
console.log('✅ Checkout routes registered');

// ==================== USER ORDER RETURN/REPLACE ROUTES ====================

// Request Return (User)
app.put('/api/orders/:id/return', requireAuth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.userId;
    const { reason } = req.body;

    console.log('=== RETURN REQUEST DEBUG ===');
    console.log('Order ID:', orderId);
    console.log('User ID from token:', userId, 'Type:', typeof userId);
    console.log('Reason:', reason);

    const order = await dbAPI.getOrderById(orderId);

    if (!order) {
      console.log('❌ Order not found');
      return res.status(404).json({ error: 'Order not found' });
    }

    console.log('Order found:', {
      id: order.id,
      user_id: order.user_id,
      user_id_type: typeof order.user_id,
      status: order.status,
      order_number: order.order_number
    });

    console.log('Ownership check:', {
      order_user_id: order.user_id,
      token_user_id: userId,
      match: String(order.user_id) === String(userId),
      strict_match: order.user_id === userId,
      loose_match: order.user_id == userId
    });

    if (String(order.user_id) !== String(userId)) {
      console.log('❌ Unauthorized - User mismatch!');
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (order.status !== 'delivered' && order.status !== 'pending' && order.status !== 'shipped') {
      console.log('❌ Order not eligible for return, status:', order.status);
      return res.status(400).json({ error: 'Only delivered, shipped or pending orders can be returned' });
    }

    await dbAPI.updateOrderStatus(orderId, 'return_requested', `Return requested: ${reason}`);

    // Create entry in return_requests table
    await dbAPI.createReturnRequest({
      order_id: orderId,
      user_id: userId,
      reason: reason,
      status: 'return_requested',
      refund_amount: order.total_amount // Assuming full refund
    });

    // Notify Admin
    await dbAPI.createNotification({
      user_id: null,
      type: 'return_request',
      title: 'Return Requested',
      message: `Order #${order.order_number} return requested.`,
      link: `/admin/orders`
    });

    res.json({ success: true, message: 'Return requested successfully' });
  } catch (error) {
    console.error('Return request error:', error);
    res.status(500).json({ error: 'Failed to request return' });
  }
});

// Request Replacement (User)
app.put('/api/orders/:id/replace', requireAuth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.userId;
    const { reason } = req.body;

    const order = await dbAPI.getOrderById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.user_id !== userId) return res.status(403).json({ error: 'Unauthorized' });
    if (order.status !== 'delivered' && order.status !== 'pending' && order.status !== 'shipped') return res.status(400).json({ error: 'Only delivered, shipped or pending orders can be replaced' });

    await dbAPI.updateOrderStatus(orderId, 'replace_requested', `Replacement requested: ${reason}`);

    // Notify Admin
    await dbAPI.createNotification({
      user_id: null,
      type: 'replace_request',
      title: 'Replacement Requested',
      message: `Order #${order.order_number} replacement requested.`,
      link: `/admin/orders`
    });

    res.json({ success: true, message: 'Replacement requested successfully' });
  } catch (error) {
    console.error('Replacement request error:', error);
    res.status(500).json({ error: 'Failed to request replacement' });
  }
});



// ==================== PROFESSIONAL WORKFLOW API ROUTES ====================

// Warehouse Management
app.get('/api/admin/warehouses', requireAuth, requireAdmin, async (req, res) => {
  try {
    const warehouses = await dbAPI.getAllWarehouses();
    res.json({ success: true, warehouses });
  } catch (error) {
    console.error('Get warehouses error:', error);
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
});

app.post('/api/admin/warehouses', requireAuth, requireAdmin, async (req, res) => {
  try {
    const warehouseData = req.body;
    const warehouse = await dbAPI.createWarehouse(warehouseData);
    res.json({ success: true, warehouse });
  } catch (error) {
    console.error('Create warehouse error:', error);
    res.status(500).json({ error: 'Failed to create warehouse' });
  }
});

app.put('/api/admin/warehouses/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const warehouseId = req.params.id;
    const warehouseData = req.body;
    const warehouse = await dbAPI.updateWarehouse(warehouseId, warehouseData);
    res.json({ success: true, warehouse });
  } catch (error) {
    console.error('Update warehouse error:', error);
    res.status(500).json({ error: 'Failed to update warehouse' });
  }
});

// Warehouse Inventory Management
app.get('/api/admin/warehouse-inventory', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { warehouseId, productId } = req.query;
    let inventory;

    if (warehouseId && productId) {
      inventory = await dbAPI.getWarehouseInventory(warehouseId, productId);
    } else if (warehouseId) {
      inventory = await dbAPI.getWarehouseInventoryByWarehouse(warehouseId);
    } else {
      inventory = await dbAPI.getAllWarehouseInventory();
    }

    res.json({ success: true, inventory });
  } catch (error) {
    console.error('Get warehouse inventory error:', error);
    res.status(500).json({ error: 'Failed to fetch warehouse inventory' });
  }
});

app.put('/api/admin/warehouse-inventory/:warehouseId/:productId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { warehouseId, productId } = req.params;
    const { stockQuantity, reservedQuantity } = req.body;

    const inventory = await dbAPI.updateWarehouseInventory(warehouseId, productId, {
      stock_quantity: stockQuantity,
      reserved_quantity: reservedQuantity
    });

    res.json({ success: true, inventory });
  } catch (error) {
    console.error('Update warehouse inventory error:', error);
    res.status(500).json({ error: 'Failed to update warehouse inventory' });
  }
});

// Courier Partners Management
app.get('/api/admin/courier-partners', requireAuth, requireAdmin, async (req, res) => {
  try {
    const couriers = await dbAPI.getAllCourierPartners();
    res.json({ success: true, couriers });
  } catch (error) {
    console.error('Get courier partners error:', error);
    res.status(500).json({ error: 'Failed to fetch courier partners' });
  }
});

app.post('/api/admin/courier-partners', requireAuth, requireAdmin, async (req, res) => {
  try {
    const courierData = req.body;
    const courier = await dbAPI.createCourierPartner(courierData);
    res.json({ success: true, courier });
  } catch (error) {
    console.error('Create courier partner error:', error);
    res.status(500).json({ error: 'Failed to create courier partner' });
  }
});

// Return Requests Management
app.get('/api/admin/return-requests', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const returnRequests = await dbAPI.getReturnRequests({ status, page, limit });
    res.json({ success: true, returnRequests });
  } catch (error) {
    console.error('Get return requests error:', error);
    res.status(500).json({ error: 'Failed to fetch return requests' });
  }
});

app.put('/api/admin/return-requests/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const returnRequestId = req.params.id;
    const updateData = req.body;
    const returnRequest = await dbAPI.updateReturnRequest(returnRequestId, updateData);
    res.json({ success: true, returnRequest });
  } catch (error) {
    console.error('Update return request error:', error);
    res.status(500).json({ error: 'Failed to update return request' });
  }
});

// Customer Support Tickets
app.get('/api/admin/support-tickets', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    const tickets = await dbAPI.getSupportTickets({ status, priority, page, limit });
    res.json({ success: true, tickets });
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch support tickets' });
  }
});

app.put('/api/admin/support-tickets/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const updateData = req.body;
    const ticket = await dbAPI.updateSupportTicket(ticketId, updateData);
    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Update support ticket error:', error);
    res.status(500).json({ error: 'Failed to update support ticket' });
  }
});

// Loyalty Points Management
app.get('/api/admin/loyalty-points', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;
    const loyaltyData = await dbAPI.getLoyaltyPoints({ userId, page, limit });
    res.json({ success: true, loyaltyData });
  } catch (error) {
    console.error('Get loyalty points error:', error);
    res.status(500).json({ error: 'Failed to fetch loyalty points' });
  }
});

// Payment Settlements
app.get('/api/admin/payment-settlements', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const settlements = await dbAPI.getPaymentSettlements({ status, page, limit });
    res.json({ success: true, settlements });
  } catch (error) {
    console.error('Get payment settlements error:', error);
    res.status(500).json({ error: 'Failed to fetch payment settlements' });
  }
});

// Enhanced Order Management with Warehouse Assignment
app.put('/api/admin/orders/:id/assign-warehouse', requireAuth, requireAdmin, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { warehouseId } = req.body;

    const order = await dbAPI.assignWarehouseToOrder(orderId, warehouseId);
    res.json({ success: true, order });
  } catch (error) {
    console.error('Assign warehouse to order error:', error);
    res.status(500).json({ error: 'Failed to assign warehouse to order' });
  }
});

// Enhanced Order Status Updates with Detailed Status
app.put('/api/admin/orders/:id/detailed-status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { detailedStatus, notes } = req.body;

    const order = await dbAPI.updateOrderDetailedStatus(orderId, detailedStatus, notes);
    res.json({ success: true, order });
  } catch (error) {
    console.error('Update order detailed status error:', error);
    res.status(500).json({ error: 'Failed to update order detailed status' });
  }
});

// Extended Admin Return Management
app.get('/api/admin/return-requests', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, page, limit } = req.query;
    const filters = {
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20
    };

    const returnRequests = await dbAPI.getReturnRequests(filters);
    res.json({ success: true, returnRequests });
  } catch (error) {
    console.error('Get return requests error:', error);
    res.status(500).json({ error: 'Failed to fetch return requests' });
  }
});

// User-facing Return Request Creation
app.post('/api/returns', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const returnData = { ...req.body, user_id: userId };
    const returnRequest = await dbAPI.createReturnRequest(returnData);
    res.json({ success: true, returnRequest });
  } catch (error) {
    console.error('Create return request error:', error);
    res.status(500).json({ error: 'Failed to create return request' });
  }
});

// User Support Ticket Creation
app.post('/api/support/tickets', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const ticketData = { ...req.body, user_id: userId };
    const ticket = await dbAPI.createSupportTicket(ticketData);
    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
});

// User Loyalty Points
app.get('/api/user/loyalty', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const loyaltyData = await dbAPI.getUserLoyaltyPoints(userId);
    res.json({ success: true, loyaltyData });
  } catch (error) {
    console.error('Get user loyalty error:', error);
    res.status(500).json({ error: 'Failed to fetch loyalty data' });
  }
});

// ==================== WISHLIST ROUTES ====================

// Get user wishlist
app.get('/api/users/:userId/wishlist', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure user is accessing their own wishlist
    if (req.userId !== parseInt(userId) && !req.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access to wishlist' });
    }

    const wishlist = await db.prepare(`
      SELECT w.*, p.name as product_name, p.selling_price, p.slug,
  (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image_url
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ?
  ORDER BY w.created_at DESC
    `).all(userId);

    res.json({ success: true, wishlist });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add to wishlist
app.post('/api/users/:userId/wishlist', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId } = req.body;

    if (req.userId !== parseInt(userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if already in wishlist
    const existing = await db.prepare('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?').get(userId, productId);
    if (existing) {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }

    const result = await db.prepare('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)').run(userId, productId);

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove from wishlist
app.delete('/api/users/:userId/wishlist/:productId', requireAuth, async (req, res) => {
  try {
    const { userId, productId } = req.params;

    if (req.userId !== parseInt(userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db.prepare('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?').run(userId, productId);

    res.json({ success: true });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// ==================== REVIEWS & FEATURED ROUTES ====================
// NOTE: These endpoints are already defined earlier in the file (lines 873, 1730, 1759)
// Duplicates removed to avoid conflicts


// ==================== ERROR HANDLING ====================

// 404 handler
app.use(async (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Internal server error' });
});


// ==================== SERVER START ====================

// ==================== SERVER START ====================

async function startServer() {
  try {
    console.log('🚀 Starting Enterprise E-commerce Server...');

    // 1. Core Database Migration (PostgreSQL only)
    if (usePostgres) {
      console.log('📦 Running Core Migration...');
      await migrateDatabase();
    }

    // 2. Professional Workflow Migration
    console.log('🛠️ Running Professional Workflow Migration...');
    await migrateToProfessionalWorkflow();

    // 3. User Profile Columns
    console.log('👤 Verifying User Profile Columns...');
    await ensureUserProfileColumns();

    // 4. Start Server
    const server = app.listen(PORT, '0.0.0.0', () => {
      const actualPort = server.address().port;
      console.log(`\n✅ Server successfully started on port ${actualPort}`);
      console.log(`🗄️  Database: ${usePostgres ? 'PostgreSQL' : 'SQLite'}`);
      console.log(`🔒 Authentication: JWT Enabled`);
      console.log(`\nReady to accept requests!`);
    });

  } catch (err) {
    console.error('❌ FATAL: Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

module.exports = app;
