import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, Package, ChevronRight, AlertTriangle, Check, Truck, Shield, Sparkles, Edit2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import apiService from '../services/api';

export default function CheckoutReview() {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();
    const { user } = useAuth();

    const [address, setAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [giftCard, setGiftCard] = useState(null);
    const [fees, setFees] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadCheckoutData();

        // Prevent back navigation to cart after reaching review page
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
        };
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    const loadCheckoutData = async () => {
        try {
            // 1. Load Address
            const addressId = sessionStorage.getItem('checkoutAddressId');
            if (!addressId) {
                navigate('/checkout/address');
                return;
            }

            // Fetch address details
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

            const addrResponse = await fetch(`${API_URL}/api/users/${user.id}/addresses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const addrData = await addrResponse.json();
            const selectedAddr = addrData.addresses.find(a => a.id === parseInt(addressId));
            setAddress(selectedAddr);

            // 2. Load Payment Method
            const savedMethod = sessionStorage.getItem('checkoutPaymentMethod');
            if (!savedMethod) {
                navigate('/checkout/payment');
                return;
            }
            setPaymentMethod(JSON.parse(savedMethod));

            // 3. Load Gift Card
            const savedGiftCard = sessionStorage.getItem('giftCardData');
            const giftCardData = savedGiftCard ? JSON.parse(savedGiftCard) : null;
            setGiftCard(giftCardData);

            // 4. Calculate Fees
            const feesResponse = await fetch(`${API_URL}/api/orders/calculate-fees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: cartItems,
                    giftCardCode: giftCardData?.code
                })
            });
            const feesData = await feesResponse.json();
            setFees(feesData.fees);

        } catch (err) {
            console.error('Error loading checkout data:', err);
            setError('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            const orderData = {
                addressId: address.id,
                paymentMethodId: paymentMethod.id,
                items: cartItems,
                giftCardCode: giftCard?.code,
                deliveryInstructions: ''
            };

            // If COD, create order directly
            if (paymentMethod.type === 'offline') {
                const response = await apiService.createOrderWithPayment(orderData);

                if (response.success) {
                    clearCart();
                    sessionStorage.clear();
                    // Use replace to prevent back navigation to checkout
                    navigate(`/checkout/success/${response.order_id}`, { replace: true });
                } else {
                    throw new Error(response.error || 'Failed to place order');
                }
            } else {
                // Online Payment - Create order first, then redirect to gateway
                const response = await apiService.createOrderWithPayment(orderData);

                if (response.success) {
                    // Navigate to gateway with order details
                    navigate('/checkout/payment-gateway', {
                        state: {
                            orderId: response.order_id,
                            amount: response.total_amount,
                            orderData: response
                        }
                    });
                } else {
                    throw new Error(response.error || 'Failed to initiate payment');
                }
            }
        } catch (err) {
            console.error('Order placement error:', err);
            setError(err.message || 'Failed to place order. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-violet-50/30 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-violet-50/30">
            {/* Floating Header */}
            <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/checkout/payment')}
                                className="rounded-full hover:bg-gray-100"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                                    Review Order
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">Step 3 of 3 • Final Confirmation</p>
                            </div>
                        </div>

                        {/* Progress Pills */}
                        <div className="hidden md:flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white shadow-lg shadow-green-200">
                                <Check className="w-4 h-4" />
                                <span className="text-sm font-medium">Address</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white shadow-lg shadow-green-200">
                                <Check className="w-4 h-4" />
                                <span className="text-sm font-medium">Payment</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">3</div>
                                <span className="text-sm font-medium">Review</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm"
                    >
                        <AlertTriangle className="w-5 h-5" />
                        {error}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Order Details */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Shipping Address */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="rounded-2xl border-2 border-transparent hover:border-indigo-100 shadow-xl shadow-indigo-100/50 transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                <MapPin className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            Shipping Address
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigate('/checkout/address')}
                                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg"
                                        >
                                            <Edit2 className="w-4 h-4 mr-1" /> Change
                                        </Button>
                                    </div>
                                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100">
                                        <p className="font-bold text-gray-900 text-lg">{address?.full_name}</p>
                                        <p className="text-gray-600 mt-1 leading-relaxed">
                                            {address?.address_line1}, {address?.address_line2 && `${address.address_line2}, `}
                                            {address?.city}, {address?.state} - <span className="font-semibold">{address?.pincode}</span>
                                        </p>
                                        <p className="text-gray-600 mt-2 flex items-center gap-2">
                                            <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded">PHONE</span>
                                            {address?.phone}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Payment Method */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="rounded-2xl border-2 border-transparent hover:border-indigo-100 shadow-xl shadow-indigo-100/50 transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 text-violet-600" />
                                            </div>
                                            Payment Method
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigate('/checkout/payment')}
                                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg"
                                        >
                                            <Edit2 className="w-4 h-4 mr-1" /> Change
                                        </Button>
                                    </div>
                                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                                            {paymentMethod?.type === 'offline' ? (
                                                <Truck className="w-6 h-6 text-green-600" />
                                            ) : (
                                                <CreditCard className="w-6 h-6 text-indigo-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{paymentMethod?.name}</p>
                                            <p className="text-sm text-gray-500">{paymentMethod?.description}</p>
                                        </div>
                                        {paymentMethod?.type === 'offline' && (
                                            <div className="ml-auto px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                                                PAY ON DELIVERY
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Order Items */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="rounded-2xl border-2 border-transparent hover:border-indigo-100 shadow-xl shadow-indigo-100/50 transition-all duration-300">
                                <CardContent className="p-6">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Package className="w-5 h-5 text-blue-600" />
                                        </div>
                                        Order Items <span className="text-gray-400 font-normal">({cartItems.length})</span>
                                    </h3>
                                    <div className="space-y-6">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="flex gap-4 group">
                                                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                                                            <p className="text-sm text-gray-500">{item.model}</p>
                                                        </div>
                                                        <p className="font-bold text-gray-900 text-lg">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                                    </div>
                                                    <div className="mt-4 flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                                                            <span>Qty:</span>
                                                            <span className="font-bold">{item.quantity}</span>
                                                        </div>
                                                        <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                            <Truck className="w-3 h-3" />
                                                            Est. Delivery: 3-5 Days
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card className="rounded-2xl border-2 border-indigo-100 shadow-xl shadow-indigo-100/50 overflow-hidden">
                                    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white text-center">
                                        <div className="flex items-baseline justify-center gap-3 mb-2">
                                            <Shield className="w-5 h-5" />
                                            <h3 className="font-bold text-lg leading-none">Order Summary</h3>
                                        </div>
                                        <p className="text-indigo-100 text-sm">Review your total before placing order</p>
                                    </div>

                                    <CardContent className="p-6">
                                        <div className="space-y-4 text-sm">
                                            <div className="flex justify-between text-gray-600">
                                                <span>Subtotal</span>
                                                <span className="font-medium text-gray-900">₹{fees?.subtotal?.toLocaleString('en-IN')}</span>
                                            </div>

                                            <div className="flex justify-between text-gray-600">
                                                <span>Delivery Charges</span>
                                                <span className={fees?.deliveryCharge === 0 ? 'text-green-600 font-bold' : 'font-medium text-gray-900'}>
                                                    {fees?.deliveryCharge === 0 ? 'Free' : `₹${fees?.deliveryCharge}`}
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-gray-600">
                                                <span>Marketplace Fee</span>
                                                <span className="font-medium text-gray-900">₹{fees?.marketplaceFee?.toLocaleString('en-IN')}</span>
                                            </div>

                                            <div className="flex justify-between text-gray-600">
                                                <span>Tax (18% GST)</span>
                                                <span className="font-medium text-gray-900">₹{fees?.taxAmount?.toLocaleString('en-IN')}</span>
                                            </div>

                                            {fees?.giftCardAmount > 0 && (
                                                <div className="flex justify-between text-green-600 bg-green-50 p-2 rounded-lg border border-green-100">
                                                    <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Gift Card</span>
                                                    <span className="font-bold">-₹{fees?.giftCardAmount?.toLocaleString('en-IN')}</span>
                                                </div>
                                            )}

                                            <Separator className="my-2" />

                                            <div className="flex justify-between items-end">
                                                <span className="text-lg font-bold text-gray-900">Total Amount</span>
                                                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                                                    ₹{fees?.total?.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handlePlaceOrder}
                                            disabled={isProcessing}
                                            className="w-full mt-6 bg-gray-900 hover:bg-indigo-600 text-white h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
                                        >
                                            {isProcessing ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Processing...
                                                </span>
                                            ) : paymentMethod?.type === 'offline' ? (
                                                <span className="flex items-center gap-2">Place Order <ChevronRight className="w-5 h-5" /></span>
                                            ) : (
                                                <span className="flex items-center gap-2">Proceed to Pay <ChevronRight className="w-5 h-5" /></span>
                                            )}
                                        </Button>

                                        <p className="text-xs text-gray-400 text-center mt-6 flex items-center justify-center gap-1">
                                            <Shield className="w-3 h-3" /> Secure SSL Encrypted Transaction
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
