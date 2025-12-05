const { db, usePostgres } = require('./database');

// Migration function to add professional workflow tables
async function migrateToProfessionalWorkflow() {
    console.log('🚀 Starting Professional Workflow Migration...');

    let tableNames = [];
    if (usePostgres) {
        const result = await db.prepare("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'").all();
        tableNames = result.map(t => t.table_name);
    } else {
        const result = await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        tableNames = result.map(t => t.name);
    }

    console.log('📋 Existing tables:', tableNames.join(', '));

    // Helper for SQL types based on DB
    const types = {
        primaryKey: usePostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT',
        datetime: usePostgres ? 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' : 'DATETIME DEFAULT CURRENT_TIMESTAMP',
        boolean: usePostgres ? 'BOOLEAN DEFAULT TRUE' : 'BOOLEAN DEFAULT 1',
        json: usePostgres ? 'JSONB' : 'JSON'
    };

    // Add new tables for professional workflow
    const newTables = [];

    // 1. Warehouses Table
    if (!tableNames.includes('warehouses')) {
        await db.prepare(`
            CREATE TABLE warehouses (
                id ${types.primaryKey},
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
                is_active ${types.boolean},
                latitude DECIMAL(10,8),
                longitude DECIMAL(11,8),
                created_at ${types.datetime},
                updated_at ${types.datetime}
            )
        `).run();
        console.log('✅ Added warehouses table');
        newTables.push('warehouses');
    }

    // 2. Warehouse Inventory Table
    if (!tableNames.includes('warehouse_inventory')) {
        await db.prepare(`
            CREATE TABLE warehouse_inventory (
                id ${types.primaryKey},
                warehouse_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                stock_quantity INTEGER DEFAULT 0,
                reserved_quantity INTEGER DEFAULT 0,
                low_stock_threshold INTEGER DEFAULT 10,
                last_updated ${types.datetime},
                UNIQUE(warehouse_id, product_id)
            )
        `).run();
        // Add FK separately if needed or keep loose for now to avoid syntax diffs
        console.log('✅ Added warehouse_inventory table');
        newTables.push('warehouse_inventory');
    }

    // 3. Courier Partners Table
    if (!tableNames.includes('courier_partners')) {
        await db.prepare(`
            CREATE TABLE courier_partners (
                id ${types.primaryKey},
                name VARCHAR(255) NOT NULL,
                code VARCHAR(50) UNIQUE NOT NULL,
                contact_person VARCHAR(100),
                phone VARCHAR(15),
                email VARCHAR(255),
                api_key VARCHAR(255),
                api_secret VARCHAR(255),
                tracking_url_template VARCHAR(500),
                is_active ${types.boolean},
                serviceable_pincodes TEXT,
                created_at ${types.datetime},
                updated_at ${types.datetime}
            )
        `).run();
        console.log('✅ Added courier_partners table');
        newTables.push('courier_partners');
    }

    // 4. Return Requests Table
    if (!tableNames.includes('return_requests')) {
        await db.prepare(`
            CREATE TABLE return_requests (
                id ${types.primaryKey},
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
                created_at ${types.datetime},
                updated_at ${types.datetime}
            )
        `).run();
        console.log('✅ Added return_requests table');
        newTables.push('return_requests');
    }

    // 5. Refunds Table
    if (!tableNames.includes('refunds')) {
        await db.prepare(`
            CREATE TABLE refunds (
                id ${types.primaryKey},
                return_request_id INTEGER,
                order_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                refund_method VARCHAR(50),
                transaction_id VARCHAR(255),
                bank_reference VARCHAR(255),
                status VARCHAR(50) DEFAULT 'pending',
                processed_by INTEGER,
                processed_at ${types.datetime},
                notes TEXT,
                created_at ${types.datetime},
                updated_at ${types.datetime}
            )
        `).run();
        console.log('✅ Added refunds table');
        newTables.push('refunds');
    }

    // 6. Customer Support Tickets Table
    if (!tableNames.includes('customer_support_tickets')) {
        await db.prepare(`
            CREATE TABLE customer_support_tickets (
                id ${types.primaryKey},
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
                resolved_at ${types.datetime},
                created_at ${types.datetime},
                updated_at ${types.datetime}
            )
        `).run();
        console.log('✅ Added customer_support_tickets table');
        newTables.push('customer_support_tickets');
    }

    // 7. Loyalty Points Table
    if (!tableNames.includes('loyalty_points')) {
        await db.prepare(`
            CREATE TABLE loyalty_points (
                id ${types.primaryKey},
                user_id INTEGER NOT NULL,
                points INTEGER DEFAULT 0,
                total_earned INTEGER DEFAULT 0,
                total_redeemed INTEGER DEFAULT 0,
                tier VARCHAR(50) DEFAULT 'bronze',
                expiry_date DATE,
                created_at ${types.datetime},
                updated_at ${types.datetime}
            )
        `).run();
        console.log('✅ Added loyalty_points table');
        newTables.push('loyalty_points');
    }

    // 8. Loyalty Transactions Table
    if (!tableNames.includes('loyalty_transactions')) {
        await db.prepare(`
            CREATE TABLE loyalty_transactions (
                id ${types.primaryKey},
                user_id INTEGER NOT NULL,
                transaction_type VARCHAR(50) NOT NULL,
                points INTEGER NOT NULL,
                order_id INTEGER,
                description TEXT,
                expiry_date DATE,
                created_at ${types.datetime}
            )
        `).run();
        console.log('✅ Added loyalty_transactions table');
        newTables.push('loyalty_transactions');
    }

    // 9. Payment Settlements Table
    if (!tableNames.includes('payment_settlements')) {
        await db.prepare(`
            CREATE TABLE payment_settlements (
                id ${types.primaryKey},
                settlement_date DATE NOT NULL,
                payment_method VARCHAR(50),
                total_amount DECIMAL(10,2) DEFAULT 0,
                transaction_count INTEGER DEFAULT 0,
                settlement_status VARCHAR(50) DEFAULT 'pending',
                bank_reference VARCHAR(255),
                processed_by INTEGER,
                processed_at ${types.datetime},
                notes TEXT,
                created_at ${types.datetime},
                updated_at ${types.datetime}
            )
        `).run();
        console.log('✅ Added payment_settlements table');
        newTables.push('payment_settlements');
    }

    // 10. Settlement Items Table
    if (!tableNames.includes('settlement_items')) {
        await db.prepare(`
            CREATE TABLE settlement_items (
                id ${types.primaryKey},
                settlement_id INTEGER NOT NULL,
                order_id INTEGER NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                commission DECIMAL(10,2) DEFAULT 0,
                net_amount DECIMAL(10,2) NOT NULL,
                created_at ${types.datetime}
            )
        `).run();
        console.log('✅ Added settlement_items table');
        newTables.push('settlement_items');
    }

    // 11. Analytics Reports Table
    if (!tableNames.includes('analytics_reports')) {
        await db.prepare(`
            CREATE TABLE analytics_reports (
                id ${types.primaryKey},
                report_type VARCHAR(100) NOT NULL,
                report_date DATE NOT NULL,
                period_start DATE,
                period_end DATE,
                data ${types.json},
                generated_by INTEGER,
                created_at ${types.datetime}
            )
        `).run();
        console.log('✅ Added analytics_reports table');
        newTables.push('analytics_reports');
    }

    console.log(`✅ Created ${newTables.length} new tables`);

    // Add new columns to existing tables
    console.log('🔄 Adding new columns to existing tables...');

    const addColumn = async (table, definition) => {
        try {
            await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${definition}`).run();
            console.log(`✅ Added column to ${table}`);
        } catch (error) {
            // Ignore duplication errors
            console.log(`ℹ️ Column likely exists in ${table}`);
        }
    };

    await addColumn('orders', 'warehouse_id INTEGER');
    await addColumn('shipping', 'courier_id INTEGER');
    await addColumn('shipping', 'delivery_agent_id INTEGER');
    await addColumn('orders', "detailed_status VARCHAR(100) DEFAULT 'order_placed'");

    // Add indexes for better performance
    console.log('🔄 Adding indexes for professional workflow...');

    const indexes = [
        'CREATE INDEX idx_orders_warehouse ON orders(warehouse_id)',
        'CREATE INDEX idx_orders_detailed_status ON orders(detailed_status)',
        'CREATE INDEX idx_shipping_courier ON shipping(courier_id)',
        'CREATE INDEX idx_return_requests_order ON return_requests(order_id)',
        'CREATE INDEX idx_return_requests_status ON return_requests(status)',
        'CREATE INDEX idx_refunds_status ON refunds(status)',
        'CREATE INDEX idx_support_tickets_status ON customer_support_tickets(status)',
        'CREATE INDEX idx_loyalty_points_user ON loyalty_points(user_id)',
        'CREATE INDEX idx_warehouse_inventory_product ON warehouse_inventory(product_id)',
        'CREATE INDEX idx_warehouse_inventory_warehouse ON warehouse_inventory(warehouse_id)'
    ];

    for (const indexSQL of indexes) {
        try {
            // Simple check to avoid "IF NOT EXISTS" syntax diffs if possible, or just catch error
            await db.prepare(indexSQL.replace('CREATE INDEX', 'CREATE INDEX IF NOT EXISTS')).run();
        } catch (error) {
            console.log(`ℹ️ Index likely exists: ${indexSQL}`);
        }
    }

    console.log('✅ Added performance indexes');

    // Seed initial data
    console.log('🌱 Seeding initial professional workflow data...');

    // Add default warehouses
    const warehouseCount = (await db.prepare('SELECT COUNT(*) as count FROM warehouses').get()).count;
    if (warehouseCount == 0) {
        const insertWarehouse = db.prepare(`
            INSERT INTO warehouses (name, code, city, state, pincode, phone, email, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const warehouses = [
            ['Mumbai Central Warehouse', 'MUM-CW', 'Mumbai', 'Maharashtra', '400001', '+91-9876543210', 'mumbai@warehouse.com', 1],
            ['Delhi North Warehouse', 'DEL-NW', 'Delhi', 'Delhi', '110001', '+91-9876543211', 'delhi@warehouse.com', 1],
            ['Bangalore South Warehouse', 'BLR-SW', 'Bangalore', 'Karnataka', '560001', '+91-9876543212', 'bangalore@warehouse.com', 1]
        ];

        for (const warehouse of warehouses) {
            // Boolean fix for postgres
            if (usePostgres) warehouse[7] = true;
            await insertWarehouse.run(...warehouse);
        }
        console.log('✅ Seeded 3 default warehouses');
    }

    // Add default courier partners
    const courierCount = (await db.prepare('SELECT COUNT(*) as count FROM courier_partners').get()).count;
    if (courierCount == 0) {
        const insertCourier = db.prepare(`
            INSERT INTO courier_partners (name, code, contact_person, phone, email, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const couriers = [
            ['Delhivery', 'DLV', 'Rajesh Kumar', '+91-9876543213', 'rajesh@delhivery.com', 1],
            ['Blue Dart', 'BDT', 'Priya Singh', '+91-9876543214', 'priya@bluedart.com', 1],
            ['DTDC', 'DTDC', 'Amit Patel', '+91-9876543215', 'amit@dtdc.com', 1]
        ];

        for (const courier of couriers) {
            if (usePostgres) courier[5] = true;
            await insertCourier.run(...courier);
        }
        console.log('✅ Seeded 3 default courier partners');
    }

    console.log('🎉 Professional Workflow Migration Complete!');
    return true;
}

module.exports = {
    migrateToProfessionalWorkflow
};

// Run migration if called directly
if (require.main === module) {
    migrateToProfessionalWorkflow()
        .then(() => console.log('✅ Migration completed successfully!'))
        .catch(err => {
            console.error('❌ Migration failed:', err);
            process.exit(1);
        });
}