import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Calendar, ChevronRight, X, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import '../styles/MyOrders.css';

export default function MyOrders() {
  const { user, isInitializing } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnModal, setReturnModal] = useState({ isOpen: false, orderId: null, type: null });
  const [returnReason, setReturnReason] = useState('');

  useEffect(() => {
    if (isInitializing) return;
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, isInitializing, navigate]);

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

      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

      // FIX: Use the correct user cancel endpoint
      const response = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel order');
      }

      await fetchOrders();
      setSelectedOrder(null);
      alert('Order cancelled successfully');
    } catch (err) {
      alert('Error cancelling order: ' + err.message);
    }
  };

  const handleReturnOrder = (orderId) => {
    setReturnModal({ isOpen: true, orderId, type: 'return' });
  };

  const handleReplaceOrder = (orderId) => {
    setReturnModal({ isOpen: true, orderId, type: 'replace' });
  };

  const submitReturnRequest = async () => {
    if (!returnReason.trim()) {
      alert('Please enter a reason');
      return;
    }

    const { orderId, type } = returnModal;
    const endpoint = type === 'return' ? 'return' : 'replace';

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

      const response = await fetch(`${API_URL}/api/orders/${orderId}/${endpoint}`, {
        method: 'PUT',
        credentials: 'include', // ✅ Send cookies with request
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ reason: returnReason })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to request ${type}`);
      }

      await fetchOrders();
      setSelectedOrder(null);
      setReturnModal({ isOpen: false, orderId: null, type: null });
      setReturnReason('');
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} requested successfully`);
    } catch (err) {
      alert(`Error requesting ${type}: ` + err.message);
    }
  };

  const closeReturnModal = () => {
    setReturnModal({ isOpen: false, orderId: null, type: null });
    setReturnReason('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle2 className="w-4 h-4 mr-1" />;
      case 'shipped': return <Truck className="w-4 h-4 mr-1" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4 mr-1" />;
      default: return <Clock className="w-4 h-4 mr-1" />;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Improved Header */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="mt-2 text-gray-500">View and track your order history</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
              <Package className="w-4 h-4 text-indigo-600" />
              <span>Total Orders: <span className="font-semibold text-gray-900">{orders.length}</span></span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-red-100">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load orders</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button onClick={fetchOrders} variant="outline">Try Again</Button>
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven't placed any orders yet. Start shopping to fill your cart!</p>
            <Button onClick={() => navigate('/products')} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 h-12 text-lg shadow-lg shadow-indigo-200/50 hover-lift">
              Start Shopping
            </Button>
          </motion.div>
        ) : (<>

          <div className="space-y-6 max-w-4xl mx-auto">
            <AnimatePresence>
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden hover:-translate-y-1 cursor-pointer group" onClick={() => setSelectedOrder(order)}>
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Package className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Badge className={`px-3 py-1 rounded-full border ${getStatusColor(order.status)} flex items-center`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-100">
                        <div className="flex gap-8 text-sm w-full sm:w-auto mb-4 sm:mb-0">
                          <div>
                            <span className="text-gray-500 block text-xs uppercase tracking-wider">Items</span>
                            <span className="font-semibold text-gray-900">{order.items?.length || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-xs uppercase tracking-wider">Total</span>
                            <span className="font-semibold text-gray-900">₹{order.totalAmount?.toFixed(2)}</span>
                          </div>
                        </div>
                        <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 group-hover:translate-x-1 transition-all">
                          View Details <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Details Modal */}
          <AnimatePresence>
            {selectedOrder && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedOrder(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                    <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="p-6 space-y-8">
                    {/* Status Bar */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-medium text-gray-500">Order Status</span>
                        <Badge className={`px-3 py-1 rounded-full border ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status.toUpperCase()}
                        </Badge>
                      </div>
                      <OrderProgressBar status={selectedOrder.status} createdAt={selectedOrder.createdAt} />
                    </div>

                    {/* Items */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Items Ordered</h3>
                      <div className="space-y-4">
                        {selectedOrder.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{item.productName || 'Product'}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="font-semibold text-gray-900">₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping */}
                    {selectedOrder.shippingAddress && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Shipping Address</h3>
                          <div className="text-sm text-gray-600 leading-relaxed">
                            <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.fullName}</p>
                            <p>{selectedOrder.shippingAddress.address}</p>
                            <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                            <p>{selectedOrder.shippingAddress.postalCode}</p>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Payment Summary</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Subtotal</span>
                              <span className="font-medium">₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Shipping</span>
                              <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-100">
                              <span className="font-bold text-gray-900">Total</span>
                              <span className="font-bold text-indigo-600">₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedOrder.status === 'pending' && (
                      <div className="pt-6 border-t border-gray-100">
                        <Button
                          onClick={() => handleCancelOrder(selectedOrder.id)}
                          className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        >
                          Cancel Order
                        </Button>
                      </div>
                    )}


                    {(selectedOrder.status === 'delivered' || selectedOrder.status === 'pending' || selectedOrder.status === 'shipped') && (
                      <div className="pt-6 border-t border-gray-100 flex gap-3">
                        <Button
                          onClick={() => handleReturnOrder(selectedOrder.id)}
                          className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Request Return
                        </Button>
                        <Button
                          onClick={() => handleReplaceOrder(selectedOrder.id)}
                          className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 border-0"
                        >
                          Request Replacement
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Return/Replace Modal */}
          <AnimatePresence>
            {returnModal.isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={closeReturnModal}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {returnModal.type === 'return' ? 'Request Return' : 'Request Replacement'}
                    </h3>
                    <button
                      onClick={closeReturnModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for {returnModal.type}:
                    </label>
                    <textarea
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      placeholder={`Please explain why you want to ${returnModal.type} this order...`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      rows={4}
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={closeReturnModal}
                      className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={submitReturnRequest}
                      className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Submit Request
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>)}
      </div>
    </div>
  );
}

const OrderProgressBar = ({ status, createdAt }) => {
  const steps = [
    { id: 'pending', label: 'Placed' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === status);
  if (status === 'cancelled') return <div className="text-red-500 font-medium text-center">Order Cancelled</div>;

  return (
    <div className="relative flex justify-between w-full mt-4">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded-full"></div>
      <div
        className="absolute top-1/2 left-0 h-1 bg-indigo-600 -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
        style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
      ></div>

      {steps.map((step, index) => {
        const isCompleted = index <= currentStepIndex;
        return (
          <div key={step.id} className="flex flex-col items-center bg-white px-2">
            <div className={`w-3 h-3 rounded-full border-2 ${isCompleted ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}`}></div>
            <span className={`text-xs mt-2 ${isCompleted ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
};
