import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/ManageAddresses.css';

export default function ManageAddresses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);

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
      
      if (!response.ok) {
        throw new Error('Failed to load addresses');
      }
      
      const data = await response.json();
      if (data.success) {
        setAddresses(data.addresses || []);
      } else {
        setError(data.error || 'Failed to load addresses');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to server');
      console.error('Fetch addresses error:', err);
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
    
    // Validation
    if (!formData.fullName || !formData.phone || !formData.addressLine1 || !formData.city || !formData.state || !formData.pincode) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Pincode validation (6 digits for India)
    if (!/^\d{6}$/.test(formData.pincode)) {
      setError('Pincode must be 6 digits');
      return;
    }
    
    // Phone validation (10 digits for India)
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Operation failed');
      }

      const data = await response.json();

      if (data.success) {
        fetchAddresses();
        resetForm();
        alert(isEditing ? 'Address updated successfully!' : 'Address added successfully!');
      } else {
        setError(data.error || 'Operation failed');
      }
    } catch (err) {
      setError(err.message || 'Error submitting form');
      console.error('Submit address error:', err);
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  if (loading && !addresses.length) return <div className="loading">Loading addresses...</div>;

  return (
    <div className="manage-addresses-container">
      <h1>Manage Addresses</h1>

      <div className="address-form-section">
        <h2>{isEditing ? 'Edit Address' : 'Add New Address'}</h2>
        <form onSubmit={handleSubmit} className="address-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address Line 1</label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Address Line 2 (Optional)</label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Landmark (Optional)</label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Address Type</label>
              <select name="addressType" value={formData.addressType} onChange={handleInputChange}>
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                />
                Set as Default Address
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {isEditing ? 'Update Address' : 'Save Address'}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="saved-addresses-section">
        <h2>Saved Addresses</h2>
        {addresses.length === 0 ? (
          <p className="no-addresses">No addresses saved yet.</p>
        ) : (
          <div className="addresses-grid">
            {addresses.map(addr => (
              <div key={addr.id} className={`address-card ${addr.is_default ? 'default' : ''}`}>
                <div className="address-header">
                  <span className="address-type">{addr.address_type}</span>
                  {addr.is_default === 1 && <span className="default-badge">Default</span>}
                </div>
                <h3>{addr.full_name}</h3>
                <p>{addr.address_line1}</p>
                {addr.address_line2 && <p>{addr.address_line2}</p>}
                <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                <p>Phone: {addr.phone}</p>
                <div className="address-actions">
                  <button onClick={() => handleEdit(addr)} className="btn-edit">Edit</button>
                  <button onClick={() => handleDelete(addr.id)} className="btn-delete">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
