const { Pool } = require('pg');
const sqlite3 = require('better-sqlite3');
const fs = require('fs');

// PostgreSQL connection (will be set from environment variable on Render)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// SQLite connection (local)
const sqliteDb = sqlite3('./ecomerce.db');

async function migrateDatabase() {
    console.log('🔄 Starting database migration from SQLite to PostgreSQL...\n');

    try {
        // Create tables in PostgreSQL
        console.log('1️⃣ Creating tables in PostgreSQL...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                phone VARCHAR(20),
                is_admin BOOLEAN DEFAULT FALSE,
                email_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('   ✅ Users table created');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                description TEXT,
                category VARCHAR(100),
                brand VARCHAR(100),
                mrp DECIMAL(10, 2),
                selling_price DECIMAL(10, 2) NOT NULL,
                stock_quantity INTEGER DEFAULT 0,
                sku VARCHAR(100) UNIQUE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('   ✅ Products table created');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS product_images (
                id SERIAL PRIMARY KEY,
                product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                image_url TEXT NOT NULL,
                is_primary BOOLEAN DEFAULT FALSE,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('   ✅ Product images table created');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS addresses (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                full_name VARCHAR(255),
                phone VARCHAR(20),
                address_line1 TEXT,
                address_line2 TEXT,
                city VARCHAR(100),
                state VARCHAR(100),
                postal_code VARCHAR(20),
                country VARCHAR(100) DEFAULT 'India',
                is_default BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('   ✅ Addresses table created');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                order_number VARCHAR(100) UNIQUE,
                total_amount DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                payment_method VARCHAR(50),
                payment_status VARCHAR(50) DEFAULT 'pending',
                shipping_address_id INTEGER REFERENCES addresses(id),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('   ✅ Orders table created');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                product_id INTEGER REFERENCES products(id),
                product_name VARCHAR(255),
                product_sku VARCHAR(100),
                quantity INTEGER NOT NULL,
                unit_price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('   ✅ Order items table created');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS return_requests (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id),
                user_id INTEGER REFERENCES users(id),
                reason TEXT,
                description TEXT,
                status VARCHAR(50) DEFAULT 'return_requested',
                refund_amount DECIMAL(10, 2),
                refund_method VARCHAR(50),
                pickup_address_id INTEGER REFERENCES addresses(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('   ✅ Return requests table created');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS wishlist (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, product_id)
            );
        `);
        console.log('   ✅ Wishlist table created\n');

        // Migrate data (only if SQLite database exists)
        if (fs.existsSync('./ecomerce.db')) {
            console.log('2️⃣ Migrating data from SQLite...');

            // Migrate users
            const users = sqliteDb.prepare('SELECT * FROM users').all();
            for (const user of users) {
                await pool.query(`
                    INSERT INTO users (email, password_hash, first_name, last_name, phone, is_admin, email_verified, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT (email) DO NOTHING
                `, [user.email, user.password_hash, user.first_name, user.last_name, user.phone,
                user.is_admin, user.email_verified, user.created_at]);
            }
            console.log(`   ✅ Migrated ${users.length} users`);

            // Migrate products
            const products = sqliteDb.prepare('SELECT * FROM products').all();
            for (const product of products) {
                await pool.query(`
                    INSERT INTO products (name, slug, description, category, brand, mrp, selling_price, stock_quantity, sku, is_active, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    ON CONFLICT (slug) DO NOTHING
                `, [product.name, product.slug, product.description, product.category, product.brand,
                product.mrp, product.selling_price, product.stock_quantity, product.sku,
                product.is_active, product.created_at]);
            }
            console.log(`   ✅ Migrated ${products.length} products`);

            console.log('\n✅ Migration completed successfully!');
        } else {
            console.log('⚠️  No SQLite database found. Tables created, ready for fresh data.');
        }

        console.log('\n🎉 Database setup complete!');

    } catch (error) {
        console.error('❌ Migration error:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run migration
if (require.main === module) {
    migrateDatabase()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { migrateDatabase, pool };
