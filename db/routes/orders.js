/**
 * User Orders Routes
 * Endpoints for retrieving and managing user orders
 * 
 * Routes:
 * - GET  /api/users/:userId/orders - Get all orders for user
 * - GET  /api/users/:userId/orders/:orderId - Get specific order
 */

module.exports = function initOrdersRoutes(app, db) {
  
  // Get all orders for a specific user
  app.get('/api/users/:userId/orders', (req, res) => {
    try {
      const { userId } = req.params;
      
      const users = db.loadUnifiedDb().users || [];
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Get orders for this user from purchaseHistory
      const orders = db.loadUnifiedDb().orders || [];
      const userOrders = orders.filter(o => o.userId === userId);
      
      // Enrich with item details
      const enrichedOrders = userOrders.map(order => ({
        ...order,
        items: (order.items || []).map(item => ({
          ...item,
          productDetails: (db.loadUnifiedDb().products || []).find(p => 
            p.id === item.productId || p.productId === item.productId
          )
        }))
      }));
      
      res.json({
        success: true,
        orders: enrichedOrders,
        total: enrichedOrders.length
      });
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });
  
  // Get specific order details
  app.get('/api/users/:userId/orders/:orderId', (req, res) => {
    try {
      const { userId, orderId } = req.params;
      
      const db_data = db.loadUnifiedDb();
      const orders = db_data.orders || [];
      const order = orders.find(o => o.userId === userId && o.orderId === orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Enrich with product details
      const enrichedOrder = {
        ...order,
        items: (order.items || []).map(item => ({
          ...item,
          productDetails: (db_data.products || []).find(p => 
            p.id === item.productId || p.productId === item.productId
          )
        }))
      };
      
      res.json({
        success: true,
        order: enrichedOrder
      });
    } catch (error) {
      console.error('Get order details error:', error);
      res.status(500).json({ error: 'Failed to fetch order details' });
    }
  });
  
  // Update order status (admin only - for future use)
  app.put('/api/orders/:orderId/status', (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      
      // TODO: Add admin authentication check
      
      const validStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid order status' });
      }
      
      const db_data = db.loadUnifiedDb();
      const orders = db_data.orders || [];
      const order = orders.find(o => o.orderId === orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      order.status = status;
      order.updatedAt = new Date().toISOString();
      
      db.saveUnifiedDb(db_data);
      
      res.json({
        success: true,
        order,
        message: `Order status updated to ${status}`
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  });
};
