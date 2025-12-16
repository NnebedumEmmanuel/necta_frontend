// services/orderService.js
import { apiService } from './apiServices';

class OrderService {
  async getOrders(limit = 10, skip = 0) {
    try {
      const response = await apiService.api.get(`/carts?limit=${limit}&skip=${skip}`);
      return response.data;
    } catch (error) {
      throw apiService.handleError(error);
    }
  }

  async getOrder(id) {
    try {
      const response = await apiService.api.get(`/carts/${id}`);
      return response.data;
    } catch (error) {
      throw apiService.handleError(error);
    }
  }

  async addOrder(orderData) {
    try {
      // DummyJSON does not support creating orders, so we simulate it using carts
      const response = await apiService.api.post('/carts/add', {
        userId: orderData.customer.userId,
        products: orderData.items.map(item => ({ id: item.id, quantity: item.quantity }))
      });
      return response.data;
    } catch (error) {
      throw apiService.handleError(error);
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
        // DummyJSON does not support updating orders, so we simulate it by fetching a cart
        // and returning it with the new status.
        const response = await apiService.api.get(`/carts/${orderId}`);
        return { ...response.data, status };
    } catch (error) {
        throw apiService.handleError(error);
    }
  }

  async getUserOrders(userId) {
    try {
        const response = await apiService.api.get(`/users/${userId}/carts`);
        return response.data;
    } catch (error) {
        throw apiService.handleError(error);
    }
  }
}

export const orderService = new OrderService();
export default orderService;
