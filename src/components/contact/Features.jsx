import React from 'react';
import {
  Lock,
  Truck,
  RotateCw,
  MapPin
} from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Lock,
      title: "Secure Payments",
      desc: "Shop with confidence knowing that your transactions are safeguarded.",
    },
    {
      icon: Truck,
      title: "Free Shipping",
      desc: "Complimentary shipping on every order.",
    },
    {
      icon: RotateCw,
      title: "Easy Returns",
      desc: "Hassle-free returns for your convenience.",
    },
    {
      icon: MapPin,
      title: "Order Tracking",
      desc: "Track your orders anytime, anywhere.",
    },
  ];

  return (
    <div className="mt-24 px-6 md:px-12 lg:px-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center text-slate-950 font-bold">
      {features.map((feature, i) => {
        const Icon = feature.icon;
        return (
          <div
            key={i}
            className="p-6 bg-white hover:shadow-lg transition duration-300 group relative"
          >
            <div className="icon-container mb-4">
              <Icon className="text-slate-950 text-3xl group-hover:scale-110 transition" />
            </div>
            <h1 className="text-xl mb-2">{feature.title}</h1>
            <p className="text-gray-600 font-semibold">{feature.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
