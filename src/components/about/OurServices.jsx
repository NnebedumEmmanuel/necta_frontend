import React from 'react';
import { Link } from 'react-router-dom';
import { Headphones, RefreshCw, Tag, Truck } from 'lucide-react';

const services = [
  {
    icon: Truck,
    title: 'Packed for Dispatch Quickly',
    description: 'Once checkout is complete, we move your order into fulfillment fast so it gets ready for delivery without unnecessary delay.',
  },
  {
    icon: Headphones,
    title: 'Support That Knows the Catalog',
    description: 'Need help choosing a speaker, confirming an order, or checking delivery details? Our team is ready to help with real product knowledge.',
  },
  {
    icon: Tag,
    title: 'Curated Tech at Fair Prices',
    description: 'Necta keeps the focus on gadgets, audio gear, watches, and accessories people use every day, priced to stay competitive.',
  },
  {
    icon: RefreshCw,
    title: 'Order Follow-Up Made Easy',
    description: 'From delivery updates to post-purchase questions, we stay available after checkout so you are never left guessing.',
  },
];

export default function OurServices() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            How Necta Supports Your Order
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-600">
            We keep the Necta shopping flow simple from discovery to delivery, with help available before and after you buy.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.title}
              className="group rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="mb-6 inline-flex rounded-xl bg-gradient-to-br from-blue-500 to-orange-500 p-4 text-white transition-all duration-300 group-hover:from-blue-600 group-hover:to-orange-600">
                <service.icon className="h-8 w-8" />
              </div>

              <h3 className="mb-4 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-orange-600">
                {service.title}
              </h3>

              <p className="leading-relaxed text-gray-600">
                {service.description}
              </p>

              <div className="mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-blue-500 to-orange-500"></div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 px-6 py-3 font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-orange-600"
          >
            <span>Browse the Shop</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
