const { db } = require('./database');
const bcrypt = require('bcryptjs');

/**
 * Add admin user to SQLite database
 * Using credentials from old admin_database.json
 */

async function addAdminUser() {
    console.log('🔧 Adding admin user to SQLite database...\n');

    try {
        // Check if admin already exists
        const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@ecommerce.com');

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists. Updating...');

            // Update existing admin
            const passwordHash = await bcrypt.hash('admin123', 10);

            db.prepare(`
        UPDATE users 
        SET password_hash = ?, 
            is_admin = 1,
            first_name = 'Admin',
            last_name = 'User',
            email_verified = 1
        WHERE email = ?
      `).run(passwordHash, 'admin@ecommerce.com');

            console.log('✅ Admin user updated successfully!');
        } else {
            console.log('📝 Creating new admin user...');

            // Create new admin user
            const passwordHash = await bcrypt.hash('admin123', 10);

            db.prepare(`
        INSERT INTO users (email, password_hash, first_name, last_name, phone, email_verified, is_admin, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
                'admin@ecommerce.com',
                passwordHash,
                'Admin',
                'User',
                '9876543210',
                1,
                1,
                new Date().toISOString()
            );

            console.log('✅ Admin user created successfully!');
        }

        // Verify admin user
        const admin = db.prepare('SELECT id, email, first_name, last_name, is_admin FROM users WHERE email = ?')
            .get('admin@ecommerce.com');

        console.log('\n📊 Admin User Details:');
        console.log('   ID:', admin.id);
        console.log('   Email:', admin.email);
        console.log('   Name:', `${admin.first_name} ${admin.last_name}`);
        console.log('   Is Admin:', admin.is_admin === 1 ? 'Yes' : 'No');

        console.log('\n🔑 Admin Credentials:');
        console.log('   Email: admin@ecommerce.com');
        console.log('   Password: admin123');

        console.log('\n✅ Admin integration complete!');

    } catch (error) {
        console.error('❌ Error adding admin user:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    addAdminUser()
        .then(() => {
            console.log('\n✅ Done!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Failed:', error);
            process.exit(1);
        });
}

module.exports = { addAdminUser };
