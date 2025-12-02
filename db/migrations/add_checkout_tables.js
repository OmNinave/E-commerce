const { db } = require('../database');

/**
 * Migration: Add Checkout Flow Tables
 * Creates tables for payment methods, transactions, order fees, and gift cards
 */

function runMigration() {
    console.log('🔄 Running checkout flow migration...');

    try {
        // 1. Create payment_methods table
        db.exec(`
            CREATE TABLE IF NOT EXISTS payment_methods (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL CHECK(type IN ('online', 'offline')),
                provider TEXT,
                icon_url TEXT,
                description TEXT,
                is_active INTEGER DEFAULT 1,
                display_order INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created payment_methods table');

        // 2. Create payment_transactions table
        db.exec(`
            CREATE TABLE IF NOT EXISTS payment_transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                payment_method_id INTEGER NOT NULL,
                transaction_id TEXT UNIQUE,
                amount REAL NOT NULL,
                currency TEXT DEFAULT 'INR',
                status TEXT NOT NULL CHECK(status IN ('pending', 'success', 'failed', 'refunded')),
                payment_gateway TEXT,
                gateway_response TEXT,
                payment_date TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
            )
        `);
        console.log('✅ Created payment_transactions table');

        // 3. Create order_fees table
        db.exec(`
            CREATE TABLE IF NOT EXISTS order_fees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL UNIQUE,
                delivery_charge REAL DEFAULT 0,
                marketplace_fee REAL DEFAULT 0,
                tax_amount REAL DEFAULT 0,
                discount_amount REAL DEFAULT 0,
                gift_card_amount REAL DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Created order_fees table');

        // 4. Create gift_cards table
        db.exec(`
            CREATE TABLE IF NOT EXISTS gift_cards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT UNIQUE NOT NULL,
                balance REAL NOT NULL,
                original_amount REAL NOT NULL,
                user_id INTEGER,
                is_active INTEGER DEFAULT 1,
                expires_at TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        console.log('✅ Created gift_cards table');

        // 5. Create saved_cards table (for future use)
        db.exec(`
            CREATE TABLE IF NOT EXISTS saved_cards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                card_last_four TEXT NOT NULL,
                card_brand TEXT NOT NULL,
                card_token TEXT NOT NULL,
                cardholder_name TEXT,
                expiry_month INTEGER,
                expiry_year INTEGER,
                is_default INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Created saved_cards table');

        // 6. Alter orders table - Add new columns
        const ordersColumns = db.prepare("PRAGMA table_info(orders)").all();
        const columnNames = ordersColumns.map(col => col.name);

        if (!columnNames.includes('payment_method_id')) {
            db.exec('ALTER TABLE orders ADD COLUMN payment_method_id INTEGER');
            console.log('✅ Added payment_method_id to orders');
        }

        if (!columnNames.includes('payment_status')) {
            db.exec("ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending'");
            console.log('✅ Added payment_status to orders');
        }

        if (!columnNames.includes('estimated_delivery_date')) {
            db.exec('ALTER TABLE orders ADD COLUMN estimated_delivery_date TEXT');
            console.log('✅ Added estimated_delivery_date to orders');
        }

        if (!columnNames.includes('delivery_instructions')) {
            db.exec('ALTER TABLE orders ADD COLUMN delivery_instructions TEXT');
            console.log('✅ Added delivery_instructions to orders');
        }

        // 7. Seed payment methods
        seedPaymentMethods();

        // 8. Seed sample gift cards (for testing)
        seedGiftCards();

        console.log('✅ Migration completed successfully!');
        return true;

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

function seedPaymentMethods() {
    const existingMethods = db.prepare('SELECT COUNT(*) as count FROM payment_methods').get();

    if (existingMethods.count > 0) {
        console.log('⏭️  Payment methods already seeded');
        return;
    }

    const paymentMethods = [
        // UPI Methods
        { name: 'PhonePe', type: 'online', provider: 'PhonePe', icon_url: '/icons/phonepe.svg', description: 'Pay using PhonePe UPI', display_order: 1 },
        { name: 'Google Pay', type: 'online', provider: 'GooglePay', icon_url: '/icons/googlepay.svg', description: 'Pay using Google Pay', display_order: 2 },
        { name: 'Paytm', type: 'online', provider: 'Paytm', icon_url: '/icons/paytm.svg', description: 'Pay using Paytm UPI', display_order: 3 },
        { name: 'UPI', type: 'online', provider: 'UPI', icon_url: '/icons/upi.svg', description: 'Pay using any UPI app', display_order: 4 },

        // Card Methods
        { name: 'Credit Card', type: 'online', provider: 'Card', icon_url: '/icons/credit-card.svg', description: 'Visa, Mastercard, RuPay', display_order: 5 },
        { name: 'Debit Card', type: 'online', provider: 'Card', icon_url: '/icons/debit-card.svg', description: 'Visa, Mastercard, RuPay', display_order: 6 },

        // Other Online Methods
        { name: 'Net Banking', type: 'online', provider: 'NetBanking', icon_url: '/icons/netbanking.svg', description: 'Pay via Internet Banking', display_order: 7 },
        { name: 'EMI', type: 'online', provider: 'EMI', icon_url: '/icons/emi.svg', description: 'Easy installments', display_order: 8 },

        // Offline Methods
        { name: 'Cash on Delivery', type: 'offline', provider: 'COD', icon_url: '/icons/cod.svg', description: 'Pay when you receive', display_order: 9 }
    ];

    const insertStmt = db.prepare(`
        INSERT INTO payment_methods (name, type, provider, icon_url, description, display_order)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const method of paymentMethods) {
        insertStmt.run(
            method.name,
            method.type,
            method.provider,
            method.icon_url,
            method.description,
            method.display_order
        );
    }

    console.log(`✅ Seeded ${paymentMethods.length} payment methods`);
}

function seedGiftCards() {
    const existingCards = db.prepare('SELECT COUNT(*) as count FROM gift_cards').get();

    if (existingCards.count > 0) {
        console.log('⏭️  Gift cards already seeded');
        return;
    }

    const giftCards = [
        { code: 'WELCOME500', balance: 500, original_amount: 500, expires_at: '2025-12-31' },
        { code: 'SAVE1000', balance: 1000, original_amount: 1000, expires_at: '2025-12-31' },
        { code: 'TEST2000', balance: 2000, original_amount: 2000, expires_at: '2025-12-31' }
    ];

    const insertStmt = db.prepare(`
        INSERT INTO gift_cards (code, balance, original_amount, expires_at)
        VALUES (?, ?, ?, ?)
    `);

    for (const card of giftCards) {
        insertStmt.run(card.code, card.balance, card.original_amount, card.expires_at);
    }

    console.log(`✅ Seeded ${giftCards.length} test gift cards`);
}

// Run migration if called directly
if (require.main === module) {
    runMigration();
}

module.exports = { runMigration };
