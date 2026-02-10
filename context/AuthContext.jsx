

import React, { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import supabase from '@/lib/supabaseClient';
import { attachAuthToken } from '@/lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const applySession = (nextSession) => {
    setSession(nextSession ?? null);
  };

  // Fetch user profile from `users` table and merge with auth user
  const fetchUserProfile = useCallback(async (authUser) => {
    if (!authUser || !authUser.id) return null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        // No DB row; keep auth user
        // eslint-disable-next-line no-console
        console.warn('fetchUserProfile error', error.message || error);
        const mergedFallback = { ...authUser };
        setUser(mergedFallback);
        return mergedFallback;
      }

      const merged = { ...authUser, ...(data || {}) };
      setUser(merged);
      return merged;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('fetchUserProfile failed', err);
      const mergedErr = { ...authUser };
      setUser(mergedErr);
      return mergedErr;
    }
  }, []);

  // Single initialization: get existing session, fetch profile, and subscribe to auth changes
  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    // Safety: mark when the init flow has settled so the timeout knows
    let settled = false;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const currentSession = data?.session ?? null;
        if (!mountedRef.current) return;

        applySession(currentSession);
        if (currentSession?.access_token) attachAuthToken(currentSession.access_token);

        if (currentSession?.user) {
          // IMPORTANT: await the DB profile before marking loading=false
          await fetchUserProfile(currentSession.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Auth init failed', err);
        setUser(null);
      } finally {
        settled = true;
        if (mountedRef.current) setLoading(false);
      }
    };

    init();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mountedRef.current) return;

      if (event === 'SIGNED_IN') {
        applySession(newSession ?? null);
        if (newSession?.access_token) attachAuthToken(newSession.access_token);
        if (newSession?.user) {
          // await profile fetch so role is available immediately
          await fetchUserProfile(newSession.user);
        }
        settled = true;
        if (mountedRef.current) setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        applySession(null);
        setUser(null);
        settled = true;
        if (mountedRef.current) setLoading(false);
      } else if (event === 'TOKEN_REFRESHED') {
        // refresh token attachment
        if (newSession?.access_token) attachAuthToken(newSession.access_token);
      }
    });

    // Safety timeout: if auth init hasn't settled in 5s, force loading=false
    const timeoutId = setTimeout(() => {
      if (!settled && mountedRef.current) {
        // eslint-disable-next-line no-console
        console.warn('Auth timed out');
        setLoading(false);
      }
    }, 5000);

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
      try {
        if (subscription?.subscription?.unsubscribe) {
          subscription.subscription.unsubscribe();
        } else if (typeof subscription?.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const signUp = useCallback(async ({ email, password, options = {} }) => {
    setLoading(true);
    try {
      const res = await supabase.auth.signUp({ email, password }, options);
      return res;
    } catch (err) {
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await supabase.auth.signInWithPassword({ email, password });
      const sessionObj = res?.data?.session ?? null;
      if (sessionObj) {
        applySession(sessionObj);
        if (sessionObj.access_token) attachAuthToken(sessionObj.access_token);
        if (sessionObj.user) {
          await fetchUserProfile(sessionObj.user);
        }
      }
      return res;
    } catch (err) {
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      const res = await supabase.auth.signOut();
      applySession(null);
      setUser(null);
      try { attachAuthToken(null); } catch (e) {}
      // ensure a full reload to reset any in-memory state
      window.location.href = '/login';
      return res;
    } catch (err) {
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    // maintain compatibility with components using these aliases
    login: signIn,
    logout: signOut,
  }), [session, user, loading, signUp, signIn, signOut]);

  // Memoize the provider value to avoid re-renders and potential loops
  const memoValue = useMemo(() => value, [value]);

  // If auth is still loading, show a blocking loading state to avoid rendering
  // components that assume auth is initialized (prevents blank crashes).
  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return <AuthContext.Provider value={memoValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
