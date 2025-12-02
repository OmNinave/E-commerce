import React from 'react';

const Alert = ({ children, className = '', variant = 'default', ...props }) => {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        destructive: 'bg-red-100 text-red-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
    };

    return (
        <div
            role="alert"
            className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

const AlertDescription = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`text-sm [&_p]:leading-relaxed ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export { Alert, AlertDescription };
