import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, User, Plus, Trash2, Edit2, Check, Home, Briefcase, Star } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import '../styles/ManageAddresses.css';

export default function ManageAddresses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);

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
  }, [user]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

      const response = await fetch(`${API_URL}/api/users/${user.id}/addresses`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) throw new Error('Failed to load addresses');

      const data = await response.json();
      if (data.success) {
        setAddresses(data.addresses || []);
      } else {
        setError(data.error || 'Failed to load addresses');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to server');
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.addressLine1 || !formData.city || !formData.state || !formData.pincode) {
      setError('Please fill in all required fields');
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      setError('Pincode must be 6 digits');
      return;
    }

    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      setError('Phone number must be 10 digits');
      return;
    }

    try {
      setError(null);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

      const url = isEditing
        ? `${API_URL}/api/users/${user.id}/addresses/${currentAddress.id}`
        : `${API_URL}/api/users/${user.id}/addresses`;

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Operation failed');

      const data = await response.json();

      if (data.success) {
        fetchAddresses();
        resetForm();
        setShowForm(false);
      } else {
        setError(data.error || 'Operation failed');
      }
    } catch (err) {
      setError(err.message || 'Error submitting form');
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/users/${user.id}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchAddresses();
      } else {
        alert('Failed to delete address');
      }
    } catch (err) {
      alert('Error deleting address');
    }
  };

  const handleEdit = (address) => {
    setCurrentAddress(address);
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
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
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
    setIsEditing(false);
    setCurrentAddress(null);
  };

  return (
    <PageLayout
      title="Manage Addresses"
      subtitle="Add and update your delivery locations"
      loading={loading && !addresses.length}
      error={error}
    >
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header Actions */}
        {!showForm && (
          <div className="flex justify-end">
            <Button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white hover-lift"
            >
              <Plus className="w-4 h-4 mr-2" /> Add New Address
            </Button>
          </div>
        )}

        {/* Form Section */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="border-none shadow-xl shadow-indigo-100/50 bg-white/80 backdrop-blur-md mb-8">
                <CardContent className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Address' : 'Add New Address'}</h2>
                    <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input name="fullName" value={formData.fullName} onChange={handleInputChange} className="pl-10" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input name="phone" value={formData.phone} onChange={handleInputChange} className="pl-10" required />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Address Line 1</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} className="pl-10" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Address Line 2 (Optional)</Label>
                      <Input name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input name="city" value={formData.city} onChange={handleInputChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label>State</Label>
                        <Input name="state" value={formData.state} onChange={handleInputChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Pincode</Label>
                        <Input name="pincode" value={formData.pincode} onChange={handleInputChange} required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Address Type</Label>
                        <div className="flex gap-4">
                          {['Home', 'Work', 'Other'].map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, addressType: type }))}
                              className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${formData.addressType === type ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 pt-8">
                        <input
                          type="checkbox"
                          id="isDefault"
                          name="isDefault"
                          checked={formData.isDefault}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <Label htmlFor="isDefault" className="cursor-pointer">Set as Default Address</Label>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button type="submit" className="w-full bg-gray-900 hover:bg-indigo-600 text-white h-11">
                        {isEditing ? 'Update Address' : 'Save Address'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Address List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {addresses.map((addr, index) => (
              <motion.div
                key={addr.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`h-full border-none shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden ${addr.is_default ? 'ring-2 ring-indigo-100' : ''}`}>
                  {addr.is_default === 1 && (
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs px-3 py-1 rounded-bl-lg font-medium z-10">
                      Default
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${addr.address_type === 'Home' ? 'bg-blue-50 text-blue-600' : addr.address_type === 'Work' ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-600'}`}>
                          {addr.address_type === 'Home' ? <Home className="w-5 h-5" /> : addr.address_type === 'Work' ? <Briefcase className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{addr.full_name}</h3>
                          <p className="text-xs text-gray-500">{addr.address_type}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-6">
                      <p>{addr.address_line1}</p>
                      {addr.address_line2 && <p>{addr.address_line2}</p>}
                      <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{addr.phone}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(addr)} className="flex-1 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200">
                        <Edit2 className="w-3 h-3 mr-2" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(addr.id)} className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                        <Trash2 className="w-3 h-3 mr-2" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {!loading && addresses.length === 0 && !showForm && (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No addresses found</h3>
              <p className="text-gray-500 mb-6">Add a new address to manage your deliveries.</p>
              <Button onClick={() => setShowForm(true)} variant="outline">Add Address</Button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
