const Database = require('better-sqlite3');
const path = require('path');

// Database path
const DB_PATH = path.join(__dirname, 'ecommerce.db');

// Create database connection
const db = new Database(DB_PATH, { verbose: console.log });

// Migration function to add professional workflow tables
function migrateToProfessionalWorkflow() {
    console.log('🚀 Starting Professional Workflow Migration...');

    // Check if tables already exist
    const existingTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const tableNames = existingTables.map(t => t.name);

    console.log('📋 Existing tables:', tableNames.join(', '));

    // Add new tables for professional workflow
    const newTables = [];

    // 1. Warehouses Table
    if (!tableNames.includes('warehouses')) {
        newTables.push(`
            -- Warehouses Table
            CREATE TABLE warehouses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                code VARCHAR(50) UNIQUE NOT NULL,
                address_line1 VARCHAR(255),
                address_line2 VARCHAR(255),
                city VARCHAR(100),
                state VARCHAR(100),
                pincode VARCHAR(10),
                phone VARCHAR(15),
                email VARCHAR(255),
                manager_name VARCHAR(100),
                capacity INTEGER,
                is_active BOOLEAN DEFAULT 1,
                latitude DECIMAL(10,8),
                longitude DECIMAL(11,8),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Added warehouses table');
    }

    // 2. Warehouse Inventory Table
    if (!tableNames.includes('warehouse_inventory')) {
        newTables.push(`
            -- Warehouse Inventory Table
            CREATE TABLE warehouse_inventory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                warehouse_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                stock_quantity INTEGER DEFAULT 0,
                reserved_quantity INTEGER DEFAULT 0,
                low_stock_threshold INTEGER DEFAULT 10,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                UNIQUE(warehouse_id, product_id)
            );
        `);
        console.log('✅ Added warehouse_inventory table');
    }

    // 3. Courier Partners Table
    if (!tableNames.includes('courier_partners')) {
        newTables.push(`
            -- Courier Partners Table
            CREATE TABLE courier_partners (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                code VARCHAR(50) UNIQUE NOT NULL,
                contact_person VARCHAR(100),
                phone VARCHAR(15),
                email VARCHAR(255),
                api_key VARCHAR(255),
                api_secret VARCHAR(255),
                tracking_url_template VARCHAR(500),
                is_active BOOLEAN DEFAULT 1,
                serviceable_pincodes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Added courier_partners table');
    }

    // 4. Return Requests Table
    if (!tableNames.includes('return_requests')) {
        newTables.push(`
            -- Return Requests Table
            CREATE TABLE return_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                reason VARCHAR(100) NOT NULL,
                description TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                refund_amount DECIMAL(10,2),
                refund_method VARCHAR(50),
                refund_status VARCHAR(50) DEFAULT 'pending',
                pickup_address_id INTEGER,
                pickup_scheduled_date DATE,
                pickup_completed_date DATE,
                inspection_date DATE,
                inspection_result VARCHAR(50),
                refund_processed_date DATE,
                admin_notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (pickup_address_id) REFERENCES addresses(id)
            );
        `);
        console.log('✅ Added return_requests table');
    }

    // 5. Refunds Table
    if (!tableNames.includes('refunds')) {
        newTables.push(`
            -- Refunds Table
            CREATE TABLE refunds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                return_request_id INTEGER,
                order_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                refund_method VARCHAR(50),
                transaction_id VARCHAR(255),
                bank_reference VARCHAR(255),
                status VARCHAR(50) DEFAULT 'pending',
                processed_by INTEGER,
                processed_at DATETIME,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (return_request_id) REFERENCES return_requests(id),
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (processed_by) REFERENCES users(id)
            );
        `);
        console.log('✅ Added refunds table');
    }

    // 6. Customer Support Tickets Table
    if (!tableNames.includes('customer_support_tickets')) {
        newTables.push(`
            -- Customer Support Tickets Table
            CREATE TABLE customer_support_tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticket_number VARCHAR(50) UNIQUE NOT NULL,
                user_id INTEGER NOT NULL,
                order_id INTEGER,
                subject VARCHAR(255) NOT NULL,
                description TEXT,
                category VARCHAR(100),
                priority VARCHAR(20) DEFAULT 'medium',
                status VARCHAR(50) DEFAULT 'open',
                assigned_to INTEGER,
                resolution TEXT,
                resolved_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (assigned_to) REFERENCES users(id)
            );
        `);
        console.log('✅ Added customer_support_tickets table');
    }

    // 7. Loyalty Points Table
    if (!tableNames.includes('loyalty_points')) {
        newTables.push(`
            -- Loyalty Points Table
            CREATE TABLE loyalty_points (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                points INTEGER DEFAULT 0,
                total_earned INTEGER DEFAULT 0,
                total_redeemed INTEGER DEFAULT 0,
                tier VARCHAR(50) DEFAULT 'bronze',
                expiry_date DATE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log('✅ Added loyalty_points table');
    }

    // 8. Loyalty Transactions Table
    if (!tableNames.includes('loyalty_transactions')) {
        newTables.push(`
            -- Loyalty Transactions Table
            CREATE TABLE loyalty_transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                transaction_type VARCHAR(50) NOT NULL,
                points INTEGER NOT NULL,
                order_id INTEGER,
                description TEXT,
                expiry_date DATE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (order_id) REFERENCES orders(id)
            );
        `);
        console.log('✅ Added loyalty_transactions table');
    }

    // 9. Payment Settlements Table
    if (!tableNames.includes('payment_settlements')) {
        newTables.push(`
            -- Payment Settlements Table
            CREATE TABLE payment_settlements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                settlement_date DATE NOT NULL,
                payment_method VARCHAR(50),
                total_amount DECIMAL(10,2) DEFAULT 0,
                transaction_count INTEGER DEFAULT 0,
                settlement_status VARCHAR(50) DEFAULT 'pending',
                bank_reference VARCHAR(255),
                processed_by INTEGER,
                processed_at DATETIME,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (processed_by) REFERENCES users(id)
            );
        `);
        console.log('✅ Added payment_settlements table');
    }

    // 10. Settlement Items Table
    if (!tableNames.includes('settlement_items')) {
        newTables.push(`
            -- Settlement Items Table
            CREATE TABLE settlement_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                settlement_id INTEGER NOT NULL,
                order_id INTEGER NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                commission DECIMAL(10,2) DEFAULT 0,
                net_amount DECIMAL(10,2) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (settlement_id) REFERENCES payment_settlements(id) ON DELETE CASCADE,
                FOREIGN KEY (order_id) REFERENCES orders(id)
            );
        `);
        console.log('✅ Added settlement_items table');
    }

    // 11. Analytics Reports Table
    if (!tableNames.includes('analytics_reports')) {
        newTables.push(`
            -- Analytics Reports Table
            CREATE TABLE analytics_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                report_type VARCHAR(100) NOT NULL,
                report_date DATE NOT NULL,
                period_start DATE,
                period_end DATE,
                data JSON,
                generated_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (generated_by) REFERENCES users(id)
            );
        `);
        console.log('✅ Added analytics_reports table');
    }

    // Execute table creation
    if (newTables.length > 0) {
        const createTablesSQL = newTables.join('\n');
        db.exec(createTablesSQL);
        console.log(`✅ Created ${newTables.length} new tables`);
    } else {
        console.log('ℹ️  All professional workflow tables already exist');
    }

    // Add new columns to existing tables
    console.log('🔄 Adding new columns to existing tables...');

    // Add warehouse_id to orders table
    try {
        db.exec(`ALTER TABLE orders ADD COLUMN warehouse_id INTEGER REFERENCES warehouses(id)`);
        console.log('✅ Added warehouse_id to orders table');
    } catch (error) {
        if (!error.message.includes('duplicate column name')) {
            console.log('⚠️  warehouse_id column may already exist in orders table');
        }
    }

    // Add courier_id to shipping table
    try {
        db.exec(`ALTER TABLE shipping ADD COLUMN courier_id INTEGER REFERENCES courier_partners(id)`);
        console.log('✅ Added courier_id to shipping table');
    } catch (error) {
        if (!error.message.includes('duplicate column name')) {
            console.log('⚠️  courier_id column may already exist in shipping table');
        }
    }

    // Add delivery_agent_id to shipping table
    try {
        db.exec(`ALTER TABLE shipping ADD COLUMN delivery_agent_id INTEGER`);
        console.log('✅ Added delivery_agent_id to shipping table');
    } catch (error) {
        if (!error.message.includes('duplicate column name')) {
            console.log('⚠️  delivery_agent_id column may already exist in shipping table');
        }
    }

    // Add detailed status to orders table
    try {
        db.exec(`ALTER TABLE orders ADD COLUMN detailed_status VARCHAR(100) DEFAULT 'order_placed'`);
        console.log('✅ Added detailed_status to orders table');
    } catch (error) {
        if (!error.message.includes('duplicate column name')) {
            console.log('⚠️  detailed_status column may already exist in orders table');
        }
    }

    // Add indexes for better performance
    console.log('🔄 Adding indexes for professional workflow...');

    const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_orders_warehouse ON orders(warehouse_id)',
        'CREATE INDEX IF NOT EXISTS idx_orders_detailed_status ON orders(detailed_status)',
        'CREATE INDEX IF NOT EXISTS idx_shipping_courier ON shipping(courier_id)',
        'CREATE INDEX IF NOT EXISTS idx_return_requests_order ON return_requests(order_id)',
        'CREATE INDEX IF NOT EXISTS idx_return_requests_status ON return_requests(status)',
        'CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status)',
        'CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON customer_support_tickets(status)',
        'CREATE INDEX IF NOT EXISTS idx_loyalty_points_user ON loyalty_points(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_product ON warehouse_inventory(product_id)',
        'CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_warehouse ON warehouse_inventory(warehouse_id)'
    ];

    indexes.forEach(indexSQL => {
        try {
            db.exec(indexSQL);
        } catch (error) {
            console.log(`⚠️  Index may already exist: ${indexSQL.split('idx_')[1].split(' ')[0]}`);
        }
    });

    console.log('✅ Added performance indexes');

    // Seed initial data
    console.log('🌱 Seeding initial professional workflow data...');

    // Add default warehouses
    const warehouseCount = db.prepare('SELECT COUNT(*) as count FROM warehouses').get();
    if (warehouseCount.count === 0) {
        const insertWarehouse = db.prepare(`
            INSERT INTO warehouses (name, code, city, state, pincode, phone, email, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const warehouses = [
            ['Mumbai Central Warehouse', 'MUM-CW', 'Mumbai', 'Maharashtra', '400001', '+91-9876543210', 'mumbai@warehouse.com', 1],
            ['Delhi North Warehouse', 'DEL-NW', 'Delhi', 'Delhi', '110001', '+91-9876543211', 'delhi@warehouse.com', 1],
            ['Bangalore South Warehouse', 'BLR-SW', 'Bangalore', 'Karnataka', '560001', '+91-9876543212', 'bangalore@warehouse.com', 1]
        ];

        warehouses.forEach(warehouse => {
            insertWarehouse.run(warehouse);
        });

        console.log('✅ Seeded 3 default warehouses');
    }

    // Add default courier partners
    const courierCount = db.prepare('SELECT COUNT(*) as count FROM courier_partners').get();
    if (courierCount.count === 0) {
        const insertCourier = db.prepare(`
            INSERT INTO courier_partners (name, code, contact_person, phone, email, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const couriers = [
            ['Delhivery', 'DLV', 'Rajesh Kumar', '+91-9876543213', 'rajesh@delhivery.com', 1],
            ['Blue Dart', 'BDT', 'Priya Singh', '+91-9876543214', 'priya@bluedart.com', 1],
            ['DTDC', 'DTDC', 'Amit Patel', '+91-9876543215', 'amit@dtdc.com', 1]
        ];

        couriers.forEach(courier => {
            insertCourier.run(courier);
        });

        console.log('✅ Seeded 3 default courier partners');
    }

    console.log('🎉 Professional Workflow Migration Complete!');
    console.log('📊 New tables added:', newTables.length);
    console.log('🔄 Database ready for professional e-commerce operations');

    return true;
}

// Export the migration function
module.exports = {
    migrateToProfessionalWorkflow
};

// Run migration if called directly
if (require.main === module) {
    try {
        migrateToProfessionalWorkflow();
        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}