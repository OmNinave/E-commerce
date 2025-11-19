-- ============================================================================
-- PostgreSQL Initial Schema for Ecommerce Platform
-- File: migrations/001_initial_schema.sql
--
-- Usage:
-- psql -U postgres -d ecommerce_db -f migrations/001_initial_schema.sql
--
-- Or manually connect and run all statements in this file.
-- ============================================================================

-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
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
  product_id VARCHAR(50) UNIQUE NOT NULL,
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
  features TEXT,
  specifications TEXT,
  applications TEXT,
  operation TEXT,
  advantages TEXT,
  considerations TEXT,
  compliance VARCHAR(255),
  commitment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(20) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  user_id_str VARCHAR(20),
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  order_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  total_amount NUMERIC(12, 2) NOT NULL,
  shipping_info TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order Items Table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_id_str VARCHAR(50),
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
  order_id_str VARCHAR(20),
  user_id INTEGER,
  user_id_str VARCHAR(20),
  product_id INTEGER,
  product_id_str VARCHAR(50),
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

-- Audit Log Table
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER,
  admin_email VARCHAR(255),
  action VARCHAR(100),
  entity_type VARCHAR(50),
  entity_id VARCHAR(50),
  old_value TEXT,
  new_value TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Wishlist Table
CREATE TABLE wishlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(user_id, product_id)
);

-- Saved Addresses Table
CREATE TABLE user_addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type VARCHAR(20),
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
