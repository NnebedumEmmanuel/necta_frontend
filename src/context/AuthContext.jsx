

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import supabase from '../lib/supabaseClient';
import { attachAuthToken, api } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [me, setMe] = useState(null); // application-level user (id, email, role)
  const [loading, setLoading] = useState(true);
  const [meLoading, setMeLoading] = useState(false);
  const mountedRef = useRef(true);
  const sessionRef = useRef(null);

  const applySession = (nextSession) => {
    setSession(nextSession ?? null);
    setUser(nextSession?.user ?? null);
    sessionRef.current = nextSession ?? null;
  };

  // Fetch application-level user info from backend (/api/me) whenever a session is available
  useEffect(() => {
    let mounted = true;
    const fetchMe = async () => {
      if (!session) {
        setMe(null);
        setMeLoading(false);
        return;
      }

      setMeLoading(true);
      try {
        if (session?.access_token) attachAuthToken(session.access_token);
        const res = await api.get('/me');
        const payload = res?.data?.data ?? null;
        if (!mounted) return;
        setMe(payload);
      } catch (err) {
        // Non-fatal: if backend call fails, keep me as null
        // eslint-disable-next-line no-console
        console.error('Failed to fetch /api/me', err);
        if (mounted) setMe(null);
      } finally {
        if (mounted) setMeLoading(false);
      }
    };

    fetchMe();

    return () => {
      mounted = false;
    };
  }, [session]);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);

    supabase.auth.getSession()
      .then(({ data }) => {
        if (!mountedRef.current) return;
        applySession(data?.session ?? null);
        if (data?.session?.access_token) attachAuthToken(data.session.access_token)
      })
      .catch(() => {
        
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });

    const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mountedRef.current) return;

      // Ignore SIGNED_IN / TOKEN_REFRESHED events if we already have a session
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && sessionRef.current) {
        // Existing session present; this event is likely fired on window focus — ignore to prevent reloads
        // Still refresh token attachment if needed
        if (newSession?.access_token) attachAuthToken(newSession.access_token);
        return;
      }

      // Only react to SIGNED_OUT (and initial SIGNED_IN when no session exists)
      applySession(newSession ?? null);
      if (newSession?.access_token) attachAuthToken(newSession.access_token);
      setLoading(false);
    });

    const subscription = data?.subscription ?? data;

    return () => {
      mountedRef.current = false;
      if (subscription?.unsubscribe) {
        try {
          subscription.unsubscribe();
        } catch (err) {
        }
      } else if (typeof subscription === 'function') {
        try {
          subscription();
        } catch (err) {
        }
      }
    };
  }, []);

  const signUp = async ({ email, password, options = {} }) => {
    setLoading(true);
    try {
      const res = await supabase.auth.signUp({ email, password }, options);
      return res;
    } catch (err) {
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await supabase.auth.signInWithPassword({ email, password });
      return res;
    } catch (err) {
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const res = await supabase.auth.signOut();
      return res;
    } catch (err) {
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    me,
    meLoading,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
