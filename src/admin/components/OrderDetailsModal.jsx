import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Calendar, MapPin, CreditCard } from 'lucide-react';

export default function OrderDetailsModal({ order, onClose, onApproveReturn, onRejectReturn, onApproveReplace, onRejectReplace }) {
    if (!order) return null;

    const handleApproveReturn = async () => {
        if (window.confirm('Approve this return request?')) {
            await onApproveReturn(order.orderId);
            onClose();
        }
    };

    const handleRejectReturn = async () => {
        const reason = prompt('Enter reason for rejection:');
        if (reason) {
            await onRejectReturn(order.orderId, reason);
            onClose();
        }
    };

    const handleApproveReplace = async () => {
        if (window.confirm('Approve this replacement request?')) {
            await onApproveReplace(order.orderId);
            onClose();
        }
    };

    const handleRejectReplace = async () => {
        const reason = prompt('Enter reason for rejection:');
        if (reason) {
            await onRejectReplace(order.orderId, reason);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                            <p className="text-sm text-gray-500 mt-1">Order #{order.orderId}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Order Info Card */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Customer</p>
                                    <p className="font-semibold text-gray-900">{order.userName || order.userEmail || 'Unknown'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Date</p>
                                    <p className="font-semibold text-gray-900 flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {new Date(order.date || order.orderDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Total</p>
                                    <p className="font-bold text-purple-600 text-lg">₹{order.totalAmount?.toLocaleString() || 0}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Status</p>
                                    <span className={`status-badge ${order.status || 'pending'}`} style={{ fontSize: '11px', padding: '4px 12px' }}>
                                        {order.status || 'pending'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <Package className="w-5 h-5 mr-2 text-purple-600" />
                                Items Ordered ({order.items?.length || 0})
                            </h3>
                            <div className="space-y-3">
                                {order.items && order.items.length > 0 ? (
                                    order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                                    <Package className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{item.productName || item.name || 'Product'}</p>
                                                    <p className="text-sm text-gray-500">SKU: {item.productSku || item.sku || 'N/A'}</p>
                                                    <p className="text-sm text-purple-600 font-medium">Quantity: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Unit Price</p>
                                                <p className="font-semibold text-gray-900">₹{(item.unitPrice || item.price || 0).toLocaleString()}</p>
                                                <p className="text-xs text-purple-600 font-bold mt-1">
                                                    Total: ₹{((item.unitPrice || item.price || 0) * (item.quantity || 0)).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-4">No items found</p>
                                )}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                                    Shipping Address
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-semibold text-gray-900">{order.shippingAddress.fullName || order.shippingAddress.full_name}</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {order.shippingAddress.addressLine1 || order.shippingAddress.address_line1}
                                        {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                    </p>
                                    <p className="text-sm text-gray-600">Phone: {order.shippingAddress.phone}</p>
                                </div>
                            </div>
                        )}

                        {/* Payment Info */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                                <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                                Payment Method
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="font-semibold text-gray-900">{order.paymentMethod || 'Not specified'}</p>
                                <p className="text-sm text-gray-600 mt-1">Status: {order.paymentStatus || 'Pending'}</p>
                            </div>
                        </div>

                        {/* Action Buttons for Return/Replace Requests */}
                        {order.status === 'return_requested' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm font-semibold text-yellow-800 mb-3">⚠️ Return Request Pending</p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleApproveReturn}
                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                                    >
                                        Approve Return
                                    </button>
                                    <button
                                        onClick={handleRejectReturn}
                                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                                    >
                                        Reject Return
                                    </button>
                                </div>
                            </div>
                        )}

                        {order.status === 'replace_requested' && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm font-semibold text-blue-800 mb-3">🔄 Replacement Request Pending</p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleApproveReplace}
                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                                    >
                                        Approve Replacement
                                    </button>
                                    <button
                                        onClick={handleRejectReplace}
                                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                                    >
                                        Reject Replacement
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
