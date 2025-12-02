import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, User, Plus, Home, Briefcase, Package, ChevronRight, X, Check, ArrowLeft, Edit2, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';

export default function CheckoutAddress() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        addressType: 'Home',
        isDefault: false
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchAddresses();

        const savedAddressId = sessionStorage.getItem('checkoutAddressId');
        if (savedAddressId) {
            setSelectedAddressId(parseInt(savedAddressId));
        }

        // Replace history state to prevent going back to cart with items
        window.history.replaceState(null, '', window.location.href);
    }, [user]);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

            const response = await fetch(`${API_URL}/api/users/${user.id}/addresses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to load addresses');

            const data = await response.json();
            if (data.success) {
                setAddresses(data.addresses || []);
                if (!selectedAddressId && data.addresses.length > 0) {
                    const defaultAddr = data.addresses.find(a => a.is_default);
                    setSelectedAddressId(defaultAddr ? defaultAddr.id : data.addresses[0].id);
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEditAddress = (e, address) => {
        e.stopPropagation();
        setEditingAddressId(address.id);
        setFormData({
            fullName: address.full_name,
            phone: address.phone,
            addressLine1: address.address_line1,
            addressLine2: address.address_line2 || '',
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            landmark: address.landmark || '',
            addressType: address.address_type,
            isDefault: address.is_default === 1
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

            const url = editingAddressId
                ? `${API_URL}/api/users/${user.id}/addresses/${editingAddressId}`
                : `${API_URL}/api/users/${user.id}/addresses`;

            const method = editingAddressId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                await fetchAddresses();
                setShowForm(false);
                setEditingAddressId(null);
                setFormData({
                    fullName: '', phone: '', addressLine1: '', addressLine2: '',
                    city: '', state: '', pincode: '', landmark: '', addressType: 'Home', isDefault: false
                });
            } else {
                setError(data.error || 'Failed to save address');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleContinue = () => {
        if (!selectedAddressId) {
            setError('Please select a delivery address');
            return;
        }
        sessionStorage.setItem('checkoutAddressId', selectedAddressId);
        navigate('/checkout/payment');
    };

    const selectedAddress = addresses.find(a => a.id === selectedAddressId);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-violet-50/30">
            {/* Floating Header with Glassmorphism */}
            <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/cart')}
                                className="rounded-full hover:bg-gray-100"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                                    Delivery Details
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">Step 1 of 3 • Secure Checkout</p>
                            </div>
                        </div>

                        {/* Progress Pills */}
                        <div className="hidden md:flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">1</div>
                                <span className="text-sm font-medium">Address</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-400">
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">2</div>
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

                    {/* Main Content - 2/3 */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Address Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Select Delivery Address</h2>
                                <Button
                                    onClick={() => {
                                        setEditingAddressId(null);
                                        setFormData({
                                            fullName: '', phone: '', addressLine1: '', addressLine2: '',
                                            city: '', state: '', pincode: '', landmark: '', addressType: 'Home', isDefault: false
                                        });
                                        setShowForm(true);
                                    }}
                                    variant="outline"
                                    className="rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add New
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.map((addr, index) => (
                                    <motion.div
                                        key={addr.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => setSelectedAddressId(addr.id)}
                                        className={`relative cursor-pointer group`}
                                    >
                                        <div className={`h-full rounded-2xl p-5 border-2 transition-all duration-300 ${selectedAddressId === addr.id
                                            ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-lg shadow-indigo-100'
                                            : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                                            }`}>

                                            {/* Selection Indicator */}
                                            <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedAddressId === addr.id
                                                ? 'border-indigo-600 bg-indigo-600'
                                                : 'border-gray-300 bg-white'
                                                }`}>
                                                {selectedAddressId === addr.id && (
                                                    <Check className="w-4 h-4 text-white" />
                                                )}
                                            </div>

                                            {/* Edit Button */}
                                            <button
                                                onClick={(e) => handleEditAddress(e, addr)}
                                                className="absolute bottom-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-indigo-100 text-gray-500 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>

                                            {/* Address Type Icon */}
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${addr.address_type === 'Home' ? 'bg-blue-100 text-blue-600' :
                                                addr.address_type === 'Work' ? 'bg-orange-100 text-orange-600' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                {addr.address_type === 'Home' ? <Home className="w-5 h-5" /> :
                                                    addr.address_type === 'Work' ? <Briefcase className="w-5 h-5" /> :
                                                        <MapPin className="w-5 h-5" />}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-gray-900">{addr.full_name}</h3>
                                                    {addr.is_default === 1 && (
                                                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    {addr.address_line1}
                                                    {addr.address_line2 && <>, {addr.address_line2}</>}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {addr.city}, {addr.state} - {addr.pincode}
                                                </p>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 pt-2 border-t border-gray-100">
                                                    <Phone className="w-3 h-3" />
                                                    {addr.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Add/Edit Address Form Modal */}
                        <AnimatePresence>
                            {showForm && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                                    >
                                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {editingAddressId ? 'Edit Address' : 'Add New Address'}
                                            </h3>
                                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition-colors">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="p-6">
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-gray-700">Full Name *</Label>
                                                        <Input name="fullName" value={formData.fullName} onChange={handleInputChange}
                                                            className="rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" required />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-gray-700">Phone Number *</Label>
                                                        <Input name="phone" value={formData.phone} onChange={handleInputChange}
                                                            className="rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" required />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-gray-700">Address Line 1 *</Label>
                                                    <Input name="addressLine1" value={formData.addressLine1} onChange={handleInputChange}
                                                        placeholder="House No., Building Name"
                                                        className="rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" required />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-gray-700">Address Line 2</Label>
                                                    <Input name="addressLine2" value={formData.addressLine2} onChange={handleInputChange}
                                                        placeholder="Road, Area, Colony"
                                                        className="rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" />
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-gray-700">City *</Label>
                                                        <Input name="city" value={formData.city} onChange={handleInputChange}
                                                            className="rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" required />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-gray-700">State *</Label>
                                                        <Input name="state" value={formData.state} onChange={handleInputChange}
                                                            className="rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" required />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-gray-700">Pincode *</Label>
                                                        <Input name="pincode" value={formData.pincode} onChange={handleInputChange}
                                                            className="rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" required maxLength={6} />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-gray-700">Landmark (Optional)</Label>
                                                    <Input name="landmark" value={formData.landmark} onChange={handleInputChange}
                                                        placeholder="Near..."
                                                        className="rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-gray-700">Address Type</Label>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        {['Home', 'Work', 'Other'].map(type => (
                                                            <button
                                                                key={type}
                                                                type="button"
                                                                onClick={() => setFormData(prev => ({ ...prev, addressType: type }))}
                                                                className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${formData.addressType === type
                                                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                                    : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                                                                    }`}
                                                            >
                                                                {type}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 pt-2">
                                                    <input
                                                        type="checkbox"
                                                        id="isDefault"
                                                        name="isDefault"
                                                        checked={formData.isDefault}
                                                        onChange={handleInputChange}
                                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                    />
                                                    <Label htmlFor="isDefault" className="cursor-pointer font-normal text-gray-700">
                                                        Set as default address
                                                    </Label>
                                                </div>

                                                <div className="pt-4 flex gap-3">
                                                    <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 h-12 rounded-xl">
                                                        Cancel
                                                    </Button>
                                                    <Button type="submit" className="flex-1 h-12 rounded-xl bg-gray-900 hover:bg-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                                                        {editingAddressId ? 'Update Address' : 'Save Address'}
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sticky Sidebar - 1/3 */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="rounded-2xl bg-white border border-gray-200 shadow-xl shadow-indigo-100/50 overflow-hidden"
                            >
                                {/* Header with Gradient */}
                                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white text-center">
                                    <div className="flex items-baseline justify-center gap-3 mb-2">
                                        <Package className="w-5 h-5" />
                                        <h3 className="font-bold text-lg leading-none">Delivery Summary</h3>
                                    </div>
                                    <p className="text-sm text-indigo-100">Review your delivery details</p>
                                </div>

                                <div className="p-6 space-y-6">
                                    {selectedAddress ? (
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                                                    <MapPin className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div className="flex-1 text-sm">
                                                    <p className="font-semibold text-gray-900">{selectedAddress.full_name}</p>
                                                    <p className="text-gray-600 mt-1 leading-relaxed">
                                                        {selectedAddress.address_line1}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                                                    </p>
                                                    <p className="text-gray-500 mt-2 flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {selectedAddress.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-400">
                                            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p className="text-sm">No address selected</p>
                                        </div>
                                    )}

                                    <div className="flex justify-center">
                                        <Button
                                            onClick={handleContinue}
                                            disabled={!selectedAddressId || showForm}
                                            className="w-full h-12 rounded-xl bg-gray-900 hover:bg-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Continue to Payment
                                            <ChevronRight className="w-4 h-4 ml-2 inline-block" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-green-50 border border-green-100">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                                <ShieldCheck className="w-4 h-4 text-green-600" />
                                            </div>
                                            <span className="text-xs font-medium text-green-700">Secure Checkout</span>
                                        </div>
                                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                                <Truck className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <span className="text-xs font-medium text-blue-700">Fast Delivery</span>
                                        </div>
                                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-50 border border-purple-100">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                                <CreditCard className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <span className="text-xs font-medium text-purple-700">Easy Returns</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
