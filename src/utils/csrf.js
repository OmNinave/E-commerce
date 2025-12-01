/**
 * CSRF Token Management Utility
 * Handles fetching and storing CSRF tokens for API requests
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class CSRFManager {
    constructor() {
        this.token = null;
        this.tokenPromise = null;
    }

    /**
     * Fetch CSRF token from the server
     * @returns {Promise<string>} The CSRF token
     */
    async fetchToken() {
        try {
            const response = await fetch(`${API_URL}/api/csrf-token`, {
                method: 'GET',
                credentials: 'include', // Important: include cookies
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch CSRF token');
            }

            const data = await response.json();
            this.token = data.csrfToken;
            return this.token;
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
            throw error;
        }
    }

    /**
     * Get the current CSRF token, fetching if necessary
     * @returns {Promise<string>} The CSRF token
     */
    async getToken() {
        // If we already have a token, return it
        if (this.token) {
            return this.token;
        }

        // If a fetch is already in progress, wait for it
        if (this.tokenPromise) {
            return this.tokenPromise;
        }

        // Start a new fetch
        this.tokenPromise = this.fetchToken();
        const token = await this.tokenPromise;
        this.tokenPromise = null;
        return token;
    }

    /**
     * Refresh the CSRF token (call this if you get a 403 CSRF error)
     * @returns {Promise<string>} The new CSRF token
     */
    async refreshToken() {
        this.token = null;
        return this.fetchToken();
    }

    /**
     * Clear the stored token (call on logout)
     */
    clearToken() {
        this.token = null;
        this.tokenPromise = null;
    }
}

// Export a singleton instance
const csrfManager = new CSRFManager();

export default csrfManager;

/**
 * Helper function to add CSRF token to request headers
 * @param {Object} headers - Existing headers object
 * @returns {Promise<Object>} Headers with CSRF token added
 */
export async function addCSRFToken(headers = {}) {
    const token = await csrfManager.getToken();
    return {
        ...headers,
        'CSRF-Token': token,
    };
}

/**
 * Initialize CSRF token on app load
 * Call this in your App.js or index.js
 */
export async function initializeCSRF() {
    try {
        await csrfManager.getToken();
        console.log('✅ CSRF token initialized');
    } catch (error) {
        console.error('❌ Failed to initialize CSRF token:', error);
    }
}
