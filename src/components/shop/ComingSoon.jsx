// ComingSoon.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Bell, 
  Speaker, 
  Mail,
  ArrowLeft,
  Smartphone,
  Sun,
  Zap,
  Tv,
  Headphones
} from "lucide-react";

const ComingSoon = ({ category }) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Get icon based on category
  const getCategoryIcon = () => {
    switch(category.toLowerCase()) {
      case "smartphones": 
      case "phones": 
        return <Smartphone size={80} className="text-gray-400" />;
      case "speakers": 
        return <Speaker size={80} className="text-gray-400" />;
      case "solar products": 
      case "solar": 
        return <Sun size={80} className="text-gray-400" />;
      case "inverters": 
      case "inverter": 
        return <Zap size={80} className="text-gray-400" />;
      case "televisions": 
      case "tv": 
        return <Tv size={80} className="text-gray-400" />;
      case "headphones": 
        return <Headphones size={80} className="text-gray-400" />;
      default: 
        return <Bell size={80} className="text-gray-400" />;
    }
  };

  // Get category description
  const getCategoryDescription = () => {
    switch(category.toLowerCase()) {
      case "smartphones": 
      case "phones": 
        return "Premium smartphones with cutting-edge technology, powerful cameras, and exceptional performance are coming soon.";
      case "speakers": 
        return "High-quality audio systems, Bluetooth speakers, soundbars, and premium home theater solutions.";
      case "solar products": 
      case "solar": 
        return "Sustainable energy solutions including solar panels, solar water heaters, and complete solar power systems.";
      case "inverters": 
      case "inverter": 
        return "Power backup solutions, UPS systems, and advanced inverters with cutting-edge technology.";
      case "televisions": 
      case "tv": 
        return "Next-generation Smart TVs, OLED displays, 4K/8K resolution screens, and home entertainment systems.";
      case "headphones": 
        return "Premium wireless headphones, noise-canceling earbuds, and studio-grade audio equipment.";
      default: 
        return "Premium quality products with cutting-edge technology are coming soon to revolutionize your experience.";
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4">
      <div className="w-full">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4">
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Shop
          </Link>
        </div>

        {/* Main Content - Full Width */}
        <div className="w-full">
          <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 lg:py-20">
              {/* Icon & Badge */}
              <div className="flex flex-col items-center mb-8">
                <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-50 mb-6">
                  {getCategoryIcon()}
                </div>
                <span className="px-6 py-2 bg-gradient-to-r from-gray-800 to-black text-white rounded-full text-sm font-semibold">
                  Coming Soon
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 text-center">
                {category} 
                <span className="block text-gray-600 mt-2">
                  Collection
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto leading-relaxed">
                {getCategoryDescription()}
              </p>

              {/* Features Preview */}
              <div className="mb-12">
                <h3 className="text-lg font-semibold text-gray-700 mb-6 text-center">What to Expect</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {[
                    { 
                      title: "Premium Quality", 
                      desc: "Top-tier products from leading brands",
                      icon: "⭐"
                    },
                    { 
                      title: "Latest Technology", 
                      desc: "Cutting-edge features and innovations",
                      icon: "🚀"
                    },
                    { 
                      title: "Competitive Pricing", 
                      desc: "Best value for your investment",
                      icon: "💎"
                    }
                  ].map((feature, index) => (
                    <div 
                      key={index}
                      className="bg-gray-50 p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-sm"
                    >
                      <div className="text-3xl mb-4 text-center">{feature.icon}</div>
                      <h4 className="font-bold text-gray-900 mb-3 text-center">{feature.title}</h4>
                      <p className="text-sm text-gray-600 text-center">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newsletter Subscription */}
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-8 max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Bell size={24} className="text-gray-600" />
                  <h3 className="text-xl font-bold text-gray-900">
                    Get Notified at Launch
                  </h3>
                </div>
                
                {subscribed ? (
                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-gray-800 to-black rounded-full mb-4">
                      <Bell size={24} className="text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h4>
                    <p className="text-gray-600">
                      You'll be the first to know when we launch the {category} collection.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="flex-1 px-6 py-4 rounded-xl border border-gray-300 focus:border-gray-800 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                      required
                    />
                    <button
                      type="submit"
                      className="px-8 py-4 bg-gradient-to-r from-gray-900 to-black text-white font-semibold rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 shadow-lg"
                    >
                      Notify Me
                    </button>
                  </form>
                )}
                
                <p className="text-sm text-gray-500 mt-4 text-center">
                  We'll send you an exclusive launch offer and early access notification.
                </p>
              </div>

              {/* Explore Other Categories */}
              <div className="mt-12 pt-8 border-t border-gray-200 max-w-7xl mx-auto">
                <h4 className="text-lg font-semibold text-gray-700 mb-6 text-center">
                  Currently Available
                </h4>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    to="/shop?category=speakers"
                    className="px-8 py-4 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-md hover:shadow-lg text-lg font-medium"
                  >
                    <span>Browse Speakers</span>
                    <span className="ml-3 text-sm bg-gray-700 px-3 py-1 rounded">
                      24 products
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;