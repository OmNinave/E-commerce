const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'ecommerce.db');
const db = new Database(dbPath);

async function checkUser() {
    const email = 'admin@example.com';
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (user) {
        console.log('User found:', user);

        // Reset password to 'admin123'
        const passwordHash = await bcrypt.hash('admin123', 10);
        db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, user.id);
        console.log('Password reset to admin123');
    } else {
        console.log('User not found. Creating admin user...');
        const passwordHash = await bcrypt.hash('admin123', 10);
        db.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, is_admin, email_verified)
      VALUES (?, ?, ?, ?, 1, 1)
    `).run(email, passwordHash, 'Admin', 'User');
        console.log('Admin user created with password admin123');
    }
}

checkUser();
