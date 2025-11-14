const fs = require('fs');
const path = require('path');

// ============================================
// UNIFIED DATABASE GENERATOR
// ============================================
// This script creates/updates unified_database.json with:
// - All products from products.js (synced/updated)
// - Existing users preserved (or demo users if empty)
// - Existing orders preserved (or demo orders if empty)
// - Purchase history maintained
// - All analytics-ready timestamps
// ============================================

const unifiedDbPath = path.join(__dirname, 'unified_database.json');
const productsFilePath = path.join(__dirname, '../src/data/products.js');

// Load existing database if it exists
function loadExistingDb() {
  try {
    if (fs.existsSync(unifiedDbPath)) {
      const content = fs.readFileSync(unifiedDbPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.log('⚠️  Existing database not found or invalid, will create new one');
  }
  return null;
}

// Extract products from products.js
function extractProductsFromFile() {
  const productsContent = fs.readFileSync(productsFilePath, 'utf8');
  
  // Clean up the content
  let productsContentClean = productsContent;
  // Remove import statements
  productsContentClean = productsContentClean.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '');
  // Replace image references with placeholder
  productsContentClean = productsContentClean.replace(/image:\s*productImage/g, 'image: "/img/product-placeholder.png"');
  productsContentClean = productsContentClean.replace(/image:\s*['"][^'"]*['"]/g, 'image: "/img/product-placeholder.png"');
  
  // Extract the products array
  const productsMatch = productsContentClean.match(/export const products = (\[[\s\S]*?\]);/);
  if (!productsMatch) {
    console.error('❌ Could not extract products from products.js');
    console.error('Make sure products.js has: export const products = [...]');
    process.exit(1);
  }
  
  // Evaluate the products array
  let products;
  try {
    const productsCode = productsMatch[1];
    products = new Function('return ' + productsCode)();
    
    if (!Array.isArray(products)) {
      throw new Error('Products is not an array');
    }
    
    console.log(`✅ Extracted ${products.length} products from products.js`);
  } catch (error) {
    console.error('❌ Error parsing products:', error.message);
    process.exit(1);
  }
  
  return products;
}

// Generate realistic prices for products
const priceRanges = {
  'analytical': { min: 50000, max: 500000 },
  'centrifuge': { min: 80000, max: 400000 },
  'detection': { min: 60000, max: 350000 },
  'molecular': { min: 100000, max: 600000 },
  'preparation': { min: 40000, max: 300000 },
  'environmental': { min: 30000, max: 250000 },
  'measurement': { min: 20000, max: 150000 },
  'chromatography': { min: 150000, max: 800000 },
  'drying': { min: 50000, max: 400000 }
};

// Sync products from products.js to database
function syncProducts(existingDb) {
  const rawProducts = extractProductsFromFile();
  const existingProducts = existingDb?.products || [];
  
  // Create a map of existing products by ID for quick lookup
  const existingProductsMap = new Map();
  existingProducts.forEach(p => {
    existingProductsMap.set(p.id, p);
  });
  
  // Process each product from products.js
  const syncedProducts = rawProducts.map((product, index) => {
    const category = product.category?.toLowerCase() || 'analytical';
    const range = priceRanges[category] || priceRanges['analytical'];
    
    // Check if product already exists in database
    const existingProduct = existingProductsMap.get(product.id);
    
    // Preserve sales data if product exists
    let currentQuantity = product.currentQuantity;
    let totalSold = product.totalSold || 0;
    
    if (existingProduct) {
      // Preserve existing sales data
      currentQuantity = existingProduct.currentQuantity !== undefined ? existingProduct.currentQuantity : currentQuantity;
      totalSold = existingProduct.totalSold || 0;
    } else {
      // New product - initialize with default values
      if (currentQuantity === undefined) {
        currentQuantity = Math.floor(Math.random() * 30) + 20; // Stock between 20-50
      }
    }
    
    // Generate price if not set
    let price = product.price;
    let originalPrice = product.originalPrice || product.price;
    
    if (!price || price === 0) {
      const basePrice = Math.floor(Math.random() * (range.max - range.min) + range.min);
      const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 20) + 5 : 0;
      price = discount > 0 ? Math.floor(basePrice * (1 - discount / 100)) : basePrice;
      originalPrice = discount > 0 ? basePrice : price;
    }
    
    // Initialize product sales history and restock history if new product
    let salesHistory = existingProduct?.salesHistory || [];
    let restockHistory = existingProduct?.restockHistory || [];
    let inProcessOrders = existingProduct?.inProcessOrders || [];
    
    // If new product, initialize with empty arrays
    if (!existingProduct) {
      salesHistory = [];
      restockHistory = [];
      inProcessOrders = [];
      
      // Generate initial restock if needed
      if (currentQuantity > 0) {
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
        restockHistory.push({
          date: twoMonthsAgo.toISOString().split('T')[0],
          quantity: currentQuantity,
          reason: 'initial_stock'
        });
      }
    }
    
    // Merge product data - preserve all fields from products.js
    return {
      ...product, // All fields from products.js (overview, features, specifications, etc.)
      id: product.id || `product_${index + 1}`,
      name: product.name || 'Unnamed Product',
      category: product.category || 'analytical',
      price: price,
      originalPrice: originalPrice,
      currentQuantity: currentQuantity,
      totalSold: totalSold, // Preserve existing sales
      image: product.image || '/img/product-placeholder.png',
      // Enhanced fields for analytics
      salesHistory: salesHistory, // Individual unit sales with dates (last 2 months)
      restockHistory: restockHistory, // Restock dates and quantities
      inProcessOrders: inProcessOrders, // Currently processing orders
      // Ensure all product detail fields exist
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
  
  console.log(`✅ Synced ${syncedProducts.length} products (preserved ${existingProducts.length} existing sales data)`);
  return syncedProducts;
}

// Generate demo users (only if database is empty)
function generateDemoUsers() {
  const now = new Date();
  const twoMonthsAgo = new Date(now);
  twoMonthsAgo.setMonth(now.getMonth() - 2);
  
  const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Robert', 'Amanda', 'James', 'Lisa', 'William', 'Ashley', 'Richard', 'Michelle', 'Joseph', 'Kimberly', 'Thomas', 'Melissa', 'Charles', 'Nicole', 'Daniel', 'Stephanie', 'Matthew', 'Jennifer', 'Anthony'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark'];
  
  const users = [];
  for (let i = 1; i <= 25; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    
    // Registration date within past 2 months
    const daysAgo = Math.floor(Math.random() * 60);
    const registrationDate = new Date(now);
    registrationDate.setDate(now.getDate() - daysAgo);
    
    // Last login within past 30 days (if registered more than 7 days ago)
    let lastLoginDate = new Date(registrationDate);
    if (daysAgo > 7) {
      const loginDaysAgo = Math.floor(Math.random() * Math.min(30, daysAgo));
      lastLoginDate = new Date(now);
      lastLoginDate.setDate(now.getDate() - loginDaysAgo);
    }
    
    // Hash password for demo users
    const crypto = require('crypto');
    const hashedPassword = crypto.createHash('sha256').update('demo123').digest('hex');
    
    users.push({
      id: `user${String(i).padStart(3, '0')}`,
      name: fullName,
      email: email,
      password: hashedPassword, // Demo password: demo123
      registrationDate: registrationDate.toISOString().split('T')[0],
      accountCreatedDate: registrationDate.toISOString().split('T')[0],
      isNewUser: daysAgo <= 30,
      lastLoginDate: lastLoginDate.toISOString().split('T')[0],
      // Enhanced fields for analytics
      purchaseHistory: [], // Will be populated when orders are generated
      totalSpent: 0,
      totalOrders: 0
    });
  }
  
  return users;
}

// Generate demo orders (only if database is empty)
function generateDemoOrders(users, products) {
  const orders = [];
  const purchaseHistory = [];
  let orderIdCounter = 1;
  
  // Generate orders for each user
  users.forEach(user => {
    const userOrderCount = Math.floor(Math.random() * 4) + 1; // 1-4 orders per user
    
    for (let o = 0; o < userOrderCount; o++) {
      const now = new Date();
      const regDate = new Date(user.registrationDate);
      const daysSinceReg = Math.floor(Math.random() * 45);
      const orderDate = new Date(regDate);
      orderDate.setDate(regDate.getDate() + daysSinceReg);
      
      // Only create orders in the past
      if (orderDate > now) continue;
      
      // Select 1-5 random products
      const orderItemCount = Math.floor(Math.random() * 5) + 1;
      const selectedProducts = [];
      const usedProductIds = new Set();
      
      for (let p = 0; p < orderItemCount; p++) {
        let product;
        let attempts = 0;
        do {
          product = products[Math.floor(Math.random() * products.length)];
          attempts++;
        } while (usedProductIds.has(product.id) && attempts < 10);
        
        if (product && !usedProductIds.has(product.id)) {
          usedProductIds.add(product.id);
          const quantity = Math.floor(Math.random() * 3) + 1;
          selectedProducts.push({ product, quantity });
        }
      }
      
      if (selectedProducts.length === 0) continue;
      
      // Calculate order total
      const orderTotal = selectedProducts.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
      }, 0);
      
      const orderId = `ORD${String(orderIdCounter++).padStart(6, '0')}`;
      
      // Determine order status with realistic distribution
      const statusRand = Math.random();
      let orderStatus = 'completed';
      if (statusRand < 0.1) {
        orderStatus = 'pending';
      } else if (statusRand < 0.3) {
        orderStatus = 'processing';
      } else if (statusRand < 0.5) {
        orderStatus = 'shipped';
      } else {
        orderStatus = 'completed';
      }
      
      // Generate shipping info for shipped/completed orders
      let shippingInfo = null;
      if (orderStatus === 'shipped' || orderStatus === 'completed') {
        const shippingDate = new Date(orderDate);
        shippingDate.setDate(shippingDate.getDate() + Math.floor(Math.random() * 5) + 1);
        shippingInfo = {
          shippedDate: shippingDate.toISOString().split('T')[0],
          trackingNumber: `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          carrier: ['FedEx', 'DHL', 'UPS', 'India Post'][Math.floor(Math.random() * 4)],
          estimatedDelivery: new Date(shippingDate.getTime() + (3 + Math.floor(Math.random() * 4)) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
      }
      
      orders.push({
        orderId: orderId,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        orderDate: orderDate.toISOString().split('T')[0],
        status: orderStatus,
        totalAmount: orderTotal,
        shippingInfo: shippingInfo,
        items: selectedProducts.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          subtotal: item.product.price * item.quantity
        }))
      });
      
      // Add to purchase history and update product/user data
      selectedProducts.forEach(item => {
        const purchaseDate = orderDate.toISOString().split('T')[0];
        
        // Add to purchase history
        purchaseHistory.push({
          orderId: orderId,
          userId: user.id,
          productId: item.product.id,
          productName: item.product.name,
          purchaseDate: purchaseDate,
          quantity: item.quantity,
          price: item.product.price
        });
        
        // Update product: add individual unit sales to salesHistory (last 2 months only)
        const product = products.find(p => p.id === item.product.id);
        if (product) {
          product.totalSold = (product.totalSold || 0) + item.quantity;
          
          // Add individual unit sales with dates (for last 2 months)
          const twoMonthsAgo = new Date();
          twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
          const purchaseDateObj = new Date(purchaseDate);
          
          if (purchaseDateObj >= twoMonthsAgo) {
            // Add each unit as a separate sale record
            for (let u = 0; u < item.quantity; u++) {
              if (!product.salesHistory) product.salesHistory = [];
              product.salesHistory.push({
                unitSaleDate: purchaseDate,
                orderId: orderId,
                userId: user.id,
                price: item.product.price
              });
            }
          }
          
          // Add to in-process orders if status is processing/pending
          if (orderStatus === 'processing' || orderStatus === 'pending') {
            if (!product.inProcessOrders) product.inProcessOrders = [];
            product.inProcessOrders.push({
              orderId: orderId,
              userId: user.id,
              quantity: item.quantity,
              orderDate: purchaseDate
            });
          }
        }
        
        // Update user purchase history
        const userObj = users.find(u => u.id === user.id);
        if (userObj) {
          if (!userObj.purchaseHistory) userObj.purchaseHistory = [];
          userObj.purchaseHistory.push({
            orderId: orderId,
            productId: item.product.id,
            productName: item.product.name,
            purchaseDate: purchaseDate,
            quantity: item.quantity,
            price: item.product.price,
            subtotal: item.product.price * item.quantity
          });
          userObj.totalSpent = (userObj.totalSpent || 0) + (item.product.price * item.quantity);
          userObj.totalOrders = (userObj.totalOrders || 0) + 1;
        }
      });
    }
  });
  
  // Sort orders by date (newest first)
  orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  
  return { orders, purchaseHistory };
}

// Main function
function generateUnifiedDatabase() {
  console.log('🔄 Starting unified database generation...\n');
  
  // Load existing database
  const existingDb = loadExistingDb();
  const hasExistingData = existingDb && (
    (existingDb.users && existingDb.users.length > 0) ||
    (existingDb.orders && existingDb.orders.length > 0)
  );
  
  if (hasExistingData) {
    console.log('📦 Found existing database with data:');
    console.log(`   - Users: ${existingDb.users?.length || 0}`);
    console.log(`   - Orders: ${existingDb.orders?.length || 0}`);
    console.log(`   - Products: ${existingDb.products?.length || 0}`);
    console.log('✅ Will preserve existing users and orders\n');
  } else {
    console.log('📝 No existing data found, will generate demo data\n');
  }
  
  // Sync products from products.js (always update products)
  const products = syncProducts(existingDb);
  
  // Preserve existing users or generate demo users
  let users = existingDb?.users || [];
  if (users.length === 0) {
    console.log('👥 Generating demo users...');
    users = generateDemoUsers();
    console.log(`✅ Generated ${users.length} demo users`);
  } else {
    // Ensure existing users have new fields
    users = users.map(user => ({
      ...user,
      purchaseHistory: user.purchaseHistory || [],
      totalSpent: user.totalSpent || 0,
      totalOrders: user.totalOrders || 0
    }));
    console.log(`✅ Preserved ${users.length} existing users`);
  }
  
  // Preserve existing orders or generate demo orders
  let orders = existingDb?.orders || [];
  let purchaseHistory = existingDb?.purchaseHistory || [];
  
  if (orders.length === 0) {
    console.log('🛒 Generating demo orders...');
    const demoData = generateDemoOrders(users, products);
    orders = demoData.orders;
    purchaseHistory = demoData.purchaseHistory;
    console.log(`✅ Generated ${orders.length} demo orders`);
  } else {
    // Ensure existing orders have shipping info
    orders = orders.map(order => ({
      ...order,
      shippingInfo: order.shippingInfo || null
    }));
    console.log(`✅ Preserved ${orders.length} existing orders`);
    console.log(`✅ Preserved ${purchaseHistory.length} purchase history items`);
  }
  
  // Update products with sales history from purchase history (last 2 months)
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  
  products.forEach(product => {
    // If product doesn't have salesHistory, generate from purchaseHistory
    if (!product.salesHistory || product.salesHistory.length === 0) {
      product.salesHistory = [];
      const productPurchases = purchaseHistory.filter(p => 
        (p.productId === product.id || p.productId === product.productId) &&
        new Date(p.purchaseDate) >= twoMonthsAgo
      );
      
      productPurchases.forEach(purchase => {
        for (let u = 0; u < purchase.quantity; u++) {
          product.salesHistory.push({
            unitSaleDate: purchase.purchaseDate,
            orderId: purchase.orderId,
            userId: purchase.userId,
            price: purchase.price
          });
        }
      });
    }
    
    // Ensure restock history exists
    if (!product.restockHistory || product.restockHistory.length === 0) {
      product.restockHistory = [{
        date: twoMonthsAgo.toISOString().split('T')[0],
        quantity: product.currentQuantity + (product.totalSold || 0),
        reason: 'initial_stock'
      }];
    }
    
    // Ensure inProcessOrders exists
    if (!product.inProcessOrders) {
      product.inProcessOrders = [];
    }
  });
  
  // Create unified database
  const unifiedDatabase = {
    products: products,
    users: users,
    orders: orders,
    purchaseHistory: purchaseHistory
  };
  
  // Write to file
  fs.writeFileSync(unifiedDbPath, JSON.stringify(unifiedDatabase, null, 2));
  
  console.log('\n✅ Unified database generated successfully!');
  console.log(`📦 Products: ${products.length} (synced from products.js)`);
  console.log(`👥 Users: ${users.length} ${hasExistingData ? '(preserved)' : '(demo)'}`);
  console.log(`🛒 Orders: ${orders.length} ${hasExistingData ? '(preserved)' : '(demo)'}`);
  console.log(`📊 Purchase History Items: ${purchaseHistory.length}`);
  console.log(`\n📁 Saved to: ${unifiedDbPath}`);
  console.log('\n💡 This database is now connected to both website and admin dashboard!');
  console.log('💡 All new user registrations and orders will be saved here in real-time.');
}

// Run the generator
try {
  generateUnifiedDatabase();
} catch (error) {
  console.error('❌ Error generating database:', error);
  process.exit(1);
}
