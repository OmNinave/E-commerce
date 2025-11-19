/**
 * User Profile Routes
 * Endpoints for managing user profile information
 * 
 * Routes:
 * - GET  /api/users/:userId/profile - Get user profile
 * - PUT  /api/users/:userId/profile - Update user profile
 * - PUT  /api/users/:userId/password - Change password
 */

module.exports = function initProfileRoutes(app, db) {
  const bcrypt = require('bcryptjs');
  
  // Get user profile
  app.get('/api/users/:userId/profile', (req, res) => {
    try {
      const { userId } = req.params;
      
      const db_data = db.loadUnifiedDb();
      const users = db_data.users || [];
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Return user without password
      const { password, ...userProfile } = user;
      
      res.json({
        success: true,
        profile: userProfile
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });
  
  // Update user profile
  app.put('/api/users/:userId/profile', (req, res) => {
    try {
      const { userId } = req.params;
      const { fullName, email, phone, company, bio } = req.body;
      
      const db_data = db.loadUnifiedDb();
      const users = db_data.users || [];
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Update fields if provided
      if (fullName && fullName.trim()) {
        user.fullName = fullName.trim();
      }
      
      if (email && email.trim()) {
        const normalizedEmail = email.trim().toLowerCase();
        
        // Check if email already exists (and not the same user)
        const existingUser = users.find(u => u.email === normalizedEmail && u.id !== userId);
        if (existingUser) {
          return res.status(400).json({ error: 'Email already in use' });
        }
        
        user.email = normalizedEmail;
      }
      
      if (phone) user.phone = phone.trim();
      if (company) user.company = company.trim();
      if (bio) user.bio = bio.trim();
      
      user.updatedAt = new Date().toISOString();
      
      db.saveUnifiedDb(db_data);
      
      const { password, ...userProfile } = user;
      
      res.json({
        success: true,
        profile: userProfile,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });
  
  // Change password
  app.put('/api/users/:userId/password', async (req, res) => {
    try {
      const { userId } = req.params;
      const { currentPassword, newPassword, confirmPassword } = req.body;
      
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: 'All password fields are required' });
      }
      
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New passwords do not match' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      
      const db_data = db.loadUnifiedDb();
      const users = db_data.users || [];
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Verify current password
      let passwordMatches = false;
      
      try {
        passwordMatches = await bcrypt.compare(currentPassword, user.password);
      } catch (e) {
        // Fallback for legacy SHA256
        const crypto = require('crypto');
        const legacyHash = crypto.createHash('sha256').update(currentPassword).digest('hex');
        passwordMatches = (user.password === legacyHash);
      }
      
      if (!passwordMatches) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.updatedAt = new Date().toISOString();
      
      db.saveUnifiedDb(db_data);
      
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  });
};
