import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#1b1b1b] text-gray-300">

      {/* ==========================
          TOP CONTACT ROW
      =========================== */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 border-b border-gray-700">

        {/* --- CONTACT COLUMN 1 --- */}
        <div>
          <img src="/public/img6.png" alt="" className="w-32 mb-3" />
          <p>Email: nectagadget@hotmail.com</p>
          <p>Tel: 09157053789</p>
        </div>

        {/* --- CONTACT COLUMN 2 --- */}
        <div>
          <p>Email: nectagadget@hotmail.com</p>
          <p>Tel: 09157053789</p>
          <p></p>
        </div>

        {/* --- CONTACT COLUMN 3 --- */}
        <div>
          <p>Email: nectagadget@hotmail.com</p>
          <p>Tel: 09157053789</p>
        </div>

      </div>

      {/* ==========================
          MIDDLE LINKS ROW
      =========================== */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-6 gap-8 text-sm">

        {/* HOME */}
        <div>
          <h4 className="font-semibold mb-2">Home</h4>
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

        {/* HUMAN RESOURCES */}
        <div>
          <h4 className="font-semibold mb-2">Human</h4>
          <ul className="space-y-1">
            <li>Talent Concept</li>
            <li>Talent Recruitment</li>
          </ul>
        </div>

        {/* ==========================
            QR CODE SECTION
            (ONLY CODE VISIBLE)
        =========================== */}
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 bg-white p-1 rounded overflow-hidden flex items-center justify-center">

            {/* 
              QR Code fits perfectly:
              - object-contain keeps the full image visible
              - no overflow or cropping
            */}
            <img
              src="/public/QR code img.jpeg"
              alt="QR Code"
              className="w-full h-full object-contain"
            />
          </div>

          <p className="mt-2 text-sm">Sweep</p>
        </div>

      </div>

      {/* ==========================
          BOTTOM COPYRIGHT BAR
      =========================== */}
      <div className="bg-orange-500 text-white text-center text-sm py-3">
        ©2025 Shantou Meili Technology Co. | Guangdong ICP No. 2021128626-1 |
        Powered by www.300.cn Shantou | SEO Tags | Business License
      </div>

    </footer>
  );
}
