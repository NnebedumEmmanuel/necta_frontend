import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useAuth } from '@/context/AuthContext' // Cleaned path reference using workspace aliases

const SignUp = () => {
  const navigate = useNavigate()
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
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ 
      ...formData, 
      [name]: type === "checkbox" ? checked : value 
    })
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.phone) newErrors.phone = "Phone number is required"
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.city.trim()) newErrors.city = "City is required"

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      const res = await signUp({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        password: formData.password,
      })
      
      if (res?.error) throw res.error

      const role = res?.data?.user?.role
      toast.success('Registration successful. Welcome to Necta!')
      navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    } catch (err) {
      console.error('Registration processing error:', err)
      
      // If our interceptor added structured backend field validations
      if (err.validationErrors) {
        setErrors(err.validationErrors)
        toast.error("Please correct the highlighted fields.")
      } else {
        const message = err?.message || 'Sign up failed. Please try again.'
        toast.error(message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Informational Sidebar panel */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-slate-800 to-slate-900 p-10 text-white">
          <div>
            <h1 className="text-4xl font-bold">
              NEC<span className="text-orange-500">TA</span>
            </h1>
            <p className="mt-4 text-slate-300 text-lg">Join our community of shoppers</p>
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
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
            <p className="text-slate-300">Already have an account?</p>
            <Link to="/login" className="mt-3 inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition duration-200">
              Sign In
            </Link>
          </div>
        </div>

        {/* Form Interactive panel */}
        <div className="w-full lg:w-1/2 p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Create Account</h1>
            <p className="mt-2 text-gray-600">Join <span className="text-orange-500">Necta</span> for a better shopping experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                <input
                  name="firstName"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.firstName ? "border-red-500 bg-red-50" : "border-gray-300"} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                <input
                  name="lastName"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.lastName ? "border-red-500 bg-red-50" : "border-gray-300"} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
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
              errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
            } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={(e) => {
              // Fires immediately when a user clicks away from the input field
              const emailValue = e.target.value;
              if (emailValue && !/^\S+@\S+\.\S+$/.test(emailValue)) {
                setErrors(prev => ({ ...prev, email: "Please enter a valid email address (e.g., name@domain.com)" }));
              }
            }}
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 font-medium animate-pulse">{errors.email}</p>
          )}
      </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
              <input
                name="phone"
                className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? "border-red-500 bg-red-50" : "border-gray-300"} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address *</label>
              <input
                name="address"
                className={`w-full px-4 py-3 rounded-lg border ${errors.address ? "border-red-500 bg-red-50" : "border-gray-300"} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
                placeholder="123 Main Street"
                value={formData.address}
                onChange={handleChange}
                required
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                <input
                  name="city"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.city ? "border-red-500 bg-red-50" : "border-gray-300"} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
                  placeholder="New York"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                <input
                  name="state"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  placeholder="NY"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.password ? "border-red-500 bg-red-50" : "border-gray-300"} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition pr-12`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-orange-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-300"} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition pr-12`}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-orange-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center cursor-pointer select-none">
                <input
                  id="newsletter"
                  name="newsletter"
                  type="checkbox"
                  className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  checked={formData.newsletter}
                  onChange={handleChange}
                />
                <label htmlFor="newsletter" className="ml-3 text-sm text-gray-700">
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
                <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                  I agree to the{" "}
                  <a href="#" className="text-orange-600 hover:underline font-medium">Terms of Service</a> and{" "}
                  <a href="#" className="text-orange-600 hover:underline font-medium">Privacy Policy</a>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white transition duration-200 ${
                isLoading ? "bg-orange-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignUp