const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'ecommerce.db');
const db = new Database(dbPath);

console.log('🧹 Cleaning up database...\n');

// 1. Find orders without valid users
const orphanedOrders = db.prepare(`
  SELECT o.id, o.user_id, o.status, o.created_at
  FROM orders o
  LEFT JOIN users u ON o.user_id = u.id
  WHERE u.id IS NULL
`).all();

console.log(`Found ${orphanedOrders.length} orphaned orders (no user):`);
orphanedOrders.forEach(order => {
    console.log(`  - Order #${order.id} (user_id: ${order.user_id}, status: ${order.status})`);
});

// 2. Delete orphaned orders
if (orphanedOrders.length > 0) {
    const orphanedIds = orphanedOrders.map(o => o.id);

    // Delete order items first (foreign key constraint)
    const deleteItems = db.prepare(`DELETE FROM order_items WHERE order_id = ?`);
    orphanedIds.forEach(id => deleteItems.run(id));

    // Delete orders
    const deleteOrders = db.prepare(`DELETE FROM orders WHERE id = ?`);
    orphanedIds.forEach(id => deleteOrders.run(id));

    console.log(`\n✅ Deleted ${orphanedOrders.length} orphaned orders\n`);
}

// 3. Show remaining orders grouped by user
const ordersByUser = db.prepare(`
  SELECT 
    u.id as user_id,
    u.email,
    u.full_name
  FROM users u
  WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)
  ORDER BY u.id
`).all();

console.log('📊 Orders by user:');
for (const user of ordersByUser) {
    const userOrders = db.prepare(`
    SELECT id, status, total_amount, created_at
    FROM orders
    WHERE user_id = ?
    ORDER BY id
  `).all(user.user_id);

    console.log(`\n  ${user.full_name || user.email}:`);
    console.log(`    - Email: ${user.email}`);
    console.log(`    - Orders: ${userOrders.length}`);
    userOrders.forEach(order => {
        console.log(`      * Order #${order.id} - ${order.status} - ₹${order.total_amount}`);
    });
}

// 4. Show total stats
const totalUsers = db.prepare(`SELECT COUNT(*) as count FROM users`).get().count;
const totalOrders = db.prepare(`SELECT COUNT(*) as count FROM orders`).get().count;

console.log(`\n\n📈 Database Stats:`);
console.log(`  - Total Users: ${totalUsers}`);
console.log(`  - Total Orders: ${totalOrders}`);

db.close();
console.log('\n✅ Cleanup complete!');
