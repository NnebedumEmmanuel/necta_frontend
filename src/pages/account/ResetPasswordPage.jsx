import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const initialToken = searchParams.get('token') || '';
  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const hasQueryHints = useMemo(() => Boolean(initialEmail || initialToken), [initialEmail, initialToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !token.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: email.trim(),
        token: token.trim(),
        password,
        confirmPassword,
      });
      setSuccess(res?.data?.message || 'Password updated successfully.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || 'Failed to reset password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#eff6ff_0,#f8fafc_35%,#fff7ed_100%)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-600 px-8 py-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-200">Secure Reset</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Choose a new password</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-100">
            {hasQueryHints
              ? 'We’ve loaded the reset details from your email link. Finish by choosing a new password.'
              : 'Paste the reset details from your email and choose a new password.'}
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
              <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="reset-token" className="block text-sm font-medium text-slate-700">
                Reset token
              </label>
              <input
                id="reset-token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                placeholder="Paste the token from your email link"
                required
              />
            </div>

            <div>
              <label htmlFor="reset-password" className="block text-sm font-medium text-slate-700">
                New password
              </label>
              <input
                id="reset-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                placeholder="Enter a new password"
                required
              />
            </div>

            <div>
              <label htmlFor="reset-confirm" className="block text-sm font-medium text-slate-700">
                Confirm password
              </label>
              <input
                id="reset-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                placeholder="Confirm your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-orange-600 to-slate-900 px-4 py-3.5 font-semibold text-white shadow-lg shadow-orange-200 transition hover:from-orange-700 hover:to-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Updating password...' : 'Reset password'}
            </button>

            <p className="text-center text-sm text-slate-600">
              Back to{' '}
              <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700">
                login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
