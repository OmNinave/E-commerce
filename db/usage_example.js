// Example of how to use the database in your e-commerce application

const fs = require('fs');
const path = require('path');

// Load the database
const database = require('./full_database.json');

// Example functions to access the data

// Get all users
function getAllUsers() {
  return database.users;
}

// Get all products
function getAllProducts() {
  return database.products;
}

// Get purchase history for a specific user
function getUserPurchaseHistory(userId) {
  return database.purchaseHistory.filter(purchase => purchase.userId === userId);
}

// Get all purchases for a specific product
function getProductPurchaseHistory(productId) {
  return database.purchaseHistory.filter(purchase => purchase.productId === productId);
}

// Get top selling products
function getTopSellingProducts(limit = 5) {
  return database.products
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, limit);
}

// Get recent purchases (last 30 days)
function getRecentPurchases(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return database.purchaseHistory
    .filter(purchase => new Date(purchase.purchaseDate) >= cutoffDate)
    .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
}

// Example usage
console.log('=== E-commerce Database Usage Examples ===\n');

console.log('Total Users:', database.users.length);
console.log('Total Products:', database.products.length);
console.log('Total Purchases:', database.purchaseHistory.length);

console.log('\n--- Sample Users ---');
getAllUsers().slice(0, 3).forEach(user => {
  console.log(`- ${user.name} (${user.email}) - Registered: ${user.registrationDate}`);
});

console.log('\n--- Sample Products ---');
getAllProducts().slice(0, 3).forEach(product => {
  console.log(`- ${product.productName} - Quantity: ${product.currentQuantity}, Sold: ${product.totalSold}`);
});

console.log('\n--- Top 3 Selling Products ---');
getTopSellingProducts(3).forEach(product => {
  console.log(`- ${product.productName} - Sold: ${product.totalSold}`);
});

console.log('\n--- Recent Purchases ---');
getRecentPurchases(7).slice(0, 3).forEach(purchase => {
  console.log(`- ${purchase.productName} (${purchase.quantity} units) purchased by ${purchase.userId} on ${purchase.purchaseDate}`);
});