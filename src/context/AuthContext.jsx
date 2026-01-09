

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import supabase from '../lib/supabaseClient';
import { attachAuthToken } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const applySession = (nextSession) => {
    setSession(nextSession ?? null);
    setUser(nextSession?.user ?? null);
  };

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
      applySession(newSession ?? null);
      if (newSession?.access_token) attachAuthToken(newSession.access_token)
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
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
