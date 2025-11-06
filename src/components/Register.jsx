import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { registerUser, isAuthenticated, isInitializing } = useAuth();

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      navigate('/products', { replace: true });
    }
  }, [isInitializing, isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setStatus({ type: 'error', message: 'Enter a valid email address.' });
      return;
    }
    if (formData.password.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    setStatus({ type: '', message: '' });
    setIsSubmitting(true);
    try {
      await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      navigate('/products', { replace: true });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Unable to create an account right now. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Access exclusive lab equipment deals and seamless checkout.</p>
        </div>
        {status.message && (
          <div className={`auth-status ${status.type}`} role="status">
            {status.message}
          </div>
        )}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className="form-input"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <div className="auth-actions">
            <button type="submit" className="auth-button" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
            <Link to="/" className="auth-link">Return to Home</Link>
          </div>
        </form>
        <div className="terms-text">
          By creating an account, you agree to receive updates about new research equipment, offers, and services.
        </div>
        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link to="/login" className="auth-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
