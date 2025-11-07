import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

// API URL - works for both local and production
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('🚀 AdminApp component mounted');
  console.log('🌐 API_URL:', API_URL);

  useEffect(() => {
    console.log('🔄 useEffect triggered');
    verifySession();
  }, []);

  const verifySession = async () => {
    const token = localStorage.getItem('adminToken');
    const savedAdmin = localStorage.getItem('adminUser');

    console.log('🔍 Verifying session...', { token: token ? 'exists' : 'none', API_URL });

    if (token && savedAdmin) {
      try {
        console.log('📡 Calling:', `${API_URL}/api/admin/verify`);
        const response = await fetch(`${API_URL}/api/admin/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('📥 Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Session valid:', data);
          setAdmin(data.admin);
          setIsAuthenticated(true);
        } else {
          console.log('❌ Session invalid, clearing storage');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      } catch (err) {
        console.error('❌ Session verification failed:', err);
      }
    } else {
      console.log('ℹ️ No existing session');
    }
    setLoading(false);
  };

  const handleLogin = (adminData) => {
    setAdmin(adminData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setAdmin(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: '20px'
      }}>
        <div style={{ fontSize: '24px' }}>Loading Admin Dashboard...</div>
        <div style={{ fontSize: '14px', color: '#666' }}>API: {API_URL}</div>
        <div className="spinner" style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div className="admin-app">
      {isAuthenticated ? (
        <AdminDashboard admin={admin} onLogout={handleLogout} />
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}
    </div>
  );
};

export default AdminApp;