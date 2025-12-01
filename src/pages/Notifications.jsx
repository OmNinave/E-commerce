import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const Notifications = () => {
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Order Shipped', message: 'Your order #ORD-2025-001 has been shipped.', type: 'success', date: '2 hours ago', read: false },
        { id: 2, title: 'New Login', message: 'New login detected from Chrome on Windows.', type: 'warning', date: '1 day ago', read: false },
        { id: 3, title: 'Welcome!', message: 'Welcome to ProLab Equipment. Start shopping now!', type: 'info', date: '2 days ago', read: true },
        { id: 4, title: 'Flash Sale', message: '50% off on all laboratory glassware this weekend.', type: 'info', date: '3 days ago', read: true },
    ]);

    const markAsRead = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <PageLayout
            title="Notifications"
            subtitle="Stay updated with your latest activity"
        >
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-600">You have {notifications.filter(n => !n.read).length} unread notifications</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={notifications.every(n => n.read)}>
                            <Check className="w-4 h-4 mr-2" /> Mark all read
                        </Button>
                        <Button variant="outline" size="sm" onClick={clearAll} disabled={notifications.length === 0} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4 mr-2" /> Clear all
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <motion.div
                                    key={notification.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`relative group`}
                                >
                                    <Card className={`p-4 border-l-4 transition-all hover:shadow-md ${notification.read ? 'bg-white border-l-gray-200' : 'bg-indigo-50/30 border-l-indigo-500'}`}>
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className={`font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <span className="text-xs text-gray-400">{notification.date}</span>
                                                </div>
                                                <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                                                    {notification.message}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="p-1 hover:bg-gray-100 rounded-full text-indigo-600"
                                                        title="Mark as read"
                                                    >
                                                        <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="p-1 hover:bg-red-50 rounded-full text-red-500"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12"
                            >
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bell className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
                                <p className="text-gray-500">You're all caught up!</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </PageLayout>
    );
};

export default Notifications;
