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
china
  async addOrder(orderData) {
    try {
      // Forward full order data to backend so the server has the calculated totals
      // and can create the Paystack payment with the correct amount (amountKobo)
      const payload = {
        customer: orderData.customer || {},
        items: (orderData.items || []).map(i => ({
          product_id: i.product_id || i.id,
          name: i.name || i.title || i.product_name || '',
          quantity: Number(i.quantity || i.qty || 1),
          price: Number(i.price || 0),
        })),
        subtotal: orderData.subtotal ?? null,
        tax: orderData.tax ?? null,
        total: orderData.total ?? null,
        amountKobo: orderData.amountKobo ?? (orderData.total ? Math.round(Number(orderData.total) * 100) : null),
        shippingAddress: orderData.shippingAddress || orderData.shipping_address || '',
        status: orderData.status || 'pending',
      };
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
