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
import AdminApp from './admin/AdminApp';
import ScrollToTop from './components/ScrollToTop';
import MyOrders from './pages/MyOrders';
import Wishlist from './pages/Wishlist';
import EditProfile from './pages/EditProfile';
import ManageAddresses from './pages/ManageAddresses';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Terms from './pages/Legal/Terms';
import Privacy from './pages/Legal/Privacy';

import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Reviews from './pages/Reviews';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/App.css';
import './styles/ResponsiveFixes.css';

function AppContent() {
  const location = useLocation();
  const hideFooter = location.pathname === '/products' || location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/admin';
  const hideNavigation = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/admin';

  return (
    <ErrorBoundary>
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
            <Route path="/admin" element={<AdminApp />} />
            <Route path="/profile" element={<EditProfile />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/preferences" element={<Settings />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/addresses" element={<ManageAddresses />} />

            {/* Auth Routes */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Legal Routes */}
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* 404 Route - Must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {!hideFooter && <Footer />}
      </div>
    </ErrorBoundary>
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