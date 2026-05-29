import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api, attachAuthToken } from '../../lib/api';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const initialEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const hasEmailHint = useMemo(() => Boolean(initialEmail), [initialEmail]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !code.trim()) {
      setError('Please enter your email and verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-email', {
        email: email.trim(),
        code: code.trim(),
      });

      const payload = res?.data?.data || {};
      const destination = payload?.user?.role === 'admin' ? '/admin' : '/dashboard';
      if (payload.token) {
        attachAuthToken(payload.token);
        if (refreshUser) {
          await refreshUser().catch(() => null);
        }
      }

      setSuccess(res?.data?.message || 'Email verified successfully. Redirecting now...');
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 700);
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || 'Failed to verify email';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }

    setResending(true);
    try {
      const res = await api.post('/auth/send-email-verification', {
        email: email.trim(),
      });
      setSuccess(res?.data?.message || 'Verification code sent.');
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || 'Failed to resend verification code';
      setError(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e0f2fe_0,#f8fafc_38%,#fff7ed_100%)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-700 px-8 py-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">Verify Email</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Confirm your account</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-100">
            {hasEmailHint
              ? 'We sent a one-time verification code to your email address. Enter it below to activate your account.'
              : 'Enter the email address you used to sign up, then paste in the verification code we sent you.'}
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

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label htmlFor="verify-email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="verify-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="verify-code" className="block text-sm font-medium text-slate-700">
                Verification code
              </label>
              <input
                id="verify-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 tracking-[0.3em] uppercase"
                placeholder="000000"
                inputMode="numeric"
                maxLength={10}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-600 to-slate-900 px-4 py-3.5 font-semibold text-white shadow-lg shadow-sky-200 transition hover:from-sky-700 hover:to-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Verify email'}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resending ? 'Resending...' : 'Resend verification code'}
            </button>

            <p className="text-center text-sm text-slate-600">
              Already verified?{' '}
              <Link to="/login" className="font-semibold text-sky-700 hover:text-sky-800">
                Go to login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
