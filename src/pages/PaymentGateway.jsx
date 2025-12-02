import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import apiService from '../services/api';
import { useCart } from '../context/CartContext';

export default function PaymentGateway() {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const { orderId, amount, orderData } = location.state || {};

    const [status, setStatus] = useState('processing'); // processing, success, failed
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!orderId) {
            navigate('/');
            return;
        }

        // Simulate payment processing delay
        const processPayment = async () => {
            try {
                // Wait for 3 seconds to simulate gateway interaction
                await new Promise(resolve => setTimeout(resolve, 3000));

                // Simulate random success/failure (90% success rate)
                const isSuccess = Math.random() > 0.1;

                if (isSuccess) {
                    // Confirm payment with backend
                    const response = await apiService.confirmPayment({
                        orderId,
                        transactionId: `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                        gatewayResponse: { status: 'captured', method: 'card' }
                    });

                    if (response.success) {
                        setStatus('success');
                        clearCart();
                        sessionStorage.clear();

                        // Redirect to success page after 2 seconds
                        setTimeout(() => {
                            navigate(`/checkout/success/${orderId}`);
                        }, 2000);
                    } else {
                        throw new Error('Payment confirmation failed');
                    }
                } else {
                    throw new Error('Payment declined by bank');
                }
            } catch (err) {
                console.error('Payment error:', err);
                setStatus('failed');
                setError(err.message);

                // Notify backend of failure
                await apiService.reportPaymentFailure({
                    orderId,
                    reason: err.message
                });
            }
        };

        processPayment();
    }, [orderId]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-violet-950 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-none bg-white/10 backdrop-blur-xl text-white overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full"></div>
                <CardContent className="p-8 text-center">

                    {/* Header */}
                    <div className="flex items-center justify-center gap-2 mb-8 text-indigo-200 text-sm font-medium bg-white/5 py-2 px-4 rounded-full w-fit mx-auto border border-white/10">
                        <Lock className="w-3 h-3" />
                        <span>Secure 256-bit SSL Encrypted</span>
                    </div>

                    {/* Processing State */}
                    {status === 'processing' && (
                        <div className="space-y-8">
                            <div className="relative w-24 h-24 mx-auto">
                                <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ShieldCheck className="w-8 h-8 text-indigo-400" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Processing Payment</h2>
                                <p className="text-indigo-200">Connecting to secure gateway...</p>
                                <p className="text-xs text-indigo-300/50 mt-2">Do not close or refresh this window</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                <p className="text-sm text-indigo-200 mb-1">Total Amount</p>
                                <p className="text-3xl font-bold text-white">₹{amount?.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    )}

                    {/* Success State */}
                    {status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                <CheckCircle className="w-12 h-12 text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                                <p className="text-indigo-200">Transaction ID: <span className="font-mono text-white">TXN_{Date.now().toString().slice(-6)}</span></p>
                            </div>
                            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2 }}
                                    className="h-full bg-green-500"
                                />
                            </div>
                            <p className="text-sm text-indigo-300">Redirecting to order confirmation...</p>
                        </motion.div>
                    )}

                    {/* Failed State */}
                    {status === 'failed' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                                <XCircle className="w-12 h-12 text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
                                <p className="text-red-300 bg-red-500/10 py-2 px-4 rounded-lg border border-red-500/20 text-sm inline-block">{error}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <Button
                                    onClick={() => navigate('/checkout/review')}
                                    className="bg-white text-gray-900 hover:bg-gray-100 font-bold h-12 rounded-xl"
                                >
                                    Try Again
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/cart')}
                                    className="border-white/20 text-white hover:bg-white/10 h-12 rounded-xl"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </motion.div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}
