import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({});

// Configure axios to always send cookies (for NextAuth sessions)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true, 
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check if user is logged in on load
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await api.get('/api/auth/session');
        if (data && Object.keys(data).length > 0 && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  // 2. Login Function (Hits NextAuth credentials provider)
  const login = async (email, password) => {
    try {
      // Get the CSRF token NextAuth requires for logins
      const csrfRes = await api.get('/api/auth/csrf');
      const csrfToken = csrfRes.data.csrfToken;

      const res = await api.post('/api/auth/callback/credentials', {
        email,
        password,
        csrfToken,
        json: 'true',
      });

      if (res.data.url && !res.data.url.includes('error')) {
        // Fetch the new session
        const sessionRes = await api.get('/api/auth/session');
        setUser(sessionRes.data.user);
        return { success: true };
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 3. Logout Function
  const logout = async () => {
    try {
      const csrfRes = await api.get('/api/auth/csrf');
      await api.post('/api/auth/signout', {
        csrfToken: csrfRes.data.csrfToken,
        json: 'true'
      });
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
