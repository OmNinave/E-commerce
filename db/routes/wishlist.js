/**
 * User Wishlist Routes
 * Endpoints for managing user wishlists
 * 
 * Routes:
 * - GET  /api/users/:userId/wishlist - Get user's wishlist
 * - POST /api/users/:userId/wishlist - Add product to wishlist
 * - DELETE /api/users/:userId/wishlist/:productId - Remove product from wishlist
 */

module.exports = function initWishlistRoutes(app, db) {
  
  // Get user's wishlist
  app.get('/api/users/:userId/wishlist', (req, res) => {
    try {
      const { userId } = req.params;
      
      const db_data = db.loadUnifiedDb();
      const users = db_data.users || [];
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const wishlist = user.wishlist || [];
      
      // Enrich with product details
      const products = db_data.products || [];
      const enrichedWishlist = wishlist.map(item => {
        const product = products.find(p => p.id === item.productId || p.productId === item.productId);
        return {
          ...item,
          productDetails: product || null
        };
      });
      
      res.json({
        success: true,
        wishlist: enrichedWishlist,
        total: enrichedWishlist.length
      });
    } catch (error) {
      console.error('Get wishlist error:', error);
      res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
  });
  
  // Add product to wishlist
  app.post('/api/users/:userId/wishlist', (req, res) => {
    try {
      const { userId } = req.params;
      const { productId } = req.body;
      
      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }
      
      const db_data = db.loadUnifiedDb();
      const users = db_data.users || [];
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Verify product exists
      const products = db_data.products || [];
      const product = products.find(p => p.id === productId || p.productId === productId);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      if (!user.wishlist) {
        user.wishlist = [];
      }
      
      // Check if already in wishlist
      const exists = user.wishlist.find(item => 
        item.productId === productId || item.productId === product.id
      );
      
      if (exists) {
        return res.status(400).json({ error: 'Product already in wishlist' });
      }
      
      const wishlistItem = {
        productId: product.id || product.productId,
        productName: product.name,
        addedAt: new Date().toISOString()
      };
      
      user.wishlist.push(wishlistItem);
      db.saveUnifiedDb(db_data);
      
      res.status(201).json({
        success: true,
        wishlistItem,
        message: 'Product added to wishlist'
      });
    } catch (error) {
      console.error('Add to wishlist error:', error);
      res.status(500).json({ error: 'Failed to add to wishlist' });
    }
  });
  
  // Remove product from wishlist
  app.delete('/api/users/:userId/wishlist/:productId', (req, res) => {
    try {
      const { userId, productId } = req.params;
      
      const db_data = db.loadUnifiedDb();
      const users = db_data.users || [];
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const wishlistIndex = (user.wishlist || []).findIndex(item => 
        item.productId === productId || item.productId.toString() === productId
      );
      
      if (wishlistIndex === -1) {
        return res.status(404).json({ error: 'Product not in wishlist' });
      }
      
      user.wishlist.splice(wishlistIndex, 1);
      db.saveUnifiedDb(db_data);
      
      res.json({
        success: true,
        message: 'Product removed from wishlist'
      });
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
  });
};
