import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from '@/context/AuthContext'
import supabase from '../../../lib/supabaseClient'

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    password: "",
    confirmPassword: "",
    newsletter: false,
    shippingSameAsBilling: true,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === "checkbox" ? checked : value 
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    // state is optional for now

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true)

    try {
      const email = formData.email.toLowerCase().trim()
      const password = formData.password

      const res = await signUp({ email, password })
      if (res?.error) throw res.error

      const userId = res?.data?.user?.id || (await supabase.auth.getUser()).data?.user?.id

      // Persist user profile into `users` table
      try {
        const upsertPayload = {
          id: userId,
          email,
          name: `${formData.firstName} ${formData.lastName}`.trim() || null,
          phone: formData.phone || null,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          role: 'customer'
        };
        const { data: upData, error: upErr } = await supabase.from('users').upsert(upsertPayload).select();
        if (upErr) {
          console.error('Failed to upsert user profile after signup', upErr);
          toast.error('Account created but failed to save profile information. Please contact support.');
        }
      } catch (dbErr) {
        console.error('Error saving profile after signup', dbErr);
        toast.error('Account created but failed to save profile information. Please contact support.');
      }

      // fetch role from users table to decide redirect
      let role = null;
      try {
        if (userId) {
          const { data: profile, error: profileErr } = await supabase.from('users').select('role').eq('id', userId).single();
          if (!profileErr) role = profile?.role
        }
      } catch (fetchRoleErr) {
        console.warn('Failed to read role after signup', fetchRoleErr);
      }

      toast.success('Registration successful — you are signed in')
      navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    } catch (err) {
      console.error('Registration error:', err)
      const message = err?.message || err?.error_description || 'Sign up failed. Please try again.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  };

  // country list removed — not used anymore

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex bg-white rounded-2xl shadow-2xl overflow-hidden">
        {}
        <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-slate-800 to-slate-900 p-10 text-white">
          <div>
            <h1 className="text-4xl font-bold">
              NEC<span className="text-orange-500">TA</span>
            </h1>
            <p className="mt-4 text-slate-300 text-lg">
              Join our community of shoppers
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-500 rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Shop with Confidence</p>
                <p className="text-sm text-slate-300">Secure payment and buyer protection</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-orange-500 rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Fast Delivery</p>
                <p className="text-sm text-slate-300">Free shipping on orders over $50</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-orange-500 rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Exclusive Community</p>
                <p className="text-sm text-slate-300">Join millions of happy customers</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
            <p className="text-slate-300">Already have an account?</p>
            <Link
              to="/login"
              className="mt-3 inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>

        {}
        <div className="w-full lg:w-1/2 p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              Create Account
            </h1>
            <p className="mt-2 text-gray-600">
              Join <span className="text-orange-500">Necta</span> for a better shopping experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  name="firstName"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  name="lastName"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                name="email"
                type="email"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                name="phone"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                name="address"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.address ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
                placeholder="123 Main Street"
                value={formData.address}
                onChange={handleChange}
                required
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                <input
                  name="city"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.city ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
                  placeholder="New York"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State
                </label>
                <input
                  name="state"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.state ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
                  placeholder="NY"
                  value={formData.state}
                  onChange={handleChange}
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition pr-12`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-orange-600"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 6 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition pr-12`}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-orange-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="newsletter"
                  name="newsletter"
                  type="checkbox"
                  className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  checked={formData.newsletter}
                  onChange={handleChange}
                />
                <label
                  htmlFor="newsletter"
                  className="ml-3 text-sm text-gray-700"
                >
                  Subscribe to our newsletter for exclusive deals and updates
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  required
                />
                <label
                  htmlFor="terms"
                  className="ml-3 text-sm text-gray-700"
                >
                  I agree to the{" "}
                  <a href="#" className="text-orange-600 hover:underline font-medium">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-orange-600 hover:underline font-medium">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white transition duration-200 ${
                isLoading
                  ? "bg-orange-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-orange-600 hover:text-orange-500"
              >
                Sign in here
              </Link>
            </p>
            <p className="mt-2 text-center text-xs text-gray-500">
              By creating an account, you agree to our terms and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;