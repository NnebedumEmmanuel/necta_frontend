import React from 'react';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#111827] text-slate-300">
      <div className="mx-auto max-w-7xl border-b border-white/10 px-6 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm text-center md:text-left">
            <div className="mb-3 inline-flex rounded-2xl bg-white px-4 py-2 shadow-sm">
              <img src="/images/img6.png" alt="Necta" className="h-10 w-auto" />
            </div>
            <p className="text-sm leading-7 text-slate-400">
              Gadgets, audio gear, power solutions, and accessories with the kind of follow-up that keeps customers coming back.
            </p>
            <div className="mt-4 space-y-2 text-sm text-slate-400">
              <p className="flex items-center justify-center gap-2 md:justify-start">
                <Mail size={16} />
                nectagadget@hotmail.com
              </p>
              <p className="flex items-center justify-center gap-2 md:justify-start">
                <Phone size={16} />
                09157053789
              </p>
              <p className="flex items-center justify-center gap-2 md:justify-start">
                <MapPin size={16} />
                Owerri, Imo State, Nigeria
              </p>
            </div>
          </div>

          <div className="w-full md:max-w-xl">
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="Enter your email for updates"
                  className="w-full rounded-full border border-white/10 bg-white px-12 py-3 text-slate-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                />
              </div>

              <button className="whitespace-nowrap rounded-full bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-10 text-sm sm:grid-cols-3 md:grid-cols-5">
        <div>
          <h4 className="mb-3 font-semibold text-white">Follow</h4>
          <div className="flex items-center gap-4">
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="transition hover:text-orange-400">
              <Instagram size={20} />
            </a>
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="transition hover:text-orange-400">
              <Facebook size={20} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-semibold text-white">What we sell</h4>
          <ul className="space-y-1 text-slate-400">
            <li>Speakers</li>
            <li>Headphones</li>
            <li>Phones</li>
            <li>Power gear</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-semibold text-white">Support</h4>
          <ul className="space-y-1 text-slate-400">
            <li>Order tracking</li>
            <li>Product help</li>
            <li>Contact us</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-semibold text-white">Business</h4>
          <ul className="space-y-1 text-slate-400">
            <li>About Necta</li>
            <li>Delivery updates</li>
            <li>After-sales support</li>
          </ul>
        </div>

        <div className="flex flex-col items-center col-span-2 sm:col-span-1">
          <div className="h-28 w-28 overflow-hidden rounded-2xl bg-white p-2 shadow-sm">
            <img
              src="/images/QRcode.jpeg"
              alt="QR Code"
              className="h-full w-full object-cover"
            />
          </div>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">Scan to connect</p>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/20 px-4 py-3 text-center text-xs text-slate-400">
        (c) 2026 Necta Hub. All rights reserved.
      </div>
    </footer>
  );
}
