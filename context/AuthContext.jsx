import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, attachAuthToken } from '@/lib/api';

const AuthContext = createContext(null);
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
  const [loading, setLoading] = useState(true);

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
    const res = await api.get('/me');
    const payload = res?.data?.data ?? res?.data ?? {};
    const nextUser = payload.user || payload.profile || payload;
    applyAuth(token, nextUser);
    return nextUser;
  }, [applyAuth]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
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
        if (mounted) setLoading(false);
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, [applyAuth, refreshUser]);

  const signUp = useCallback(async (payload) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', payload);
      const data = res?.data?.data ?? {};
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

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout').catch(() => null);
      applyAuth(null, null);
      window.location.href = '/login';
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

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
