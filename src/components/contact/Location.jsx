import React from 'react';

export default function Location() {
  return (
    <div className="my-16">
      <h2 className="mb-4 text-center text-3xl font-black text-slate-950">
        Our Location
      </h2>
      <p className="mx-auto mb-10 max-w-2xl text-center text-sm leading-7 text-slate-600">
        We are based in Owerri, Imo State, and handle delivery requests for customers across Nigeria.
      </p>

      <div className="relative h-96 w-full overflow-hidden rounded-3xl border border-slate-200 shadow-2xl">
        <iframe
          src="https://www.google.com/maps?q=Owerri%2C%20Imo%20State%2C%20Nigeria&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          title="Google Maps Location"
          className="transition duration-500"
        ></iframe>
      </div>
    </div>
  );
}
