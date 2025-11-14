import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Checkout.css';

const Checkout = () => {
  const location = useLocation();
  const order = location.state?.order;

  if (order) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-header">
            <h1>✅ Order Confirmed!</h1>
            <p>Your order has been successfully created and saved to the database.</p>
          </div>
          
          <div className="checkout-content">
            <div className="order-details">
              <h2>Order Details</h2>
              <div className="order-info">
                <p><strong>Order ID:</strong> {order.orderId}</p>
                <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> ₹{order.totalAmount.toLocaleString()}</p>
                <p><strong>Status:</strong> {order.status}</p>
              </div>
              
              <div className="order-items">
                <h3>Items Ordered:</h3>
                <ul>
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.productName} - Qty: {item.quantity} - ₹{item.subtotal.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="success-message">
                <p>📊 This order has been saved to the database and will appear in the admin dashboard analytics!</p>
                <p>🔄 The admin can now see updated user count, order count, and revenue in real-time.</p>
              </div>
            </div>
            
            <div className="checkout-actions">
              <Link to="/products" className="continue-shopping-btn">
                Continue Shopping
              </Link>
              <Link to="/" className="back-to-home-btn">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>🚧 Checkout</h1>
          <p>Please add items to your cart and proceed from there.</p>
        </div>
        
        <div className="checkout-content">
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