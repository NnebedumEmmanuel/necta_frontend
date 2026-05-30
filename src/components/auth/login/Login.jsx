import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'; // 🚨 IMPORTED LOCALLY
import 'react-toastify/dist/ReactToastify.css'; // 🚨 IMPORTED LOCALLY
import { useAuth } from '@/context/AuthContext';

function extractErrorMessage(error) {
  if (!error) return 'Invalid email or password. Please try again.';
  
  if (error instanceof Error || error.message) {
    return error.message || 'Invalid email or password. Please try again.';
  }
  
  if (typeof error === 'string') return error;

  const foundMessage =
    error?.response?.data?.error ||
    error?.data?.error ||
    error?.error ||
    error?.error_description;

  if (typeof foundMessage === 'string' && foundMessage.trim() !== '') {
    return foundMessage;
  }

  return 'Invalid email or password. Please try again.';
}

function buildRedirectTarget(location, fallback) {
  const from = location?.state?.from;
  if (!from || !from.pathname) return fallback;

  const pathname = String(from.pathname || '');
  if (pathname === '/login' || pathname === '/admin/login' || pathname === '/signup') {
    return fallback;
  }

  return `${pathname}${from.search || ''}${from.hash || ''}`;
}

const copy = {
  customer: {
    eyebrow: 'Customer Portal',
    title: 'Welcome back',
    description: 'Sign in to continue shopping, track your orders, and manage your account.',
    button: 'Sign in',
    footnote: 'Need an account?',
    footnoteLink: '/signup',
    footnoteLinkLabel: 'Create one',
  },
  admin: {
    eyebrow: 'Admin Access',
    title: 'Admin login',
    description: 'Use your admin credentials to access orders, products, support, and fulfillment tools.',
    button: 'Open admin dashboard',
    footnote: 'Need customer access instead?',
    footnoteLink: '/login',
    footnoteLinkLabel: 'Go to customer login',
  },
};

const Login = ({ mode = 'customer' }) => {
  const isAdminMode = mode === 'admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [formError, setFormError] = useState(''); 
  const [fieldErrors, setFieldErrors] = useState({}); 
  
  const { signIn, signOut, session, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const targetPath = useMemo(() => {
    const defaultPath = isAdminMode ? '/admin' : '/dashboard';
    const fromPath = buildRedirectTarget(location, defaultPath);
    if (isAdminMode) {
      return fromPath.startsWith('/admin') ? fromPath : defaultPath;
    }
    return fromPath;
  }, [isAdminMode, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (fieldErrors.email) {
      toast.error("Please fix the email error before submitting.");
      return;
    }

    if (!email || !password) {
      const message = 'Please fill in all fields.';
      setFormError(message);
      toast.error(message);
      return;
    }

    setIsLoading(true);
    try {
      const res = await signIn({ email, password });
      
      if (res?.data && res.data.success === false) {
        const msg = extractErrorMessage(res.data.error || res.data);
        console.log("🔥 Setting UI Error:", msg);
        setFormError(msg);
        toast.error(msg);
        return;
      }

      if (res?.error) {
        if (res.error?.requiresVerification) {
          const verificationEmail = res.error?.data?.email || email.trim();
          const message = res.error?.error || 'Verify your email address before signing in.';
          setFormError(message);
          toast.error(message);
          navigate(`/verify-email?email=${encodeURIComponent(verificationEmail)}`, { replace: true });
          return;
        }

        const errMsg = extractErrorMessage(res.error);
        console.log("🔥 Setting UI Error:", errMsg);
        
        if (typeof errMsg === 'string' && errMsg.toLowerCase().includes("email not confirmed")) {
          toast.info("Please check your email and confirm your account to sign in.");
        } else {
          setFormError(errMsg);
          toast.error(errMsg);
        }
        return; 
      }

      const nextUser = res?.data?.user;
      if (isAdminMode && nextUser?.role !== 'admin') {
        await signOut(null);
        const message = 'This account does not have admin access.';
        setFormError(message);
        toast.error(message);
        return;
      }

      const destination = isAdminMode && nextUser?.role === 'admin'
        ? targetPath
        : targetPath || (nextUser?.role === 'admin' ? '/admin' : '/dashboard');

      toast.success('Signed in successfully');
      navigate(destination, { replace: true });
      
    } catch (err) {
      console.error('Login error block caught:', err);
      const targetMessage = extractErrorMessage(err);
      console.log("🔥 Setting UI Error Catch Block:", targetMessage);
      setFormError(targetMessage);
      toast.error(targetMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!session) return;
    const destination = user?.role === 'admin' ? '/admin' : '/dashboard';
    navigate(destination, { replace: true });
  }, [session, user, navigate]);

  const activeCopy = copy[isAdminMode ? 'admin' : 'customer'];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7ed_0,#f8fafc_35%,#eef2ff_100%)] flex items-center justify-center p-4">
      
      {/* 🚨 LOCAL TOAST CONTAINER INJECTED DIRECTLY INTO THE COMPONENT */}
      <ToastContainer position="top-right" autoClose={5000} zIndex={99999} />

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur relative z-10">
        
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-600 px-8 py-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-200">
            {activeCopy.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">
            NEC<span className="text-orange-300">TA</span>
          </h1>
          <h2 className="mt-6 text-2xl font-semibold">{activeCopy.title}</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-100">
            {activeCopy.description}
          </p>
        </div>

        <div className="p-8">
          
         

          {/* Existing Tailwind Error Banner */}
          {formError && (
            <div
              className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-semibold"
              role="alert"
              aria-live="polite"
            >
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors(prev => ({ ...prev, email: "" })); 
                    }
                  }}
                  onBlur={(e) => {
                    const val = e.target.value;
                    if (val && !/^\S+@\S+\.\S+$/.test(val)) {
                      setFieldErrors(prev => ({ ...prev, email: "Please enter a valid email address." }));
                    }
                  }}
                  className={`mt-2 block w-full rounded-2xl border bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${
                    fieldErrors?.email ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-orange-500 focus:ring-orange-100'
                  }`}
                  placeholder="you@example.com"
                />
                {fieldErrors?.email && (
                  <p className="text-xs text-red-600 mt-2 font-medium animate-pulse">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-orange-600 hover:text-orange-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-2">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-20 text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-3 text-sm font-medium text-slate-500 transition hover:text-slate-800"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-2 text-slate-600">Remember me</span>
              </label>
              {!isAdminMode && (
                <span className="text-xs text-slate-400">
                  Keep me signed in on this device
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-3.5 font-semibold text-white shadow-lg shadow-orange-200 transition hover:from-orange-700 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Signing in...' : activeCopy.button}
            </button>

            <div className="space-y-2 text-center text-sm text-slate-600">
              <p>
                {activeCopy.footnote}{' '}
                <Link to={activeCopy.footnoteLink} className="font-semibold text-orange-600 hover:text-orange-700">
                  {activeCopy.footnoteLinkLabel}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;