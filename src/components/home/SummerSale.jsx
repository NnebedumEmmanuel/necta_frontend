import React from 'react';

const BigSummerSale = ({
  // Desktop images (leave exactly as before)
  topFarLeftImage = '/images/img18.png',
  topLeftImage = '/images/img20.png',
  topRightImage = '/images/img21.png',
  bottomLeftImage = '/images/img19.png',
  bottomRightImage = '/images/img22.png',

  // Mobile images (you can set your own)
  mobileTopFarLeftImage = '/images/img27.png',
  mobileTopLeftImage = '/images/img28.png',
  mobileTopRightImage = '/images/img29.png',
  mobileBottomLeftImage = '/images/img30.png',
  mobileBottomRightImage = '/images/img31.png',
}) => {
  const handleShopNow = () => {
    // Simple navigation without Next.js router
    window.location.href = '/shop?category=all';
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#2E2E2E] to-[#000000] overflow-hidden">

      {/* ---------- DESKTOP (unchanged) ---------- */}
      <div className="hidden md:block">
        {/* New Top Far Left Image */}
        <div className="absolute top-15 left-10 z-10">
          <div className="w-full h-full transform overflow-hidden">
            {topFarLeftImage && (
              <img
                src={topFarLeftImage}
                alt="Top Far Left Product"
                width={160}
                height={160}
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>

        {/* Top Left Image */}
        <div className="absolute top-0 left-44">
          {topLeftImage && (
            <img
              src={topLeftImage}
              alt="Top Left Product"
              width={195}
              height={195}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Top Right Image */}
        <div className="absolute -top-5 -right-5">
          {topRightImage && (
            <img
              src={topRightImage}
              alt="Top Right Product"
              width={130}
              height={130}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Bottom Left Image */}
        <div className="absolute bottom-2 left-0">
          {bottomLeftImage && (
            <img
              src={bottomLeftImage}
              alt="Bottom Left Product"
              width={195}
              height={195}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Bottom Right Image */}
        <div className="absolute bottom-0 -right-1">
          {bottomRightImage && (
            <img
              src={bottomRightImage}
              alt="Bottom Right Product"
              width={195}
              height={195}
              className="w-full h-full object-contain"
            />
          )}
        </div>
      </div>

      {/* ---------- MOBILE (5 absolute images) ---------- */}
      <div className="relative md:hidden w-full h-full">
        <div className="absolute top-0 left-0">
          <img
            src={mobileTopFarLeftImage}
            alt="Mobile Top Far Left"
            width={50}
            height={50}
            className="object-contain"
          />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
          <img
            src={mobileTopLeftImage}
            alt="Mobile Top Left"
            width={250}
            height={250}
            className="object-contain"
          />
        </div>
        <div className="absolute top-0 right-0">
          <img
            src={mobileTopRightImage}
            alt="Mobile Top Right"
            width={150}
            height={150}
            className="object-contain"
          />
        </div>
        <div className="absolute bottom-0 left-0">
          <img
            src={mobileBottomLeftImage}
            alt="Mobile Bottom Left"
            width={120}
            height={120}
            className="object-contain"
          />
        </div>
        <div className="absolute bottom-0 right-0">
          <img
            src={mobileBottomRightImage}
            alt="Mobile Bottom Right"
            width={120}
            height={120}
            className="object-contain"
          />
        </div>
      </div>

      {/* ---------- CENTER TEXT CONTENT ---------- */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white px-4">
        <h1 className="text-5xl md:text-7xl font-normal mb-6 tracking-tight">
          Big Summer <span className='font-bold'>Sale</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl leading-relaxed opacity-90 text-[#787878]">
          Commodo Inmervitas vitae leo maurish. Ei contestual.
        </p>
        <button
          onClick={handleShopNow}
          className="border border-gray-400 px-6 py-2 [border-radius:6px] hover:bg-white hover:text-black transition"
        >
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default BigSummerSale;