const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'ecommerce.db');
const db = new Database(dbPath);

console.log('🧹 Cleaning up database...\n');

try {
    // 1. Find orders without valid users
    const orphanedOrders = db.prepare(`
    SELECT o.id, o.user_id, o.status
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

        // Delete order items first (foreign key constraint usually, but good practice)
        const deleteItems = db.prepare(`DELETE FROM order_items WHERE order_id = ?`);
        const deleteOrders = db.prepare(`DELETE FROM orders WHERE id = ?`);

        let deletedCount = 0;
        const transaction = db.transaction((ids) => {
            for (const id of ids) {
                deleteItems.run(id);
                deleteOrders.run(id);
                deletedCount++;
            }
        });

        transaction(orphanedIds);
        console.log(`\n✅ Deleted ${deletedCount} orphaned orders and their items.\n`);
    } else {
        console.log('\n✅ No orphaned orders found.\n');
    }

    // 3. Show remaining orders grouped by user
    // Using first_name || ' ' || last_name for name
    const ordersByUser = db.prepare(`
    SELECT 
      u.id as user_id,
      u.email,
      COALESCE(u.first_name || ' ' || u.last_name, 'No Name') as user_name
    FROM users u
    WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)
    ORDER BY u.id
  `).all();

    console.log('📊 Orders by user:');
    for (const user of ordersByUser) {
        const userOrders = db.prepare(`
      SELECT id, status, total_amount
      FROM orders
      WHERE user_id = ?
      ORDER BY id
    `).all(user.user_id);

        console.log(`\n  User: ${user.user_name} (${user.email})`);
        console.log(`    - Total Orders: ${userOrders.length}`);
        userOrders.forEach(order => {
            console.log(`      * Order #${order.id} [${order.status}] - ₹${order.total_amount}`);
        });
    }

} catch (error) {
    console.error('❌ Error during cleanup:', error.message);
} finally {
    db.close();
    console.log('\n✅ Database connection closed.');
}
