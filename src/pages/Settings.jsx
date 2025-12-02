import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Bell,
    Shield,
    CreditCard,
    HelpCircle,
    LogOut,
    Globe,
    Moon,
    Sun,
    DollarSign,
    Trash2,
    Lock,
    Palette,
    Languages,
    MapPin
} from 'lucide-react';
import EditProfile from './EditProfile';
import ManageAddresses from './ManageAddresses';
import PageLayout from '../components/PageLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Select, SelectItem } from '../components/ui/select';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('account');
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const tabs = [
        { id: 'account', label: 'Account', icon: User },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'region', label: 'Region & Language', icon: Globe },
        { id: 'addresses', label: 'Address Management', icon: MapPin },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <PageLayout
            title="Settings"
            subtitle="Manage your account preferences and settings"
        >
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <Card className="border-none shadow-lg shadow-indigo-100/50 overflow-hidden sticky top-24">
                        <div className="p-2 space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        {tab.label}
                                    </button>
                                );
                            })}

                            <div className="h-px bg-gray-100 my-2 mx-4"></div>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* ACCOUNT TAB */}
                            {activeTab === 'account' && (
                                <div className="space-y-6">
                                    <EditProfile standalone={false} />

                                    <Card className="p-6 border-none shadow-lg shadow-indigo-100/50">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                            <Trash2 className="w-5 h-5 text-red-500" />
                                            Delete Account
                                        </h3>
                                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                                            <p className="text-sm text-red-800 font-medium">Warning: This action is irreversible</p>
                                            <p className="text-sm text-red-600 mt-1">
                                                Deleting your account will permanently remove all your data, order history, and saved preferences.
                                            </p>
                                        </div>
                                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                                            Delete My Account
                                        </Button>
                                    </Card>
                                </div>
                            )}

                            {/* APPEARANCE TAB */}
                            {activeTab === 'appearance' && (
                                <div className="space-y-6">
                                    <Card className="p-6 border-none shadow-lg shadow-indigo-100/50">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                            <Palette className="w-5 h-5 text-indigo-600" />
                                            Appearance
                                        </h3>
                                        <div className="flex items-center justify-between py-4 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <Moon className="w-5 h-5 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Dark Mode</p>
                                                    <p className="text-sm text-gray-500">Switch between light and dark themes</p>
                                                </div>
                                            </div>
                                            <Switch />
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {/* REGION & LANGUAGE TAB */}
                            {activeTab === 'region' && (
                                <div className="space-y-6">
                                    <Card className="p-6 border-none shadow-lg shadow-indigo-100/50">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                            <Globe className="w-5 h-5 text-indigo-600" />
                                            Region & Language
                                        </h3>

                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700">Language</label>
                                                    <Select defaultValue="en">
                                                        <SelectItem value="en">English (US)</SelectItem>
                                                        <SelectItem value="es">Español</SelectItem>
                                                        <SelectItem value="fr">Français</SelectItem>
                                                        <SelectItem value="de">Deutsch</SelectItem>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700">Region</label>
                                                    <Select defaultValue="us">
                                                        <SelectItem value="us">United States</SelectItem>
                                                        <SelectItem value="uk">United Kingdom</SelectItem>
                                                        <SelectItem value="eu">European Union</SelectItem>
                                                        <SelectItem value="in">India</SelectItem>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between py-4 border-t border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                        <DollarSign className="w-5 h-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Currency</p>
                                                        <p className="text-sm text-gray-500">Select your preferred currency</p>
                                                    </div>
                                                </div>
                                                <Select defaultValue="usd" className="w-32">
                                                    <SelectItem value="usd">USD ($)</SelectItem>
                                                    <SelectItem value="eur">EUR (€)</SelectItem>
                                                    <SelectItem value="gbp">GBP (£)</SelectItem>
                                                    <SelectItem value="inr">INR (₹)</SelectItem>
                                                </Select>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {/* ADDRESS MANAGEMENT TAB */}
                            {activeTab === 'addresses' && (
                                <div className="space-y-6">
                                    <ManageAddresses standalone={false} />
                                </div>
                            )}

                            {/* SECURITY TAB */}
                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <Card className="p-6 border-none shadow-lg shadow-indigo-100/50">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                            <Lock className="w-5 h-5 text-indigo-600" />
                                            Password & Authentication
                                        </h3>
                                        <div className="space-y-4">
                                            <Button variant="outline" className="w-full justify-between">
                                                Change Password
                                                <span className="text-xs text-gray-500">Last changed 3 months ago</span>
                                            </Button>
                                            <Button variant="outline" className="w-full justify-between">
                                                Two-Factor Authentication
                                                <span className="text-xs text-green-600 font-medium">Enabled</span>
                                            </Button>
                                        </div>
                                    </Card>

                                    <Card className="p-6 border-none shadow-lg shadow-indigo-100/50">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Login History</h3>
                                        <div className="space-y-4">
                                            {[
                                                { device: 'Chrome on Windows', location: 'New York, USA', time: 'Just now', active: true },
                                                { device: 'Safari on iPhone', location: 'New York, USA', time: '2 hours ago', active: false },
                                            ].map((session, i) => (
                                                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                            <Shield className="w-4 h-4 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{session.device}</p>
                                                            <p className="text-xs text-gray-500">{session.location} • {session.time}</p>
                                                        </div>
                                                    </div>
                                                    {session.active && (
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Active</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </PageLayout>
    );
};

export default Settings;
