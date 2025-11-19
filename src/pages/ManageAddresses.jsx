import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/ManageAddresses.css';

export default function ManageAddresses() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
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

      const response = await fetch(`/api/users/${user.id}/addresses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }

      const data = await response.json();
      setAddresses(data.addresses || []);
    } catch (err) {
      setError(err.message);
      console.error('Fetch addresses error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName.trim()) {
      alert('Please enter full name');
      return;
    }
    if (!formData.phone.trim()) {
      alert('Please enter phone number');
      return;
    }
    if (!formData.address.trim()) {
      alert('Please enter address');
      return;
    }
    if (!formData.city.trim()) {
      alert('Please enter city');
      return;
    }
    if (!formData.state.trim()) {
      alert('Please enter state');
      return;
    }
    if (!formData.postalCode.trim()) {
      alert('Please enter postal code');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId
        ? `/api/users/${user.id}/addresses/${editingId}`
        : `/api/users/${user.id}/addresses`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(editingId ? 'Failed to update address' : 'Failed to add address');
      }

      await fetchAddresses();
      resetForm();
      setShowForm(false);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (address) => {
    setEditingId(address.id);
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault || false
    });
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await fetch(`/api/users/${user.id}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete address');
      }

      await fetchAddresses();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const response = await fetch(`/api/users/${user.id}/addresses/${addressId}/default`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to set default address');
      }

      await fetchAddresses();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      isDefault: false
    });
    setEditingId(null);
  };

  if (!user) {
    return <div className="manage-addresses-container">Please log in to manage addresses</div>;
  }

  return (
    <div className="manage-addresses-container">
      <h1>Manage Addresses</h1>

      {loading && <div className="loading">Loading addresses...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && (
        <>
          <div className="addresses-header">
            <button
              className="btn-primary"
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
            >
              {showForm ? 'Cancel' : '+ Add New Address'}
            </button>
          </div>

          {showForm && (
            <div className="address-form-container">
              <h2>{editingId ? 'Edit Address' : 'Add New Address'}</h2>
              <form onSubmit={handleSubmit} className="address-form">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    placeholder="Enter street address"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleFormChange}
                      placeholder="City"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleFormChange}
                      placeholder="State"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Postal Code *</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleFormChange}
                      placeholder="Postal Code"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Country *</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleFormChange}
                      placeholder="Country"
                      required
                    />
                  </div>
                </div>

                <div className="form-group checkbox">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleFormChange}
                  />
                  <label htmlFor="isDefault">Set as default address</label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingId ? 'Update Address' : 'Add Address'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {addresses.length === 0 && !showForm && (
            <div className="empty-state">
              <p>No addresses saved yet.</p>
              <p>Add your first address to get started.</p>
            </div>
          )}

          {addresses.length > 0 && (
            <div className="addresses-list">
              {addresses.map(address => (
                <div key={address.id} className="address-card">
                  {address.isDefault && (
                    <div className="default-badge">Default Address</div>
                  )}
                  <h3>{address.fullName}</h3>
                  <p>{address.address}</p>
                  <p>{address.city}, {address.state} {address.postalCode}</p>
                  <p>{address.country}</p>
                  <p className="phone">Phone: {address.phone}</p>

                  <div className="address-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => handleEdit(address)}
                    >
                      Edit
                    </button>
                    {!address.isDefault && (
                      <button
                        className="btn-secondary"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(address.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
