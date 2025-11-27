import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/MyOrders.css';

export default function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    setSelectedOrder(order);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      // Refresh orders
      await fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      alert('Error cancelling order: ' + err.message);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: '#ffc107',
      confirmed: '#17a2b8',
      processing: '#007bff',
      shipped: '#20c997',
      delivered: '#28a745',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  if (!user) {
    return <div className="my-orders-container">Please log in to view your orders</div>;
  }

  return (
    <div className="my-orders-container">
      <h1>My Orders</h1>

      {loading && <div className="loading">Loading orders...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && orders.length === 0 && (
        <div className="empty-state">
          <p>You haven't placed any orders yet.</p>
          <button className="btn-primary" onClick={() => navigate('/products')}>
            Continue Shopping
          </button>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order.id}</h3>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="order-status">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusBadgeColor(order.status) }}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="order-summary">
                <p><strong>{order.items?.length || 0}</strong> item(s)</p>
                <p>Total: <strong>₹{order.totalAmount?.toFixed(2) || '0.00'}</strong></p>
              </div>

              <div className="order-actions">
                <button
                  className="btn-secondary"
                  onClick={() => handleViewDetails(order.id)}
                >
                  View Details
                </button>
                {order.status === 'pending' && (
                  <button
                    className="btn-danger"
                    onClick={() => handleCancelOrder(order.id)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="order-modal-overlay" onClick={handleCloseDetails}>
          <div className="order-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details - #{selectedOrder.id}</h2>
              <button className="btn-close" onClick={handleCloseDetails}>&times;</button>
            </div>

            <div className="modal-content">
              <div className="order-info">
                <h3>Order Information</h3>
                <p><strong>Status:</strong> {selectedOrder.status}</p>
                <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <p><strong>Total Amount:</strong> ₹{selectedOrder.totalAmount?.toFixed(2) || '0.00'}</p>
              </div>

              <div className="order-items">
                <h3>Items</h3>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.productName || 'Product'}</td>
                          <td>₹{item.price?.toFixed(2) || '0.00'}</td>
                          <td>{item.quantity}</td>
                          <td>₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No items in this order</p>
                )}
              </div>

              {selectedOrder.shippingAddress && (
                <div className="shipping-address">
                  <h3>Shipping Address</h3>
                  <p>{selectedOrder.shippingAddress.fullName}</p>
                  <p>{selectedOrder.shippingAddress.address}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                </div>
              )}

              <OrderProgressBar status={selectedOrder.status} createdAt={selectedOrder.createdAt} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const OrderProgressBar = ({ status, createdAt }) => {
  const steps = [
    { id: 'pending', label: 'Order Placed', icon: '📝' },
    { id: 'processing', label: 'Processing', icon: '⚙️' },
    { id: 'shipped', label: 'Shipped', icon: '🚚' },
    { id: 'delivered', label: 'Delivered', icon: '✅' }
  ];

  const getCurrentStepIndex = () => {
    if (status === 'cancelled') return -1;
    return steps.findIndex(step => step.id === status);
  };

  const currentStepIndex = getCurrentStepIndex();

  if (status === 'cancelled') {
    return (
      <div className="order-progress-container">
        <div className="error-message" style={{ textAlign: 'center', margin: 0 }}>
          ❌ This order has been cancelled.
        </div>
      </div>
    );
  }

  return (
    <div className="order-progress-container">
      <h3>Order Status</h3>
      <div className="progress-track">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isActive = index === currentStepIndex;

          return (
            <div
              key={step.id}
              className={`progress-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
            >
              <div className="step-icon">{step.icon}</div>
              <div className="step-label">{step.label}</div>
              {index === 0 && <span className="step-date">{new Date(createdAt).toLocaleDateString()}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
