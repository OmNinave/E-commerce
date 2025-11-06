import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { loginUser, isAuthenticated, isInitializing } = useAuth();

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
    if (!formData.email || !formData.password) {
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
    setStatus({ type: '', message: '' });
    setIsSubmitting(true);
    try {
      await loginUser({ email: formData.email, password: formData.password });
      navigate('/products', { replace: true });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Unable to sign in right now. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue exploring premium lab equipment.</p>
        </div>
        {status.message && (
          <div className={`auth-status ${status.type}`} role="status">
            {status.message}
          </div>
        )}
        <form className="auth-form" onSubmit={handleSubmit}>
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
          <div className="auth-actions">
            <button type="submit" className="auth-button" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
            <Link to="/" className="auth-link">Return to Home</Link>
          </div>
        </form>
        <div className="auth-footer">
          <span>New to ProLab?</span>
          <Link to="/register" className="auth-link">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
