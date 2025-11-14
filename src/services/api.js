// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiService {
  constructor(baseURL = API_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      console.log(`📡 API Response: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        const errorMessage = error.error || `HTTP error! status: ${response.status}`;
        console.error(`❌ API Error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`✅ API Success: Received data`, { 
        hasProducts: !!data.products, 
        productsCount: data.products?.length || 0,
        total: data.total || 0
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
  async getProducts() {
    try {
      const data = await this.request('/api/products');
      // Handle both response formats: { products: [...] } or { success: true, products: [...] }
      if (data.products && Array.isArray(data.products)) {
        return data.products;
      }
      // Fallback: if data itself is an array
      if (Array.isArray(data)) {
        return data;
      }
      console.warn('Unexpected API response format:', data);
      return [];
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }

  async getProduct(id) {
    const data = await this.request(`/api/products/${id}`);
    return data.product;
  }

  // Authentication endpoints
  async registerUser(userData) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    return data.user;
  }

  async loginUser(credentials) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    return data.user;
  }

  // Order endpoints
  async createOrder(orderData) {
    const data = await this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    return data.order;
  }
}

export default new ApiService();

