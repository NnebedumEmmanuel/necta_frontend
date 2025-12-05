import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#1b1b1b] text-gray-300">
      {/* TOP CONTACT ROW */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 border-b border-gray-700">
        
        <div>
          <img src="/public/img6.png" alt="" />
          <p>Email: sean@tgspeaker.cn</p>
          <p>Tel: 86-15089109256 (Sean Zhuang)</p>
        </div>

        <div>
          <p>Email: william@tgspeaker.cn</p>
          <p>Tel: 86-18011729326 (William Kuo)</p>
        </div>

        <div>
          <p>Email: able@tgspeaker.cn</p>
          <p>Tel: 86-13531218687 (Able Zhang)</p>
        </div>

      </div>

      {/* MIDDLE LINKS ROW */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-6 gap-8 text-sm">

        <div>
          <h4 className="font-semibold mb-2">Home</h4>
        </div>

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

        <div>
          <h4 className="font-semibold mb-2">Product</h4>
          <ul className="space-y-1">
            <li>Bluetooth Speaker</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">News Center</h4>
          <ul className="space-y-1">
            <li>Company News</li>
            <li>Industry News</li>
            <li>Exhibition Information</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Human</h4>
          <ul className="space-y-1">
            <li>Talent Concept</li>
            <li>Talent Recruitment</li>
          </ul>
        </div>

        {/* QR Section */}
        <div className="flex flex-col items-center">
          <img
            src="/qr.png" 
            alt="QR Code"
            className="w-24 h-24 object-cover bg-white p-1 rounded"
          />
          <p className="mt-2 text-sm">Sweep</p>
        </div>

      </div>

      {/* BOTTOM COPYRIGHT BAR */}
     <div className="bg-orange-500 text-white text-center text-sm py-3">
  ©2025 Shantou Meili Technology Co. | Guangdong ICP No. 2021128626-1 |
  Powered by www.300.cn Shantou | SEO Tags | Business License
</div>

    </footer>
  );
}
