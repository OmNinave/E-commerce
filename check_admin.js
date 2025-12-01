const Database = require('better-sqlite3');
const db = new Database('db/ecommerce.db');

const user = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@ecommerce.com');
console.log('Admin user:', user);

if (user) {
    console.log('Is Admin:', user.is_admin);
} else {
    console.log('Admin user not found.');
}
