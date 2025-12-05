const { db, usePostgres } = require('./database');

/**
 * Enterprise E-commerce Database API
 * Complete CRUD operations for all entities
 * now Fully Async and Postgres Compatible
 */

class DatabaseAPI {
    // ==================== PRODUCTS ====================

    async getAllProducts(filters = {}) {
        let query = `
      SELECT p.*, c.name as category_name, 
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = ${usePostgres ? 'true' : '1'} LIMIT 1) as primary_image,
             (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;

        if (!filters.include_inactive) {
            query += usePostgres ? ' AND p.is_active = true' : ' AND p.is_active = 1';
        }

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

        // ASYNC CALL
        return await db.prepare(query).all(...params);
    }

    async getProductsCount(filters = {}) {
        let query = `
      SELECT COUNT(*) as count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;

        if (!filters.include_inactive) {
            query += usePostgres ? ' AND p.is_active = true' : ' AND p.is_active = 1';
        }

        const params = [];

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

        // ASYNC CALL
        const result = await db.prepare(query).get(...params);
        return result.count;
    }

    async getProductById(id) {
        // ASYNC CALL
        const product = await db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(id);

        if (product) {
            product.images = await this.getProductImages(id);
            product.discount = await this.getActiveDiscount(id);

            // Parse JSON fields
            try { product.features = typeof product.features === 'string' ? JSON.parse(product.features || '[]') : product.features; } catch (e) { product.features = []; }
            try { product.specifications = typeof product.specifications === 'string' ? JSON.parse(product.specifications || '{}') : product.specifications; } catch (e) { product.specifications = {}; }
            try { product.shipping_info = typeof product.shipping_info === 'string' ? JSON.parse(product.shipping_info || '{}') : product.shipping_info; } catch (e) { product.shipping_info = {}; }
        }

        return product;
    }

