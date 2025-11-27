const { db } = require('./database');
const bcrypt = require('bcryptjs');

const admin = db.prepare("SELECT * FROM users WHERE email = 'admin@ecommerce.com'").get();

if (admin) {
    console.log('Admin found:', admin);
    const isMatch = bcrypt.compareSync('admin123', admin.password_hash);
    console.log('Password match:', isMatch);
} else {
    console.log('Admin NOT found');
}
