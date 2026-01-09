import React from "react";
import { Instagram, Facebook, Search } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1b1b1b] text-gray-300">

      {}
      <div className="max-w-7xl mx-auto px-6 py-10 
                      flex flex-col md:flex-row 
                      gap-8 md:gap-0 
                      border-b border-gray-700">

        {}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <img src="/images/img6.png" alt="Logo" className="w-32 mb-2" />
          <p className="text-sm text-gray-400">
            Email: nectagadget@hotmail.com
          </p>
          <p className="text-sm text-gray-400">
            Contact: 09157053789
          </p>
        </div>

        {}
        <div className="md:ml-auto w-full md:max-w-xl">
          <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

            {}
            <div className="relative w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="email"
                placeholder="Enter your email..."
                className="w-full pl-12 pr-4 py-3 rounded-full 
                           border border-gray-300 bg-white text-gray-800 
                           focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {}
            <button
              className="bg-orange-500 hover:bg-orange-600 
                         text-white font-semibold 
                         px-6 py-3 rounded-full transition 
                         whitespace-nowrap"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="max-w-7xl mx-auto px-6 py-10 
                      grid grid-cols-2 
                      sm:grid-cols-3 
                      md:grid-cols-6 
                      gap-8 text-sm">

        {}
        <div>
          <h4 className="font-semibold mb-3">Socials</h4>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500 transition"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500 transition"
            >
              <Facebook size={20} />
            </a>
          </div>
        </div>

        {}
        <div>
          <h4 className="font-semibold mb-2">About Us</h4>
          <ul className="space-y-1">
            <li>Company Profile</li>
            <li>Plant Environment</li>
            <li>T & G Certificates</li>
            <li>Qualification</li>
            <li>Patent Certificate</li>
          </ul>
        </div>

        {}
        <div>
          <h4 className="font-semibold mb-2">Product</h4>
          <ul className="space-y-1">
            <li>Bluetooth Speaker</li>
            <li>Solar Panel</li>
            <li>Inverter Battery</li>
          </ul>
        </div>

        {}
        <div>
          <h4 className="font-semibold mb-2">News Center</h4>
          <ul className="space-y-1">
            <li>Company News</li>
            <li>Industry News</li>
            <li>Exhibition Information</li>
          </ul>
        </div>

        {}
        <div>
          <h4 className="font-semibold mb-2">Human</h4>
          <ul className="space-y-1">
            <li>Talent Concept</li>
            <li>Talent Recruitment</li>
          </ul>
        </div>

        {}
        <div className="flex flex-col items-center col-span-2 sm:col-span-1">
          <div className="w-28 h-28 bg-white rounded overflow-hidden flex items-center justify-center">
            <img
              src="/images/QRcode.jpeg"
              alt="QR Code"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-2 text-sm">Sweep</p>
        </div>
      </div>

      {}
      <div className="bg-orange-500 text-white text-center text-xs sm:text-sm py-3 px-4">
        ©2025 Shantou Meili Technology Co. | Guangdong ICP No. 2021128626-1 |
        Powered by www.300.cn Shantou | SEO Tags | Business License
      </div>

    </footer>
  );
}
