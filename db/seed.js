const { db, initializeDatabase } = require('./database');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Indian data for realistic seeding
const INDIAN_FIRST_NAMES = {
    male: ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Reyansh', 'Aarush', 'Kabir', 'Shivansh', 'Rudra', 'Ansh'],
    female: ['Saanvi', 'Aadhya', 'Kiara', 'Diya', 'Pihu', 'Ananya', 'Fatima', 'Anika', 'Zara', 'Sara', 'Jhanvi', 'Myra', 'Aanya', 'Pari', 'Navya', 'Angel', 'Aaradhya', 'Riya', 'Siya', 'Kavya']
};

const INDIAN_LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Reddy', 'Nair', 'Iyer', 'Joshi', 'Mehta', 'Desai', 'Rao', 'Pillai', 'Menon', 'Shah', 'Agarwal', 'Banerjee', 'Chatterjee', 'Mukherjee', 'Das', 'Ghosh', 'Sinha', 'Jain', 'Malhotra', 'Kapoor', 'Chopra', 'Khanna', 'Bhatia', 'Sethi'];

const INDIAN_CITIES = [
    { city: 'Mumbai', state: 'Maharashtra', pincodes: ['400001', '400002', '400003', '400051', '400070'] },
    { city: 'Delhi', state: 'Delhi', pincodes: ['110001', '110002', '110003', '110016', '110025'] },
    { city: 'Bangalore', state: 'Karnataka', pincodes: ['560001', '560002', '560003', '560034', '560076'] },
    { city: 'Hyderabad', state: 'Telangana', pincodes: ['500001', '500002', '500003', '500016', '500081'] },
    { city: 'Chennai', state: 'Tamil Nadu', pincodes: ['600001', '600002', '600003', '600028', '600096'] },
    { city: 'Kolkata', state: 'West Bengal', pincodes: ['700001', '700002', '700003', '700016', '700091'] },
    { city: 'Pune', state: 'Maharashtra', pincodes: ['411001', '411002', '411003', '411014', '411045'] },
    { city: 'Ahmedabad', state: 'Gujarat', pincodes: ['380001', '380002', '380003', '380015', '380054'] },
    { city: 'Jaipur', state: 'Rajasthan', pincodes: ['302001', '302002', '302003', '302015', '302033'] },
    { city: 'Surat', state: 'Gujarat', pincodes: ['395001', '395002', '395003', '395007', '395017'] },
    { city: 'Lucknow', state: 'Uttar Pradesh', pincodes: ['226001', '226002', '226003', '226010', '226024'] },
    { city: 'Kanpur', state: 'Uttar Pradesh', pincodes: ['208001', '208002', '208003', '208012', '208027'] },
    { city: 'Nagpur', state: 'Maharashtra', pincodes: ['440001', '440002', '440003', '440010', '440025'] },
    { city: 'Indore', state: 'Madhya Pradesh', pincodes: ['452001', '452002', '452003', '452010', '452016'] },
    { city: 'Thane', state: 'Maharashtra', pincodes: ['400601', '400602', '400603', '400610', '400615'] },
    { city: 'Bhopal', state: 'Madhya Pradesh', pincodes: ['462001', '462002', '462003', '462016', '462042'] },
    { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincodes: ['530001', '530002', '530003', '530016', '530045'] },
    { city: 'Patna', state: 'Bihar', pincodes: ['800001', '800002', '800003', '800013', '800025'] },
    { city: 'Vadodara', state: 'Gujarat', pincodes: ['390001', '390002', '390003', '390007', '390021'] },
    { city: 'Ghaziabad', state: 'Uttar Pradesh', pincodes: ['201001', '201002', '201003', '201010', '201014'] }
];

const LANDMARKS = ['Near Railway Station', 'Opposite City Mall', 'Behind Bus Stand', 'Near Hospital', 'Close to School', 'Main Road', 'Market Area', 'Residential Complex', 'Near Temple', 'Close to Park'];

