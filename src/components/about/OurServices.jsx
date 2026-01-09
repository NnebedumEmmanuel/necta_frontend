import React from 'react';
import { Truck, Headphones, Tag, RefreshCw } from 'lucide-react';

const OurServices = () => {
  const services = [
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Fast & Reliable Shipping",
      description: "Offering expedited shipping options and ensuring timely delivery of orders, with tracking information available for customers.",
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "24/7 Customer Support",
      description: "Providing multiple channels for customer support, including live chat, email, and phone support, to address any queries or issues promptly.",
    },
    {
      icon: <Tag className="w-8 h-8" />,
      title: "Special Offers & Discounts",
      description: "Offering discounts, coupons, and promotional offers to incentivize purchases and reward loyal customers.",
    },
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: "Easy Returns & Refunds",
      description: "Providing a hassle-free return policy and easy refund process for customers in case they are not satisfied with their purchases.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Premium Services
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We're committed to providing exceptional service at every step of your shopping journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 transform hover:-translate-y-2"
            >
              {}
              <div className="inline-flex items-center justify-center p-4 mb-6 rounded-xl bg-gradient-to-br from-blue-500 to-orange-500 text-white group-hover:from-blue-600 group-hover:to-orange-600 transition-all duration-300">
                {service.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors duration-300">
                {service.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {service.description}
              </p>

              {}
              <div className="mt-6 h-1 w-16 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full"></div>
            </div>
          ))}
        </div>

        {}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full text-white font-semibold hover:from-blue-600 hover:to-orange-600 transition-all duration-300 cursor-pointer">
            <span>Explore All Services</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurServices;