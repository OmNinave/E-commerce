import React from 'react';
import { Check, MapPin, CreditCard, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const CheckoutProgress = ({ currentStep }) => {
    const steps = [
        { id: 1, name: 'Address', icon: MapPin },
        { id: 2, name: 'Payment', icon: CreditCard },
        { id: 3, name: 'Review', icon: FileText },
    ];

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-center relative">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full" />

                {/* Active Progress Bar */}
                <div
                    className="absolute top-1/2 left-0 h-1 bg-indigo-600 -z-10 rounded-full transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                <div className="flex justify-between w-full max-w-3xl px-4">
                    {steps.map((step) => {
                        const isCompleted = step.id < currentStep;
                        const isCurrent = step.id === currentStep;
                        const Icon = step.icon;

                        return (
                            <div key={step.id} className="flex flex-col items-center">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: isCurrent ? 1.2 : 1,
                                        backgroundColor: isCompleted || isCurrent ? '#4F46E5' : '#FFFFFF',
                                        borderColor: isCompleted || isCurrent ? '#4F46E5' : '#E5E7EB',
                                    }}
                                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 
                    ${isCompleted || isCurrent ? 'text-white' : 'text-gray-400'}`}
                                >
                                    {isCompleted ? (
                                        <Check className="w-6 h-6" />
                                    ) : (
                                        <Icon className="w-5 h-5" />
                                    )}
                                </motion.div>
                                <div className={`mt-2 text-sm font-medium ${isCurrent ? 'text-indigo-600' : 'text-gray-500'}`}>
                                    {step.name}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CheckoutProgress;
