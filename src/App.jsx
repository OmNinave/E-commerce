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
import './styles/App.css';

function AppContent() {
  const location = useLocation();
  const hideFooter = location.pathname === '/products';
  const hideNavigation = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/admin';

  // If admin route, show admin dashboard
  if (location.pathname === '/admin') {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Admin route detected');
    }
    return <AdminApp />;
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
          <Route path="/admin" element={<AdminApp />} />
          <Route path="/profile" element={<EditProfile />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/settings" element={<EditProfile />} />
          <Route path="/notifications" element={<MyOrders />} />
          <Route path="/preferences" element={<EditProfile />} />
          <Route path="/reviews" element={<Wishlist />} />
          <Route path="/addresses" element={<ManageAddresses />} />
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