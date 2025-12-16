// services/productService.js
import { apiService } from './apiServices';

class ProductService {
  async getProducts(limit = 10, skip = 0, search = '') {
    try {
      const url = search 
        ? `/products/search?q=${search}&limit=${limit}&skip=${skip}`
        : `/products?limit=${limit}&skip=${skip}`;
      
      const response = await apiService.api.get(url);
      return response.data;
    } catch (error) {
      throw apiService.handleError(error);
    }
  }

  async getProduct(id) {
    try {
      const response = await apiService.api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw apiService.handleError(error);
    }
  }

  async addProduct(product) {
    try {
      const response = await apiService.api.post('/products/add', product);
      return response.data;
    } catch (error) {
      throw apiService.handleError(error);
    }
  }

  async updateProduct(id, product) {
    try {
      const response = await apiService.api.put(`/products/${id}`, product);
      return response.data;
    } catch (error) {
      throw apiService.handleError(error);
    }
  }

  async deleteProduct(id) {
    try {
      const response = await apiService.api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw apiService.handleError(error);
    }
  }
}

export const productService = new ProductService();
export default productService;
