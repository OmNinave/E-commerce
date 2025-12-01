import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import apiService from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            await apiService.forgotPassword(email);
            setStatus('success');
            setMessage('If an account exists with this email, you will receive a password reset link shortly.');
        } catch (error) {
            setStatus('error');
            setMessage(error.message || 'Failed to send reset link. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -z-10"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card className="border-none shadow-2xl shadow-indigo-100/50 bg-white/80 backdrop-blur-xl">
                    <CardHeader className="space-y-1 text-center pb-6">
                        <CardTitle className="text-2xl font-bold text-gray-900">Reset Password</CardTitle>
                        <CardDescription className="text-gray-500">
                            Enter your email to receive a reset link
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {status === 'success' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-4"
                            >
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg text-sm text-green-700">
                                    {message}
                                </div>
                                <p className="text-xs text-gray-400">
                                    Note: Check your spam folder if you don't see it.
                                </p>
                                <Link to="/login">
                                    <Button className="w-full bg-gray-900 hover:bg-indigo-600 text-white mt-4">
                                        Back to Login
                                    </Button>
                                </Link>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {status === 'error' && (
                                    <div className="p-3 rounded-lg flex items-center gap-2 text-sm bg-red-50 text-red-600">
                                        <AlertCircle className="w-4 h-4" />
                                        {message}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="name@example.com"
                                            className="pl-10"
                                            disabled={status === 'loading'}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-gray-900 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                                    {!status === 'loading' && <ArrowRight className="w-4 h-4 ml-2" />}
                                </Button>

                                <div className="text-center">
                                    <Link to="/login" className="text-sm text-gray-500 hover:text-indigo-600 flex items-center justify-center gap-1 transition-colors">
                                        <ArrowLeft className="w-3 h-3" /> Back to Login
                                    </Link>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
