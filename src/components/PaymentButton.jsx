import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PaymentButton = ({ amount, onSuccess, onError, user, orderId }) => {
    const [loading, setLoading] = useState(false);
    const [sdkLoaded, setSdkLoaded] = useState(false);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    useEffect(() => {
        const loadSdk = async () => {
            const res = await loadRazorpay();
            setSdkLoaded(res);
        };
        loadSdk();
    }, []);

    const handlePayment = async () => {
        console.log('💳 handlePayment started');
        setLoading(true);
        try {
            if (!sdkLoaded) {
                alert('Razorpay SDK failed to load. Please check your internet connection.');
                setLoading(false);
                return;
            }

            // Create Order
            console.log('💰 Creating payment order...');
            const order = await api.createPaymentOrder(amount);
            console.log('✅ Payment order created:', order);

            const key = process.env.REACT_APP_RAZORPAY_KEY_ID;
            console.log('🔑 Using Razorpay Key:', key);

            if (!key) {
                alert('Payment configuration error: Missing Key ID');
                setLoading(false);
                return;
            }

            const options = {
                key: key,
                amount: order.amount,
                currency: order.currency,
                name: "E-Commerce Store",
                description: "Test Transaction",
                image: "https://example.com/your_logo",
                order_id: order.id,
                handler: async function (response) {
                    console.log('📩 Razorpay handler triggered:', response);
                    try {
                        const verifyData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        };

                        const result = await api.verifyPayment(verifyData);
                        if (result.success) {
                            onSuccess(result);
                        } else {
                            onError('Payment verification failed');
                        }
                    } catch (error) {
                        console.error('❌ Verification Error:', error);
                        onError(error.message);
                    }
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: user?.phone || ''
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                console.error('❌ Payment Failed:', response.error);
                alert(response.error.description);
                onError(response.error.description);
            });
            rzp1.open();

        } catch (error) {
            console.error('❌ Payment Error:', error);
            onError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '15px', margin: '20px 0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
                <strong>Debug Status:</strong><br />
                Key Configured: {process.env.REACT_APP_RAZORPAY_KEY_ID ? '✅ Yes' : '❌ No'}<br />
                Key Value: {process.env.REACT_APP_RAZORPAY_KEY_ID || 'Missing'}<br />
                SDK Loaded: {sdkLoaded ? '✅ Yes' : '❌ No'}
            </div>
            <button
                onClick={handlePayment}
                disabled={loading || !sdkLoaded}
                className="payment-button"
                style={{
                    padding: '12px 24px',
                    backgroundColor: sdkLoaded ? '#3399cc' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: (loading || !sdkLoaded) ? 'not-allowed' : 'pointer',
                    opacity: (loading || !sdkLoaded) ? 0.7 : 1,
                    transition: 'all 0.3s ease',
                    width: '100%',
                }}
            >
                {loading ? 'Processing...' : sdkLoaded ? `Pay ₹${amount}` : 'Loading Payment...'}
            </button>
        </div>
    );
};

export default PaymentButton;
