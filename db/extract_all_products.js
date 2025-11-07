const fs = require('fs');
const path = require('path');

// Read the products file as text
const productsFilePath = path.join(__dirname, '../src/data/products.js');
let productsFileContent = fs.readFileSync(productsFilePath, 'utf8');

// Remove the import statement and export statement
productsFileContent = productsFileContent.replace(/import.*?;\n/, '');
productsFileContent = productsFileContent.replace(/export const products = \[\n/, '[');
productsFileContent = productsFileContent.replace(/\];\s*$/, ']');

// Replace productImage references with null
productsFileContent = productsFileContent.replace(/image: productImage,/g, 'image: null,');
productsFileContent = productsFileContent.replace(/image: productImage/g, 'image: null');

// Fix any remaining syntax issues
productsFileContent = productsFileContent.replace(/'/g, '"');
productsFileContent = productsFileContent.replace(/(\w+):/g, '"$1":');

// Parse the JSON
try {
  const products = JSON.parse(productsFileContent);
  
  // Save extracted products to a JSON file
  const extractedProductsPath = path.join(__dirname, 'all_products.json');
  fs.writeFileSync(extractedProductsPath, JSON.stringify(products, null, 2));
  
  console.log(`Successfully extracted ${products.length} products`);
} catch (error) {
  console.error('Error parsing products:', error);
  
  // Try a different approach - manual parsing
  console.log('Trying manual parsing approach...');
  
  // Extract product objects manually
  const products = [];
  let productMatch;
  const productRegex = /{\s*id:.*?}(?=\s*[,\]])/gs;
  
  let match;
  while ((match = productRegex.exec(productsFileContent)) !== null) {
    try {
      // Clean up the match
      let productStr = match[0];
      productStr = productStr.replace(/image: productImage,/g, '');
      productStr = productStr.replace(/image: productImage/g, '');
      
      // This is a complex parsing task, so let's just extract the basic info we need
      const idMatch = productStr.match(/id:\s*['"]([^'"]+)['"]/);
      const nameMatch = productStr.match(/name:\s*['"]([^'"]+)['"]/);
      const productIdMatch = productStr.match(/productId:\s*['"]([^'"]+)['"]/);
      
      if (idMatch && nameMatch) {
        products.push({
          id: idMatch[1],
          name: nameMatch[1],
          productId: productIdMatch ? productIdMatch[1] : idMatch[1]
        });
      }
    } catch (e) {
      console.error('Error processing product:', e);
    }
  }
  
  if (products.length > 0) {
    // Save extracted products to a JSON file
    const extractedProductsPath = path.join(__dirname, 'all_products.json');
    fs.writeFileSync(extractedProductsPath, JSON.stringify(products, null, 2));
    
    console.log(`Successfully extracted ${products.length} products using manual parsing`);
  } else {
    console.log('Could not extract products using either method');
  }
}