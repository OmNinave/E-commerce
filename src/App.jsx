import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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
import PrivateRoute from './components/PrivateRoute';
import ScrollToTop from './components/ScrollToTop';
import MyOrders from './pages/MyOrders';
import Wishlist from './pages/Wishlist';
import EditProfile from './pages/EditProfile';
import ManageAddresses from './pages/ManageAddresses';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Terms from './pages/Legal/Terms';
import Privacy from './pages/Legal/Privacy';

// New Checkout Pages
import CheckoutAddress from './pages/CheckoutAddress';
import CheckoutPayment from './pages/CheckoutPayment';
import CheckoutReview from './pages/CheckoutReview';
import PaymentGateway from './pages/PaymentGateway';
import OrderSuccess from './pages/OrderSuccess';


import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Reviews from './pages/Reviews';
import Contact from './pages/Contact';
import About from './pages/About';
import Solutions from './pages/Solutions';
import ContactSales from './pages/ContactSales';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import { initializeCSRF } from './utils/csrf';
import './styles/App.css';
import './styles/ResponsiveFixes.css';

function AppContent() {
  const location = useLocation();
  const hideFooter = location.pathname === '/products' || location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/admin' || location.pathname.startsWith('/checkout');
  const hideNavigation = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/admin' || location.pathname.startsWith('/checkout');

  // Initialize CSRF token on app load
  React.useEffect(() => {
    initializeCSRF();
  }, []);

  return (
    <ErrorBoundary>
      <div className="app">
        <ScrollToTop />
        {!hideNavigation && <Navigation />}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            {/* FIX: Changed to singular /product/:id for consistency */}
            <Route path="/product/:id" element={<ProductDetail />} />
            {/* FIX: Removed PrivateRoute - users can view cart without login, auth required only at checkout */}
            <Route path="/cart" element={<Cart />} />

            {/* Checkout Flow Routes */}
            <Route path="/checkout" element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            } />
            <Route path="/checkout/address" element={
              <PrivateRoute>
                <CheckoutAddress />
              </PrivateRoute>
            } />
            <Route path="/checkout/payment" element={
              <PrivateRoute>
                <CheckoutPayment />
              </PrivateRoute>
            } />
            <Route path="/checkout/review" element={
              <PrivateRoute>
                <CheckoutReview />
              </PrivateRoute>
            } />
            <Route path="/checkout/payment-gateway" element={
              <PrivateRoute>
                <PaymentGateway />
              </PrivateRoute>
            } />
            <Route path="/checkout/success/:orderId" element={
              <PrivateRoute>
                <OrderSuccess />
              </PrivateRoute>
            } />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminApp />} />
            <Route path="/profile" element={
              <PrivateRoute>
                <EditProfile />
              </PrivateRoute>
            } />
            <Route path="/orders" element={
              <PrivateRoute>
                <MyOrders />
              </PrivateRoute>
            } />
            <Route path="/wishlist" element={
              <PrivateRoute>
                <Wishlist />
              </PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            } />
            <Route path="/notifications" element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            } />
            <Route path="/preferences" element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            } />
            <Route path="/reviews" element={
              <PrivateRoute>
                <Reviews />
              </PrivateRoute>
            } />
            <Route path="/addresses" element={
              <PrivateRoute>
                <ManageAddresses />
              </PrivateRoute>
            } />

            {/* Auth Routes */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Contact Route */}
            <Route path="/contact" element={<Contact />} />

            {/* Legal Routes */}
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* Public Pages */}
            <Route path="/about" element={<About />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/contact-sales" element={<ContactSales />} />


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
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </CartProvider>
        </CurrencyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;