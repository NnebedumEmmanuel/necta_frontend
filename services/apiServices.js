// services/apiService.js
import axios from 'axios';
import { authService } from './authServices';

const API_URL = 'https://dummyjson.com';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests if available
    this.api.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Handle token expiration
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          authService.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Products
  async getProducts(limit = 10, skip = 0, search = '') {
    try {
      const url = search 
        ? `/products/search?q=${search}&limit=${limit}&skip=${skip}`
        : `/products?limit=${limit}&skip=${skip}`;
      
      const response = await this.api.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProduct(id) {
    try {
      const response = await this.api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addProduct(product) {
    try {
      const response = await this.api.post('/products/add', product);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProduct(id, product) {
    try {
      const response = await this.api.put(`/products/${id}`, product);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteProduct(id) {
    try {
      const response = await this.api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Orders (using /carts as orders in DummyJSON)
  async getOrders(limit = 10, skip = 0) {
    try {
      const response = await this.api.get(`/carts?limit=${limit}&skip=${skip}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOrder(id) {
    try {
      const response = await this.api.get(`/carts/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Users
  async getUsers(limit = 10, skip = 0) {
    try {
      const response = await this.api.get(`/users?limit=${limit}&skip=${skip}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUser(id) {
    try {
      const response = await this.api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handling
  handleError(error) {
    if (error.response) {
      return new Error(error.response.data?.message || 'API request failed');
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    } else {
      return error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;