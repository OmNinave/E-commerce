import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

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
  const { registerUser } = useAuth();

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
      { text: 'Weak', color: 'text-red-500' },
      { text: 'Fair', color: 'text-yellow-500' },
      { text: 'Good', color: 'text-green-500' },
      { text: 'Strong', color: 'text-green-600' },
      { text: 'Very Strong', color: 'text-green-700' }
    ];

    return { score, ...strengths[score] };
  };

  useEffect(() => {
    let isSubscribed = true;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setEmailStatus({ checking: false, available: null, message: '' });
      return () => { isSubscribed = false; };
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
      navigate('/products');
    } catch (error) {
      setStatus({
        type: 'error',
        message: typeof error.message === 'string'
          ? error.message
          : (error.message?.error || error.message?.message || JSON.stringify(error.message))
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -z-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-2xl shadow-indigo-100/50 bg-white/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
            <CardDescription className="text-gray-500">
              Join ProLab to access exclusive equipment deals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {status.message && (
              <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${status.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                <AlertCircle className="w-4 h-4" />
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                {emailStatus.message && (
                  <div className={`text-xs flex items-center gap-1 ${emailStatus.available ? 'text-green-600' : 'text-red-600'}`}>
                    {emailStatus.available ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {emailStatus.checking ? 'Checking availability...' : emailStatus.message}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
                {passwordStrength.text && (
                  <div className={`text-xs font-medium ${passwordStrength.color}`}>
                    Strength: {passwordStrength.text}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gray-900 hover:bg-indigo-600 text-white rounded-lg transition-colors mt-2"
                disabled={isSubmitting || emailStatus.available === false}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
                {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>

            <div className="text-center text-xs text-gray-500 px-4">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </div>

            <div className="text-center text-sm text-gray-500 border-t pt-4">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
