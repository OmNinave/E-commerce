import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './components/Home';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Login from './components/Login';
import Register from './components/Register';
import ScrollToTop from './components/ScrollToTop';
import './styles/App.css';

function AppContent() {
  const location = useLocation();
  const hideFooter = location.pathname === '/products';
  const hideNavigation = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/admin';

  // Admin dashboard - show warning on Netlify (no backend)
  if (location.pathname === '/admin') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          maxWidth: '600px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <h1 style={{ color: '#667eea', marginBottom: '20px' }}>⚠️ Admin Dashboard Unavailable</h1>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '15px' }}>
            The admin dashboard requires a backend server which is not available on this static hosting.
          </p>
          <p style={{ fontSize: '14px', color: '#999' }}>
            Admin features work only when running locally with: <code style={{background: '#f5f7fa', padding: '4px 8px', borderRadius: '4px'}}>npm run admin-server</code>
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <ScrollToTop />
      {!hideNavigation && <Navigation />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CurrencyProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </CurrencyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;