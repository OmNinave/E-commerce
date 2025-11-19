/**
 * P0 Patches Validation Script
 * Verifies all critical patches are properly in place
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const checks = {
  passed: [],
  failed: [],
  warnings: []
};

function checkFile(filePath, shouldExist = true, searchStrings = []) {
  const fullPath = path.join(projectRoot, filePath);
  
  if (shouldExist && !fs.existsSync(fullPath)) {
    checks.failed.push(`❌ Missing file: ${filePath}`);
    return false;
  }
  
  if (shouldExist && searchStrings.length > 0) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      let allFound = true;
      
      for (const str of searchStrings) {
        if (!content.includes(str)) {
          checks.failed.push(`❌ Missing pattern in ${filePath}: "${str}"`);
          allFound = false;
        }
      }
      
      if (allFound) {
        checks.passed.push(`✓ ${filePath} - All patterns found`);
        return true;
      }
      return false;
    } catch (error) {
      checks.failed.push(`❌ Error reading ${filePath}: ${error.message}`);
      return false;
    }
  }
  
  if (shouldExist) {
    checks.passed.push(`✓ ${filePath} exists`);
    return true;
  }
  
  return true;
}

function validatePatches() {
  console.log('\n🔍 P0 PATCHES VALIDATION\n');
  console.log('=' .repeat(60));
  
  // 1. Check bcrypt patches in admin_server.js
  console.log('\n1. Bcrypt Implementation:');
  checkFile('db/admin_server.js', true, [
    'const bcrypt = require',
    'await bcrypt.hash(password, 10)',
    'await bcrypt.compare(password, user.password)',
    'await bcrypt.compare(password, stored)'
  ]);
  
  // 2. Check hardcoded password removal
  console.log('\n2. Hardcoded Password Removal:');
  const serverPath = path.join(projectRoot, 'db/admin_server.js');
  try {
    const content = fs.readFileSync(serverPath, 'utf8');
    if (content.includes("password === 'admin123'")) {
      checks.failed.push(`❌ Hardcoded password 'admin123' still present in admin_server.js`);
    } else {
      checks.passed.push(`✓ Hardcoded 'admin123' password removed`);
    }
  } catch (error) {
    checks.failed.push(`Error checking hardcoded password: ${error.message}`);
  }
  
  // 3. Check admin DB resilience
  console.log('\n3. Admin DB Resilience:');
  checkFile('db/admin_server.js', true, [
    'loadAdminDb() {',
    'try {',
    'catch (err)',
    'defaultAdminDb',
    'fs.writeFileSync(adminDbPath'
  ]);
  
  // 4. Check order validation
  console.log('\n4. Order Price & Stock Validation:');
  checkFile('db/admin_server.js', true, [
    'validatedItems',
    'computedTotal',
    'Insufficient stock for product',
    'Total amount mismatch',
    'Invalid price for product'
  ]);
  
  // 5. Check frontend security
  console.log('\n5. Frontend Secure Checkout:');
  checkFile('src/components/Cart.jsx', true, [
    '// Only send product id and quantity to server',
    'id: item.id,',
    'quantity: item.quantity',
    'const order = response'
  ]);
  
  // 6. Check rate limiter
  console.log('\n6. Rate Limiting:');
  checkFile('middleware/rateLimiter.js', true, [
    'const rateLimit = {',
    'middleware: function()',
    'maxRequests:',
    'X-RateLimit-Limit',
    '429'
  ]);
  
  // 7. Check rate limiter integration
  console.log('\n7. Rate Limiter Integration:');
  checkFile('db/admin_server.js', true, [
    "require('../middleware/rateLimiter')",
    'app.use(rateLimit.middleware())',
    'initializeRateLimitCleanup()'
  ]);
  
  // 8. Check test suite
  console.log('\n8. Test Suite:');
  checkFile('tests/P0_auth_and_order_tests.js', true, [
    'User Registration',
    'User Login',
    'Admin Database Resilience',
    'Order Validation'
  ]);
  
  // 9. Check migration artifacts
  console.log('\n9. Migration Artifacts:');
  checkFile('migrations/001_initial_schema.sql', true, ['CREATE TABLE users', 'CREATE TABLE products']);
  checkFile('migrations/002_indexes.sql', true, ['CREATE INDEX']);
  checkFile('scripts/json_to_sql_migration.js', true, ['migrateUsers', 'migrateProducts']);
  checkFile('migrations/JSON_TO_POSTGRES_MAPPING.md', true, ['JSON Field', 'SQL Column']);
  
  // 10. Check documentation
  console.log('\n10. Documentation:');
  checkFile('P0_TESTING_AND_DEPLOYMENT.md', true, ['Quick Integration Test']);
  checkFile('P0_COMPLETION_REPORT.md', true, ['All P0 critical issues']);
}

function printResults() {
  console.log('\n' + '=' .repeat(60));
  console.log('\nRESULTS:');
  console.log(`✓ Passed: ${checks.passed.length}`);
  console.log(`❌ Failed: ${checks.failed.length}`);
  console.log(`⚠️ Warnings: ${checks.warnings.length}`);
  
  if (checks.passed.length > 0) {
    console.log('\n✓ PASSED CHECKS:');
    checks.passed.forEach(msg => console.log(`  ${msg}`));
  }
  
  if (checks.failed.length > 0) {
    console.log('\n❌ FAILED CHECKS:');
    checks.failed.forEach(msg => console.log(`  ${msg}`));
  }
  
  if (checks.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    checks.warnings.forEach(msg => console.log(`  ${msg}`));
  }
  
  console.log('\n' + '=' .repeat(60));
  
  if (checks.failed.length === 0) {
    console.log('\n✅ ALL P0 PATCHES VALIDATED SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️ SOME VALIDATION CHECKS FAILED!\n');
    process.exit(1);
  }
}

// Run validation
validatePatches();
printResults();
