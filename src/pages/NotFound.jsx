import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
            </div>

            <div className="text-center relative z-10 max-w-lg mx-auto">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                >
                    <h1 className="text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 leading-none select-none">
                        404
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
                    <p className="text-gray-500 text-lg mb-8">
                        Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/">
                            <Button className="h-12 px-8 bg-gray-900 hover:bg-indigo-600 text-white rounded-full hover-lift shadow-lg shadow-indigo-200/50">
                                <Home className="w-4 h-4 mr-2" /> Back to Home
                            </Button>
                        </Link>
                        <button onClick={() => window.history.back()}>
                            <Button variant="outline" className="h-12 px-8 rounded-full border-gray-300 hover:bg-gray-100">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                            </Button>
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default NotFound;
