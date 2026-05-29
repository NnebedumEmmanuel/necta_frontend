import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      setSuccess(res?.data?.message || 'If an account exists for that email, a reset link has been sent.');
      setEmail('');
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || 'Failed to request password reset';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7ed_0,#f8fafc_35%,#ecfeff_100%)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-700 px-8 py-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Account Help</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Forgot your password?</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-100">
            Enter the email address tied to your account and we’ll send a secure reset link.
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                placeholder="you@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-700 to-slate-900 px-4 py-3.5 font-semibold text-white shadow-lg shadow-cyan-200 transition hover:from-cyan-800 hover:to-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Sending reset link...' : 'Send reset link'}
            </button>

            <p className="text-center text-sm text-slate-600">
              Remembered it already?{' '}
              <Link to="/login" className="font-semibold text-cyan-700 hover:text-cyan-800">
                Back to login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
