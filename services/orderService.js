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
      // The backend expects a payload like: { items: [...], email: 'user@example.com', shipping_address: '...' }
      // Translate the frontend orderData shape into the backend shape.
      const payload = {
        items: (orderData.items || []).map(i => ({
          id: i.id,
          qty: Number(i.quantity || i.qty || 1),
          price: Number(i.price || 0),
        })),
        email: orderData.customer?.email || orderData.email || '',
        shipping_address: orderData.shippingAddress || orderData.shipping_address || '',
      }
      const response = await api.post('/checkout', payload);
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
  const url = '/me/orders';
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
