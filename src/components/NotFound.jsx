import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
            <div className="text-center max-w-lg">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative inline-block mb-8"
                >
                    <h1 className="text-[150px] font-bold text-gray-200 leading-none select-none">404</h1>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <AlertTriangle className="w-24 h-24 text-indigo-500 opacity-80" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
                    <p className="text-gray-500 mb-8 text-lg">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/">
                            <Button size="lg" className="w-full sm:w-auto rounded-full bg-gray-900 hover:bg-indigo-600 gap-2">
                                <Home className="w-4 h-4" /> Return Home
                            </Button>
                        </Link>
                        <Link to="/products">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full gap-2">
                                <Search className="w-4 h-4" /> Browse Products
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default NotFound;
