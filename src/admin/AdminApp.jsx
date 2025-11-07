import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

const AdminApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifySession();
  }, []);

  const verifySession = async () => {
    const token = localStorage.getItem('adminToken');
    const savedAdmin = localStorage.getItem('adminUser');

    if (token && savedAdmin) {
      try {
        const response = await fetch('http://localhost:5000/api/admin/verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAdmin(data.admin);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      } catch (err) {
        console.error('Session verification failed:', err);
      }
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
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