const { db } = require('./database');

/**
 * Enterprise E-commerce Database API
 * Complete CRUD operations for all entities
 */

class DatabaseAPI {
    // ==================== PRODUCTS ====================

    getAllProducts(filters = {}) {
        let query = `
      SELECT p.*, c.name as category_name, 
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
             (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;

        const params = [];

        // Support both category_id (numeric) and category (name)
        if (filters.category_id) {
            query += ' AND p.category_id = ?';
            params.push(filters.category_id);
        } else if (filters.category) {
            query += ' AND c.name = ?';
            params.push(filters.category);
        }

        if (filters.search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ? OR p.model LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (filters.min_price) {
            query += ' AND p.selling_price >= ?';
            params.push(filters.min_price);
        }

        if (filters.max_price) {
            query += ' AND p.selling_price <= ?';
            params.push(filters.max_price);
        }

        // Sorting
        const sortBy = filters.sort || 'featured';
        switch (sortBy) {
            case 'newest':
                query += ' ORDER BY p.created_at DESC';
                break;
            case 'name-asc':
                query += ' ORDER BY p.name ASC';
                break;
            case 'name-desc':
                query += ' ORDER BY p.name DESC';
                break;
            case 'price-asc':
                query += ' ORDER BY p.selling_price ASC';
                break;
            case 'price-desc':
                query += ' ORDER BY p.selling_price DESC';
                break;
            case 'featured':
            default:
                query += ' ORDER BY p.is_featured DESC, p.created_at DESC';
                break;
        }

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
        }

        if (filters.offset) {
            query += ' OFFSET ?';
            params.push(filters.offset);
        }

        return db.prepare(query).all(...params);
    }

    getProductsCount(filters = {}) {
        let query = `
      SELECT COUNT(*) as count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;

        const params = [];

        // Support both category_id (numeric) and category (name)
        if (filters.category_id) {
            query += ' AND p.category_id = ?';
            params.push(filters.category_id);
        } else if (filters.category) {
            query += ' AND c.name = ?';
            params.push(filters.category);
        }

        if (filters.search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ? OR p.model LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (filters.min_price) {
            query += ' AND p.selling_price >= ?';
            params.push(filters.min_price);
        }

        if (filters.max_price) {
            query += ' AND p.selling_price <= ?';
            params.push(filters.max_price);
        }

        return db.prepare(query).get(...params).count;
    }

    getProductById(id) {
        const product = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(id);

        if (product) {
            product.images = this.getProductImages(id);
            product.discount = this.getActiveDiscount(id);
        }

        return product;
    }

    createProduct(productData) {
        const stmt = db.prepare(`
      INSERT INTO products (
        name, slug, model, tagline, description, category_id, brand, sku,
        base_price, selling_price, cost_price, stock_quantity, low_stock_threshold,
        weight, dimensions, is_active, is_featured, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const now = new Date().toISOString();
        const result = stmt.run(
            productData.name,
            productData.slug,
            productData.model || '',
            productData.tagline || '',
            productData.description || '',
            productData.category_id,
            productData.brand || '',
            productData.sku,
            productData.base_price,
            productData.selling_price,
            productData.cost_price || null,
            productData.stock_quantity || 0,
            productData.low_stock_threshold || 10,
            productData.weight || null,
            productData.dimensions || null,
            productData.is_active !== undefined ? productData.is_active : 1,
            productData.is_featured || 0,
            now,
            now
        );

        return result.lastInsertRowid;
    }

    updateProduct(id, productData) {
        const fields = [];
        const values = [];

        const allowedFields = [
            'name', 'slug', 'model', 'tagline', 'description', 'category_id', 'brand', 'sku',
            'base_price', 'selling_price', 'cost_price', 'stock_quantity', 'low_stock_threshold',
            'weight', 'dimensions', 'is_active', 'is_featured'
        ];

        for (const field of allowedFields) {
            if (productData[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(productData[field]);
            }
        }

        fields.push('updated_at = ?');
        values.push(new Date().toISOString());
        values.push(id);

        const stmt = db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`);
        return stmt.run(...values);
    }

    deleteProduct(id) {
        return db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(id);
    }

    // ==================== PRODUCT IMAGES ====================

    getProductImages(productId) {
        return db.prepare(`
      SELECT * FROM product_images
      WHERE product_id = ?
      ORDER BY is_primary DESC, display_order ASC
    `).all(productId);
    }

    addProductImage(productId, imageData) {
        const stmt = db.prepare(`
      INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
      VALUES (?, ?, ?, ?, ?)
    `);

        return stmt.run(
            productId,
            imageData.image_url,
            imageData.alt_text || '',
            imageData.is_primary || 0,
            imageData.display_order || 0
        );
    }

    deleteProductImage(imageId) {
        return db.prepare('DELETE FROM product_images WHERE id = ?').run(imageId);
    }

    // ==================== CATEGORIES ====================

    getAllCategories() {
        return db.prepare(`
      SELECT c.*, 
             (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = 1) as product_count
      FROM categories c
      WHERE c.is_active = 1
      ORDER BY c.display_order ASC
    `).all();
    }

    createCategory(categoryData) {
        const stmt = db.prepare(`
      INSERT INTO categories (name, slug, description, parent_id, image_url, is_active, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        return stmt.run(
            categoryData.name,
            categoryData.slug,
            categoryData.description || '',
            categoryData.parent_id || null,
            categoryData.image_url || null,
            categoryData.is_active !== undefined ? categoryData.is_active : 1,
            categoryData.display_order || 0
        );
    }

    // ==================== DISCOUNTS ====================

    getActiveDiscount(productId) {
        const now = new Date().toISOString();
        return db.prepare(`
      SELECT * FROM discounts
      WHERE product_id = ?
        AND is_active = 1
        AND (start_date IS NULL OR start_date <= ?)
        AND (end_date IS NULL OR end_date >= ?)
      ORDER BY discount_value DESC
      LIMIT 1
    `).get(productId, now, now);
    }

    createDiscount(discountData) {
        const stmt = db.prepare(`
      INSERT INTO discounts (product_id, discount_type, discount_value, start_date, end_date, is_active, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        return stmt.run(
            discountData.product_id,
            discountData.discount_type,
            discountData.discount_value,
            discountData.start_date || null,
            discountData.end_date || null,
            discountData.is_active !== undefined ? discountData.is_active : 1,
            discountData.created_by || null
        );
    }

    deleteDiscount(id) {
        return db.prepare('UPDATE discounts SET is_active = 0 WHERE id = ?').run(id);
    }

    // ==================== ORDERS ====================

    getAllOrders(filters = {}) {
        let query = `
      SELECT o.*, u.email as user_email, u.first_name, u.last_name,
             a.city as shipping_city, a.state as shipping_state
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses a ON o.shipping_address_id = a.id
      WHERE 1=1
    `;

        const params = [];

        if (filters.status) {
            query += ' AND o.status = ?';
            params.push(filters.status);
        }

        if (filters.user_id) {
            query += ' AND o.user_id = ?';
            params.push(filters.user_id);
        }

        query += ' ORDER BY o.created_at DESC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
        }

        return db.prepare(query).all(...params);
    }

    getOrderById(id) {
        const order = db.prepare(`
      SELECT o.*, u.email as user_email, u.first_name, u.last_name, u.phone as user_phone,
             sa.*, sa.id as shipping_address_id,
             ba.*, ba.id as billing_address_id
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses sa ON o.shipping_address_id = sa.id
      LEFT JOIN addresses ba ON o.billing_address_id = ba.id
      WHERE o.id = ?
    `).get(id);

        if (order) {
            order.items = this.getOrderItems(id);
            order.status_history = this.getOrderStatusHistory(id);
            order.shipping = this.getOrderShipping(id);
        }

        return order;
    }

    createOrder(orderData) {
        const stmt = db.prepare(`
      INSERT INTO orders (
        order_number, user_id, status, payment_status, payment_method, payment_id,
        subtotal, discount_amount, shipping_cost, tax_amount, total_amount,
        coupon_code, shipping_address_id, billing_address_id, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const result = stmt.run(
            orderData.order_number,
            orderData.user_id,
            orderData.status || 'pending',
            orderData.payment_status || 'pending',
            orderData.payment_method || null,
            orderData.payment_id || null,
            orderData.subtotal,
            orderData.discount_amount || 0,
            orderData.shipping_cost || 0,
            orderData.tax_amount || 0,
            orderData.total_amount,
            orderData.coupon_code || null,
            orderData.shipping_address_id,
            orderData.billing_address_id || orderData.shipping_address_id,
            orderData.notes || null,
            new Date().toISOString()
        );

        return result.lastInsertRowid;
    }

    updateOrderStatus(orderId, status, notes = null, userId = null) {
        const transaction = db.transaction(() => {
            // Update order status
            db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?')
                .run(status, new Date().toISOString(), orderId);

            // Add to status history
            db.prepare(`
        INSERT INTO order_status_history (order_id, status, notes, created_by)
        VALUES (?, ?, ?, ?)
      `).run(orderId, status, notes, userId);

            // Update timestamps based on status
            if (status === 'shipped') {
                db.prepare('UPDATE orders SET shipped_at = ? WHERE id = ?')
                    .run(new Date().toISOString(), orderId);
            } else if (status === 'delivered') {
                db.prepare('UPDATE orders SET delivered_at = ? WHERE id = ?')
                    .run(new Date().toISOString(), orderId);
            } else if (status === 'cancelled') {
                db.prepare('UPDATE orders SET cancelled_at = ? WHERE id = ?')
                    .run(new Date().toISOString(), orderId);
            }
        });

        transaction();
        return true;
    }

    getOrderItems(orderId) {
        return db.prepare(`
      SELECT oi.*, p.name as product_name, p.sku as product_sku
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(orderId);
    }

    addOrderItem(orderItemData) {
        const stmt = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, discount_amount, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

        return stmt.run(
            orderItemData.order_id,
            orderItemData.product_id,
            orderItemData.product_name,
            orderItemData.product_sku,
            orderItemData.quantity,
            orderItemData.unit_price,
            orderItemData.discount_amount || 0,
            orderItemData.total_price
        );
    }

    getOrderStatusHistory(orderId) {
        return db.prepare(`
      SELECT osh.*, u.first_name, u.last_name
      FROM order_status_history osh
      LEFT JOIN users u ON osh.created_by = u.id
      WHERE osh.order_id = ?
      ORDER BY osh.created_at ASC
    `).all(orderId);
    }

    getOrderShipping(orderId) {
        return db.prepare('SELECT * FROM shipping WHERE order_id = ?').get(orderId);
    }

    // ==================== USERS ====================

    getUserByEmail(email) {
        return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    }

    getUserById(id) {
        return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    }

    createUser(userData) {
        const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, phone, email_verified, is_admin)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        return stmt.run(
            userData.email,
            userData.password_hash,
            userData.first_name || '',
            userData.last_name || '',
            userData.phone || '',
            userData.email_verified || 0,
            userData.is_admin || 0
        );
    }

    // ==================== NOTIFICATIONS ====================

    createNotification(notificationData) {
        const stmt = db.prepare(`
      INSERT INTO notifications (user_id, type, title, message, link, is_read)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        return stmt.run(
            notificationData.user_id || null,
            notificationData.type,
            notificationData.title,
            notificationData.message,
            notificationData.link || null,
            0
        );
    }

    getUnreadNotifications(userId = null) {
        if (userId) {
            return db.prepare('SELECT * FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC')
                .all(userId);
        } else {
            return db.prepare('SELECT * FROM notifications WHERE user_id IS NULL AND is_read = 0 ORDER BY created_at DESC')
                .all();
        }
    }

    markNotificationAsRead(id) {
        return db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
    }

    // ==================== ANALYTICS ====================

    getDashboardStats() {
        const stats = {};

        // Total products
        stats.total_products = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get().count;

        // Total orders
        stats.total_orders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;

        // Total revenue
        stats.total_revenue = db.prepare('SELECT SUM(total_amount) as total FROM orders WHERE payment_status = "paid"').get().total || 0;

        // Pending orders
        stats.pending_orders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = "pending"').get().count;

        // Low stock products
        stats.low_stock_products = db.prepare('SELECT COUNT(*) as count FROM products WHERE stock_quantity <= low_stock_threshold AND is_active = 1').get().count;

        // Today's orders
        const today = new Date().toISOString().split('T')[0];
        stats.today_orders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = ?').get(today).count;

        // Today's revenue
        stats.today_revenue = db.prepare('SELECT SUM(total_amount) as total FROM orders WHERE DATE(created_at) = ? AND payment_status = "paid"').get(today).total || 0;

        return stats;
    }

    // ==================== PROFESSIONAL WORKFLOW API ====================

    // Warehouse Management
    getAllWarehouses() {
        return db.prepare('SELECT * FROM warehouses WHERE is_active = 1 ORDER BY name').all();
    }

    createWarehouse(warehouseData) {
        const stmt = db.prepare(`
            INSERT INTO warehouses (name, code, address_line1, address_line2, city, state, pincode, phone, email, manager_name, capacity, latitude, longitude, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            warehouseData.name,
            warehouseData.code,
            warehouseData.address_line1 || null,
            warehouseData.address_line2 || null,
            warehouseData.city,
            warehouseData.state,
            warehouseData.pincode,
            warehouseData.phone || null,
            warehouseData.email || null,
            warehouseData.manager_name || null,
            warehouseData.capacity || null,
            warehouseData.latitude || null,
            warehouseData.longitude || null,
            warehouseData.is_active !== undefined ? warehouseData.is_active : 1
        );

        return this.getWarehouseById(result.lastInsertRowid);
    }

    getWarehouseById(id) {
        return db.prepare('SELECT * FROM warehouses WHERE id = ?').get(id);
    }

    updateWarehouse(id, warehouseData) {
        const stmt = db.prepare(`
            UPDATE warehouses SET
                name = ?, code = ?, address_line1 = ?, address_line2 = ?, city = ?, state = ?, pincode = ?,
                phone = ?, email = ?, manager_name = ?, capacity = ?, latitude = ?, longitude = ?, is_active = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        stmt.run(
            warehouseData.name,
            warehouseData.code,
            warehouseData.address_line1 || null,
            warehouseData.address_line2 || null,
            warehouseData.city,
            warehouseData.state,
            warehouseData.pincode,
            warehouseData.phone || null,
            warehouseData.email || null,
            warehouseData.manager_name || null,
            warehouseData.capacity || null,
            warehouseData.latitude || null,
            warehouseData.longitude || null,
            warehouseData.is_active !== undefined ? warehouseData.is_active : 1,
            id
        );

        return this.getWarehouseById(id);
    }

    // Warehouse Inventory Management
    getAllWarehouseInventory() {
        return db.prepare(`
            SELECT wi.*, w.name as warehouse_name, w.code as warehouse_code,
                   p.name as product_name, p.sku as product_sku
            FROM warehouse_inventory wi
            JOIN warehouses w ON wi.warehouse_id = w.id
            JOIN products p ON wi.product_id = p.id
            ORDER BY w.name, p.name
        `).all();
    }

    getWarehouseInventoryByWarehouse(warehouseId) {
        return db.prepare(`
            SELECT wi.*, p.name as product_name, p.sku as product_sku, p.selling_price
            FROM warehouse_inventory wi
            JOIN products p ON wi.product_id = p.id
            WHERE wi.warehouse_id = ?
            ORDER BY p.name
        `).all(warehouseId);
    }

    getWarehouseInventory(warehouseId, productId) {
        return db.prepare(`
            SELECT wi.*, w.name as warehouse_name, p.name as product_name, p.sku as product_sku
            FROM warehouse_inventory wi
            JOIN warehouses w ON wi.warehouse_id = w.id
            JOIN products p ON wi.product_id = p.id
            WHERE wi.warehouse_id = ? AND wi.product_id = ?
        `).get(warehouseId, productId);
    }

    updateWarehouseInventory(warehouseId, productId, data) {
        // First check if inventory record exists
        const existing = this.getWarehouseInventory(warehouseId, productId);

        if (existing) {
            // Update existing record
            db.prepare(`
                UPDATE warehouse_inventory SET
                    stock_quantity = ?, reserved_quantity = ?, last_updated = CURRENT_TIMESTAMP
                WHERE warehouse_id = ? AND product_id = ?
            `).run(
                data.stock_quantity,
                data.reserved_quantity || 0,
                warehouseId,
                productId
            );
        } else {
            // Create new record
            db.prepare(`
                INSERT INTO warehouse_inventory (warehouse_id, product_id, stock_quantity, reserved_quantity)
                VALUES (?, ?, ?, ?)
            `).run(
                warehouseId,
                productId,
                data.stock_quantity,
                data.reserved_quantity || 0
            );
        }

        return this.getWarehouseInventory(warehouseId, productId);
    }

    // Courier Partners Management
    getAllCourierPartners() {
        return db.prepare('SELECT * FROM courier_partners WHERE is_active = 1 ORDER BY name').all();
    }

    createCourierPartner(courierData) {
        const stmt = db.prepare(`
            INSERT INTO courier_partners (name, code, contact_person, phone, email, api_key, api_secret, tracking_url_template, serviceable_pincodes, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            courierData.name,
            courierData.code,
            courierData.contact_person || null,
            courierData.phone || null,
            courierData.email || null,
            courierData.api_key || null,
            courierData.api_secret || null,
            courierData.tracking_url_template || null,
            courierData.serviceable_pincodes || null,
            courierData.is_active !== undefined ? courierData.is_active : 1
        );

        return this.getCourierPartnerById(result.lastInsertRowid);
    }

    getCourierPartnerById(id) {
        return db.prepare('SELECT * FROM courier_partners WHERE id = ?').get(id);
    }

    // Return Requests Management
    getReturnRequests(filters = {}) {
        let query = `
            SELECT rr.*, o.order_number, u.first_name, u.last_name, u.email
            FROM return_requests rr
            JOIN orders o ON rr.order_id = o.id
            JOIN users u ON rr.user_id = u.id
        `;

        const params = [];
        const conditions = [];

        if (filters.status) {
            conditions.push('rr.status = ?');
            params.push(filters.status);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY rr.created_at DESC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
        }

        if (filters.page && filters.limit) {
            const offset = (filters.page - 1) * filters.limit;
            query += ' OFFSET ?';
            params.push(offset);
        }

        return db.prepare(query).all(...params);
    }

    createReturnRequest(returnData) {
        const stmt = db.prepare(`
            INSERT INTO return_requests (order_id, user_id, reason, description, refund_amount, refund_method, pickup_address_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            returnData.order_id,
            returnData.user_id,
            returnData.reason,
            returnData.description || null,
            returnData.refund_amount || null,
            returnData.refund_method || null,
            returnData.pickup_address_id || null
        );

        return this.getReturnRequestById(result.lastInsertRowid);
    }

    getReturnRequestById(id) {
        return db.prepare(`
            SELECT rr.*, o.order_number, u.first_name, u.last_name, u.email
            FROM return_requests rr
            JOIN orders o ON rr.order_id = o.id
            JOIN users u ON rr.user_id = u.id
            WHERE rr.id = ?
        `).get(id);
    }

    updateReturnRequest(id, updateData) {
        const fields = [];
        const params = [];

        if (updateData.status !== undefined) {
            fields.push('status = ?');
            params.push(updateData.status);
        }
        if (updateData.refund_amount !== undefined) {
            fields.push('refund_amount = ?');
            params.push(updateData.refund_amount);
        }
        if (updateData.refund_status !== undefined) {
            fields.push('refund_status = ?');
            params.push(updateData.refund_status);
        }
        if (updateData.pickup_scheduled_date !== undefined) {
            fields.push('pickup_scheduled_date = ?');
            params.push(updateData.pickup_scheduled_date);
        }
        if (updateData.pickup_completed_date !== undefined) {
            fields.push('pickup_completed_date = ?');
            params.push(updateData.pickup_completed_date);
        }
        if (updateData.inspection_date !== undefined) {
            fields.push('inspection_date = ?');
            params.push(updateData.inspection_date);
        }
        if (updateData.inspection_result !== undefined) {
            fields.push('inspection_result = ?');
            params.push(updateData.inspection_result);
        }
        if (updateData.refund_processed_date !== undefined) {
            fields.push('refund_processed_date = ?');
            params.push(updateData.refund_processed_date);
        }
        if (updateData.admin_notes !== undefined) {
            fields.push('admin_notes = ?');
            params.push(updateData.admin_notes);
        }

        if (fields.length > 0) {
            fields.push('updated_at = CURRENT_TIMESTAMP');
            const query = `UPDATE return_requests SET ${fields.join(', ')} WHERE id = ?`;
            params.push(id);
            db.prepare(query).run(...params);
        }

        return this.getReturnRequestById(id);
    }

    // Customer Support Tickets
    getSupportTickets(filters = {}) {
        let query = `
            SELECT st.*, u.first_name, u.last_name, u.email,
                   (SELECT first_name || ' ' || last_name FROM users WHERE id = st.assigned_to) as assigned_to_name
            FROM customer_support_tickets st
            JOIN users u ON st.user_id = u.id
        `;

        const params = [];
        const conditions = [];

        if (filters.status) {
            conditions.push('st.status = ?');
            params.push(filters.status);
        }
        if (filters.priority) {
            conditions.push('st.priority = ?');
            params.push(filters.priority);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY st.created_at DESC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
        }

        if (filters.page && filters.limit) {
            const offset = (filters.page - 1) * filters.limit;
            query += ' OFFSET ?';
            params.push(offset);
        }

        return db.prepare(query).all(...params);
    }

    createSupportTicket(ticketData) {
        // Generate ticket number
        const ticketNumber = 'TICK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();

        const stmt = db.prepare(`
            INSERT INTO customer_support_tickets (ticket_number, user_id, order_id, subject, description, category, priority, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            ticketNumber,
            ticketData.user_id,
            ticketData.order_id || null,
            ticketData.subject,
            ticketData.description || null,
            ticketData.category || null,
            ticketData.priority || 'medium',
            'open'
        );

        return this.getSupportTicketById(result.lastInsertRowid);
    }

    getSupportTicketById(id) {
        return db.prepare(`
            SELECT st.*, u.first_name, u.last_name, u.email,
                   (SELECT first_name || ' ' || last_name FROM users WHERE id = st.assigned_to) as assigned_to_name
            FROM customer_support_tickets st
            JOIN users u ON st.user_id = u.id
            WHERE st.id = ?
        `).get(id);
    }

    updateSupportTicket(id, updateData) {
        const fields = [];
        const params = [];

        if (updateData.status !== undefined) {
            fields.push('status = ?');
            params.push(updateData.status);
        }
        if (updateData.assigned_to !== undefined) {
            fields.push('assigned_to = ?');
            params.push(updateData.assigned_to);
        }
        if (updateData.resolution !== undefined) {
            fields.push('resolution = ?');
            params.push(updateData.resolution);
        }
        if (updateData.resolved_at !== undefined) {
            fields.push('resolved_at = ?');
            params.push(updateData.resolved_at);
        }

        if (fields.length > 0) {
            fields.push('updated_at = CURRENT_TIMESTAMP');
            const query = `UPDATE customer_support_tickets SET ${fields.join(', ')} WHERE id = ?`;
            params.push(id);
            db.prepare(query).run(...params);
        }

        return this.getSupportTicketById(id);
    }

    // Loyalty Points Management
    getLoyaltyPoints(filters = {}) {
        let query = `
            SELECT lp.*, u.first_name, u.last_name, u.email
            FROM loyalty_points lp
            JOIN users u ON lp.user_id = u.id
        `;

        const params = [];
        const conditions = [];

        if (filters.userId) {
            conditions.push('lp.user_id = ?');
            params.push(filters.userId);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY lp.created_at DESC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
        }

        return db.prepare(query).all(...params);
    }

    getUserLoyaltyPoints(userId) {
        return db.prepare('SELECT * FROM loyalty_points WHERE user_id = ?').get(userId);
    }

    // Payment Settlements
    getPaymentSettlements(filters = {}) {
        let query = 'SELECT * FROM payment_settlements';
        const params = [];
        const conditions = [];

        if (filters.status) {
            conditions.push('settlement_status = ?');
            params.push(filters.status);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY settlement_date DESC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
        }

        return db.prepare(query).all(...params);
    }

    // Enhanced Order Management
    assignWarehouseToOrder(orderId, warehouseId) {
        db.prepare('UPDATE orders SET warehouse_id = ? WHERE id = ?').run(warehouseId, orderId);
        return this.getOrderById(orderId);
    }

    updateOrderDetailedStatus(orderId, detailedStatus, notes) {
        // Update order detailed status
        db.prepare('UPDATE orders SET detailed_status = ? WHERE id = ?').run(detailedStatus, orderId);

        // Add to order status history
        db.prepare(`
            INSERT INTO order_status_history (order_id, status, notes, created_by)
            VALUES (?, ?, ?, ?)
        `).run(orderId, detailedStatus, notes || null, null); // TODO: Add admin user ID

        return this.getOrderById(orderId);
    }
}

module.exports = new DatabaseAPI();
