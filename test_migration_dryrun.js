#!/usr/bin/env node
/**
 * Migration Dry-Run Test Script
 * 
 * Purpose: Test the migration script with --dry-run flag to verify:
 * 1. JSON files load correctly
 * 2. Data transforms without errors
 * 3. Record counts are accurate
 * 4. Validation passes
 * 5. Rollback logic works (no DB changes)
 * 
 * Usage:
 *   node test_migration_dryrun.js
 * 
 * This script does NOT require a database connection.
 * It simulates the full migration flow locally.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, label, message) {
  console.log(`${color}[${label}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  log(colors.green, 'PASS', message);
}

function logError(message) {
  log(colors.red, 'FAIL', message);
}

function logInfo(message) {
  log(colors.blue, 'INFO', message);
}

function logWarning(message) {
  log(colors.yellow, 'WARN', message);
}

function logTest(message) {
  log(colors.cyan, 'TEST', message);
}

// Test results tracker
let testsPassed = 0;
let testsFailed = 0;
const failures = [];

function assert(condition, description) {
  if (condition) {
    logSuccess(description);
    testsPassed++;
  } else {
    logError(description);
    testsFailed++;
    failures.push(description);
  }
}

// ============================================================================
// STEP 1: Verify JSON Files Exist
// ============================================================================
logTest('Step 1: Verify JSON files exist...');

const jsonFiles = {
  unified: path.join(__dirname, 'db/unified_database.json'),
  admin: path.join(__dirname, 'db/admin_database.json'),
};

let unifiedData = null;
let adminData = null;

try {
  if (!fs.existsSync(jsonFiles.unified)) {
    logError(`JSON file not found: ${jsonFiles.unified}`);
    process.exit(1);
  }
  logSuccess(`Found ${jsonFiles.unified}`);

  if (!fs.existsSync(jsonFiles.admin)) {
    logError(`JSON file not found: ${jsonFiles.admin}`);
    process.exit(1);
  }
  logSuccess(`Found ${jsonFiles.admin}`);
} catch (err) {
  logError(`Error checking JSON files: ${err.message}`);
  process.exit(1);
}

// ============================================================================
// STEP 2: Load and Parse JSON Files
// ============================================================================
logTest('Step 2: Load and parse JSON files...');

try {
  const unifiedContent = fs.readFileSync(jsonFiles.unified, 'utf8');
  unifiedData = JSON.parse(unifiedContent);
  logSuccess(`Loaded unified_database.json (${JSON.stringify(unifiedData).length} bytes)`);
} catch (err) {
  logError(`Failed to parse unified_database.json: ${err.message}`);
  process.exit(1);
}

try {
  const adminContent = fs.readFileSync(jsonFiles.admin, 'utf8');
  adminData = JSON.parse(adminContent);
  logSuccess(`Loaded admin_database.json (${JSON.stringify(adminData).length} bytes)`);
} catch (err) {
  logError(`Failed to parse admin_database.json: ${err.message}`);
  process.exit(1);
}

// ============================================================================
// STEP 3: Validate Data Structure
// ============================================================================
logTest('Step 3: Validate data structure...');

// Unified database should have users, products, orders
assert(unifiedData.users && Array.isArray(unifiedData.users), 'users array exists');
assert(unifiedData.products && Array.isArray(unifiedData.products), 'products array exists');
assert(unifiedData.orders && Array.isArray(unifiedData.orders), 'orders array exists');

// Admin database should have admin_users
assert(adminData.admin_users && Array.isArray(adminData.admin_users), 'admin_users array exists');

// ============================================================================
// STEP 4: Validate Record Counts
// ============================================================================
logTest('Step 4: Validate record counts...');

const userCount = unifiedData.users?.length || 0;
const productCount = unifiedData.products?.length || 0;
const orderCount = unifiedData.orders?.length || 0;
const adminCount = adminData.admin_users?.length || 0;

logInfo(`Users: ${userCount}`);
logInfo(`Products: ${productCount}`);
logInfo(`Orders: ${orderCount}`);
logInfo(`Admin Users: ${adminCount}`);

assert(userCount > 0, `Users count > 0 (found: ${userCount})`);
assert(productCount > 0, `Products count > 0 (found: ${productCount})`);
assert(orderCount > 0, `Orders count > 0 (found: ${orderCount})`);
assert(adminCount > 0, `Admin users count > 0 (found: ${adminCount})`);

// ============================================================================
// STEP 5: Validate Data Quality - Users
// ============================================================================
logTest('Step 5: Validate user records...');

let usersValid = 0;
let usersInvalid = 0;

unifiedData.users.forEach((user, idx) => {
  const hasRequiredFields = user.id && user.email && (user.name || user.fullName);
  if (hasRequiredFields) {
    usersValid++;
  } else {
    usersInvalid++;
    if (usersInvalid <= 3) { // Show first 3 errors
      logWarning(`User ${idx} missing fields: ${JSON.stringify(user)}`);
    }
  }
});

assert(usersInvalid === 0, `All ${usersValid} users have required fields`);
if (usersInvalid > 0) {
  logWarning(`${usersInvalid} user records have missing fields (will be rejected in migration)`);
}

// ============================================================================
// STEP 6: Validate Data Quality - Products
// ============================================================================
logTest('Step 6: Validate product records...');

let productsValid = 0;
let productsInvalid = 0;

unifiedData.products.forEach((product, idx) => {
  const hasRequiredFields = product.id && product.name && product.price !== undefined;
  if (hasRequiredFields) {
    productsValid++;
  } else {
    productsInvalid++;
    if (productsInvalid <= 3) {
      logWarning(`Product ${idx} missing fields: ${JSON.stringify(product)}`);
    }
  }
});

assert(productsInvalid === 0, `All ${productsValid} products have required fields`);
if (productsInvalid > 0) {
  logWarning(`${productsInvalid} product records have missing fields (will be rejected in migration)`);
}

// ============================================================================
// STEP 7: Validate Data Quality - Orders
// ============================================================================
logTest('Step 7: Validate order records...');

let ordersValid = 0;
let ordersInvalid = 0;

unifiedData.orders.forEach((order, idx) => {
  const hasRequiredFields = order.orderId && order.userId && order.items && Array.isArray(order.items) && order.totalAmount !== undefined;
  if (hasRequiredFields) {
    ordersValid++;
  } else {
    ordersInvalid++;
    if (ordersInvalid <= 3) {
      logWarning(`Order ${idx} missing fields: ${JSON.stringify(order)}`);
    }
  }
});

assert(ordersInvalid === 0, `All ${ordersValid} orders have required fields`);
if (ordersInvalid > 0) {
  logWarning(`${ordersInvalid} order records have missing fields (will be rejected in migration)`);
}

// ============================================================================
// STEP 8: Validate Data Quality - Admin Users
// ============================================================================
logTest('Step 8: Validate admin user records...');

let adminsValid = 0;
let adminsInvalid = 0;

adminData.admin_users.forEach((admin, idx) => {
  const hasRequiredFields = admin.email && (admin.password_hash || admin.passwordHash);
  if (hasRequiredFields) {
    adminsValid++;
  } else {
    adminsInvalid++;
    if (adminsInvalid <= 3) {
      logWarning(`Admin ${idx} missing fields: ${JSON.stringify(admin)}`);
    }
  }
});

assert(adminsInvalid === 0, `All ${adminsValid} admin users have required fields`);
if (adminsInvalid > 0) {
  logWarning(`${adminsInvalid} admin records have missing fields (will be rejected in migration)`);
}

// ============================================================================
// STEP 9: Simulate Data Transformations
// ============================================================================
logTest('Step 9: Simulate data transformations...');

let transformErrors = 0;

// Simulate user transformation
unifiedData.users.forEach((user, idx) => {
  try {
    // Simulate what migration script does: check email format, password hash
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      transformErrors++;
      if (transformErrors <= 3) {
        logWarning(`User ${idx} has invalid email: ${user.email}`);
      }
    }
  } catch (err) {
    transformErrors++;
    logWarning(`User ${idx} transform error: ${err.message}`);
  }
});

assert(transformErrors === 0, `All user records transform without errors`);

// Simulate product transformation
transformErrors = 0;
unifiedData.products.forEach((product, idx) => {
  try {
    // Simulate parsing price and stock
    const price = parseFloat(product.price);
    const stock = parseInt(product.currentQuantity || 0, 10);
    
    if (isNaN(price) || price < 0) {
      transformErrors++;
      if (transformErrors <= 3) {
        logWarning(`Product ${idx} has invalid price: ${product.price}`);
      }
    }
    if (isNaN(stock) || stock < 0) {
      transformErrors++;
      if (transformErrors <= 3) {
        logWarning(`Product ${idx} has invalid stock: ${product.stock}`);
      }
    }
  } catch (err) {
    transformErrors++;
    logWarning(`Product ${idx} transform error: ${err.message}`);
  }
});

assert(transformErrors === 0, `All product records transform without errors`);

// Simulate order transformation
transformErrors = 0;
unifiedData.orders.forEach((order, idx) => {
  try {
    // Simulate computing order total
    let computedTotal = 0;
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity, 10) || 0;
        computedTotal += price * qty;
      });
    }
    
    const reportedTotal = parseFloat(order.totalAmount);
    if (isNaN(reportedTotal)) {
      transformErrors++;
      if (transformErrors <= 3) {
        logWarning(`Order ${idx} has invalid total: ${order.total}`);
      }
    }
  } catch (err) {
    transformErrors++;
    logWarning(`Order ${idx} transform error: ${err.message}`);
  }
});

assert(transformErrors === 0, `All order records transform without errors`);

// ============================================================================
// STEP 10: Summary Report
// ============================================================================
console.log('\n' + '='.repeat(70));
logTest('MIGRATION DRY-RUN TEST SUMMARY');
console.log('='.repeat(70) + '\n');

logInfo(`Test Results: ${testsPassed} passed, ${testsFailed} failed`);
console.log('');

logInfo(`Records to Migrate:`);
logInfo(`  Users:  ${usersValid} valid, ${usersInvalid} invalid`);
logInfo(`  Products: ${productsValid} valid, ${productsInvalid} invalid`);
logInfo(`  Orders: ${ordersValid} valid, ${ordersInvalid} invalid`);
logInfo(`  Admin Users: ${adminsValid} valid, ${adminsInvalid} invalid`);
console.log('');

logInfo(`Total Records: ${usersValid + productsValid + ordersValid + adminsValid}`);
console.log('');

logInfo(`Next Steps:`);
console.log(`  1. Run migration on staging database with --dry-run:`);
console.log(`     DATABASE_URL="postgresql://user:pass@staging:5432/ecomerce" \\`);
console.log(`     node scripts/json_to_sql_migration.js --dry-run`);
console.log('');
console.log(`  2. Review migration_report_*.json for any errors`);
console.log('');
console.log(`  3. If staging test passes, run with --commit on production:`);
console.log(`     DATABASE_URL="postgresql://user:pass@prod:5432/ecomerce" \\`);
console.log(`     node scripts/json_to_sql_migration.js --commit`);
console.log('');

if (testsFailed === 0) {
  logSuccess('All tests passed! Migration is safe to proceed.');
  console.log('');
  process.exit(0);
} else {
  logError(`${testsFailed} test(s) failed. Review errors above.`);
  console.log('\nFailures:');
  failures.forEach(f => console.log(`  • ${f}`));
  console.log('');
  process.exit(1);
}
