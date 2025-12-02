import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    CheckCircle,
    AlertCircle,
    MessageSquare,
    Headphones,
    FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import PageLayout from '../components/PageLayout';

export default function ContactSales() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'

    const contactInfo = [
        {
            icon: Mail,
            title: 'Email Us',
            value: 'sales@prolab.com',
            description: 'Get a response within 24 hours',
            color: 'indigo'
        },
        {
            icon: Phone,
            title: 'Call Us',
            value: '+1 (555) 123-4567',
            description: 'Mon-Fri, 9 AM - 6 PM EST',
            color: 'green'
        },
        {
            icon: MapPin,
            title: 'Visit Us',
            value: '123 Science Park, Tech City',
            description: 'Schedule an appointment',
            color: 'orange'
        }
    ];

    const quickInquiries = [
        {
            icon: MessageSquare,
            title: 'Product Inquiry',
            description: 'Questions about specific equipment',
            action: () => navigate('/products')
        },
        {
            icon: FileText,
            title: 'Request Quote',
            description: 'Get pricing for bulk orders',
            action: () => setFormData(prev => ({ ...prev, subject: 'Quote Request' }))
        },
        {
            icon: Headphones,
            title: 'Technical Support',
            description: 'Help with existing equipment',
            action: () => setFormData(prev => ({ ...prev, subject: 'Technical Support' }))
        }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In production, send to backend:
            // const response = await fetch('/api/contact-sales', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(formData)
            // });

            setSubmitStatus('success');
            setFormData({
                name: '',
                email: '',
                phone: '',
                company: '',
                subject: '',
                message: ''
            });

            // Auto-hide success message after 5 seconds
            setTimeout(() => setSubmitStatus(null), 5000);
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const colorClasses = {
        indigo: 'bg-indigo-50 text-indigo-600',
        green: 'bg-green-50 text-green-600',
        orange: 'bg-orange-50 text-orange-600'
    };

    return (
        <PageLayout
            title="Contact Sales"
            subtitle="Let's discuss how ProLab can support your laboratory needs"
        >
            <div className="max-w-7xl mx-auto">

                {/* Quick Inquiry Cards */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {quickInquiries.map((inquiry, index) => {
                        const Icon = inquiry.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card
                                    className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
                                    onClick={inquiry.action}
                                >
                                    <CardContent className="p-6 text-center">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                                            <Icon className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-2">{inquiry.title}</h3>
                                        <p className="text-sm text-gray-600">{inquiry.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="border-none shadow-xl">
                            <CardContent className="p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>

                                {submitStatus === 'success' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3"
                                    >
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-green-900">Message Sent Successfully!</p>
                                            <p className="text-sm text-green-700">Our sales team will contact you within 24 hours.</p>
                                        </div>
                                    </motion.div>
                                )}

                                {submitStatus === 'error' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                                    >
                                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-red-900">Submission Failed</p>
                                            <p className="text-sm text-red-700">Please try again or contact us directly.</p>
                                        </div>
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="John Doe"
                                                className={errors.name ? 'border-red-300' : ''}
                                            />
                                            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address *</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="john@company.com"
                                                className={errors.email ? 'border-red-300' : ''}
                                            />
                                            {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number *</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="+1 (555) 123-4567"
                                                className={errors.phone ? 'border-red-300' : ''}
                                            />
                                            {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="company">Company Name</Label>
                                            <Input
                                                id="company"
                                                name="company"
                                                value={formData.company}
                                                onChange={handleInputChange}
                                                placeholder="Your Organization"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            placeholder="How can we help you?"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message *</Label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            rows={6}
                                            placeholder="Tell us about your requirements..."
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.message ? 'border-red-300' : 'border-gray-300'}`}
                                        />
                                        {errors.message && <p className="text-xs text-red-600">{errors.message}</p>}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gray-900 hover:bg-indigo-600 text-white h-12 rounded-xl"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Send className="w-4 h-4" />
                                                Send Message
                                            </span>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-6">
                        {/* Contact Cards */}
                        {contactInfo.map((info, index) => {
                            const Icon = info.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="border-none shadow-lg">
                                        <CardContent className="p-6">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClasses[info.color]}`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-bold text-gray-900 mb-1">{info.title}</h3>
                                            <p className="text-gray-900 font-medium mb-1">{info.value}</p>
                                            <p className="text-sm text-gray-600">{info.description}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}

                        {/* Business Hours */}
                        <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-50 to-violet-50">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Clock className="w-6 h-6 text-indigo-600" />
                                    <h3 className="font-bold text-gray-900">Business Hours</h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Monday - Friday</span>
                                        <span className="font-medium text-gray-900">9:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Saturday</span>
                                        <span className="font-medium text-gray-900">10:00 AM - 4:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Sunday</span>
                                        <span className="font-medium text-gray-900">Closed</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </PageLayout>
    );
}
