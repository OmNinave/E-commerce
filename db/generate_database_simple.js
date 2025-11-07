const fs = require('fs');
const path = require('path');

// Load extracted products
const extractedProducts = require('./extracted_products.json');

// Function to generate random date within last 2 months
function getRandomDate() {
  const today = new Date();
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  
  const randomTime = twoMonthsAgo.getTime() + Math.random() * (today.getTime() - twoMonthsAgo.getTime());
  return new Date(randomTime);
}

// Function to format date as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Generate 20 users
const users = [];
for (let i = 1; i <= 20; i++) {
  users.push({
    id: `user${i.toString().padStart(3, '0')}`,
    name: `User ${i}`,
    email: `user${i}@example.com`,
    registrationDate: formatDate(getRandomDate())
  });
}

// Generate purchase data for the past 2 months
const purchaseData = [];

// For each user, generate random purchases
users.forEach(user => {
  // Each user makes between 1-10 purchases
  const numberOfPurchases = Math.floor(Math.random() * 10) + 1;
  
  for (let j = 0; j < numberOfPurchases; j++) {
    // Select a random product
    const randomProduct = extractedProducts[Math.floor(Math.random() * extractedProducts.length)];
    
    // Generate a random purchase date
    const purchaseDate = getRandomDate();
    
    // Generate a random quantity (1-5)
    const quantity = Math.floor(Math.random() * 5) + 1;
    
    purchaseData.push({
      userId: user.id,
      productId: randomProduct.id,
      productName: randomProduct.name,
      purchaseDate: formatDate(purchaseDate),
      quantity: quantity,
      price: randomProduct.originalPrice || 0
    });
  }
});

// Create a product quantity map based on sales data
const productQuantityMap = {};

// Initialize all products with base quantity
extractedProducts.forEach(product => {
  productQuantityMap[product.id] = {
    productId: product.id,
    productName: product.name,
    currentQuantity: 50, // Base quantity
    totalSold: 0
  };
});

// Update quantities based on purchase data
purchaseData.forEach(purchase => {
  if (productQuantityMap[purchase.productId]) {
    productQuantityMap[purchase.productId].currentQuantity -= purchase.quantity;
    productQuantityMap[purchase.productId].totalSold += purchase.quantity;
  }
});

// Ensure no product has negative quantity
Object.values(productQuantityMap).forEach(product => {
  if (product.currentQuantity < 0) {
    product.currentQuantity = 0;
  }
});

// Save data to JSON files
const dbPath = path.join(__dirname, 'database.json');

const database = {
  users: users,
  products: Object.values(productQuantityMap),
  purchaseHistory: purchaseData
};

fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));

console.log('Database generated successfully!');
console.log(`- ${users.length} users created`);
console.log(`- ${Object.values(productQuantityMap).length} products with quantities`);
console.log(`- ${purchaseData.length} purchase records created`);