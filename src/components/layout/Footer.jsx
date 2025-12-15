import React from "react";
import { Instagram, Facebook, Search } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1b1b1b] text-gray-300">

      {/* ==========================
          TOP CONTACT ROW (Logo + Email Input + Subscribe aligned right)
      =========================== */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex items-start justify-between border-b border-gray-700">

        {/* Logo and Email */}
        <div className="flex flex-col">
          <img src="/public/img6.png" alt="Logo" className="w-32 mb-2" />
          <p className="text-sm text-gray-400">Email Address: nectagadget@hotmail.com</p>
          <p className="text-sm text-gray-400">contact      : 09157053789</p>

        </div>

        {/* Email Input + Subscribe Button aligned right */}
        <div className="ml-auto relative flex-1 max-w-xl flex items-center mt-4 md:mt-0">
          <input
            type="email"
            placeholder="Enter your email..."
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />

          <button className="ml-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-full transition">
            Subscribe
          </button>
        </div>

      </div>

      {/* ==========================
          MIDDLE LINKS ROW
      =========================== */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-6 gap-8 text-sm">

        {/* SOCIALS */}
        <div>
          <h4 className="font-semibold mb-3">Socials</h4>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/s/aGlnaGxpZ2h0OjE4MzA0ODAyMzUzMjY3OTUy?story_media_id=3785179784817469910_79294617253&igsh=MXdwdXR2cGszaWl3Zg=="
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500 transition"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://www.facebook.com/share/p/1aAyZbZFgE/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500 transition"
            >
              <Facebook size={20} />
            </a>
          </div>
        </div>

        {/* ABOUT */}
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

        {/* PRODUCTS */}
        <div>
          <h4 className="font-semibold mb-2">Product</h4>
          <ul className="space-y-1">
            <li>Bluetooth Speaker</li>
            <li>Solar Panel</li>
            <li>Inverter Battery</li>
          </ul>
        </div>

        {/* NEWS */}
        <div>
          <h4 className="font-semibold mb-2">News Center</h4>
          <ul className="space-y-1">
            <li>Company News</li>
            <li>Industry News</li>
            <li>Exhibition Information</li>
          </ul>
        </div>

        {/* HUMAN */}
        <div>
          <h4 className="font-semibold mb-2">Human</h4>
          <ul className="space-y-1">
            <li>Talent Concept</li>
            <li>Talent Recruitment</li>
          </ul>
        </div>

        {/* QR CODE */}
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 bg-white rounded overflow-hidden flex items-center justify-center">
            <img
              src="/public/QR code img.jpeg"
              alt="QR Code"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-2 text-sm">Sweep</p>
        </div>

      </div>

      {/* ==========================
          BOTTOM BAR
      =========================== */}
      <div className="bg-orange-500 text-white text-center text-sm py-3">
        ©2025 Shantou Meili Technology Co. | Guangdong ICP No. 2021128626-1 |
        Powered by www.300.cn Shantou | SEO Tags | Business License
      </div>

    </footer>
  );
}
