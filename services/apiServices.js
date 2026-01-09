import { api, handleApiError } from '../src/lib/api';
import { authService } from './authServices';

class ApiService {
  constructor() {
    this.api = api;

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try { authService.logout(); } catch (e) {  }
          if (typeof window !== 'undefined') window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

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

  handleError(error) {
    return handleApiError(error);
  }
}

export const apiService = new ApiService();
export default apiService;