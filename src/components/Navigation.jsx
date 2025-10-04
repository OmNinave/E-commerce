import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import '../styles/Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const { getCartTotal } = useCart();
  const { currency, setCurrency, getAvailableCurrencies } = useCurrency();
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
                  <div className="profile-greeting">Hello, Guest</div>
                </div>
                <div className="dropdown-section">
                  <div className="dropdown-section-title">Your Account</div>
                  <button className="dropdown-item">
                    <span className="item-icon">👤</span>
                    Your Profile
                  </button>
                  <button className="dropdown-item">
                    <span className="item-icon">📦</span>
                    Your Orders
                  </button>
                  <button className="dropdown-item">
                    <span className="item-icon">❤️</span>
                    Your Wishlist
                  </button>
                  <button className="dropdown-item">
                    <span className="item-icon">⭐</span>
                    Your Reviews
                  </button>
                </div>
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
                  <button className="dropdown-item">
                    <span className="item-icon">⚙️</span>
                    Account Settings
                  </button>
                  <button className="dropdown-item">
                    <span className="item-icon">🔔</span>
                    Notifications
                  </button>
                  <button className="dropdown-item">
                    <span className="item-icon">🌍</span>
                    Language & Region
                  </button>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-section">
                  <button className="dropdown-item">
                    <span className="item-icon">❓</span>
                    Help & Support
                  </button>
                  <button className="dropdown-item logout-item">
                    <span className="item-icon">🚪</span>
                    Sign Out
                  </button>
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