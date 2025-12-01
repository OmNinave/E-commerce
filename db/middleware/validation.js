/**
 * Input Validation Middleware
 * Provides validation and sanitization rules for API endpoints
 */

const { body, validationResult } = require('express-validator');
const validator = require('validator');

/**
 * Middleware to check validation results and return errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map(err => ({
                field: err.path || err.param,
                message: err.msg
            }))
        });
    }
    next();
};

/**
 * Sanitize string input - remove HTML tags and trim
 */
const sanitizeString = (value) => {
    if (typeof value !== 'string') return value;
    // Remove HTML tags
    let sanitized = validator.stripLow(value);
    sanitized = validator.escape(sanitized);
    return validator.trim(sanitized);
};

/**
 * Validation Rules for User Registration
 */
const validateRegistration = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email must be less than 255 characters'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .isLength({ max: 128 })
        .withMessage('Password must be less than 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter or number'),

    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters')
        .customSanitizer(sanitizeString),

    body('lastName')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Last name must be less than 50 characters')
        .customSanitizer(sanitizeString),

    body('phone')
        .optional()
        .trim()
        .matches(/^[0-9+\-\s()]*$/)
        .withMessage('Phone number contains invalid characters')
        .isLength({ max: 20 })
        .withMessage('Phone number must be less than 20 characters'),

    handleValidationErrors
];

/**
 * Validation Rules for User Login
 */
const validateLogin = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ max: 128 })
        .withMessage('Invalid password format'),

    handleValidationErrors
];

/**
 * Validation Rules for Product Creation/Update
 */
const validateProduct = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Product name is required')
        .isLength({ min: 3, max: 200 })
        .withMessage('Product name must be between 3 and 200 characters')
        .customSanitizer(sanitizeString),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Description must be less than 5000 characters')
        .customSanitizer(sanitizeString),

    body('price')
        .isFloat({ min: 0, max: 1000000 })
        .withMessage('Price must be a positive number less than 1,000,000')
        .toFloat(),

    body('category')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Category must be less than 100 characters')
        .customSanitizer(sanitizeString),

    body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Stock must be a non-negative integer')
        .toInt(),

    body('sku')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('SKU must be less than 50 characters')
        .matches(/^[A-Za-z0-9\-_]*$/)
        .withMessage('SKU can only contain letters, numbers, hyphens, and underscores'),

    handleValidationErrors
];

/**
 * Validation Rules for Order Creation
 */
const validateOrder = [
    body('items')
        .isArray({ min: 1 })
        .withMessage('Order must contain at least one item'),

    body('items.*.productId')
        .isInt({ min: 1 })
        .withMessage('Valid product ID is required')
        .toInt(),

    body('items.*.quantity')
        .isInt({ min: 1, max: 1000 })
        .withMessage('Quantity must be between 1 and 1000')
        .toInt(),

    body('items.*.price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number')
        .toFloat(),

    body('shippingAddress')
        .optional()
        .isObject()
        .withMessage('Shipping address must be an object'),

    body('shippingAddress.street')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Street address must be less than 200 characters')
        .customSanitizer(sanitizeString),

    body('shippingAddress.city')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('City must be less than 100 characters')
        .customSanitizer(sanitizeString),

    body('shippingAddress.state')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('State must be less than 100 characters')
        .customSanitizer(sanitizeString),

    body('shippingAddress.zipCode')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Zip code must be less than 20 characters')
        .matches(/^[A-Za-z0-9\s\-]*$/)
        .withMessage('Zip code contains invalid characters'),

    body('paymentMethod')
        .optional()
        .trim()
        .isIn(['credit_card', 'debit_card', 'paypal', 'cod', 'razorpay'])
        .withMessage('Invalid payment method'),

    body('totalAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Total amount must be a positive number')
        .toFloat(),

    handleValidationErrors
];

/**
 * Validation Rules for Cart Validation
 */
const validateCart = [
    body('items')
        .isArray({ min: 1 })
        .withMessage('Cart must contain at least one item'),

    body('items.*.productId')
        .isInt({ min: 1 })
        .withMessage('Valid product ID is required')
        .toInt(),

    body('items.*.quantity')
        .isInt({ min: 1, max: 1000 })
        .withMessage('Quantity must be between 1 and 1000')
        .toInt(),

    body('shippingMethod')
        .optional()
        .trim()
        .isIn(['standard', 'express', 'overnight'])
        .withMessage('Invalid shipping method'),

    handleValidationErrors
];

/**
 * Validation Rules for Profile Update
 */
const validateProfileUpdate = [
    body('fullName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Full name must be between 1 and 100 characters')
        .customSanitizer(sanitizeString),

    body('phone')
        .optional()
        .trim()
        .matches(/^[0-9+\-\s()]*$/)
        .withMessage('Phone number contains invalid characters')
        .isLength({ max: 20 })
        .withMessage('Phone number must be less than 20 characters'),

    body('company')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Company name must be less than 100 characters')
        .customSanitizer(sanitizeString),

    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio must be less than 500 characters')
        .customSanitizer(sanitizeString),

    handleValidationErrors
];

/**
 * Validation Rules for Password Change
 */
const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),

    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
        .isLength({ max: 128 })
        .withMessage('New password must be less than 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter or number'),

    handleValidationErrors
];

/**
 * Validation Rules for Review Creation
 */
const validateReview = [
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5')
        .toInt(),

    body('comment')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Comment must be less than 1000 characters')
        .customSanitizer(sanitizeString),

    handleValidationErrors
];

module.exports = {
    validateRegistration,
    validateLogin,
    validateProduct,
    validateOrder,
    validateCart,
    validateProfileUpdate,
    validatePasswordChange,
    validateReview,
    handleValidationErrors,
    sanitizeString
};
