// services/authServices.js - Updated with better login handling
import axios from 'axios';

const API_URL = 'https://dummyjson.com';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const IS_ADMIN_KEY = 'is_admin';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // ============ USER AUTHENTICATION ============
  
  // User login with DummyJSON (username or email)
  async login(identifier, password) {
    try {
      // First try to login with identifier as username
      const response = await this.api.post('/auth/login', {
        username: identifier,
        password,
        expiresInMins: 30,
      });
      
      if (response.data.token) {
        this.setToken(response.data.token);
        this.setUser(response.data);
        this.setAdminStatus(response.data.username === 'emilys');
        return response.data;
      }
      throw new Error('No token received');
    } catch (error) {
      // If login with username fails, try to find user by email
      if (error.response?.status === 400 && identifier.includes('@')) {
        return await this.loginWithEmail(identifier, password);
      }
      throw this.handleError(error);
    }
  }

  // User login with email
  async loginWithEmail(email, password) {
    try {
      // Search for user by email
      const usersResponse = await this.api.get('/users');
      const user = usersResponse.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Login with username
      const response = await this.api.post('/auth/login', {
        username: user.username,
        password,
        expiresInMins: 30,
      });
      
      if (response.data.token) {
        this.setToken(response.data.token);
        this.setUser(response.data);
        this.setAdminStatus(user.username === 'emilys');
        return response.data;
      }
      throw new Error('No token received');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // DUMMY USER LOGIN FOR TESTING (hardcoded users)
  async dummyUserLogin(email, password) {
    // Hardcoded dummy users for testing
    const dummyUsers = [
      {
        email: 'testuser@necta.com',
        username: 'testuser',
        password: 'Test@123',
        firstName: 'Test',
        lastName: 'User',
        role: 'user'
      },
      {
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: 'John@123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user'
      },
      {
        email: 'jane.smith@example.com',
        username: 'janesmith',
        password: 'Jane@123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'user'
      }
    ];

    // Check if it's a hardcoded dummy user
    const dummyUser = dummyUsers.find(u => 
      (u.email === email || u.username === email) && 
      u.password === password
    );

    if (dummyUser) {
      const userData = {
        ...dummyUser,
        token: `dummy-token-${Date.now()}`,
        id: 1000 + dummyUsers.indexOf(dummyUser)
      };
      
      this.setToken(userData.token);
      this.setUser(userData);
      this.setAdminStatus(false);
      return userData;
    }
    
    // If not a dummy user, try DummyJSON API
    return await this.login(email, password);
  }

  // User signup (using DummyJSON /users/add endpoint)
  async signup(userData) {
    try {
      const response = await this.api.post('/users/add', {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        username: userData.username || userData.email.split('@')[0] + Date.now().toString().slice(-4),
        password: userData.password,
        phone: userData.phone || '+1234567890',
        address: {
          address: userData.address || 'Not provided',
          city: userData.city || 'Not provided',
          postalCode: userData.postalCode || '00000',
          country: userData.country || 'Not provided'
        }
      });
      
      // Auto-login after signup
      const loginResponse = await this.login(response.data.username, userData.password);
      return loginResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ ADMIN AUTHENTICATION ============
  
  // Admin login (hardcoded credentials for demo)
  async adminLogin(email, password) {
    // Demo admin credentials
    const adminCredentials = {
      email: 'admin@necta.com',
      password: 'Admin@123',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    };

    // Check admin credentials
    if ((email === adminCredentials.email || email === adminCredentials.username) && 
        password === adminCredentials.password) {
      const adminData = {
        ...adminCredentials,
        token: 'admin-demo-token-' + Date.now(),
        id: 999
      };
      
      this.setToken(adminData.token);
      this.setUser(adminData);
      this.setAdminStatus(true);
      return adminData;
    }
    
    // Also check for emilys (DummyJSON admin)
    if ((email === 'emilys' || email === 'emilys@example.com') && 
        password === 'emilyspass') {
      try {
        // Try to login with DummyJSON
        return await this.login('emilys', password);
      } catch (error) {
        // If DummyJSON fails, use hardcoded
        const emilysData = {
          email: 'emilys@example.com',
          username: 'emilys',
          firstName: 'Emily',
          lastName: 'Johnson',
          token: 'emilys-demo-token-' + Date.now(),
          id: 998,
          role: 'admin'
        };
        
        this.setToken(emilysData.token);
        this.setUser(emilysData);
        this.setAdminStatus(true);
        return emilysData;
      }
    }
    
    throw new Error('Invalid admin credentials');
  }

  // Get admin info (for AdminNavbar)
  getAdminInfo() {
    const user = this.getUser();
    if (this.isAdmin()) {
      return {
        fname: user?.firstName || 'Admin',
        lname: user?.lastName || 'User',
        email: user?.email || 'admin@necta.com',
        role: 'admin'
      };
    }
    return null;
  }

  // Logout admin/user
  logoutAdmin() {
    this.logout();
  }

  // ============ COMMON METHODS ============
  
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(IS_ADMIN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(IS_ADMIN_KEY);
  }

  setToken(token, rememberMe = false) {
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  }

  setUser(userData) {
    const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
    storage.setItem(USER_KEY, JSON.stringify(userData));
  }

  getUser() {
    const userData = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  setAdminStatus(isAdmin) {
    const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
    storage.setItem(IS_ADMIN_KEY, isAdmin ? 'true' : 'false');
  }

  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  isAdmin() {
    const adminStatus = localStorage.getItem(IS_ADMIN_KEY) || sessionStorage.getItem(IS_ADMIN_KEY);
    const user = this.getUser();
    
    return adminStatus === 'true' || 
           user?.username === 'emilys' || 
           user?.role === 'admin' ||
           user?.email === 'admin@necta.com';
  }

  // ============ ERROR HANDLING ============
  
  handleError(error) {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          return new Error('Invalid username or password');
        case 401:
          return new Error('Unauthorized');
        case 403:
          return new Error('Forbidden');
        case 404:
          return new Error('User not found');
        default:
          return new Error(error.response.data?.message || 'Login failed. Please try again.');
      }
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    } else {
      return error;
    }
  }

  // ============ LOCAL STORAGE PRODUCTS (for AdminPanel) ============
  getProducts() {
    const products = localStorage.getItem('admin_products');
    return products ? JSON.parse(products) : [];
  }

  addProduct(product) {
    const products = this.getProducts();
    const newProduct = {
      ...product,
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      createdAt: new Date().toISOString()
    };
    products.push(newProduct);
    localStorage.setItem('admin_products', JSON.stringify(products));
    return newProduct;
  }

  updateProduct(id, updatedProduct) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedProduct };
      localStorage.setItem('admin_products', JSON.stringify(products));
      return products[index];
    }
    return null;
  }

  deleteProduct(id) {
    const products = this.getProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    localStorage.setItem('admin_products', JSON.stringify(filteredProducts));
    return true;
  }

  // ============ LOCAL STORAGE ORDERS (for AdminOrders) ============
  getOrders() {
    const orders = localStorage.getItem('admin_orders');
    if (orders) {
      return JSON.parse(orders);
    }
    // Default mock orders
    const defaultOrders = [
      {
        id: 1,
        orderNumber: 'ORD-001',
        customer: { name: 'John Doe', email: 'john@example.com' },
        createdAt: new Date().toISOString(),
        items: [{ name: 'Product 1', quantity: 2, total: 49.98 }],
        total: 49.98,
        status: 'pending'
      },
      {
        id: 2,
        orderNumber: 'ORD-002',
        customer: { name: 'Jane Smith', email: 'jane@example.com' },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        items: [{ name: 'Product 2', quantity: 1, total: 29.99 }],
        total: 29.99,
        status: 'delivered'
      }
    ];
    localStorage.setItem('admin_orders', JSON.stringify(defaultOrders));
    return defaultOrders;
  }

  updateOrderStatus(id, status) {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index].status = status;
      localStorage.setItem('admin_orders', JSON.stringify(orders));
      return orders[index];
    }
    return null;
  }
}

// Create singleton instance
const authServiceInstance = new AuthService();

// Export the instance as both default and named export
export default authServiceInstance;

// Also export it as a named export
export const authService = authServiceInstance;

// Export individual functions for backward compatibility
export const getAdminInfo = () => authServiceInstance.getAdminInfo();
export const logoutAdmin = () => authServiceInstance.logoutAdmin();
export const login = (username, password) => authServiceInstance.login(username, password);
export const loginWithEmail = (email, password) => authServiceInstance.loginWithEmail(email, password);
export const dummyUserLogin = (email, password) => authServiceInstance.dummyUserLogin(email, password);
export const signup = (userData) => authServiceInstance.signup(userData);
export const adminLogin = (email, password) => authServiceInstance.adminLogin(email, password);
export const getProducts = () => authServiceInstance.getProducts();
export const addProduct = (product) => authServiceInstance.addProduct(product);
export const updateProduct = (id, product) => authServiceInstance.updateProduct(id, product);
export const deleteProduct = (id) => authServiceInstance.deleteProduct(id);
export const getOrders = () => authServiceInstance.getOrders();
export const updateOrderStatus = (id, status) => authServiceInstance.updateOrderStatus(id, status);