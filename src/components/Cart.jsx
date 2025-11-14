import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import '../styles/Cart.css';

const Cart = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal,
    getCartSubtotal,
    getCartOriginalTotal,
    getTotalSavings
  } = useCart();
  const { formatPrice } = useCurrency();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');

  const handleQuantityChange = (productId, newQuantity) => {
    const quantity = parseInt(newQuantity);
    if (quantity > 0) {
      updateQuantity(productId, quantity);
    }
  };

  const handleCheckout = async () => {
    // Check if user is logged in
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    setIsCreatingOrder(true);
    setOrderMessage('');

    try {
      // Prepare order data
      const orderData = {
        userId: user.id,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price || 0
        })),
        totalAmount: getCartSubtotal()
      };

      // Create order in backend database
      const order = await apiService.createOrder(orderData);
      
      // Clear cart after successful order
      clearCart();
      
      // Show success message
      setOrderMessage(`Order ${order.orderId} created successfully!`);
      
      // Navigate to checkout confirmation
      setTimeout(() => {
        navigate('/checkout', { state: { order } });
      }, 1500);
    } catch (error) {
      console.error('Failed to create order:', error);
      setOrderMessage(error.message || 'Failed to create order. Please try again.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="empty-cart-icon">🛒</div>
          <h1>Your Cart is Empty</h1>
          <p>Add some products to your cart to get started!</p>
          <Link to="/products" className="continue-shopping-button">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1 className="cart-title">Shopping Cart</h1>
        <p className="cart-subtitle">
          {getCartTotal()} {getCartTotal() === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      <div className="cart-content">
        <div className="cart-items-section">
          <div className="cart-items-header">
            <span className="header-product">Product</span>
            <span className="header-price">Price</span>
            <span className="header-quantity">Quantity</span>
            <span className="header-total">Total</span>
            <span className="header-actions">Actions</span>
          </div>

          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </div>

                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <p className="cart-item-model">Model: {item.model}</p>
                  <p className="cart-item-id">Product ID: {item.productId}</p>
                  <Link 
                    to={`/products/${item.id}`} 
                    className="cart-item-view-link"
                  >
                    View Details →
                  </Link>
                </div>

                <div className="cart-item-price">
                  {item.price !== undefined && item.price !== null && (
                    <>
                      <div className="cart-price-current">{formatPrice(item.price)}</div>
                      {item.originalPrice !== undefined && item.originalPrice !== null && item.originalPrice > item.price && (
                        <div className="cart-price-original">{formatPrice(item.originalPrice)}</div>
                      )}
                    </>
                  )}
                </div>

                <div className="cart-item-quantity">
                  <button
                    className="quantity-button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    className="quantity-input"
                    aria-label="Quantity"
                  />
                  <button
                    className="quantity-button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  {item.price !== undefined && item.price !== null && (
                    <div className="cart-total-price">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  )}
                </div>

                <div className="cart-item-actions">
                  <button
                    className="remove-button"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-actions">
            <button onClick={clearCart} className="clear-cart-button">
              Clear Cart
            </button>
            <Link to="/products" className="continue-shopping-link">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        <div className="cart-summary-section">
          <div className="cart-summary">
            <h2 className="summary-title">Order Summary</h2>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Total Items:</span>
                <span className="summary-value">{getCartTotal()}</span>
              </div>
              <div className="summary-row">
                <span>Products:</span>
                <span className="summary-value">{cartItems.length}</span>
              </div>
              {getCartOriginalTotal() > 0 && (
                <>
                  <div className="summary-row">
                    <span>Original Total:</span>
                    <span className="summary-value summary-original">{formatPrice(getCartOriginalTotal())}</span>
                  </div>
                  {getTotalSavings() > 0 && (
                    <div className="summary-row summary-savings">
                      <span>You Save:</span>
                      <span className="summary-value">-{formatPrice(getTotalSavings())}</span>
                    </div>
                  )}
                  <div className="summary-row summary-total">
                    <span>Subtotal:</span>
                    <span className="summary-value">{formatPrice(getCartSubtotal())}</span>
                  </div>
                </>
              )}
            </div>

            {orderMessage && (
              <div className={`order-message ${orderMessage.includes('successfully') ? 'success' : 'error'}`}>
                {orderMessage}
              </div>
            )}
            <button 
              onClick={handleCheckout} 
              className="checkout-button"
              disabled={isCreatingOrder || !isAuthenticated}
            >
              {isCreatingOrder ? 'Creating Order...' : isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
            </button>
            {!isAuthenticated && (
              <p style={{ fontSize: '14px', color: '#666', marginTop: '10px', textAlign: 'center' }}>
                Please <Link to="/login" style={{ color: '#667eea' }}>login</Link> to create an order
              </p>
            )}

            <div className="summary-info">
              <div className="info-item">
                <span className="info-icon">📧</span>
                <span>Email quote request</span>
              </div>
              <div className="info-item">
                <span className="info-icon">🚚</span>
                <span>2-4 weeks delivery</span>
              </div>
              <div className="info-item">
                <span className="info-icon">🛡️</span>
                <span>3-year warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;