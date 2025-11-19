/**
 * User Addresses Routes
 * Endpoints for managing user shipping and billing addresses
 * 
 * Routes:
 * - GET    /api/users/:userId/addresses - Get all addresses for user
 * - POST   /api/users/:userId/addresses - Create new address
 * - PUT    /api/users/:userId/addresses/:addressId - Update address
 * - DELETE /api/users/:userId/addresses/:addressId - Delete address
 * - PUT    /api/users/:userId/addresses/:addressId/default - Set as default
 */

module.exports = function initAddressesRoutes(app, db) {
  
  // Get all addresses for a user
  app.get('/api/users/:userId/addresses', (req, res) => {
    try {
      const { userId } = req.params;
      
      const db_data = db.loadUnifiedDb();
      const users = db_data.users || [];
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const addresses = user.addresses || [];
      
      res.json({
        success: true,
        addresses,
        total: addresses.length
      });
    } catch (error) {
      console.error('Get addresses error:', error);
      res.status(500).json({ error: 'Failed to fetch addresses' });
    }
  });
  
  // Create new address for user
  app.post('/api/users/:userId/addresses', (req, res) => {
    try {
      const { userId } = req.params;
      const { type, streetAddress, city, state, postalCode, country, isDefault } = req.body;
      
      if (!streetAddress || !city || !state || !postalCode || !country) {
        return res.status(400).json({ error: 'All address fields are required' });
      }
      
      const db_data = db.loadUnifiedDb();
      const users = db_data.users || [];
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      if (!user.addresses) {
        user.addresses = [];
      }
      
      const newAddress = {
        id: `addr_${Date.now()}`,
        type: type || 'shipping',
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
        isDefault: isDefault === true && user.addresses.length === 0,
        createdAt: new Date().toISOString()
      };
      
      // If setting as default, unset others
      if (newAddress.isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
      }
      
      user.addresses.push(newAddress);
      db.saveUnifiedDb(db_data);
      
      res.status(201).json({
        success: true,
        address: newAddress,
        message: 'Address added successfully'
      });
    } catch (error) {
      console.error('Create address error:', error);
      res.status(500).json({ error: 'Failed to add address' });
    }
  });
  
  // Update address
  app.put('/api/users/:userId/addresses/:addressId', (req, res) => {
    try {
      const { userId, addressId } = req.params;
      const { type, streetAddress, city, state, postalCode, country } = req.body;
      
      const db_data = db.loadUnifiedDb();
      const users = db_data.users || [];
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const address = (user.addresses || []).find(a => a.id === addressId);
      
      if (!address) {
        return res.status(404).json({ error: 'Address not found' });
      }
      
      // Update fields if provided
      if (type) address.type = type;
      if (streetAddress) address.streetAddress = streetAddress.trim();
      if (city) address.city = city.trim();
      if (state) address.state = state.trim();
      if (postalCode) address.postalCode = postalCode.trim();
      if (country) address.country = country.trim();
      address.updatedAt = new Date().toISOString();
      
      db.saveUnifiedDb(db_data);
      
      res.json({
        success: true,
        address,
        message: 'Address updated successfully'
      });
    } catch (error) {
      console.error('Update address error:', error);
      res.status(500).json({ error: 'Failed to update address' });
    }
  });
  
  // Delete address
  app.delete('/api/users/:userId/addresses/:addressId', (req, res) => {
    try {
      const { userId, addressId } = req.params;
      
      const db_data = db.loadUnifiedDb();
      const users = db_data.users || [];
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const addressIndex = (user.addresses || []).findIndex(a => a.id === addressId);
      
      if (addressIndex === -1) {
        return res.status(404).json({ error: 'Address not found' });
      }
      
      user.addresses.splice(addressIndex, 1);
      db.saveUnifiedDb(db_data);
      
      res.json({
        success: true,
        message: 'Address deleted successfully'
      });
    } catch (error) {
      console.error('Delete address error:', error);
      res.status(500).json({ error: 'Failed to delete address' });
    }
  });
  
  // Set address as default
  app.put('/api/users/:userId/addresses/:addressId/default', (req, res) => {
    try {
      const { userId, addressId } = req.params;
      
      const db_data = db.loadUnifiedDb();
      const users = db_data.users || [];
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const address = (user.addresses || []).find(a => a.id === addressId);
      
      if (!address) {
        return res.status(404).json({ error: 'Address not found' });
      }
      
      // Unset all others as default
      (user.addresses || []).forEach(a => a.isDefault = false);
      
      // Set this one as default
      address.isDefault = true;
      
      db.saveUnifiedDb(db_data);
      
      res.json({
        success: true,
        address,
        message: 'Address set as default'
      });
    } catch (error) {
      console.error('Set default address error:', error);
      res.status(500).json({ error: 'Failed to set default address' });
    }
  });
};
