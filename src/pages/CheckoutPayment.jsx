import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Wallet, Banknote, Gift, ChevronRight, AlertCircle, Lock, Check, Sparkles, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';

export default function CheckoutPayment() {
    const navigate = useNavigate();
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMethod, setSelectedMethod] = useState(null);

    // Gift Card State
    const [giftCardCode, setGiftCardCode] = useState('');
    const [giftCardData, setGiftCardData] = useState(null);
    const [giftCardError, setGiftCardError] = useState(null);
    const [isValidatingGiftCard, setIsValidatingGiftCard] = useState(false);

    useEffect(() => {
        if (!sessionStorage.getItem('checkoutAddressId')) {
            navigate('/checkout/address');
            return;
        }

        fetchPaymentMethods();

        const savedMethod = sessionStorage.getItem('checkoutPaymentMethod');
        if (savedMethod) {
            setSelectedMethod(JSON.parse(savedMethod));
        }

        const savedGiftCard = sessionStorage.getItem('giftCardData');
        if (savedGiftCard) {
            setGiftCardData(JSON.parse(savedGiftCard));
        }

        // Replace history state to maintain proper checkout flow
        window.history.replaceState(null, '', window.location.href);
    }, []);

    const fetchPaymentMethods = async () => {
        try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const response = await fetch(`${API_URL}/api/payment-methods`);
            const data = await response.json();

            if (data.success) {
                setPaymentMethods(data.methods);
            }
        } catch (err) {
            console.error('Failed to fetch payment methods', err);
        } finally {
            setLoading(false);
        }
    };

    const handleValidateGiftCard = async () => {
        if (!giftCardCode.trim()) return;

        setIsValidatingGiftCard(true);
        setGiftCardError(null);

        try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

            const response = await fetch(`${API_URL}/api/gift-cards/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code: giftCardCode })
            });

            const data = await response.json();

            if (data.success) {
                setGiftCardData(data.giftCard);
                sessionStorage.setItem('giftCardData', JSON.stringify(data.giftCard));
                sessionStorage.setItem('giftCardCode', data.giftCard.code);
            } else {
                setGiftCardError(data.error);
            }
        } catch (err) {
            setGiftCardError('Failed to validate gift card');
        } finally {
            setIsValidatingGiftCard(false);
        }
    };

    const removeGiftCard = () => {
        setGiftCardData(null);
        setGiftCardCode('');
        sessionStorage.removeItem('giftCardData');
        sessionStorage.removeItem('giftCardCode');
    };

    const handleContinue = () => {
        if (!selectedMethod) return;
        sessionStorage.setItem('checkoutPaymentMethod', JSON.stringify(selectedMethod));
        navigate('/checkout/review');
    };

    const getMethodIcon = (provider) => {
        if (provider === 'COD') return <Banknote className="w-6 h-6" />;
        if (provider.includes('Pay') || provider === 'UPI') return <Wallet className="w-6 h-6" />;
        return <CreditCard className="w-6 h-6" />;
    };

    // Group payment methods
    const onlineMethods = paymentMethods.filter(m => m.type === 'online');
    const offlineMethods = paymentMethods.filter(m => m.type === 'offline');

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
                                onClick={() => navigate('/checkout/address')}
                                className="rounded-full hover:bg-gray-100"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                                    Payment Method
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">Step 2 of 3 • Secure Checkout</p>
                            </div>
                        </div>

                        {/* Progress Pills */}
                        <div className="hidden md:flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white shadow-lg shadow-green-200">
                                <Check className="w-4 h-4" />
                                <span className="text-sm font-medium">Address</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">2</div>
                                <span className="text-sm font-medium">Payment</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-400">
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">3</div>
                                <span className="text-sm font-medium">Review</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Gift Card Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="rounded-2xl border-2 border-indigo-200 shadow-xl shadow-indigo-100/50 overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4">
                                    <div className="flex items-center gap-2 text-white">
                                        <Sparkles className="w-5 h-5" />
                                        <h3 className="font-bold">ProLab Balance & Gift Cards</h3>
                                    </div>
                                </div>
                                <CardContent className="p-6">
                                    {giftCardData ? (
                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                                                            <Gift className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-green-800">Gift Card Active</p>
                                                            <p className="text-xs text-green-600 font-mono">{giftCardData.code}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-2xl font-bold text-green-700">₹{giftCardData.balance.toLocaleString('en-IN')}</p>
                                                    <p className="text-xs text-green-600 mt-1">Available balance</p>
                                                </div>
                                                <button onClick={removeGiftCard} className="text-sm text-red-600 hover:text-red-700 font-medium underline">
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex gap-3">
                                                <Input
                                                    placeholder="Enter gift card code"
                                                    value={giftCardCode}
                                                    onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                                                    className="uppercase font-mono rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                                <Button
                                                    onClick={handleValidateGiftCard}
                                                    disabled={isValidatingGiftCard || !giftCardCode}
                                                    className="whitespace-nowrap rounded-xl bg-indigo-600 hover:bg-indigo-700"
                                                >
                                                    {isValidatingGiftCard ? 'Applying...' : 'Apply'}
                                                </Button>
                                            </div>
                                            {giftCardError && (
                                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {giftCardError}
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                Try codes: <span className="font-mono font-semibold">WELCOME500</span>, <span className="font-mono font-semibold">SAVE1000</span>, <span className="font-mono font-semibold">TEST2000</span>
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Payment Methods */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-4"
                        >
                            <h2 className="text-xl font-bold text-gray-900">Choose Payment Method</h2>

                            {/* Online Methods */}
                            {onlineMethods.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Digital Payments</p>
                                    {onlineMethods.map((method, index) => (
                                        <motion.div
                                            key={method.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => setSelectedMethod(method)}
                                            className={`relative cursor-pointer group`}
                                        >
                                            <div className={`rounded-2xl p-5 border-2 transition-all duration-300 ${selectedMethod?.id === method.id
                                                ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-lg shadow-indigo-100'
                                                : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                                                }`}>
                                                <div className="flex items-center gap-4">
                                                    {/* Selection Indicator */}
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selectedMethod?.id === method.id
                                                        ? 'border-indigo-600 bg-indigo-600'
                                                        : 'border-gray-300 bg-white'
                                                        }`}>
                                                        {selectedMethod?.id === method.id && (
                                                            <Check className="w-4 h-4 text-white" />
                                                        )}
                                                    </div>

                                                    {/* Icon */}
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedMethod?.id === method.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {getMethodIcon(method.provider)}
                                                    </div>

                                                    {/* Details */}
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900">{method.name}</h4>
                                                        <p className="text-sm text-gray-500">{method.description}</p>
                                                    </div>

                                                    {/* Card Logos */}
                                                    {method.provider === 'Card' && (
                                                        <div className="flex gap-2 opacity-60">
                                                            <div className="w-8 h-6 bg-blue-600 rounded text-white text-[8px] flex items-center justify-center font-bold">VISA</div>
                                                            <div className="w-8 h-6 bg-red-600 rounded text-white text-[8px] flex items-center justify-center font-bold">MC</div>
                                                            <div className="w-8 h-6 bg-orange-500 rounded text-white text-[8px] flex items-center justify-center font-bold">RUPAY</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Offline Methods */}
                            {offlineMethods.length > 0 && (
                                <div className="space-y-3 pt-4">
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pay on Delivery</p>
                                    {offlineMethods.map((method) => (
                                        <div
                                            key={method.id}
                                            onClick={() => setSelectedMethod(method)}
                                            className={`relative cursor-pointer`}
                                        >
                                            <div className={`rounded-2xl p-5 border-2 transition-all duration-300 ${selectedMethod?.id === method.id
                                                ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-lg shadow-indigo-100'
                                                : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                                                }`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedMethod?.id === method.id
                                                        ? 'border-indigo-600 bg-indigo-600'
                                                        : 'border-gray-300 bg-white'
                                                        }`}>
                                                        {selectedMethod?.id === method.id && (
                                                            <Check className="w-4 h-4 text-white" />
                                                        )}
                                                    </div>

                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedMethod?.id === method.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {getMethodIcon(method.provider)}
                                                    </div>

                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900">{method.name}</h4>
                                                        <p className="text-sm text-gray-500">{method.description}</p>
                                                        <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            Convenience fee of ₹10 applies
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Security Badge */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                                <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="text-sm">
                                <p className="font-bold text-blue-900 mb-1">256-bit SSL Encryption</p>
                                <p className="text-blue-700 leading-relaxed">
                                    Your payment information is encrypted and secure. We never store your card details.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="rounded-2xl bg-white border border-gray-200 shadow-xl shadow-indigo-100/50 overflow-hidden"
                            >
                                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white text-center">
                                    <div className="flex items-baseline justify-center gap-3 mb-2">
                                        <Lock className="w-5 h-5" />
                                        <h3 className="font-bold text-lg leading-none">Payment Summary</h3>
                                    </div>
                                    <p className="text-sm text-indigo-100">Secure transaction</p>
                                </div>

                                <div className="p-6 space-y-4">
                                    {selectedMethod ? (
                                        <div className="space-y-3">
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <p className="text-xs text-gray-500 mb-1">Selected Method</p>
                                                <p className="font-bold text-gray-900">{selectedMethod.name}</p>
                                                <p className="text-sm text-gray-600 mt-1">{selectedMethod.description}</p>
                                            </div>
                                            {giftCardData && (
                                                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                                    <p className="text-xs text-green-600 mb-1">Gift Card Applied</p>
                                                    <p className="font-bold text-green-800">₹{giftCardData.balance.toLocaleString('en-IN')}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-400">
                                            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p className="text-sm">Select a payment method</p>
                                        </div>
                                    )}

                                    <div className="flex justify-center">
                                        <Button
                                            onClick={handleContinue}
                                            disabled={!selectedMethod}
                                            className="w-full h-12 rounded-xl bg-gray-900 hover:bg-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                                        >
                                            Continue to Review
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>

                                    <button
                                        onClick={() => navigate('/checkout/address')}
                                        className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        ← Back to Address
                                    </button>

                                    <p className="text-xs text-center text-gray-500 pt-2 flex items-center justify-center gap-1">
                                        <Lock className="w-3 h-3 text-orange-500" />
                                        <span className="pt-0.5">Secure checkout • PCI DSS compliant</span>
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
