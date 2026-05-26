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
      const payload = {
        items: (orderData.items || []).map(i => ({
          product_id: i.product_id || i._id || i.id,
          id: i.id || i.product_id || i._id,
          name: i.name || i.title || i.product_name || '',
          quantity: Number(i.quantity || i.qty || 1),
          qty: Number(i.quantity || i.qty || 1),
          price: Number(i.price || 0),
        })),
        email: orderData.customer?.email || orderData.email || '',
        customer: orderData.customer || null,
        shipping_address: orderData.shippingAddress || orderData.shipping_address || '',
        total: Number(orderData.total ?? orderData.total_amount ?? 0),
        total_amount: Number(orderData.total_amount ?? orderData.total ?? 0),
        subtotal: Number(orderData.subtotal || 0),
        tax: Number(orderData.tax || 0),
        idempotency_key: orderData.idempotency_key,
      }
      const response = await api.post('/checkout', payload);
      const data = response.data;
      return {
        ...data,
        data: {
          ...(data?.data || {}),
          order: data?.data?.order || (data?.order_id ? { id: data.order_id } : null),
          paystack: data?.data?.paystack || {
            authorization_url: data?.paystack_auth_url,
            reference: data?.paystack_reference,
          },
        },
      };
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
