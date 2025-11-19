/**
 * PostgreSQL Migration Guide for Ecommerce Platform
 * 
 * This guide provides step-by-step instructions for migrating from JSON file-based
 * storage to PostgreSQL with the normalized schema defined in this migration.
 * 
 * PREREQUISITE: Install PostgreSQL 12+ and create a database named `ecommerce_db`
 */

-- ============================================================================
-- PHASE 1: Create Database and Connect
-- ============================================================================

-- In psql or your PostgreSQL client:
-- CREATE DATABASE ecommerce_db;
-- \c ecommerce_db

-- ============================================================================
-- PHASE 2: Initial Schema (001_initial_schema.sql)
-- ============================================================================
-- Run: psql -U postgres -d ecommerce_db -f migrations/001_initial_schema.sql

-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(20) UNIQUE NOT NULL,  -- Matches JSON: user001, user002, etc.
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  -- bcrypt hash
  full_name VARCHAR(255) NOT NULL,
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  account_created_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_login_date DATE,
  is_new_user BOOLEAN DEFAULT TRUE,
  total_spent NUMERIC(12, 2) DEFAULT 0.00,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) UNIQUE NOT NULL,  -- Matches JSON: PROD001, etc.
  name VARCHAR(255) NOT NULL,
  model VARCHAR(100),
  category VARCHAR(100),
  price NUMERIC(10, 2) NOT NULL,
  current_price NUMERIC(10, 2),
  original_price NUMERIC(10, 2),
  current_quantity INTEGER DEFAULT 0,
  total_sold INTEGER DEFAULT 0,
  image_url TEXT,
  overview TEXT,
  features TEXT,  -- JSON stored as TEXT or use JSONB for PostgreSQL 9.4+
  specifications TEXT,  -- JSON
  applications TEXT,  -- JSON array
  operation TEXT,
  advantages TEXT,  -- JSON array
  considerations TEXT,  -- JSON array
  compliance VARCHAR(255),
  commitment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(20) UNIQUE NOT NULL,  -- Matches JSON: ORD000001, etc.
  user_id INTEGER NOT NULL,
  user_id_str VARCHAR(20),  -- For joining with JSON backup
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  order_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',  -- pending, processing, shipped, completed
  total_amount NUMERIC(12, 2) NOT NULL,
  shipping_info TEXT,  -- JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order Items Table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_id_str VARCHAR(50),  -- For joining with JSON backup
  product_name VARCHAR(255),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Purchase History Table (for analytics)
CREATE TABLE purchase_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER,
  order_id_str VARCHAR(20),  -- For joining with JSON backup
  user_id INTEGER,
  user_id_str VARCHAR(20),  -- For joining with JSON backup
  product_id INTEGER,
  product_id_str VARCHAR(50),  -- For joining with JSON backup
  product_name VARCHAR(255),
  purchase_date DATE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- Admin Users Table
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  admin_id VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log Table (for tracking changes)
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER,
  admin_email VARCHAR(255),
  action VARCHAR(100),  -- create, update, delete, approve_order, ship_order, etc.
  entity_type VARCHAR(50),  -- user, product, order, etc.
  entity_id VARCHAR(50),
  old_value TEXT,  -- JSON
  new_value TEXT,  -- JSON
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Wishlist Table (optional, for future feature)
CREATE TABLE wishlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(user_id, product_id)
);

-- Saved Addresses Table (for future feature)
CREATE TABLE user_addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type VARCHAR(20),  -- billing, shipping, default
  street_address VARCHAR(255),
  city VARCHAR(100),
  state_province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- PHASE 3: Indexes (002_indexes.sql)
-- ============================================================================
-- Run: psql -U postgres -d ecommerce_db -f migrations/002_indexes.sql

-- Users Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_registration_date ON users(registration_date);

-- Products Indexes
CREATE INDEX idx_products_product_id ON products(product_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_name ON products USING GIN(to_tsvector('english', name));  -- Full-text search

-- Orders Indexes
CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Order Items Indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Purchase History Indexes
CREATE INDEX idx_purchase_history_user_id ON purchase_history(user_id);
CREATE INDEX idx_purchase_history_product_id ON purchase_history(product_id);
CREATE INDEX idx_purchase_history_purchase_date ON purchase_history(purchase_date);
CREATE INDEX idx_purchase_history_order_id ON purchase_history(order_id);

-- Admin Indexes
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_admin_id ON admin_users(admin_id);

-- Audit Log Indexes
CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Wishlist Indexes
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON wishlists(product_id);

-- Addresses Indexes
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_default ON user_addresses(is_default) WHERE is_default = TRUE;

-- ============================================================================
-- PHASE 4: Migration Script (scripts/json_to_sql_migration.js)
-- ============================================================================
-- Run: node scripts/json_to_sql_migration.js
-- (See separate migration script file for implementation)

-- ============================================================================
-- PHASE 5: Post-Migration Verification
-- ============================================================================

-- Count migrated records
-- SELECT 'Users' as table_name, COUNT(*) as record_count FROM users
-- UNION ALL
-- SELECT 'Products', COUNT(*) FROM products
-- UNION ALL
-- SELECT 'Orders', COUNT(*) FROM orders
-- UNION ALL
-- SELECT 'Order Items', COUNT(*) FROM order_items
-- UNION ALL
-- SELECT 'Purchase History', COUNT(*) FROM purchase_history
-- UNION ALL
-- SELECT 'Admin Users', COUNT(*) FROM admin_users;

-- ============================================================================
-- MIGRATION ROLLBACK PLAN
-- ============================================================================
-- If migration fails, you can restore by:
-- 1. Keep original unified_database.json and admin_database.json files backed up
-- 2. In case of errors, restore from backup and restart server with JSON files
-- 3. Identify issues and re-run migration
-- 4. PostgreSQL transaction support ensures atomicity (no partial migrations)

-- ============================================================================
-- NOTES FOR DEVELOPERS
-- ============================================================================
--
-- 1. ID MAPPING:
--    - JSON: user001, user002 → PostgreSQL: auto-increment integer
--    - PROD001 → auto-increment integer (kept in product_id VARCHAR for reference)
--    - ORD000001 → auto-increment integer (kept in order_id VARCHAR for reference)
--
-- 2. FUTURE ENHANCEMENT - CONVERT TO JSONB:
--    For modern PostgreSQL 9.4+, convert JSON columns:
--    ALTER TABLE products ALTER COLUMN features TYPE JSONB USING features::JSONB;
--    This allows querying within JSON documents efficiently.
--
-- 3. PASSWORD MIGRATION:
--    Existing SHA256 hashes will be migrated as-is.
--    On next user login, bcrypt rehashing will occur (see admin_server.js fallback logic).
--    Admin passwords: similar rehashing on login.
--
-- 4. BACKUP BEFORE MIGRATION:
--    Run this before migration:
--    pg_dump -U postgres ecommerce_db > ecommerce_backup_$(date +%s).sql
--
-- 5. CONNECTION STRING FOR NODE.JS:
--    PostgreSQL connection string format:
--    postgresql://username:password@localhost:5432/ecommerce_db
--    Set in environment variable: DATABASE_URL or create a .env file
--
-- 6. ORM RECOMMENDATION:
--    Consider using Sequelize or TypeORM for easier database interaction:
--    npm install sequelize pg pg-hstore
--    or
--    npm install typeorm pg
--
