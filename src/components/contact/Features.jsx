import React from 'react';
import { Headphones, Lock, PackageCheck, Truck } from 'lucide-react';

const features = [
  {
    icon: Lock,
    title: 'Secure checkout',
    desc: 'Payments and order details are handled through the store checkout flow with validation on the backend.',
  },
  {
    icon: Truck,
    title: 'Delivery support',
    desc: 'Orders are routed for shipping and the team can help customers track the next step.',
  },
  {
    icon: PackageCheck,
    title: 'Product handling',
    desc: 'Products are managed with stock-aware workflows so orders reflect what is really available.',
  },
  {
    icon: Headphones,
    title: 'Real support',
    desc: 'Questions, complaints, and follow-ups are collected in one place and sent to the admin inbox.',
  },
];

export default function Features() {
  return (
    <div className="mt-24 grid grid-cols-1 gap-6 px-6 text-center sm:grid-cols-2 lg:grid-cols-4 lg:px-12 xl:px-24">
      {features.map((feature) => {
        const Icon = feature.icon;

        return (
          <article
            key={feature.title}
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white transition group-hover:bg-orange-600">
              <Icon className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-950">{feature.title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{feature.desc}</p>
          </article>
        );
      })}
    </div>
  );
}