    async createProduct(productData) {
        let sql = `
      INSERT INTO products (
        name, slug, model, tagline, description, category_id, brand, sku,
        base_price, selling_price, cost_price, stock_quantity, low_stock_threshold,
        weight, dimensions, is_active, is_featured, features, specifications, shipping_info, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        if (usePostgres) {
            sql += ' RETURNING id';
        }

        const now = new Date().toISOString();
        // ASYNC CALL
        const result = await db.prepare(sql).run(
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
            productData.is_active !== undefined ? productData.is_active : (usePostgres ? true : 1),
            productData.is_featured || 0,
            JSON.stringify(productData.features || []),
            JSON.stringify(productData.specifications || {}),
            JSON.stringify(productData.shipping_info || {}),
            now,
            now
        );

        return result.lastInsertRowid; // Wrapper ensures this exists for both
    }

    async updateProduct(id, productData) {
        const fields = [];
        const values = [];

        const allowedFields = [
            'name', 'slug', 'model', 'tagline', 'description', 'category_id', 'brand', 'sku',
            'base_price', 'selling_price', 'cost_price', 'stock_quantity', 'low_stock_threshold',
            'weight', 'dimensions', 'is_active', 'is_featured', 'features', 'specifications', 'shipping_info'
        ];

        for (const field of allowedFields) {
            if (productData[field] !== undefined) {
                fields.push(`${field} = ?`);
                if (['features', 'specifications', 'shipping_info'].includes(field) && typeof productData[field] === 'object') {
                    values.push(JSON.stringify(productData[field]));
                } else {
                    values.push(productData[field]);
                }
            }
        }

        fields.push('updated_at = ?');
        values.push(new Date().toISOString());
        values.push(id);

        const stmt = db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`);
        return await stmt.run(...values);
    }

    async deleteProduct(id) {
        return await db.prepare(`UPDATE products SET is_active = ${usePostgres ? 'false' : '0'} WHERE id = ?`).run(id);
    }

    // ==================== PRODUCT IMAGES ====================

    async getProductImages(productId) {
        return await db.prepare(`
      SELECT * FROM product_images
      WHERE product_id = ?
      ORDER BY is_primary DESC, display_order ASC
    `).all(productId);
    }

    async addProductImage(productId, imageData) {
        return await db.prepare(`
      INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
      VALUES (?, ?, ?, ?, ?)
    `).run(
            productId,
            imageData.image_url,
            imageData.alt_text || '',
            imageData.is_primary || (usePostgres ? false : 0),
            imageData.display_order || 0
        );
    }

    async deleteProductImage(imageId) {
        return await db.prepare('DELETE FROM product_images WHERE id = ?').run(imageId);
    }

    async setPrimaryProductImage(productId, imageId) {
        const transaction = db.transaction(async () => {
            // Reset all images
            await db.prepare(`UPDATE product_images SET is_primary = ${usePostgres ? 'false' : '0'} WHERE product_id = ?`).run(productId);
            // Set primary
            await db.prepare(`UPDATE product_images SET is_primary = ${usePostgres ? 'true' : '1'} WHERE id = ? AND product_id = ?`).run(imageId, productId);
        });

        await transaction();
        return true;
    }

    // ==================== CATEGORIES ====================

    async getAllCategories() {
        return await db.prepare(`
      SELECT c.*, 
             (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = ${usePostgres ? 'true' : '1'}) as product_count
      FROM categories c
      WHERE c.is_active = ${usePostgres ? 'true' : '1'}
      ORDER BY c.display_order ASC
    `).all();
    }

    async createCategory(categoryData) {
        return await db.prepare(`
      INSERT INTO categories (name, slug, description, parent_id, image_url, is_active, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
            categoryData.name,
            categoryData.slug,
            categoryData.description || '',
            categoryData.parent_id || null,
            categoryData.image_url || null,
            categoryData.is_active !== undefined ? categoryData.is_active : (usePostgres ? true : 1),
            categoryData.display_order || 0
        );
    }

    // ==================== DISCOUNTS ====================

    async getActiveDiscount(productId) {
        const now = new Date().toISOString();
        return await db.prepare(`
      SELECT * FROM discounts
      WHERE product_id = ?
        AND is_active = ${usePostgres ? 'true' : '1'}
        AND (start_date IS NULL OR start_date <= ?)
        AND (end_date IS NULL OR end_date >= ?)
      ORDER BY discount_value DESC
      LIMIT 1
    `).get(productId, now, now);
    }

    async createDiscount(discountData) {
        return await db.prepare(`
      INSERT INTO discounts (product_id, discount_type, discount_value, start_date, end_date, is_active, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
            discountData.product_id,
            discountData.discount_type,
            discountData.discount_value,
            discountData.start_date || null,
            discountData.end_date || null,
            discountData.is_active !== undefined ? discountData.is_active : (usePostgres ? true : 1),
            discountData.created_by || null
        );
    }

    async deleteDiscount(id) {
        return await db.prepare(`UPDATE discounts SET is_active = ${usePostgres ? 'false' : '0'} WHERE id = ?`).run(id);
    }

    // ==================== ORDERS ====================

    async getAllOrders(filters = {}) {
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

        return await db.prepare(query).all(...params);
    }

    async getOrderById(id) {
        const order = await db.prepare(`
      SELECT 
        sa.full_name, sa.phone, sa.address_line1, sa.address_line2, sa.city, sa.state, sa.pincode, sa.landmark,
        u.email as user_email, u.first_name, u.last_name, u.phone as user_phone,
        o.*
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses sa ON o.shipping_address_id = sa.id
      WHERE o.id = ?
    `).get(id);

        if (order) {
            order.items = await this.getOrderItems(id);
            order.status_history = await this.getOrderStatusHistory(id);
            order.shipping = await this.getOrderShipping(id);
        }

        return order;
    }

    async createOrder(orderData) {
        let sql = `
      INSERT INTO orders (
        order_number, user_id, status, payment_status, payment_method, payment_id,
        subtotal, discount_amount, shipping_cost, tax_amount, total_amount,
        coupon_code, shipping_address_id, billing_address_id, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        if (usePostgres) {
            sql += ' RETURNING id';
        }

        const result = await db.prepare(sql).run(
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

    async updateOrderStatus(orderId, status, notes = null, userId = null) {
        const transaction = db.transaction(async () => {
            // Update order status
            await db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?')
                .run(status, new Date().toISOString(), orderId);

            // Add to status history
            await db.prepare(`
        INSERT INTO order_status_history (order_id, status, notes, created_by)
        VALUES (?, ?, ?, ?)
      `).run(orderId, status, notes, userId);

            // Update timestamps based on status
            if (status === 'shipped') {
                await db.prepare('UPDATE orders SET shipped_at = ? WHERE id = ?')
                    .run(new Date().toISOString(), orderId);
            } else if (status === 'delivered') {
                await db.prepare('UPDATE orders SET delivered_at = ? WHERE id = ?')
                    .run(new Date().toISOString(), orderId);
            } else if (status === 'cancelled') {
                await db.prepare('UPDATE orders SET cancelled_at = ? WHERE id = ?')
                    .run(new Date().toISOString(), orderId);
            }
        });

        await transaction();
        return true;
    }

    async getOrderItems(orderId) {
        return await db.prepare(`
      SELECT oi.*, p.name as product_name, p.sku as product_sku
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(orderId);
    }

    async addOrderItem(orderItemData) {
        return await db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, discount_amount, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
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

    async getOrderStatusHistory(orderId) {
        return await db.prepare(`
      SELECT osh.*, u.first_name, u.last_name
      FROM order_status_history osh
      LEFT JOIN users u ON osh.created_by = u.id
      WHERE osh.order_id = ?
      ORDER BY osh.created_at ASC
    `).all(orderId);
    }

    async getOrderShipping(orderId) {
        return await db.prepare('SELECT * FROM shipping WHERE order_id = ?').get(orderId);
    }

    // ==================== USERS ====================

    async getUserByEmail(email) {
        return await db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    }

    async getUserById(id) {
        return await db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    }

    async createUser(userData) {
        let sql = `
      INSERT INTO users (email, password_hash, first_name, last_name, phone, email_verified, is_admin)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
        if (usePostgres) sql += ' RETURNING id';

        return await db.prepare(sql).run(
            userData.email,
            userData.password_hash,
            userData.first_name || '',
            userData.last_name || '',
            userData.phone || '',
            userData.email_verified || (usePostgres ? false : 0),
            userData.is_admin || (usePostgres ? false : 0)
        );
    }

    // ==================== NOTIFICATIONS ====================

    async createNotification(notificationData) {
        return await db.prepare(`
      INSERT INTO notifications (user_id, type, title, message, link, is_read)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
            notificationData.user_id || null,
            notificationData.type,
            notificationData.title,
            notificationData.message,
            notificationData.link || null,
            usePostgres ? false : 0
        );
    }

    async getUnreadNotifications(userId = null) {
        if (userId) {
            return await db.prepare(`SELECT * FROM notifications WHERE user_id = ? AND is_read = ${usePostgres ? 'false' : '0'} ORDER BY created_at DESC`)
                .all(userId);
        } else {
            return await db.prepare(`SELECT * FROM notifications WHERE user_id IS NULL AND is_read = ${usePostgres ? 'false' : '0'} ORDER BY created_at DESC`)
                .all();
        }
    }

    async markNotificationAsRead(id) {
        return await db.prepare(`UPDATE notifications SET is_read = ${usePostgres ? 'true' : '1'} WHERE id = ?`).run(id);
    }

    // ==================== ANALYTICS ====================

    async getDashboardStats() {
        const stats = {};
        const isActiveTrue = usePostgres ? 'true' : '1';

        // Helper to safely get count
        const getCount = async (sql, ...params) => {
            const res = await db.prepare(sql).get(...params);
            return res ? (parseInt(res.count) || 0) : 0;
        };

        const getTotal = async (sql, ...params) => {
            const res = await db.prepare(sql).get(...params);
            return res ? (parseFloat(res.total) || 0) : 0;
        };

        // Total products
        stats.total_products = await getCount(`SELECT COUNT(*) as count FROM products WHERE is_active = ${isActiveTrue}`);

        // Total orders
        stats.total_orders = await getCount('SELECT COUNT(*) as count FROM orders');

        // Total revenue
        stats.total_revenue = await getTotal('SELECT SUM(total_amount) as total FROM orders WHERE payment_status = ?', 'paid'); // Assuming 'paid' is string literal

        // Pending orders
        stats.pending_orders = await getCount('SELECT COUNT(*) as count FROM orders WHERE status = ?', 'pending');

        // Low stock products
        stats.low_stock_products = await getCount(`SELECT COUNT(*) as count FROM products WHERE stock_quantity <= low_stock_threshold AND is_active = ${isActiveTrue}`);

        // Today's orders
        const today = new Date().toISOString().split('T')[0];
        // Postgres date functions are different
        const dateFilter = usePostgres ? "DATE(created_at) = DATE($1)" : "DATE(created_at) = ?";

        stats.today_orders = await getCount(`SELECT COUNT(*) as count FROM orders WHERE ${dateFilter}`, today);

        // Today's revenue
        stats.today_revenue = await getTotal(`SELECT SUM(total_amount) as total FROM orders WHERE ${dateFilter} AND payment_status = 'paid'`, today);

        return stats;
    }

    // ==================== PROFESSIONAL WORKFLOW API ====================

    // Warehouse Management
    async getAllWarehouses() {
        return await db.prepare(`SELECT * FROM warehouses WHERE is_active = ${usePostgres ? 'true' : '1'} ORDER BY name`).all();
    }

    async createWarehouse(warehouseData) {
        let sql = `
            INSERT INTO warehouses (name, code, address_line1, address_line2, city, state, pincode, phone, email, manager_name, capacity, latitude, longitude, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        if (usePostgres) sql += ' RETURNING id';

        const result = await db.prepare(sql).run(
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
            warehouseData.is_active !== undefined ? warehouseData.is_active : (usePostgres ? true : 1)
        );

        return await this.getWarehouseById(result.lastInsertRowid);
    }

    async getWarehouseById(id) {
        return await db.prepare('SELECT * FROM warehouses WHERE id = ?').get(id);
    }

    async updateWarehouse(id, warehouseData) {
        const stmt = db.prepare(`
            UPDATE warehouses SET
                name = ?, code = ?, address_line1 = ?, address_line2 = ?, city = ?, state = ?, pincode = ?,
                phone = ?, email = ?, manager_name = ?, capacity = ?, latitude = ?, longitude = ?, is_active = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        await stmt.run(
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
            warehouseData.is_active !== undefined ? warehouseData.is_active : (usePostgres ? true : 1),
            id
        );

        return await this.getWarehouseById(id);
    }

    // Warehouse Inventory Management
    async getAllWarehouseInventory() {
        return await db.prepare(`
            SELECT wi.*, w.name as warehouse_name, w.code as warehouse_code,
                   p.name as product_name, p.sku as product_sku
            FROM warehouse_inventory wi
            JOIN warehouses w ON wi.warehouse_id = w.id
            JOIN products p ON wi.product_id = p.id
            ORDER BY w.name, p.name
        `).all();
    }

    async getWarehouseInventoryByWarehouse(warehouseId) {
        return await db.prepare(`
            SELECT wi.*, p.name as product_name, p.sku as product_sku, p.selling_price
            FROM warehouse_inventory wi
            JOIN products p ON wi.product_id = p.id
            WHERE wi.warehouse_id = ?
            ORDER BY p.name
        `).all(warehouseId);
    }

    async getWarehouseInventory(warehouseId, productId) {
        return await db.prepare(`
            SELECT wi.*, w.name as warehouse_name, p.name as product_name, p.sku as product_sku
            FROM warehouse_inventory wi
            JOIN warehouses w ON wi.warehouse_id = w.id
            JOIN products p ON wi.product_id = p.id
            WHERE wi.warehouse_id = ? AND wi.product_id = ?
        `).get(warehouseId, productId);
    }

    async updateWarehouseInventory(warehouseId, productId, data) {
        // First check if inventory record exists
        const existing = await this.getWarehouseInventory(warehouseId, productId);

        if (existing) {
            // Update existing record
            await db.prepare(`
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
            await db.prepare(`
                INSERT INTO warehouse_inventory (warehouse_id, product_id, stock_quantity, reserved_quantity)
                VALUES (?, ?, ?, ?)
            `).run(
                warehouseId,
                productId,
                data.stock_quantity,
                data.reserved_quantity || 0
            );
        }

        return await this.getWarehouseInventory(warehouseId, productId);
    }

    // Courier Partners Management
    async getAllCourierPartners() {
        return await db.prepare(`SELECT * FROM courier_partners WHERE is_active = ${usePostgres ? 'true' : '1'} ORDER BY name`).all();
    }

    async createCourierPartner(courierData) {
        let sql = `
            INSERT INTO courier_partners (name, code, contact_person, phone, email, api_key, api_secret, tracking_url_template, serviceable_pincodes, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        if (usePostgres) sql += ' RETURNING id';

        const result = await db.prepare(sql).run(
            courierData.name,
            courierData.code,
            courierData.contact_person || null,
            courierData.phone || null,
            courierData.email || null,
            courierData.api_key || null,
            courierData.api_secret || null,
            courierData.tracking_url_template || null,
            courierData.serviceable_pincodes || null,
            courierData.is_active !== undefined ? courierData.is_active : (usePostgres ? true : 1)
        );

        return await this.getCourierPartnerById(result.lastInsertRowid);
    }

    async getCourierPartnerById(id) {
        return await db.prepare('SELECT * FROM courier_partners WHERE id = ?').get(id);
    }

    // Return Requests Management
    async getReturnRequests(filters = {}) {
        let query = `
            SELECT rr.*, o.order_number, o.total_amount, u.first_name, u.last_name, u.email
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

        const requests = await db.prepare(query).all(...params);

        // Attach items to each request
        // Since we are async, we use Promise.all
        return await Promise.all(requests.map(async req => {
            req.items = await this.getOrderItems(req.order_id);
            return req;
        }));
    }

    async createReturnRequest(returnData) {
        let sql = `
            INSERT INTO return_requests (order_id, user_id, reason, description, refund_amount, refund_method, pickup_address_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        if (usePostgres) sql += ' RETURNING id';

        const result = await db.prepare(sql).run(
            returnData.order_id,
            returnData.user_id,
            returnData.reason,
            returnData.description || null,
            returnData.refund_amount || null,
            returnData.refund_method || null,
            returnData.pickup_address_id || null
        );

        return await this.getReturnRequestById(result.lastInsertRowid);
    }

    async getReturnRequestById(id) {
        return await db.prepare(`
            SELECT rr.*, o.order_number, u.first_name, u.last_name, u.email
            FROM return_requests rr
            JOIN orders o ON rr.order_id = o.id
            JOIN users u ON rr.user_id = u.id
            WHERE rr.id = ?
        `).get(id);
    }

    async updateReturnRequest(id, updateData) {
        const fields = [];
        const values = [];

        const allowedFields = [
            'status', 'refund_status', 'pickup_scheduled_date', 'pickup_completed_date',
            'inspection_date', 'inspection_result', 'refund_processed_date', 'admin_notes'
        ];

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(updateData[field]);
            }
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        if (fields.length > 1) { // >1 because updated_at is always there
            await db.prepare(`UPDATE return_requests SET ${fields.join(', ')} WHERE id = ?`).run(...values);
        }

        return await this.getReturnRequestById(id);
    }


    // Support Tickets
    async createSupportTicket(ticketData) {
        let sql = `
            INSERT INTO customer_support_tickets (ticket_number, user_id, order_id, subject, description, category, priority, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        if (usePostgres) sql += ' RETURNING id';

        const result = await db.prepare(sql).run(
            ticketData.ticket_number,
            ticketData.user_id,
            ticketData.order_id || null,
            ticketData.subject,
            ticketData.description || null,
            ticketData.category || 'general',
            ticketData.priority || 'medium',
            ticketData.status || 'open'
        );
        return result.lastInsertRowid;
    }
}

// Export Singleton Instance
const dbAPI = new DatabaseAPI();
module.exports = dbAPI;
