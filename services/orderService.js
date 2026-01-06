// services/orderService.js — use central API client
import { api, handleApiError } from '../src/lib/api';

class OrderService {
  async getOrders(limit = 10, skip = 0) {
    try {
      const response = await api.get(`/orders?limit=${limit}&skip=${skip}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getOrder(id) {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async addOrder(orderData) {
    try {
  // Send order to backend checkout/init endpoint — backend will persist and (optionally) initialize payment
  // Use the App Route path (/api/checkout) on the Next backend so requests target the API route
  const response = await api.post('/api/checkout', orderData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      const response = await api.patch(`/orders/${orderId}`, { status });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getUserOrders(userId, token = null) {
    try {
      // Prefer authenticated endpoint that returns orders for the current
      // session: `/api/me/orders`. If a token is provided we'll include it
      // in the Authorization header for the request. Keep backward
      // compatibility by accepting userId but prefer the authenticated
      // endpoint.
      const url = '/api/me/orders';
      const config = {};
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const orderService = new OrderService();
export default orderService;
