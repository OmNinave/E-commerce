const { db } = require('./database');

console.log('🚀 Adding Product Details Columns...');

try {
    // Check if columns exist
    const tableInfo = db.prepare('PRAGMA table_info(products)').all();
    const columns = tableInfo.map(col => col.name);

    if (!columns.includes('features')) {
        db.prepare('ALTER TABLE products ADD COLUMN features TEXT').run();
        console.log('✅ Added features column');
    }

    if (!columns.includes('specifications')) {
        db.prepare('ALTER TABLE products ADD COLUMN specifications TEXT').run();
        console.log('✅ Added specifications column');
    }

    if (!columns.includes('shipping_info')) {
        db.prepare('ALTER TABLE products ADD COLUMN shipping_info TEXT').run();
        console.log('✅ Added shipping_info column');
    }

    console.log('✅ Schema update complete');

} catch (error) {
    console.error('❌ Error updating schema:', error);
}
