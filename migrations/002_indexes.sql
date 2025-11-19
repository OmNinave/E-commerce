-- ============================================================================
-- PostgreSQL Indexes for Ecommerce Platform
-- File: migrations/002_indexes.sql
--
-- Usage:
-- psql -U postgres -d ecommerce_db -f migrations/002_indexes.sql
--
-- These indexes optimize query performance for common queries.
-- ============================================================================

-- Users Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_registration_date ON users(registration_date);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Products Indexes
CREATE INDEX idx_products_product_id ON products(product_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_name ON products(name);

-- Full-text search index for product name and overview (if using PostgreSQL 8.3+)
-- Uncomment if you plan to use full-text search:
-- CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('english', name || ' ' || COALESCE(overview, '')));

-- Orders Indexes
CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_user_id_order_date ON orders(user_id, order_date DESC);  -- Common query pattern

-- Order Items Indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Purchase History Indexes
CREATE INDEX idx_purchase_history_user_id ON purchase_history(user_id);
CREATE INDEX idx_purchase_history_product_id ON purchase_history(product_id);
CREATE INDEX idx_purchase_history_purchase_date ON purchase_history(purchase_date);
CREATE INDEX idx_purchase_history_order_id ON purchase_history(order_id);
CREATE INDEX idx_purchase_history_date_product ON purchase_history(purchase_date DESC, product_id);  -- Analytics query pattern

-- Admin Indexes
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_admin_id ON admin_users(admin_id);

-- Audit Log Indexes
CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_admin_date ON audit_logs(admin_id, created_at DESC);  -- Common pattern for admin activity logs

-- Wishlist Indexes
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON wishlists(product_id);

-- Addresses Indexes
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_default ON user_addresses(is_default) WHERE is_default = TRUE;

-- ============================================================================
-- PERFORMANCE ANALYSIS
-- ============================================================================
-- After running indexes, analyze the database for query planner optimization:
-- ANALYZE;
--
-- To check index usage, run:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- ORDER BY idx_scan DESC;
--
-- To identify missing indexes (if using pgAdmin):
-- Look at slow query logs and create indexes on frequently filtered columns.

-- ============================================================================
-- INDEX MAINTENANCE
-- ============================================================================
-- Periodically rebuild indexes (especially after large data migrations):
-- REINDEX INDEX idx_users_email;
-- REINDEX INDEX idx_purchase_history_purchase_date;
--
-- Or rebuild all indexes on a table:
-- REINDEX TABLE orders;
--
-- For automatic maintenance, consider running VACUUM and ANALYZE weekly:
-- VACUUM ANALYZE;
