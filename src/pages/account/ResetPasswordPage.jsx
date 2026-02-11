import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import supabase from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [validSession, setValidSession] = useState(null); // null=checking, false=invalid, true=valid
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    // If the URL contains an access_token (magic link), wait for auth state change event
    const hash = (typeof window !== 'undefined' && window.location.hash) ? window.location.hash : '';
    const hasAccessToken = hash.includes('access_token=');

    let subscription;

    const eventHandler = (event, session) => {
      if (!mounted) return;
      // Supabase emits PASSWORD_RECOVERY when the magic-link for password reset is used
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true);
        setMessage('');
      }
    };

    // Register auth state listener if available
    if (supabase.auth.onAuthStateChange) {
      const { data } = supabase.auth.onAuthStateChange((event, session) => eventHandler(event, session));
      subscription = data?.subscription;
    } else if (supabase.auth.onAuthStateChanged) {
      // fallback if API differs
      subscription = supabase.auth.onAuthStateChanged((event, session) => eventHandler(event, session));
    }

    if (hasAccessToken) {
      // We expect the onAuthStateChange to fire; show interim message while waiting
      setValidSession(null);
      setMessage('Processing magic link...');

      // As a safety fallback, try to read session after a short delay in case the client auto-sets it
      (async () => {
        try {
          const { data } = await supabase.auth.getSession();
          if (!mounted) return;
          const session = data?.session ?? null;
          if (session) {
            setValidSession(true);
            setMessage('');
          }
        } catch (err) {
          console.error('Error validating session after magic link:', err);
          if (mounted) {
            // don't overwrite a PASSWORD_RECOVERY-driven validSession if set
            if (validSession === null) {
              setValidSession(false);
              setMessage('Unable to validate reset link.');
            }
          }
        }
      })();
    } else {
      // Normal flow (no token in URL): check session immediately
      (async () => {
        try {
          const { data } = await supabase.auth.getSession();
          if (!mounted) return;
          const session = data?.session ?? null;
          if (!session) {
            setValidSession(false);
            setMessage('Reset link appears invalid or expired.');
          } else {
            setValidSession(true);
            setMessage('');
          }
        } catch (err) {
          console.error('Error checking reset session:', err);
          if (mounted) {
            setValidSession(false);
            setMessage('Unable to validate reset link.');
          }
        }
      })();
    }

    return () => {
      mounted = false;
      try {
        if (subscription && typeof subscription.unsubscribe === 'function') subscription.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const handleUpdate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setMessage('');
    if (!newPassword || !confirmPassword) {
      setMessage('Please fill in both password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setMessage('Password should be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        console.error('Update password error:', error);
        setMessage(error.message || 'Unable to update password');
        return;
      }
      toast.success('Password updated!');
      // After a short delay navigate to login
      navigate('/account/login');
    } catch (err) {
      console.error('Unexpected error updating password:', err);
      setMessage('Unable to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800">
              NEC<span className="text-orange-500">TA</span>
            </h1>
            <h2 className="mt-4 text-xl font-semibold text-gray-800">Reset your password</h2>
            <p className="mt-2 text-gray-600">Use the form below to set a new password.</p>
          </div>

          {validSession === false && (
            <div className="p-4 bg-red-50 text-red-700 rounded">{message || 'Reset link appears invalid or expired.'}</div>
          )}

          {validSession === null ? (
            <div className="text-center text-gray-500">Checking session…</div>
          ) : (
            validSession && (
              <form onSubmit={handleUpdate} className="space-y-4">
                {message && (
                  <div className="text-red-600 bg-red-50 p-3 rounded">{message}</div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    placeholder="New password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 bg-orange-600 text-white rounded-md disabled:opacity-60"
                  >
                    {loading ? 'Saving…' : 'Save new password'}
                  </button>
                </div>
              </form>
            )
          )}
        </div>
      </div>
    </div>
  );
}
