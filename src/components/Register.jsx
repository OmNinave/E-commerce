import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import '../styles/Auth.css';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });
  const [emailStatus, setEmailStatus] = useState({ checking: false, available: null, message: '' });
  const navigate = useNavigate();
  const { registerUser, isAuthenticated, isInitializing } = useAuth();

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, text: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    const strengths = [
      { text: '', color: '' },
      { text: 'Weak', color: '#ff4444' },
      { text: 'Fair', color: '#ffaa00' },
      { text: 'Good', color: '#88cc00' },
      { text: 'Strong', color: '#00aa00' },
      { text: 'Very Strong', color: '#008800' }
    ];

    return { score, ...strengths[score] };
  };

  // DISABLED: This useEffect was causing double navigation that cleared the token
  // The handleSubmit already navigates after successful registration
  // useEffect(() => {
  //   if (!isInitializing && isAuthenticated) {
  //     navigate('/products', { replace: true });
  //   }
  // }, [isInitializing, isAuthenticated, navigate]);

  useEffect(() => {
    let isSubscribed = true;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setEmailStatus({ checking: false, available: null, message: '' });
      return () => {
        isSubscribed = false;
      };
    }

    setEmailStatus((prev) => ({ ...prev, checking: true }));

    const timeoutId = setTimeout(async () => {
      try {
        const response = await apiService.checkEmailAvailability(formData.email.trim());
        if (!isSubscribed) return;
        setEmailStatus({
          checking: false,
          available: response.available,
          message: response.available ? 'Email available' : 'Email already registered'
        });
      } catch (error) {
        if (!isSubscribed) return;
        setEmailStatus({
          checking: false,
          available: null,
          message: 'Unable to verify email right now'
        });
      }
    }, 400);

    return () => {
      isSubscribed = false;
      clearTimeout(timeoutId);
    };
  }, [formData.email]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Update password strength when password changes
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }
    if (!emailRegex.test(formData.email)) {
      setStatus({ type: 'error', message: 'Enter a valid email address.' });
      return;
    }
    if (emailStatus.available === false) {
      setStatus({ type: 'error', message: 'This email is already registered.' });
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

      // Navigate immediately after successful registration
      navigate('/products');
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
            {emailStatus.message && (
              <div
                className="email-status"
                style={{
                  color: emailStatus.available ? '#00aa00' : '#c0392b',
                  fontSize: '0.85rem',
                  marginTop: '4px'
                }}
              >
                {emailStatus.checking ? 'Checking availability...' : emailStatus.message}
              </div>
            )}
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
            {passwordStrength.text && (
              <div className="password-strength" style={{ color: passwordStrength.color, fontSize: '0.85rem', marginTop: '4px' }}>
                Password Strength: <strong>{passwordStrength.text}</strong>
              </div>
            )}
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
            <button
              type="submit"
              className="auth-button"
              disabled={isSubmitting || emailStatus.available === false}
            >
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