// Helper functions
function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone() {
    const prefixes = ['98', '99', '97', '96', '95', '94', '93', '92', '91', '90', '89', '88', '87', '86', '85', '84', '83', '82', '81', '80'];
    return randomElement(prefixes) + randomNumber(10000000, 99999999).toString();
}

function generateEmail(firstName, lastName) {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'rediffmail.com'];
    const separators = ['', '.', '_'];
    const numbers = Math.random() > 0.5 ? randomNumber(1, 999) : '';
    return `${firstName.toLowerCase()}${randomElement(separators)}${lastName.toLowerCase()}${numbers}@${randomElement(domains)}`;
}

function generateSKU(category, index) {
    return `${category.substring(0, 3).toUpperCase()}-${String(index).padStart(5, '0')}`;
}

function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Seeding functions
async function seedUsers(count = 1000) {
    console.log(`🌱 Seeding ${count} users...`);

    const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, first_name, last_name, phone, email_verified, is_admin, created_at, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    const users = [];
    const passwordHash = bcrypt.hashSync('password123', 10);

    // Create admin user
    insertUser.run(
        'admin@ecommerce.com',
        bcrypt.hashSync('admin123', 10),
        'Admin',
        'User',
        '9876543210',
        1,
        1,
        new Date().toISOString(),
        1
    );
    console.log('✅ Created admin user');

    // Create regular users
    for (let i = 0; i < count; i++) {
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const firstName = randomElement(INDIAN_FIRST_NAMES[gender]);
        const lastName = randomElement(INDIAN_LAST_NAMES);
        const email = generateEmail(firstName, lastName);
        const phone = generatePhone();
        const createdAt = randomDate(new Date(2024, 0, 1), new Date()).toISOString();

        try {
            insertUser.run(
                email,
                passwordHash,
                firstName,
                lastName,
                phone,
                Math.random() > 0.3 ? 1 : 0, // 70% verified
                0,
                createdAt,
                1
            );
            users.push({ email, firstName, lastName });
        } catch (error) {
            // Skip duplicate emails
        }
    }

    console.log(`✅ Seeded ${users.length} users`);
    return users;
}

