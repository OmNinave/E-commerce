import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, Calendar, ArrowRight, Home, ShoppingBag, MapPin, CreditCard, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import confetti from 'canvas-confetti';

export default function OrderSuccess() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Prevent back navigation to checkout pages after order success
        window.history.pushState(null, '', window.location.href);
        const handlePopState = (e) => {
            window.history.pushState(null, '', window.location.href);
            // Optionally show a confirmation dialog
            if (window.confirm('Are you sure you want to leave this page? Your order has been placed successfully.')) {
                navigate('/orders');
            }
        };
        window.addEventListener('popstate', handlePopState);

        // Trigger confetti
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);

        fetchOrderDetails();

        return () => {
            window.removeEventListener('popstate', handlePopState);
            clearInterval(interval);
        };
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

            const response = await fetch(`${API_URL}/api/orders/${orderId}/details`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                setOrder(data.order);
            }
        } catch (err) {
            console.error('Failed to fetch order:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-violet-50/30 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-violet-50/30 flex justify-center items-center p-4">
                <Card className="max-w-md w-full text-center p-8 rounded-2xl shadow-xl">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
                    <Button onClick={() => navigate('/')} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full rounded-xl">
                        Go Home
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-violet-50/30 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-12"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 mb-2">
                        Order Placed Successfully!
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Thank you for your purchase. Your order ID is <span className="font-mono font-bold text-indigo-600">#{orderId}</span>
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="mb-8 overflow-hidden border-none shadow-2xl shadow-indigo-100/50 rounded-3xl bg-white/80 backdrop-blur-sm">
                        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <div className="relative z-10 flex justify-between items-center">
                                <div>
                                    <p className="text-indigo-100 text-sm font-medium mb-1 uppercase tracking-wider">Estimated Delivery</p>
                                    <div className="flex items-center gap-3 font-bold text-2xl">
                                        <Calendar className="w-6 h-6" />
                                        {new Date(order.estimated_delivery_date).toLocaleDateString('en-IN', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <Truck className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>

                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        Delivery Address
                                    </h3>
                                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                        <p className="font-bold text-gray-900 text-lg mb-1">{order.full_name}</p>
                                        <p className="text-gray-600 leading-relaxed text-sm">
                                            {order.address_line1}<br />
                                            {order.address_line2 && <>{order.address_line2}<br /></>}
                                            {order.city}, {order.state} - {order.pincode}
                                        </p>
                                        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600">PHONE</span>
                                            {order.phone}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                                            <CreditCard className="w-4 h-4 text-violet-600" />
                                        </div>
                                        Payment Details
                                    </h3>
                                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 h-full">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500 text-sm">Method</span>
                                                <span className="font-bold text-gray-900">{order.payment_method_name}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500 text-sm">Status</span>
                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    order.payment_status === 'cod' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {order.payment_status === 'cod' ? 'Cash on Delivery' : order.payment_status}
                                                </span>
                                            </div>

                                            <Separator className="my-2" />

                                            {/* Price Breakdown */}
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between text-gray-600">
                                                    <span>Subtotal</span>
                                                    <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
                                                </div>

                                                <div className="flex justify-between text-gray-600">
                                                    <span>Delivery</span>
                                                    <span className={order.fees?.delivery_charge === 0 ? 'text-green-600 font-medium' : ''}>
                                                        {order.fees?.delivery_charge === 0 ? 'Free' : `₹${order.fees?.delivery_charge?.toLocaleString('en-IN')}`}
                                                    </span>
                                                </div>

                                                {order.fees?.marketplace_fee > 0 && (
                                                    <div className="flex justify-between text-gray-600">
                                                        <span>Marketplace Fee</span>
                                                        <span>₹{order.fees?.marketplace_fee?.toLocaleString('en-IN')}</span>
                                                    </div>
                                                )}

                                                {order.fees?.tax_amount > 0 && (
                                                    <div className="flex justify-between text-gray-600">
                                                        <span>Tax (18% GST)</span>
                                                        <span>₹{order.fees?.tax_amount?.toLocaleString('en-IN')}</span>
                                                    </div>
                                                )}

                                                {order.fees?.gift_card_amount > 0 && (
                                                    <div className="flex justify-between text-green-600">
                                                        <span>Gift Card</span>
                                                        <span>-₹{order.fees?.gift_card_amount?.toLocaleString('en-IN')}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <Separator className="my-2" />

                                            <div className="flex justify-between items-center pt-1">
                                                <span className="text-gray-900 font-bold">Total Amount</span>
                                                <span className="text-xl font-bold text-indigo-600">₹{order.total_amount.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10">
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Package className="w-4 h-4 text-blue-600" />
                                    </div>
                                    Order Items
                                </h3>
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex gap-4 items-start p-5 bg-white border-2 border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                                    <Package className="w-8 h-8" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 text-base mb-1">{item.name}</h4>
                                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">Qty: {item.quantity}</span>
                                                    <span className="text-xs">@ ₹{item.unit_price.toLocaleString('en-IN')} each</span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs text-gray-500 mb-1 font-medium">Item Total</p>
                                                <p className="text-xl font-bold text-indigo-600">₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pb-12">
                    <Button
                        onClick={() => navigate(`/orders`)}
                        variant="outline"
                        className="h-14 px-8 rounded-xl border-2 border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 text-gray-700 font-semibold"
                    >
                        <Package className="w-5 h-5 mr-2" /> View My Orders
                    </Button>
                    <Button
                        onClick={() => navigate('/')}
                        variant="ghost"
                        className="h-14 px-8 rounded-xl hover:bg-gray-100 text-gray-600 font-semibold"
                    >
                        <Home className="w-5 h-5 mr-2" /> Go to Home
                    </Button>
                    <Button
                        onClick={() => navigate('/products')}
                        className="bg-gray-900 hover:bg-indigo-600 text-white h-14 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] font-semibold"
                    >
                        <ShoppingBag className="w-5 h-5 mr-2" /> Continue Shopping
                    </Button>
                </div>
            </div>
        </div>
    );
}
