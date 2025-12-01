import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const Sheet = ({ children, open, onOpenChange }) => {
    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                    />
                    {/* Content */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 z-50 h-full w-3/4 gap-4 border-l bg-white p-6 shadow-lg transition ease-in-out sm:max-w-sm"
                    >
                        {children}
                        <button
                            onClick={() => onOpenChange(false)}
                            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const SheetTrigger = ({ children, onClick }) => {
    return <div onClick={onClick}>{children}</div>;
};

const SheetContent = ({ children, className }) => {
    return <div className={cn("flex flex-col space-y-2", className)}>{children}</div>;
};

const SheetHeader = ({ children, className }) => {
    return (
        <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}>
            {children}
        </div>
    );
};

const SheetTitle = ({ children, className }) => {
    return (
        <h3 className={cn("text-lg font-semibold text-slate-950", className)}>
            {children}
        </h3>
    );
};

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle };
