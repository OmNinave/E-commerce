import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea'; // Assuming you have this or use standard textarea
import { Card, CardContent } from '../components/ui/card';
import PageLayout from '../components/PageLayout';
import '../styles/Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <PageLayout
            title="Get in Touch"
            subtitle="We'd love to hear from you. Our team is always here to chat."
        >
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

                {/* Left: Contact Info */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                >
                    <div className="prose prose-lg text-gray-500">
                        <p className="text-lg leading-relaxed">
                            Have a question about our products, support, or just want to say hello?
                            Fill out the form and we'll be in touch as soon as possible.
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white group">
                            <CardContent className="p-6 flex items-start gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
                                    <p className="text-gray-500 text-sm mb-1">Our friendly team is here to help.</p>
                                    <p className="text-indigo-600 font-medium">support@prolab.com</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white group">
                            <CardContent className="p-6 flex items-start gap-4">
                                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Visit Us</h3>
                                    <p className="text-gray-500 text-sm mb-1">Come say hello at our office HQ.</p>
                                    <p className="text-purple-600 font-medium">123 Innovation Dr, Tech Valley, CA</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white group">
                            <CardContent className="p-6 flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
                                    <p className="text-gray-500 text-sm mb-1">Mon-Fri from 8am to 5pm.</p>
                                    <p className="text-blue-600 font-medium">+1 (555) 000-0000</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* Right: Contact Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-none shadow-2xl shadow-indigo-100/50 bg-white/80 backdrop-blur-xl overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                        <CardContent className="p-8">
                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Send className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
                                    <p className="text-gray-500 mb-8">Thank you for reaching out. We'll get back to you shortly.</p>
                                    <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-full">
                                        Send Another Message
                                    </Button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                placeholder="John Doe"
                                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="john@example.com"
                                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            placeholder="How can we help?"
                                            className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="5"
                                            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:bg-white transition-colors resize-none"
                                            placeholder="Tell us more about your inquiry..."
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-gray-900 hover:bg-indigo-600 text-white text-lg rounded-lg shadow-lg shadow-indigo-200/50 hover-lift transition-all"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send Message'}
                                        {!isSubmitting && <Send className="w-4 h-4 ml-2" />}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </PageLayout>
    );
};

export default Contact;
