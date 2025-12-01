// Import CSRF manager
import csrfManager from '../utils/csrf';

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiService {
  constructor(baseURL = API_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Get token from localStorage (check both user and admin tokens)
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    // Add CSRF token for state-changing requests
    const method = options.method || 'GET';
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
      try {
        const csrfToken = await csrfManager.getToken();
        headers['CSRF-Token'] = csrfToken;
      } catch (csrfError) {
        console.warn('Failed to get CSRF token:', csrfError);
        // Continue anyway - the server will reject if CSRF is required
      }
    }

    const config = {
      ...options,
      headers,
      credentials: 'include', // Important: include cookies for CSRF
    };

    try {
      console.log(`🌐 API Request: ${method} ${url}`);
      const response = await fetch(url, config);

      console.log(`📡 API Response: ${response.status} ${response.statusText}`);

      // Handle CSRF token errors
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error && errorData.error.toLowerCase().includes('csrf')) {
          console.warn('CSRF token invalid, refreshing...');
          // Refresh CSRF token and retry once
          await csrfManager.refreshToken();
          // Retry the request with new token
          return this.request(endpoint, options);
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        const errorMessage = error.error || `HTTP error! status: ${response.status}`;
        console.error(`❌ API Error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`✅ API Success: Received data`, {
        keys: Object.keys(data),
        isArray: Array.isArray(data),
        count: Array.isArray(data) ? data.length : (data.products?.length || data.count || 1)
      });
      return data;
    } catch (error) {
      // Check if it's a network error (backend not running)
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.error('🔴 Network Error: Backend server may not be running');
        console.error('💡 Start backend with: cd db && node admin_server.js');
        throw new Error('Cannot connect to server. Please ensure the backend is running on port 5000.');
      }
      console.error('❌ API request failed:', error);
      throw error;
    }
  }

  // Public endpoints
  async getProducts(page = 1, limit = 12, filters = {}) {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add pagination
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());

      // Add filters if provided
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      if (filters.category && filters.category !== 'All') {
        queryParams.append('category', filters.category);
      }
      if (filters.sort) {
        queryParams.append('sort', filters.sort);
      }
      if (filters.min_price) {
        queryParams.append('min_price', filters.min_price);
      }
      if (filters.max_price) {
        queryParams.append('max_price', filters.max_price);
      }

      const data = await this.request(`/api/products?${queryParams.toString()}`);

      // Return an array for components that expect lists
      if (Array.isArray(data)) {
        return data;
      }

      return data?.products || [];
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }

  async getFeaturedProducts(limit = 4) {
    const query = new URLSearchParams({ limit: String(limit), sort: 'featured' });
    const data = await this.request(`/api/products?${query.toString()}`);
    return data?.products || [];
  }

  async getProduct(id) {
    const data = await this.request(`/api/products/${id}`);
    return data.product;
  }

  async getProductReviews(productId) {
    const data = await this.request(`/api/products/${productId}/reviews`);
    return data.reviews || [];
  }

  async addProductReview(productId, rating, comment) {
    const data = await this.request(`/api/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment })
    });
    return data.review;
  }

  async getCategories() {
    const data = await this.request('/api/categories');
    return data.categories || [];
  }

  // Authentication endpoints
  async registerUser(userData) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    // Store token if provided
    if (data.token) {
      this.setToken(data.token);
    }
    return data.user;
  }

  async loginUser(credentials) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    // Store token if provided
    if (data.token) {
      this.setToken(data.token);
    }
    return data.user;
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  async deleteAccount(password) {
    return this.request('/api/auth/delete-account', {
      method: 'DELETE',
      body: JSON.stringify({ password })
    });
  }

  // Order endpoints
  async createOrder(orderData) {
    const data = await this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    return data;
  }

  async validateCart(items, shippingMethod = 'standard') {
    return this.request('/api/cart/validate', {
      method: 'POST',
      body: JSON.stringify({ items, shippingMethod })
    });
  }

  async getOrders() {
    const data = await this.request('/api/orders');
    return data.orders || [];
  }

  // Wishlist endpoints
  async getWishlist(userId) {
    const data = await this.request(`/api/users/${userId}/wishlist`);
    return data.wishlist || [];
  }

  async addToWishlist(userId, productId) {
    const data = await this.request(`/api/users/${userId}/wishlist`, {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
    return data;
  }

  async removeFromWishlist(userId, productId) {
    await this.request(`/api/users/${userId}/wishlist/${productId}`, {
      method: 'DELETE'
    });
  }

  async checkEmailAvailability(email) {
    if (!email) {
      return { available: false };
    }
    return this.request(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
  }

  // Admin endpoints
  async getAdminProducts(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.category) queryParams.append('category', filters.category);

    // Admin sees all products, potentially with different query params if needed
    // For now, reuse the public endpoint but with admin token it might return more data if backend is configured
    const data = await this.request(`/api/products?${queryParams.toString()}`);
    return data.products || [];
  }

  async createProduct(productData) {
    const data = await this.request('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
    return data.product;
  }

  async updateProduct(id, productData) {
    const data = await this.request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
    return data.product;
  }

  async deleteProduct(id) {
    await this.request(`/api/products/${id}`, {
      method: 'DELETE'
    });
  }

  async getUsers() {
    const data = await this.request('/api/users');
    return data.users || [];
  }

  async deleteUser(id) {
    await this.request(`/api/users/${id}`, {
      method: 'DELETE'
    });
  }

  // Payment endpoints
  async createPaymentOrder(amount) {
    const data = await this.request('/api/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount })
    });
    return data;
  }

  async verifyPayment(paymentData) {
    const data = await this.request('/api/payment/verify-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
    return data;
  }

  // Token management
  setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
    }
  }
}

export default new ApiService();

