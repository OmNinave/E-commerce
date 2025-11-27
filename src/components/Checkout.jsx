import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PaymentButton from './PaymentButton';
import '../styles/Checkout.css';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(location.state?.order);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePaymentSuccess = (result) => {
    setPaymentSuccess(true);
    // Update local order state to reflect paid status
    setOrder(prev => ({ ...prev, status: 'paid' }));
  };

  const handlePaymentError = (error) => {
    alert(`Payment Failed: ${error}`);
  };

  // Redirect if no order data
  if (!order) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-header">
            <h1>No Order Found</h1>
            <p>Please add items to your cart and proceed to checkout.</p>
            <div className="checkout-actions">
              <Link to="/cart" className="continue-shopping-btn">View Cart</Link>
              <Link to="/products" className="back-to-home-btn">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = order.status === 'paid' || paymentSuccess;
  const isPending = order.status === 'pending' && !paymentSuccess;

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>{isPaid ? '✅ Order Confirmed!' : '💳 Complete Payment'}</h1>
          <p>{isPaid
            ? 'Your order has been successfully paid and confirmed.'
            : 'Please complete your payment to finalize the order.'}</p>
        </div>

        <div className="checkout-content">
          <div className="order-details">
            <h2>Order Details</h2>
            <div className="order-info">
              <p><strong>Order ID:</strong> {order.order_number || order.orderId || order.id}</p>
              <p><strong>Order Date:</strong> {new Date(order.orderDate || order.created_at).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> ₹{(order.totalAmount || order.total_amount).toLocaleString()}</p>
              <p>
                <strong>Shipping Method:</strong>{' '}
                {order.shipping_details?.label ||
                  (order.shipping_method
                    ? order.shipping_method.charAt(0).toUpperCase() + order.shipping_method.slice(1)
                    : 'Standard Shipping')}
              </p>
              <p><strong>Status:</strong> <span className={`status-badge ${isPaid ? 'paid' : 'pending'}`}>{isPaid ? 'Paid' : 'Pending Payment'}</span></p>
            </div>

            <div className="order-items">
              <h3>Items Ordered:</h3>
              <ul>
                {(order.items || []).map((item, index) => (
                  <li key={index}>
                    {item.productName || item.product_name} - Qty: {item.quantity} - ₹{(item.subtotal || item.total_price).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>

            {isPaid ? (
              <div className="success-message">
                <p>📊 This order has been saved to the database and will appear in the admin dashboard analytics!</p>
                <p>🔄 The admin can now see updated user count, order count, and revenue in real-time.</p>
                <div className="success-actions">
                  <Link to="/products" className="continue-shopping-btn">
                    Continue Shopping
                  </Link>
                  <Link to="/" className="back-to-home-btn">
                    Back to Home
                  </Link>
                </div>
              </div>
            ) : (
              <div className="payment-section">
                <h3>Payment Method</h3>
                <p>Secure payment via Razorpay</p>
                <PaymentButton
                  amount={order.totalAmount || order.total_amount}
                  orderId={order.id || order.orderId || order.order_number}
                  user={user}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </div>
            )}
          </div>

          {!isPaid && (
            <div className="checkout-actions">
              <Link to="/products" className="continue-shopping-btn">
                Continue Shopping
              </Link>
              <Link to="/" className="back-to-home-btn">
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;