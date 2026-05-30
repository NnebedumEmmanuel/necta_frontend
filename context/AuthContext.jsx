import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api, attachAuthToken } from '@/lib/api';
import { AuthContext } from './AuthContextCore';
const TOKEN_KEY = 'necta_auth_token';
const USER_KEY = 'necta_auth_user';

function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeAuth(token, user) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);

    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    // localStorage can be unavailable in private browsing; API defaults still carry the token.
  }
  attachAuthToken(token || null);
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(() => getStoredUser());
  
  // 🚨 THE FIX: Split loading into two distinct states
  const [isInitializing, setIsInitializing] = useState(true); 
  const [loading, setLoading] = useState(false);

  const applyAuth = useCallback((token, nextUser) => {
    const authSession = token ? { access_token: token, accessToken: token, user: nextUser || null } : null;
    storeAuth(token, nextUser || null);
    setSession(authSession);
    setUser(nextUser || null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      applyAuth(null, null);
      return null;
    }

    attachAuthToken(token);
    try {
      const res = await api.get('/me');
      const payload = res?.data?.data ?? res?.data ?? {};
      const nextUser = payload.user || payload.profile || payload;
      applyAuth(token, nextUser);
      return nextUser;
    } catch {
      return null;
    }
  }, [applyAuth]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setIsInitializing(true); // Only blocks the screen on initial website load
      try {
        const token = getStoredToken();
        if (!token) {
          if (mounted) applyAuth(null, null);
          return;
        }

        attachAuthToken(token);
        const cachedUser = getStoredUser();
        if (cachedUser && mounted) {
          setSession({ access_token: token, accessToken: token, user: cachedUser });
          setUser(cachedUser);
        }

        const nextUser = await refreshUser();
        if (!mounted) return;
        if (!nextUser) applyAuth(null, null);
      } catch (err) {
        console.warn('Auth init failed', err);
        if (mounted) applyAuth(null, null);
      } finally {
        if (mounted) setIsInitializing(false); // Done initializing
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, [applyAuth, refreshUser]);

  const signUp = useCallback(async (payload) => {
    setLoading(true); // Tells the UI a network request is happening, but does NOT unmount the DOM
    try {
      const res = await api.post('/auth/register', payload);
      const response = res?.data ?? {};
      const data = {
        ...(response?.data ?? {}),
        requiresVerification: Boolean(response?.requiresVerification),
        message: response?.message || '',
      };

      if (data.token) applyAuth(data.token, data.user);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err?.response?.data || err };
    } finally {
      setLoading(false);
    }
  }, [applyAuth]);

  const signIn = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res?.data?.data ?? {};
      if (data.token) applyAuth(data.token, data.user);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err?.response?.data || err };
    } finally {
      setLoading(false);
    }
  }, [applyAuth]);

  const signOut = useCallback(async (redirectTo = '/login') => {
    setLoading(true);
    try {
      await api.post('/auth/logout').catch(() => null);
      applyAuth(null, null);
      if (redirectTo) {
        window.location.href = redirectTo;
      }
      return { error: null };
    } catch (err) {
      applyAuth(null, null);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, [applyAuth]);

  const value = useMemo(() => ({
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUser,
    login: signIn,
    logout: signOut,
  }), [session, user, loading, signUp, signIn, signOut, refreshUser]);

  // 🚨 THE FIX: Only block the UI if the website is doing its very first initial load. 
  if (isInitializing) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;