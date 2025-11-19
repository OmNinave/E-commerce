/**
 * JSON to PostgreSQL Migration Script
 * File: scripts/json_to_sql_migration.js
 *
 * Migrates data from unified_database.json and admin_database.json to PostgreSQL.
 *
 * Prerequisites:
 * - PostgreSQL server running and database created (ecommerce_db)
 * - Schema created by running migrations/001_initial_schema.sql
 * - Indexes created by running migrations/002_indexes.sql
 * - npm packages installed: pg
 *
 * Usage:
 *   DATABASE_URL="postgresql://user:password@localhost/ecommerce_db" node scripts/json_to_sql_migration.js
 *
 * Or create a .env file with DATABASE_URL and run:
 *   node scripts/json_to_sql_migration.js
 *
 * Safety:
 * - This script DOES NOT delete data from JSON files (they are preserved as backup)
 * - All operations are wrapped in transactions for atomicity
 * - A detailed migration report is generated and saved to logs/migration_report.json
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const readline = require('readline');
require('dotenv').config();  // Load .env file if present

// ============================================================================
// CLI ARGUMENTS
// ============================================================================

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isCommit = args.includes('--commit');

if (isDryRun && isCommit) {
  console.error('Cannot use both --dry-run and --commit. Choose one.');
  process.exit(1);
}

const RUN_MODE = isDryRun ? 'DRY_RUN' : (isCommit ? 'COMMIT' : 'DRY_RUN');

// ============================================================================
// CONFIGURATION
// ============================================================================

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ecommerce_db';
const JSON_DB_PATH = path.join(__dirname, '../db/unified_database.json');
const ADMIN_DB_PATH = path.join(__dirname, '../db/admin_database.json');
const LOGS_DIR = path.join(__dirname, '../logs');
const REPORT_FILE = path.join(LOGS_DIR, 'migration_report_' + Date.now() + '.json');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// ============================================================================
// LOGGING AND REPORTING
// ============================================================================

const report = {
  startTime: new Date().toISOString(),
  status: 'in-progress',
  summary: {},
  errors: [],
  warnings: [],
  details: {
    users: { migrated: 0, failed: 0, skipped: 0 },
    products: { migrated: 0, failed: 0, skipped: 0 },
    orders: { migrated: 0, failed: 0, skipped: 0 },
    orderItems: { migrated: 0, failed: 0, skipped: 0 },
    purchaseHistory: { migrated: 0, failed: 0, skipped: 0 },
    adminUsers: { migrated: 0, failed: 0, skipped: 0 }
  }
};

function logMessage(type, message, details = null) {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, type, message, details };
  // Store all logs in the report for easier post-run analysis
  if (!report.logs) report.logs = [];
  report.logs.push(logEntry);

  if (type === 'error') {
    console.error(`ERROR [${timestamp}] ${message}`, details || '');
    report.errors.push(logEntry);
  } else if (type === 'warning') {
    console.warn(`WARN  [${timestamp}] ${message}`, details || '');
    report.warnings.push(logEntry);
  } else {
    console.log(`INFO  [${timestamp}] ${message}`, details || '');
  }
}

function saveReport() {
  report.endTime = new Date().toISOString();
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(`Migration report saved to: ${REPORT_FILE}`);
}

// Interactive confirmation prompt
async function confirmMigration(summary) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\n' + '='.repeat(60));
    console.log('MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Users:            ${summary.users}`);
    console.log(`  Products:         ${summary.products}`);
    console.log(`  Orders:           ${summary.orders}`);
    console.log(`  Admin Users:      ${summary.adminUsers}`);
    console.log(`  Run Mode:         ${RUN_MODE}`);
    if (RUN_MODE === 'DRY_RUN') {
      console.log(`  Action:           ROLLBACK (no changes will be saved)`);
    } else {
      console.log(`  Action:           COMMIT (writes to database)`);
    }
    console.log('='.repeat(60));
    console.log('\nReview the summary above. Proceed?');

    // Handle Ctrl+C while prompting
    rl.on('SIGINT', () => {
      rl.close();
      resolve(false);
    });

    rl.question('Type "yes" to continue or "no" to cancel: ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

// ============================================================================
// DATABASE FUNCTIONS
// ============================================================================

const pool = new Pool({ connectionString: DATABASE_URL });

// When running a multi-statement migration we want all queries to run
// on the same client so BEGIN/COMMIT/ROLLBACK affect them. We set
// `activeClient` when we acquire a dedicated client for the transaction.
let activeClient = null;

async function query(sql, params = []) {
  try {
    const executor = activeClient || pool;
    const result = await executor.query(sql, params);
    return result;
  } catch (error) {
    logMessage('error', `SQL Query failed: ${sql}`, error.message);
    throw error;
  }
}

async function clearAllTables() {
  const tables = [
    'wishlists',
    'user_addresses',
    'audit_logs',
    'purchase_history',
    'order_items',
    'orders',
    'products',
    'admin_users',
    'users'
  ];

  for (const table of tables) {
    try {
      await query(`TRUNCATE TABLE ${table} CASCADE;`);
      logMessage('info', `Cleared table: ${table}`);
    } catch (error) {
      logMessage('warning', `Could not clear table ${table}`, error.message);
    }
  }
}

// ============================================================================
// DATA LOADING
// ============================================================================

function loadJsonDatabase() {
  try {
    if (!fs.existsSync(JSON_DB_PATH)) {
      throw new Error(`File not found: ${JSON_DB_PATH}`);
    }
    const data = fs.readFileSync(JSON_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logMessage('error', 'Failed to load unified_database.json', error.message);
    throw error;
  }
}

function loadAdminDatabase() {
  try {
    if (!fs.existsSync(ADMIN_DB_PATH)) {
      logMessage('warning', `Admin database not found: ${ADMIN_DB_PATH}`);
      return { admin_users: [] };
    }
    const data = fs.readFileSync(ADMIN_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logMessage('error', 'Failed to load admin_database.json', error.message);
    throw error;
  }
}

// ============================================================================
// MIGRATION FUNCTIONS
// ============================================================================

async function migrateUsers(jsonDb) {
  logMessage('info', 'Starting user migration...');
  const users = jsonDb.users || [];

  for (const user of users) {
    try {
      const result = await query(
        `INSERT INTO users (
          user_id, email, password_hash, full_name, registration_date,
          account_created_date, last_login_date, is_new_user,
          total_spent, total_orders
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (user_id) DO NOTHING
        RETURNING id;`,
        [
          user.id || `user${Date.now()}`,
          user.email,
          user.password || user.password_hash || '',
          user.fullName || user.full_name || 'Unknown',
          user.registrationDate || user.registration_date || new Date().toISOString().split('T')[0],
          user.accountCreatedDate || user.account_created_date || new Date().toISOString().split('T')[0],
          user.lastLoginDate || user.last_login_date || null,
          user.isNewUser !== false,
          parseFloat(user.totalSpent || 0),
          parseInt(user.totalOrders || 0, 10)
        ]
      );

      if (result.rowCount > 0) {
        report.details.users.migrated++;
      } else {
        report.details.users.skipped++;
      }
    } catch (error) {
      report.details.users.failed++;
      logMessage('warning', `Failed to migrate user: ${user.email}`, error.message);
    }
  }

  logMessage('info', `User migration complete: ${report.details.users.migrated} migrated, ${report.details.users.failed} failed, ${report.details.users.skipped} skipped`);
}

async function migrateProducts(jsonDb) {
  logMessage('info', 'Starting product migration...');
  const products = jsonDb.products || [];

  for (const product of products) {
    try {
      await query(
        `INSERT INTO products (
          product_id, name, model, category, price, current_price,
          original_price, current_quantity, total_sold, image_url,
          overview, features, specifications, applications,
          operation, advantages, considerations, compliance, commitment
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        ON CONFLICT (product_id) DO NOTHING;`,
        [
          product.id || product.productId || `PROD${Date.now()}`,
          product.name || product.productName || 'Unknown Product',
          product.model || null,
          product.category || null,
          parseFloat(product.price || 0),
          parseFloat(product.currentPrice || product.price || 0),
          (product.originalPrice != null ? parseFloat(product.originalPrice) : null),
          parseInt(product.currentQuantity || 0, 10),
          parseInt(product.totalSold || 0, 10),
          product.image || product.imageUrl || null,
          product.overview || null,
          JSON.stringify(product.features || []),
          JSON.stringify(product.specifications || {}),
          JSON.stringify(product.applications || []),
          product.operation || null,
          JSON.stringify(product.advantages || []),
          JSON.stringify(product.considerations || []),
          product.compliance || null,
          product.commitment || null
        ]
      );

      report.details.products.migrated++;
    } catch (error) {
      report.details.products.failed++;
      logMessage('warning', `Failed to migrate product: ${product.id || product.name}`, error.message);
    }
  }

  logMessage('info', `Product migration complete: ${report.details.products.migrated} migrated, ${report.details.products.failed} failed`);
}

async function migrateOrders(jsonDb) {
  logMessage('info', 'Starting order migration...');
  const orders = jsonDb.orders || [];

  for (const order of orders) {
    try {
      // First get the user ID from users table
      const userResult = await query(
        'SELECT id FROM users WHERE user_id = $1 LIMIT 1;',
        [order.userId || order.user_id]
      );

      if (userResult.rows.length === 0) {
        logMessage('warning', `Order ${order.orderId} skipped: user not found in database`);
        report.details.orders.skipped++;
        continue;
      }

      const userId = userResult.rows[0].id;

      const result = await query(
        `INSERT INTO orders (
          order_id, user_id, user_id_str, user_email, user_name,
          order_date, status, total_amount, shipping_info
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (order_id) DO NOTHING
        RETURNING id;`,
        [
          order.orderId || `ORD${Date.now()}`,
          userId,
          order.userId || order.user_id || null,
          order.userEmail || order.user_email || null,
          order.userName || order.user_name || null,
          order.orderDate || order.order_date || new Date().toISOString().split('T')[0],
          order.status || 'pending',
          parseFloat(order.totalAmount || 0),
          order.shippingInfo ? JSON.stringify(order.shippingInfo) : null
        ]
      );

      if (result.rowCount > 0) {
        const orderId = result.rows[0].id;

        // Migrate order items
        if (order.items && Array.isArray(order.items)) {
          for (const item of order.items) {
            try {
              // Get product ID
              const productResult = await query(
                'SELECT id FROM products WHERE product_id = $1 OR id = $2 LIMIT 1;',
                [item.productId || item.id, item.productId || item.id]
              );

              const productId = productResult.rows.length > 0 ? productResult.rows[0].id : null;

              await query(
                `INSERT INTO order_items (
                  order_id, product_id, product_id_str, product_name,
                  quantity, price, subtotal
                ) VALUES ($1, $2, $3, $4, $5, $6, $7);`,
                [
                  orderId,
                  productId,
                  item.productId || item.id,
                  item.productName || item.name || 'Unknown',
                  parseInt(item.quantity || 1, 10),
                  parseFloat(item.price || 0),
                  (item.subtotal != null ? parseFloat(item.subtotal) : (parseFloat(item.price || 0) * parseInt(item.quantity || 1, 10)))
                ]
              );

              report.details.orderItems.migrated++;
            } catch (error) {
              report.details.orderItems.failed++;
              logMessage('warning', `Failed to migrate order item for order ${order.orderId}`, error.message);
            }
          }
        }

        report.details.orders.migrated++;
      } else {
        report.details.orders.skipped++;
      }
    } catch (error) {
      report.details.orders.failed++;
      logMessage('warning', `Failed to migrate order: ${order.orderId}`, error.message);
    }
  }

  logMessage('info', `Order migration complete: ${report.details.orders.migrated} migrated, ${report.details.orders.failed} failed, ${report.details.orders.skipped} skipped`);
}

async function migratePurchaseHistory(jsonDb) {
  logMessage('info', 'Starting purchase history migration...');
  const purchaseHistory = jsonDb.purchaseHistory || [];

  for (const purchase of purchaseHistory) {
    try {
      // Get user and product IDs
      const userResult = await query(
        'SELECT id FROM users WHERE user_id = $1 LIMIT 1;',
        [purchase.userId || purchase.user_id]
      );

      const productResult = await query(
        'SELECT id FROM products WHERE product_id = $1 LIMIT 1;',
        [purchase.productId || purchase.product_id]
      );

      await query(
        `INSERT INTO purchase_history (
          order_id_str, user_id, user_id_str, product_id,
          product_id_str, product_name, purchase_date, quantity, price
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
        [
          purchase.orderId || purchase.order_id,
          userResult.rows.length > 0 ? userResult.rows[0].id : null,
          purchase.userId || purchase.user_id,
          productResult.rows.length > 0 ? productResult.rows[0].id : null,
          purchase.productId || purchase.product_id,
          purchase.productName || purchase.product_name || 'Unknown',
          purchase.purchaseDate || purchase.purchase_date,
          parseInt(purchase.quantity || 1, 10),
          parseFloat(purchase.price || 0)
        ]
      );

      report.details.purchaseHistory.migrated++;
    } catch (error) {
      report.details.purchaseHistory.failed++;
      logMessage('warning', `Failed to migrate purchase history record`, error.message);
    }
  }

  logMessage('info', `Purchase history migration complete: ${report.details.purchaseHistory.migrated} migrated, ${report.details.purchaseHistory.failed} failed`);
}

async function migrateAdminUsers(adminDb) {
  logMessage('info', 'Starting admin user migration...');
  const adminUsers = adminDb.admin_users || [];

  for (const admin of adminUsers) {
    try {
      await query(
        `INSERT INTO admin_users (
          admin_id, email, password_hash, full_name, is_super_admin
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (admin_id) DO NOTHING;`,
        [
          admin.admin_id || admin.id || `admin${Date.now()}`,
          admin.email || 'admin@example.com',
          admin.password || admin.password_hash || '',
          admin.full_name || admin.fullName || 'Admin',
          admin.is_super_admin || false
        ]
      );

      report.details.adminUsers.migrated++;
    } catch (error) {
      report.details.adminUsers.failed++;
      logMessage('warning', `Failed to migrate admin user: ${admin.email}`, error.message);
    }
  }

  logMessage('info', `Admin user migration complete: ${report.details.adminUsers.migrated} migrated, ${report.details.adminUsers.failed} failed`);
}

// ============================================================================
// MAIN MIGRATION FUNCTION
// ============================================================================

async function runMigration() {
  console.log('\n');
  logMessage('info', '='.repeat(60));
  logMessage('info', 'JSON to PostgreSQL Migration Started');
  logMessage('info', '='.repeat(60));

  let client = null;
  try {
    try {
      client = await pool.connect();
    } catch (err) {
      logMessage('error', 'Failed to acquire database client', err.message);
      await pool.end();
      process.exit(1);
    }
    // Use this client for all subsequent queries so the transaction
    // started below will include them.
    activeClient = client;

    // Load JSON data
    logMessage('info', 'Loading JSON databases...');
    const jsonDb = loadJsonDatabase();
    const adminDb = loadAdminDatabase();
    const userCount = (jsonDb.users || []).length;
    const productCount = (jsonDb.products || []).length;
    const orderCount = (jsonDb.orders || []).length;
    const adminCount = (adminDb.admin_users || []).length;
    
    logMessage('info', `Loaded ${userCount} users, ${productCount} products, ${orderCount} orders, ${adminCount} admin users`);

    // Show summary and request confirmation
    const proceed = await confirmMigration({
      users: userCount,
      products: productCount,
      orders: orderCount,
      adminUsers: adminCount
    });

    if (!proceed) {
      logMessage('info', 'Migration cancelled by user.');
      // Release client and cleanup before exiting
      try {
        activeClient = null;
        if (client) client.release();
      } catch (e) {
        // ignore
      }
      await pool.end();
      process.exit(0);
    }

    // Start transaction
    await client.query('BEGIN;');
    logMessage('info', 'Database transaction started');

    // Clear existing data (optional - comment out to append)
    // await clearAllTables();

    // Migrate data
    logMessage('info', 'Beginning data migration...');
    await migrateUsers(jsonDb);
    await migrateProducts(jsonDb);
    await migrateOrders(jsonDb);
    await migratePurchaseHistory(jsonDb);
    await migrateAdminUsers(adminDb);

    // Commit or rollback based on run mode
    if (RUN_MODE === 'COMMIT') {
      await client.query('COMMIT;');
      logMessage('info', 'Database transaction COMMITTED');
    } else {
      await client.query('ROLLBACK;');
      logMessage('info', 'Database transaction ROLLED BACK (dry-run mode)');
    }

    report.status = 'completed';
    report.summary = {
      totalMigrated: Object.values(report.details).reduce((sum, d) => sum + d.migrated, 0),
      totalFailed: Object.values(report.details).reduce((sum, d) => sum + d.failed, 0),
      totalSkipped: Object.values(report.details).reduce((sum, d) => sum + d.skipped, 0)
    };

    logMessage('info', '='.repeat(60));
    logMessage('info', 'Migration Complete!');
    logMessage('info', `Total Migrated: ${report.summary.totalMigrated}, Failed: ${report.summary.totalFailed}, Skipped: ${report.summary.totalSkipped}`);
    if (RUN_MODE === 'DRY_RUN') {
      logMessage('info', 'Mode: DRY_RUN (changes were NOT saved)');
    } else {
      logMessage('info', 'Mode: COMMIT (changes were saved)');
    }
    logMessage('info', '='.repeat(60));

  } catch (error) {
    await client.query('ROLLBACK;');
    logMessage('error', 'Migration failed, transaction rolled back', error.message);
    report.status = 'failed';
    throw error;
  } finally {
    // Clear the active client reference before releasing so further
    // calls to `query` will use the pool again.
    activeClient = null;
    client.release();
    saveReport();
    await pool.end();
  }
}

// ============================================================================
// EXECUTION
// ============================================================================

(async () => {
  try {
    await runMigration();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    saveReport();
    process.exit(1);
  }
})();
