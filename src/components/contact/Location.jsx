import React from 'react';

export default function Location() {
  return (
    <div className="my-16">
      <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
        Our Location
      </h2>
      <div className="relative h-96 w-full rounded-xl overflow-hidden shadow-2xl border-2 border-white">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.082340479078!2d3.344108274274971!3d6.601565795263154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b3456789abc%3A0xabcdef1234567890!2s2%20Simbiat%20Abiola%20Way%2C%20Ikeja%2C%20Lagos%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          title="Google Maps Location"
          className="filter grayscale-0 hover:grayscale-0 transition duration-500"
        ></iframe>
      </div>
    </div>
  );
}