async function seedAddresses(userCount = 1000) {
    console.log('🌱 Seeding addresses...');

    const users = db.prepare('SELECT id FROM users WHERE is_admin = 0').all();
    const insertAddress = db.prepare(`
    INSERT INTO addresses (user_id, address_type, full_name, phone, address_line1, address_line2, city, state, pincode, landmark, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    let count = 0;
    for (const user of users) {
        // Each user gets 1-3 addresses
        const numAddresses = randomNumber(1, 3);
        for (let i = 0; i < numAddresses; i++) {
            const location = randomElement(INDIAN_CITIES);
            const pincode = randomElement(location.pincodes);
            const addressType = i === 0 ? 'shipping' : (Math.random() > 0.5 ? 'shipping' : 'billing');

            insertAddress.run(
                user.id,
                addressType,
                `${randomElement(INDIAN_FIRST_NAMES.male)} ${randomElement(INDIAN_LAST_NAMES)}`,
                generatePhone(),
                `${randomNumber(1, 999)}, ${randomElement(['Street', 'Road', 'Lane', 'Avenue'])} ${randomNumber(1, 50)}`,
                `${randomElement(['Sector', 'Block', 'Area'])} ${randomNumber(1, 100)}`,
                location.city,
                location.state,
                pincode,
                randomElement(LANDMARKS),
                i === 0 ? 1 : 0
            );
            count++;
        }
    }

    console.log(`✅ Seeded ${count} addresses`);
}

async function seedCategories() {
    console.log('🌱 Seeding categories...');

    const categories = [
        { name: 'Laboratory Equipment', slug: 'laboratory-equipment', description: 'Professional laboratory equipment and instruments' },
        { name: 'Microscopes', slug: 'microscopes', description: 'High-quality microscopes for research and education', parent: 'Laboratory Equipment' },
        { name: 'Glassware', slug: 'glassware', description: 'Laboratory glassware and containers', parent: 'Laboratory Equipment' },
        { name: 'Chemicals', slug: 'chemicals', description: 'Laboratory chemicals and reagents', parent: 'Laboratory Equipment' },
        { name: 'Safety Equipment', slug: 'safety-equipment', description: 'Laboratory safety equipment and protective gear' },
        { name: 'Measuring Instruments', slug: 'measuring-instruments', description: 'Precision measuring instruments' },
        { name: 'Heating Equipment', slug: 'heating-equipment', description: 'Laboratory heating and cooling equipment' },
        { name: 'Electronics', slug: 'electronics', description: 'Electronic equipment and accessories' }
    ];

    const insertCategory = db.prepare(`
    INSERT INTO categories (name, slug, description, parent_id, is_active, display_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    const categoryMap = {};

    for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        const parentId = cat.parent ? categoryMap[cat.parent] : null;

        const result = insertCategory.run(
            cat.name,
            cat.slug,
            cat.description,
            parentId,
            1,
            i
        );

        categoryMap[cat.name] = result.lastInsertRowid;
    }

    console.log(`✅ Seeded ${categories.length} categories`);
    return categoryMap;
}

async function migrateExistingProducts() {
    console.log('🌱 Migrating existing products...');

    // Read existing unified_database.json
    const dbPath = path.join(__dirname, 'unified_database.json');
    if (!fs.existsSync(dbPath)) {
        console.log('⚠️  No existing database found, skipping migration');
        return [];
    }

    const existingDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const products = existingDb.products || [];

    const insertProduct = db.prepare(`
    INSERT INTO products (name, slug, model, tagline, description, category_id, brand, sku, base_price, selling_price, stock_quantity, is_active, is_featured, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    const insertImage = db.prepare(`
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
    VALUES (?, ?, ?, ?, ?)
  `);

    const categoryId = db.prepare('SELECT id FROM categories WHERE slug = ?').get('laboratory-equipment')?.id || 1;

    let count = 0;
    for (const product of products) {
        try {
            const result = insertProduct.run(
                product.name,
                slugify(product.name),
                product.model || '',
                product.tagline || '',
                product.description || '',
                categoryId,
                product.brand || 'Generic',
                generateSKU('LAB', product.id),
                product.originalPrice || product.price,
                product.price,
                randomNumber(10, 500),
                1,
                Math.random() > 0.8 ? 1 : 0,
                new Date().toISOString()
            );

            // Add product image
            if (product.image) {
                insertImage.run(
                    result.lastInsertRowid,
                    product.image,
                    product.name,
                    1,
                    0
                );
            }

            count++;
        } catch (error) {
            console.error(`Error migrating product ${product.name}:`, error.message);
        }
    }

    console.log(`✅ Migrated ${count} products`);
    return count;
}

// Main seeding function
async function seedDatabase() {
    console.log('🚀 Starting database seeding...\n');

    try {
        // Initialize database
        initializeDatabase();

        // Seed in order
        await seedUsers(1000);
        await seedAddresses();
        const categoryMap = await seedCategories();
        await migrateExistingProducts();

        console.log('\n✅ Database seeding completed successfully!');
        console.log('\n📊 Database Statistics:');
        console.log(`   Users: ${db.prepare('SELECT COUNT(*) as count FROM users').get().count}`);
        console.log(`   Addresses: ${db.prepare('SELECT COUNT(*) as count FROM addresses').get().count}`);
        console.log(`   Categories: ${db.prepare('SELECT COUNT(*) as count FROM categories').get().count}`);
        console.log(`   Products: ${db.prepare('SELECT COUNT(*) as count FROM products').get().count}`);
        console.log(`   Product Images: ${db.prepare('SELECT COUNT(*) as count FROM product_images').get().count}`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}

// Run seeding if called directly
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('\n✅ Seeding complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = { seedDatabase };
