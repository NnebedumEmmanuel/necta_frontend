import React from "react";

export default function OurSpecial() {
  return (
    <section className="w-full py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* ---- SECTION TITLE ---- */}
        <h2 className="text-center text-3xl font-semibold mb-14">
          Our Specials
        </h2>

        {/* ---- GRID LAYOUT ---- */}
        <div className="grid md:grid-cols-3 gap-10 items-start relative">

          {/* ----------------------------------------------------
              CARD 1
          ----------------------------------------------------- */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src="/images/specialimg.jpg"
                alt="hearing"
                className="rounded-xl shadow-md w-full"
              />

              <p className="absolute top-3 right-3 text-gray-700 font-semibold">
                $130
              </p>
            </div>

            <p className="text-gray-600 leading-relaxed">
              A seamless fusion of advanced technology and refined acoustics, creating a 
              listening experience that feels richer, clearer, and more alive than ever before
            </p>

            <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2">
              More Information <span>›</span>
            </button>
          </div>

          {/* ----------------------------------------------------
              CARD 2 (CENTER LARGE IMAGE)
          ----------------------------------------------------- */}
          <div className="relative">
            <img
              src="/images/special img1.jpg"
              alt="electronics"
              className="rounded-xl shadow-md w-full h-full object-cover"
            />

            <p className="absolute top-3 right-3 text-gray-700 font-semibold">
              $140
            </p>
          </div>

          {/* ----------------------------------------------------
              CARD 3 (CIRCULAR TEXT + LOWERED IMAGE)
          ----------------------------------------------------- */}
          <div className="relative">

            {/* ====== ROTATING CIRCULAR TEXT (MOVED HIGHER) ====== */}
            <div className="absolute left-1/2 -translate-x-1/2 top-10 md:top-20">
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
                    d="
                      M 100,20
                      a 80,80 0 1,1 0,160
                      a 80,80 0 1,1 0,-160
                    "
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
                      PREMIUM QUALITY • CRYSTAL SOUND • ADVANCED AUDIO • 
                    </textPath>
                  </text>
                </g>
              </svg>
            </div>

            {/* ====== IMAGE MOVED FAR LOWER ====== */}
            <div className="absolute top-72 md:top-96 w-full">
              <img
                src="/images/special img2.jpg"
                alt="Airpods Small"
                className="rounded-xl shadow-md w-full"
              />

              <p className="absolute top-3 right-3 text-gray-700 font-semibold">
                $140
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
