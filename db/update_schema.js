const { db } = require('./database');

console.log('🚀 Updating Database Schema...');

const createTables = `
    -- Payment Methods Table
    CREATE TABLE IF NOT EXISTS payment_methods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL, -- 'online', 'offline'
        provider VARCHAR(50), -- 'stripe', 'razorpay', 'cod'
        icon_url VARCHAR(500),
        description TEXT,
        is_active BOOLEAN DEFAULT 1,
        display_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Gift Cards Table
    CREATE TABLE IF NOT EXISTS gift_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code VARCHAR(50) UNIQUE NOT NULL,
        balance DECIMAL(10,2) NOT NULL,
        original_amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'INR',
        is_active BOOLEAN DEFAULT 1,
        expires_at DATETIME,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Order Fees Table
    CREATE TABLE IF NOT EXISTS order_fees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        delivery_charge DECIMAL(10,2) DEFAULT 0,
        marketplace_fee DECIMAL(10,2) DEFAULT 0,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        gift_card_amount DECIMAL(10,2) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    -- Payment Transactions Table
    CREATE TABLE IF NOT EXISTS payment_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        payment_method_id INTEGER,
        transaction_id VARCHAR(255),
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'INR',
        status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'success', 'failed', 'refunded'
        gateway_response TEXT,
        payment_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
    );
`;

try {
    db.exec(createTables);
    console.log('✅ Created missing tables: payment_methods, gift_cards, order_fees, payment_transactions');

    // Seed Payment Methods
    const count = db.prepare('SELECT count(*) as count FROM payment_methods').get();
    if (count.count === 0) {
        const insertMethod = db.prepare(`
            INSERT INTO payment_methods (name, type, provider, description, display_order, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        insertMethod.run('Credit/Debit Card', 'online', 'card', 'Pay securely with your bank card', 1, 1);
        insertMethod.run('UPI / PhonePe', 'online', 'upi', 'Instant payment via UPI apps', 2, 1);
        insertMethod.run('Net Banking', 'online', 'netbanking', 'All major Indian banks supported', 3, 1);
        insertMethod.run('Cash on Delivery', 'offline', 'cod', 'Pay cash when you receive your order', 4, 1);

        console.log('✅ Seeded payment methods');
    }

    // Seed a test Gift Card
    const giftCount = db.prepare('SELECT count(*) as count FROM gift_cards').get();
    if (giftCount.count === 0) {
        db.prepare(`
            INSERT INTO gift_cards (code, balance, original_amount, expires_at)
            VALUES (?, ?, ?, date('now', '+1 year'))
        `).run('WELCOME500', 500.00, 500.00);
        console.log('✅ Seeded test gift card: WELCOME500');
    }

} catch (error) {
    console.error('❌ Error updating schema:', error);
}
