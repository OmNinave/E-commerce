import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Checkout.css';

const Checkout = () => {
  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>🚧 Checkout Coming Soon</h1>
          <p>We're working hard to bring you a seamless checkout experience!</p>
        </div>
        
        <div className="checkout-content">
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>Secure Payment Gateway</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>Multiple Payment Options</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>Order Tracking</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>Fast Delivery</span>
            </div>
          </div>
          
          <div className="checkout-actions">
            <Link to="/cart" className="back-to-cart-btn">
              ← Back to Cart
            </Link>
            <Link to="/products" className="continue-shopping-btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;