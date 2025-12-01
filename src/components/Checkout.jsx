import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PaymentButton from './PaymentButton';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-gray-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Order Found</h1>
          <p className="text-gray-500 mb-8">Please add items to your cart and proceed to checkout.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/cart')} variant="outline" className="rounded-full">
              View Cart
            </Button>
            <Button onClick={() => navigate('/products')} className="rounded-full bg-gray-900 text-white">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = order.status === 'paid' || paymentSuccess;

  return (
    <div className="min-h-screen bg-gray-50 py-12 lg:py-20 font-sans">
      <div className="container mx-auto px-4 max-w-3xl">

        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isPaid ? 'bg-green-100' : 'bg-indigo-100'}`}
          >
            {isPaid ? (
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            ) : (
              <CreditCardIcon className="w-10 h-10 text-indigo-600" />
            )}
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isPaid ? 'Order Confirmed!' : 'Complete Payment'}
          </h1>
          <p className="text-gray-500">
            {isPaid
              ? 'Your order has been successfully paid and confirmed.'
              : 'Please complete your payment to finalize the order.'}
          </p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold text-gray-900">Order Details</CardTitle>
                <Badge variant={isPaid ? "default" : "secondary"} className={isPaid ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"}>
                  {isPaid ? 'Paid' : 'Pending Payment'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Order ID</p>
                  <p className="font-mono font-medium text-gray-900">{order.order_number || order.orderId || order.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Date</p>
                  <p className="font-medium text-gray-900">{new Date(order.orderDate || order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Total Amount</p>
                  <p className="font-bold text-lg text-gray-900">₹{(order.totalAmount || order.total_amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Shipping</p>
                  <p className="font-medium text-gray-900">
                    {order.shipping_details?.label ||
                      (order.shipping_method
                        ? order.shipping_method.charAt(0).toUpperCase() + order.shipping_method.slice(1)
                        : 'Standard Shipping')}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Items Ordered</h3>
                <ul className="space-y-3">
                  {(order.items || []).map((item, index) => (
                    <li key={index} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <span className="text-gray-700 font-medium">
                          {item.productName || item.product_name} <span className="text-gray-400">x{item.quantity}</span>
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">₹{(item.subtotal || item.total_price).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {isPaid ? (
                <div className="bg-green-50 rounded-xl p-6 text-center space-y-4">
                  <p className="text-green-800 font-medium">
                    🎉 Thank you for your purchase! A confirmation email has been sent.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                    <Button onClick={() => navigate('/products')} className="rounded-full bg-green-600 hover:bg-green-700 text-white">
                      Continue Shopping
                    </Button>
                    <Button onClick={() => navigate('/')} variant="outline" className="rounded-full border-green-200 text-green-700 hover:bg-green-100">
                      Back to Home
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pt-2">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-500 text-center mb-4">Secure payment via Razorpay</p>
                    <PaymentButton
                      amount={order.totalAmount || order.total_amount}
                      orderId={order.id || order.orderId || order.order_number}
                      user={user}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Button variant="link" onClick={() => navigate('/cart')} className="text-gray-400 hover:text-gray-600">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Return to Cart
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

// Helper icon component
const CreditCardIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

export default Checkout;