import { api, attachAuthToken, handleApiError } from '../src/lib/api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const IS_ADMIN_KEY = 'is_admin';

class AuthService {
  constructor() {
    try {
      const token = this.getToken();
      if (token) attachAuthToken(token);
    } catch (e) {
    }
  }

  
  async login(identifier, password) {
    try {
      const res = await api.post('/auth/login', { identifier, password });
      const data = res.data;
      if (data?.access_token || data?.token) {
        const token = data.access_token || data.token;
        this.setToken(token);
        this.setUser(data.user || data);
        this.setAdminStatus((data.user && data.user.role === 'admin') || data.username === 'emilys');
        return data;
      }
      throw new Error('No token received from backend');
    } catch (error) {
      if (error.response?.status === 400 && identifier.includes('@')) {
        return await this.loginWithEmail(identifier, password);
      }
      throw handleApiError(error);
    }
  }

  async loginWithEmail(email, password) {
    try {
      const res = await api.post('/auth/login', { identifier: email, password });
      const data = res.data;
      if (data?.access_token || data?.token) {
        const token = data.access_token || data.token;
        this.setToken(token);
        this.setUser(data.user || data);
        this.setAdminStatus((data.user && data.user.role === 'admin') || data.username === 'emilys');
        return data;
      }
      throw new Error('No token received from backend');
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async dummyUserLogin(email, password) {
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

    const dummyUser = dummyUsers.find(u => 
      (u.email === email || u.username === email) && 
      u.password === password
    );

    if (dummyUser) {
      const userData = {
        ...dummyUser,
        token: `dummy-token-${Date.now()}`,
        id: 1 + dummyUsers.indexOf(dummyUser)
      };
      
      this.setToken(userData.token);
      this.setUser(userData);
      this.setAdminStatus(false);
      return userData;
    }
    
    return await this.login(email, password);
  }

  async signup(userData) {
    try {
      const res = await api.post('/auth/signup', {
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

      const loginResponse = await this.login(userData.email, userData.password);
      return loginResponse;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  
  async adminLogin(email, password) {
    const adminCredentials = {
      email: 'admin@necta.com',
      password: 'Admin@123',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    };

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
    
    if ((email === 'emilys' || email === 'emilys@example.com') && 
        password === 'emilyspass') {
      try {
        return await this.login('emilys', password);
      } catch (error) {
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

  logoutAdmin() {
    this.logout();
  }

  
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(IS_ADMIN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(IS_ADMIN_KEY);
    try { attachAuthToken(null); } catch (e) {  }
  }

  setToken(token, rememberMe = false) {
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
    try { attachAuthToken(token); } catch (e) {  }
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
}

const authServiceInstance = new AuthService();

export default authServiceInstance;

export const authService = authServiceInstance;
export const getAdminInfo = () => authServiceInstance.getAdminInfo();
export const logoutAdmin = () => authServiceInstance.logoutAdmin();
export const login = (username, password) => authServiceInstance.login(username, password);
export const loginWithEmail = (email, password) => authServiceInstance.loginWithEmail(email, password);
export const dummyUserLogin = (email, password) => authServiceInstance.dummyUserLogin(email, password);
export const signup = (userData) => authServiceInstance.signup(userData);
export const adminLogin = (email, password) => authServiceInstance.adminLogin(email, password);