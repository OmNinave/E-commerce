const jwt = require('jsonwebtoken');
const dbAdapter = require('../db/dbAdapter');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development_only';

// Middleware to verify user authentication
const requireUserAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, JWT_SECRET);

            // Verify user exists in DB
            const user = await dbAdapter.getUserById(decoded.userId || decoded.id);
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized: User not found' });
            }

            // Attach user to request
            req.user = user;
            req.userId = user.id;

            next();
        } catch (err) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Internal server error during authentication' });
    }
};

// Middleware to ensure user can only access their own data
const requireSameUser = (req, res, next) => {
    const requestedUserId = req.params.userId;

    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Not logged in' });
    }

    if (req.user.id !== requestedUserId) {
        return res.status(403).json({ error: 'Forbidden: You can only access your own data' });
    }

    next();
};

module.exports = {
    requireUserAuth,
    requireSameUser
};
