// services/apiService.js — thin wrapper around central api instance
import { api, handleApiError } from '../src/lib/api';
import { authService } from './authServices';

class ApiService {
  constructor() {
    // Use shared axios instance from src/lib/api.js
    this.api = api;

    // Handle token expiry / unauthorized globally
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try { authService.logout(); } catch (e) { /* ignore */ }
          // Attempt client-side redirect if running in browser
          if (typeof window !== 'undefined') window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
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
    return handleApiError(error);
  }
}

export const apiService = new ApiService();
export default apiService;