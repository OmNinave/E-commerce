const { db } = require('./database');

try {
    const tableInfo = db.pragma('table_info(payment_methods)');
    console.log('Payment Methods Schema:', tableInfo);

    const feesInfo = db.pragma('table_info(order_fees)');
    console.log('Order Fees Schema:', feesInfo);

    const methods = db.prepare('SELECT * FROM payment_methods').all();
    console.log('Payment Methods Data:', methods);

} catch (err) {
    console.error('Error checking schema:', err);
}
