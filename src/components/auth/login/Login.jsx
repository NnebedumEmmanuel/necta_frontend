import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // 🚨 THIS IS THE MISSING LINE THAT CAUSED THE CRASH 🚨
  const [fieldErrors, setFieldErrors] = useState({}); 
  
  const { signIn, session, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    // Check if there are any pending inline errors before submitting
    if (fieldErrors.email) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await signIn({ email, password });
      
      if (res?.error) {
        const errMsg = res.error.message || "Invalid credentials";
        if (errMsg.toLowerCase().includes("email not confirmed")) {
          toast.info("Please check your email and confirm your account to sign in.");
        } else {
          toast.error(errMsg);
        }
        return;
      }
      
      toast.success("Signed in successfully");
      const nextUser = res?.data?.user;
      navigate(nextUser?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      console.error("Login component caught exception:", err);
      const targetMessage = err?.message || "Invalid email or password. Please try again.";
      
      if (targetMessage.toLowerCase().includes("email not confirmed")) {
        toast.info("Please check your email and confirm your account to sign in.");
      } else {
        toast.error(targetMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      try {
        navigate(user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      } catch (e) {}
    }
  }, [session, user, navigate]);

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
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input Block */}
            <div>
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear error when user starts typing again
                    if (fieldErrors.email) {
                      setFieldErrors(prev => ({ ...prev, email: "" })); 
                    }
                  }}
                  onBlur={(e) => {
                    // Fire validation when user clicks outside the input box
                    const val = e.target.value;
                    if (val && !/^\S+@\S+\.\S+$/.test(val)) {
                      setFieldErrors(prev => ({ ...prev, email: "Please enter a valid email address." }));
                    }
                  }}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm outline-none transition-colors ${
                    fieldErrors?.email ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                  }`}
                  placeholder="you@example.com"
                />
                {/* Inline Error Message */}
                {fieldErrors?.email && (
                  <p className="text-xs text-red-600 mt-1 font-medium animate-pulse">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            {/* Password Input Block */}
            <div>
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
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm font-medium text-gray-500 hover:text-orange-500"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>

              <div className="text-sm">
                <Link to="#" className="font-medium text-orange-600 hover:text-orange-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-60 font-semibold transition-colors"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-orange-600 hover:text-orange-500">
                Create account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;