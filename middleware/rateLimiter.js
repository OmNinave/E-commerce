/**
 * Rate Limiting Middleware
 * Prevents brute-force attacks on authentication endpoints.
 * 
 * Limits per IP:
 * - /api/auth/register: 5 requests per 15 minutes
 * - /api/auth/login: 10 requests per 15 minutes
 * - /api/admin/login: 5 requests per 15 minutes
 */

const rateLimit = {
  // Store: { ip: { endpoint: { count, resetTime } } }
  requests: {},
  
  // Configuration per endpoint
  limits: {
    '/api/auth/register': { maxRequests: 5, windowMs: 15 * 60 * 1000 },
    '/api/auth/login': { maxRequests: 10, windowMs: 15 * 60 * 1000 },
    '/api/admin/login': { maxRequests: 5, windowMs: 15 * 60 * 1000 }
  },

  /**
   * Middleware function for Express
   * Usage: app.use(rateLimitMiddleware.middleware());
   */
  middleware: function() {
    const self = this;
    return (req, res, next) => {
      const endpoint = req.path;
      const ip = req.ip || req.connection.remoteAddress || 'unknown';

      // Only rate-limit configured endpoints
      if (!this.limits[endpoint]) {
        return next();
      }

      const config = this.limits[endpoint];
      const now = Date.now();

      // Initialize IP record if not exists
      if (!self.requests[ip]) {
        self.requests[ip] = {};
      }

      // Initialize endpoint record if not exists
      if (!self.requests[ip][endpoint]) {
        self.requests[ip][endpoint] = { count: 0, resetTime: now + config.windowMs };
      }

      const record = self.requests[ip][endpoint];

      // Reset if window expired
      if (now > record.resetTime) {
        record.count = 0;
        record.resetTime = now + config.windowMs;
      }

      // Increment request count
      record.count++;

      // Add rate-limit headers
      const remaining = Math.max(0, config.maxRequests - record.count);
      const resetTime = Math.ceil(record.resetTime / 1000);
      
      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetTime);

      // Check if limit exceeded
      if (record.count > config.maxRequests) {
        return res.status(429).json({
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((record.resetTime - now) / 1000)
        });
      }

      // Log rate-limit near threshold
      if (record.count >= config.maxRequests - 1) {
        console.warn(`⚠️ Rate limit near threshold for ${ip} on ${endpoint} (${record.count}/${config.maxRequests})`);
      }

      next();
    };
  },

  /**
   * Cleanup old entries (run periodically to prevent memory leak)
   */
  cleanup: function() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    for (const ip in this.requests) {
      let hasActiveRecord = false;

      for (const endpoint in this.requests[ip]) {
        const record = this.requests[ip][endpoint];
        // Remove old records
        if (record.resetTime < oneHourAgo) {
          delete this.requests[ip][endpoint];
        } else {
          hasActiveRecord = true;
        }
      }

      // Remove IP if no active records
      if (!hasActiveRecord) {
        delete this.requests[ip];
      }
    }
  }
};

/**
 * Initialize rate limiting cleanup (run every 30 minutes)
 */
function initializeRateLimitCleanup() {
  setInterval(() => {
    rateLimit.cleanup();
    console.log('🧹 Rate limit cache cleaned');
  }, 30 * 60 * 1000);
}

module.exports = {
  rateLimit,
  initializeRateLimitCleanup
};
