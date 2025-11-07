const fs = require('fs');
const path = require('path');

// Read the products file as text
const productsFilePath = path.join(__dirname, '../src/data/products.js');
const productsFileContent = fs.readFileSync(productsFilePath, 'utf8');

// Extract the products array using regex
const productsArrayMatch = productsFileContent.match(/export const products = \[([\s\S]*?)\];/);
if (!productsArrayMatch) {
  console.error('Could not find products array in file');
  process.exit(1);
}

// Extract individual product objects
const productsContent = productsArrayMatch[1];

// Simple parser to extract product objects
let products = [];
let bracketCount = 0;
let currentProduct = '';
let inProduct = false;

// Split by top-level objects
const lines = productsContent.split('\n');
for (let line of lines) {
  // Skip empty lines and comments
  if (line.trim() === '' || line.trim().startsWith('//')) continue;
  
  if (line.includes('{') && !inProduct) {
    inProduct = true;
    currentProduct = line;
    bracketCount = 1;
  } else if (inProduct) {
    currentProduct += '\n' + line;
    
    // Count brackets
    const openBrackets = (line.match(/{/g) || []).length;
    const closeBrackets = (line.match(/}/g) || []).length;
    bracketCount += openBrackets - closeBrackets;
    
    if (bracketCount === 0) {
      inProduct = false;
      // Process the product object
      try {
        // Remove image property
        let cleanProduct = currentProduct.replace(/image: productImage,/g, '');
        cleanProduct = cleanProduct.replace(/image: productImage/g, '');
        
        // Convert to valid JSON by replacing single quotes with double quotes for keys
        cleanProduct = cleanProduct.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
        
        // Evaluate the object (this is a simple approach, in production you might want to use a proper parser)
        const product = eval(`(${cleanProduct})`);
        products.push(product);
      } catch (e) {
        console.error('Error parsing product:', e);
        console.error('Problematic product content:', currentProduct);
      }
      currentProduct = '';
    }
  }
}

// Save extracted products to a JSON file
const extractedProductsPath = path.join(__dirname, 'extracted_products.json');
fs.writeFileSync(extractedProductsPath, JSON.stringify(products, null, 2));

console.log(`Successfully extracted ${products.length} products`);