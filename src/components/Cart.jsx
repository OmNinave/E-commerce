import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, ArrowRight, Minus, Plus, AlertCircle, CheckCircle2, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { getProductImage } from '../utils/imageUtils';
import '../styles/Cart.css';
import '../styles/CartFixes.css';

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

  const handleCheckout = () => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      setOrderMessage('Error: Your cart is empty.');
      return;
    }

    // Navigate to the new checkout flow
    navigate('/checkout/address');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-8 text-lg">Looks like you haven't added anything to your cart yet.</p>
          <Button
            onClick={() => navigate('/products')}
            className="rounded-full h-12 px-8 text-lg bg-indigo-600 hover:bg-indigo-700 hover-lift"
          >
            Start Shopping
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 lg:py-20 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-end mb-8"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-500">
              You have <span className="font-semibold text-indigo-600">{getCartTotal()} items</span> in your cart
            </p>
          </div>
          <Button
            variant="outline"
            onClick={clearCart}
            className="hidden sm:flex text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Clear Cart
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

          {/* Left: Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
                    <div className="p-6 flex flex-row gap-6 items-start">

                      {/* Image */}
                      <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={getProductImage(item)}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 text-left w-full">
                        <div className="flex flex-col sm:flex-row justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900 mb-1 sm:mb-0">{item.name}</h3>
                          <div className="text-right">
                            <div className="text-lg font-bold text-indigo-600">
                              {item.price ? formatPrice(item.price * item.quantity) : '-'}
                            </div>
                            {item.originalPrice > item.price && (
                              <div className="text-sm text-gray-400 line-through">
                                {formatPrice(item.originalPrice * item.quantity)}
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-1">Model: {item.model}</p>
                        {item.originalPrice > item.price && (
                          <div className="text-xs text-green-600 font-medium mb-4">
                            Saved {formatPrice((item.originalPrice - item.price) * item.quantity)}
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-200">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-12 text-center font-medium text-gray-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-600"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            <Link
                              to={`/products/${item.id}`}
                              className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                            >
                              View Details
                            </Link>
                            <div className="h-4 w-px bg-gray-200"></div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-sm text-red-500 hover:text-red-600 transition-colors flex items-center"
                            >
                              <Trash2 className="w-3 h-3 mr-1" /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex justify-between items-center pt-4">
              <Link to="/products" className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Continue Shopping
              </Link>
              <Button
                variant="ghost"
                onClick={clearCart}
                className="sm:hidden text-red-500"
              >
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24"
            >
              <Card className="border-none shadow-xl shadow-indigo-100/50 overflow-hidden">
                <div className="p-6 bg-white">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({getCartTotal()} items)</span>
                      <div className="text-right">
                        {getCartOriginalTotal() > getCartSubtotal() && (
                          <span className="text-sm text-gray-400 line-through block">
                            {formatPrice(getCartOriginalTotal())}
                          </span>
                        )}
                        <span className="font-medium text-gray-900">{formatPrice(getCartSubtotal())}</span>
                      </div>
                    </div>

                    {getCartOriginalTotal() > getCartSubtotal() && (
                      <div className="flex justify-between text-green-600 text-sm bg-green-50 p-2 rounded-lg border border-green-100">
                        <span className="font-medium">Total Savings</span>
                        <span className="font-bold">-{formatPrice(getCartOriginalTotal() - getCartSubtotal())}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>

                    <div className="h-px bg-gray-100 my-4"></div>

                    <div className="flex justify-between items-end">
                      <span className="text-lg font-bold text-gray-900">Total Payable</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-indigo-600 block leading-none">
                          {formatPrice(getCartSubtotal())}
                        </span>
                        <span className="text-xs text-gray-400 mt-1 block">Including VAT</span>
                      </div>
                    </div>
                  </div>

                  {orderMessage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`p-3 rounded-lg flex items-start gap-2 text-sm mb-4 ${orderMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                    >
                      {orderMessage.includes('successfully') ? <CheckCircle2 className="w-4 h-4 mt-0.5" /> : <AlertCircle className="w-4 h-4 mt-0.5" />}
                      {orderMessage}
                    </motion.div>
                  )}

                  <Button
                    onClick={handleCheckout}
                    disabled={isCreatingOrder}
                    className="w-full h-12 text-lg bg-gray-900 hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200/50 hover-lift transition-all"
                  >
                    {isCreatingOrder ? 'Processing...' : 'Proceed to Checkout'}
                    {!isCreatingOrder && <ArrowRight className="w-5 h-5 ml-2" />}
                  </Button>

                  {!isAuthenticated && (
                    <p className="text-xs text-center text-gray-500 mt-4">
                      Please <Link to="/login" className="text-indigo-600 hover:underline">login</Link> to complete your purchase
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 p-6 space-y-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span>Secure Checkout with SSL</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span>Free Shipping on all orders</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span>All major cards accepted</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;