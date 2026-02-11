import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from '@/context/AuthContext';
import supabase from '../../../lib/supabaseClient';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  // Forgot password UI state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [shake, setShake] = useState(false);
  const { signIn, session, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Do not reset UI error state here; keep visible until user starts typing
    if (!email || !password) {
      setLoginError('Invalid email or password. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    setIsLoading(true);
    try {
      const res = await signIn({ email, password });
      if (res?.error) {
        // For security, show a generic message for all auth failures
        console.error('Auth failure:', res.error);
        console.log('SETTING UI ERROR STATE NOW');
        setLoginError('Invalid email or password. Please try again.');
        setShake(true);
        setTimeout(() => setShake(false), 600);
        return;
      }
      toast.success("Signed in successfully");
    } catch (err) {
      console.error("Login error:", err);
      // Show generic error to user while logging details to console for debugging
      console.log('SETTING UI ERROR STATE NOW');
      setLoginError('Invalid email or password. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const emailToSend = (forgotEmail || email || '').trim();
    if (!emailToSend) {
      toast.error('Please enter an email address');
      return;
    }
    setIsSendingReset(true);
    try {
      // Supabase v2 method to send reset email with redirect
      const { data, error } = await supabase.auth.resetPasswordForEmail(emailToSend, {
        redirectTo: 'https://necta-frontend.vercel.app/reset-password'
      });

      // Regardless of whether an account exists, show neutral message for security
      toast.success('If an account exists with this email, a reset link has been sent.');
      setShowForgot(false);
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error('Unable to send reset link. Please try again later.');
    } finally {
      setIsSendingReset(false);
    }
  };

  useEffect(() => {
    if (session) {
      try {
        navigate('/dashboard', { replace: true });
      } catch (e) {
      }
    }
  }, [session, navigate]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) {
        toast.error(error.message || 'Google sign-in failed');
        return;
      }
      toast.info('Redirecting to Google for authentication...');
    } catch (err) {
      console.error('Google sign-in error:', err);
      toast.error(err?.message || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
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
            <h2 className="mt-4 text-xl font-semibold text-gray-800">
              Welcome Back
            </h2>
            <p className="mt-2 text-gray-600">
              Sign in to your account to continue shopping
            </p>
          </div>
          
          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.4 1.2 8.4 2.9l6.2-6.2C34.4 3 29.6 1 24 1 14.8 1 6.9 6.6 3.4 14.6l7.8 6.1C12.7 16 18 9.5 24 9.5z"/>
                <path fill="#34A853" d="M46.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.7c-.5 2.7-2 5-4.2 6.6l6.4 5c3.7-3.4 6-8.5 6-15z"/>
                <path fill="#4A90E2" d="M10.9 29.4c-.6-1.8-1-3.8-1-5.9s.4-4.1 1-5.9L3.1 11.5C1.1 14.5 0 18.1 0 22s1.1 7.5 3.1 10.5l7.8-3.1z"/>
                <path fill="#FBBC05" d="M24 46c6.1 0 11.2-2 15-5.4l-7.1-5.8c-2 1.3-4.6 2.1-7.9 2.1-6 0-11.3-6.5-13.1-9.9L3.1 33.5C6.6 41.4 14.5 46 24 46z"/>
              </svg>
              Continue with Google
            </button>
          </div>
         
          <div onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)} className="space-y-6">
            <style>{`
              @keyframes shakeX { 0% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } 100% { transform: translateX(0); } }
              .animate-shake { animation: shakeX 0.6s ease-in-out; }
            `}</style>
            <div className={shake ? 'animate-shake' : ''}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setLoginError(''); }}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className={shake ? 'animate-shake' : ''}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setShowForgot(s => !s)}
                  className="font-medium text-orange-600 hover:text-orange-500"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            {/* Forgot password moved outside the main form to avoid accidental submit on Enter */}

            {loginError && (
              <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center">{loginError}</div>
            )}
            <div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-60"
              >
                {isLoading ? 'Logging in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-orange-600 hover:text-orange-500">
                Create account
              </Link>
            </div>
          </div>

          {showForgot && (
            <div className="p-4 bg-gray-50 rounded border mt-2">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Enter email to reset</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleResetPassword(e); } }}
                    placeholder="you@example.com"
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={isSendingReset}
                    className="py-2 px-4 bg-orange-600 text-white rounded-md disabled:opacity-60"
                  >
                    {isSendingReset ? 'Sending...' : 'Send reset link'}
                  </button>
                  <button type="button" onClick={() => setShowForgot(false)} className="text-sm text-gray-600 underline">Cancel</button>
                </div>
              </div>
            </div>
          )}
          {}
        </div>
      </div>
    </div>
  );
};

export default Login;