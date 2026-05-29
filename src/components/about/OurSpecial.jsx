import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function OurSpecial() {
  const navigate = useNavigate();

  return (
    <section className="w-full py-20 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-14 text-center text-3xl font-semibold">
          Our Specials
        </h2>

        <div className="grid gap-10 md:grid-cols-3 items-start">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-xl shadow-md">
              <img
                src="/images/specialimg.jpg"
                alt="Featured gadget"
                className="h-[320px] w-full object-cover"
              />
              <p className="absolute top-3 right-3 rounded-full bg-white/90 px-4 py-1 text-sm font-semibold text-gray-700">
                Featured
              </p>
            </div>

            <p className="text-gray-600 leading-relaxed">
              We curate gadgets, audio gear, and power essentials that customers actually use every day, with support that continues after checkout.
            </p>

            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
            >
              Shop Collection <span aria-hidden="true">›</span>
            </button>
          </div>

          <div className="relative overflow-hidden rounded-xl shadow-md">
            <img
              src="/images/special%20img1.jpg"
              alt="Premium audio collection"
              className="h-[320px] w-full object-cover"
            />
            <p className="absolute top-3 right-3 rounded-full bg-white/90 px-4 py-1 text-sm font-semibold text-gray-700">
              Top Pick
            </p>
          </div>

          <div className="relative min-h-[720px] md:min-h-[920px]">
            <div className="absolute left-1/2 top-8 -translate-x-1/2">
              <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                className="mx-auto"
              >
                <style>{`
                  @keyframes spinText {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                  .rotate-circle {
                    transform-origin: 50% 50%;
                    animation: spinText 11s linear infinite;
                  }
                `}</style>

                <defs>
                  <path
                    id="circlePath"
                    d="M 100,20 a 80,80 0 1,1 0,160 a 80,80 0 1,1 0,-160"
                  />
                </defs>

                <g className="rotate-circle">
                  <text
                    fill="#4b5563"
                    fontSize="14"
                    fontWeight="600"
                    letterSpacing="3px"
                  >
                    <textPath href="#circlePath">
                      GADGETS • AUDIO • POWER • ACCESSORIES •
                    </textPath>
                  </text>
                </g>
              </svg>
            </div>

            <div className="absolute top-72 w-full md:top-96">
              <div className="relative overflow-hidden rounded-xl shadow-md">
                <img
                  src="/images/special%20img2.jpg"
                  alt="Portable speaker"
                  className="h-[280px] w-full object-cover"
                />
                <p className="absolute top-3 right-3 rounded-full bg-white/90 px-4 py-1 text-sm font-semibold text-gray-700">
                  Best Seller
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
