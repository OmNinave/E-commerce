import React, { useState } from 'react';
import '../styles/AdminLogin.css';

// API URL - works for both local and production
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Attempting login to:', `${API_URL}/api/admin/login`);
      console.log('📧 Email:', email);

      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Response status:', response.status, response.ok);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (response.ok) {
        console.log('✅ Login successful!');
        // Store both tokens if available
        if (data.jwtToken) {
          localStorage.setItem('adminToken', data.jwtToken); // Prefer JWT
          console.log('💾 Stored jwtToken');
        } else if (data.token) {
          localStorage.setItem('adminToken', data.token); // Fallback to legacy
          console.log('💾 Stored token');
        }
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        console.log('👤 Calling onLogin with:', data.admin);
        onLogin(data.admin);
      } else {
        console.log('❌ Login failed:', data.error);
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('🚨 Login error:', err);
      setError('Failed to connect to server. Please ensure the admin server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <h1>Admin Dashboard</h1>
          <p>Sign in to access the control panel</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ecommerce.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-credentials">
          <p><strong>Demo Credentials:</strong></p>
          <p>Email: admin@ecommerce.com</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;