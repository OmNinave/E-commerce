import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const { getCartTotal } = useCart();
  const { currency, setCurrency, getAvailableCurrencies } = useCurrency();
  const { user, isAuthenticated, logout } = useAuth();
  const profileRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleProfileNavigate = () => {
    setIsProfileOpen(false);
    closeMenu();
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    closeMenu();
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navigation" role="navigation" aria-label="Main navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <span className="logo-icon">🔬</span>
          <span className="logo-text">ProLab Equipment</span>
        </Link>

        <button
          className={`nav-toggle ${isMenuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <li>
            <Link
              to="/"
              className={`nav-link ${isActive('/')}`}
              onClick={closeMenu}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/products"
              className={`nav-link ${isActive('/products')}`}
              onClick={closeMenu}
            >
              Products
            </Link>
          </li>
          <li>
            <Link
              to="/cart"
              className={`nav-link cart-link ${isActive('/cart')}`}
              onClick={closeMenu}
              aria-label={`Shopping cart with ${getCartTotal()} items`}
            >
              🛒 Cart
              {getCartTotal() > 0 && (
                <span className="cart-badge">{getCartTotal()}</span>
              )}
            </Link>
          </li>

          {/* Profile Dropdown */}
          <li className="nav-dropdown" ref={profileRef}>
            <button 
              className="nav-link profile-button" 
              onClick={toggleProfile}
              aria-expanded={isProfileOpen}
            >
              <span className="profile-icon">👤</span>
              <span className="profile-text">Account</span>
              <span className="dropdown-arrow">{isProfileOpen ? '▲' : '▼'}</span>
            </button>
            {isProfileOpen && (
              <div className="dropdown-menu profile-menu">
                <div className="dropdown-header">
                  <div className="profile-greeting">
                    {isAuthenticated ? `Hello, ${(user.fullName || user.name || 'User').split(' ')[0]}` : 'Hello, Guest'}
                  </div>
                  <div className="profile-helper">
                    {isAuthenticated ? user.email : 'Sign in to personalize your experience'}
                  </div>
                </div>
                {isAuthenticated && (
                  <div className="dropdown-section">
                    <div className="dropdown-section-title">Your Account</div>
                    <Link to="/profile" className="dropdown-item" onClick={handleProfileNavigate}>
                      <span className="item-icon">👤</span>
                      Your Profile
                    </Link>
                    <Link to="/orders" className="dropdown-item" onClick={handleProfileNavigate}>
                      <span className="item-icon">📦</span>
                      Your Orders
                    </Link>
                    <Link to="/wishlist" className="dropdown-item" onClick={handleProfileNavigate}>
                      <span className="item-icon">❤️</span>
                      Your Wishlist
                    </Link>
                    <Link to="/reviews" className="dropdown-item" onClick={handleProfileNavigate}>
                      <span className="item-icon">⭐</span>
                      Your Reviews
                    </Link>
                  </div>
                )}
                <div className="dropdown-divider"></div>
                <div className="dropdown-section">
                  <div className="dropdown-section-title">Currency & Region</div>
                  <div className="currency-selector-section">
                    <label className="currency-label">
                      <span className="item-icon">💱</span>
                      Currency
                    </label>
                    <select
                      className="currency-select-dropdown"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      {getAvailableCurrencies().map((curr) => (
                        <option key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.code} - {curr.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {isAuthenticated && (
                    <>
                      <Link to="/settings" className="dropdown-item" onClick={handleProfileNavigate}>
                        <span className="item-icon">⚙️</span>
                        Account Settings
                      </Link>
                      <Link to="/notifications" className="dropdown-item" onClick={handleProfileNavigate}>
                        <span className="item-icon">🔔</span>
                        Notifications
                      </Link>
                      <Link to="/preferences" className="dropdown-item" onClick={handleProfileNavigate}>
                        <span className="item-icon">🌍</span>
                        Language & Region
                      </Link>
                    </>
                  )}
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-section">
                  {isAuthenticated ? (
                    <button
                      type="button"
                      className="dropdown-item logout-item"
                      onClick={handleLogout}
                    >
                      <span className="item-icon">🚪</span>
                      Sign Out
                    </button>
                  ) : (
                    <>
                      <Link to="/login" className="dropdown-item" onClick={handleProfileNavigate}>
                        <span className="item-icon">🔑</span>
                        Sign In
                      </Link>
                      <Link to="/register" className="dropdown-item" onClick={handleProfileNavigate}>
                        <span className="item-icon">✨</span>
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;