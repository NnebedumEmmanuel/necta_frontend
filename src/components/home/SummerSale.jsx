import React from 'react';

const BigSummerSale = ({
  topFarLeftImage = '/images/px16.png',
  topLeftImage = '/images/px10.png',
  topRightImage = '/images/px11.png',
  topRightImage2 = '/images/px10.png',
  bottomLeftImage = '/images/px9.png',
  bottomRightImage = '/images/px12.png',

  mobileTopFarLeftImage = '/images/px16.png',
  mobileTopLeftImage = '/images/px10.png',
  mobileTopRightImage = '/images/px11.png',
  mobileBottomLeftImage = '/images/px9.png',
  mobileBottomRightImage = '/images/px12.png',
}) => {
  const handleShopNow = () => {
    window.location.href = '/shop?category=all';
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#231306] to-[#000000] overflow-hidden">

      {}
      <div className="hidden md:block">
        {}
        <div className="absolute top-2 -left-10 z-10">
          <div className="w-full h-full transform overflow-hidden">
            {topFarLeftImage && (
              <img
                src={topFarLeftImage}
                alt="Top Far Left Product"
                width={200}
                height={160}
                className=" object-contain"
              />
            )}
          </div>
        </div>

        {}
        <div className="absolute top-15 left-20">
          {topLeftImage && (
            <img
              src={topLeftImage}
              alt="Top Left Product"
              width={295}
              height={195}
              className=" object-contain"
            />
          )}
        </div>

        {}
        <div className="absolute top-2 -right-10">
          {topRightImage && (
            <img
              src={topRightImage}
              alt="Top Right Product"
              width={200}
              height={130}
              className=" object-contain"
            />
          )}
        </div>
        {}
        <div className="absolute top-15 right-20">
          {topRightImage && (
            <img
              src={topRightImage2}
              alt="Top Right Product"
              width={295}
              height={195}
              className=" object-contain"
            />
          )}
        </div>

        {}
        <div className="absolute -bottom-5 left-0">
          {bottomLeftImage && (
            <img
              src={bottomLeftImage}
              alt="Bottom Left Product"
              width={205}
              height={195}
              className=" object-contain"
            />
          )}
        </div>

        {}
        <div className="absolute -bottom-5 -right-1">
          {bottomRightImage && (
            <img
              src={bottomRightImage}
              alt="Bottom Right Product"
              width={200}
              height={195}
              className=" object-contain"
            />
          )}
        </div>
      </div>

      {}
      <div className="relative md:hidden w-full h-full">
        <div className="absolute top-0 left-0">
          <img
            src={mobileTopFarLeftImage}
            alt="Mobile Top Far Left"
            width={150}
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

      {}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white px-4">
     <h1 className="text-5xl md:text-7xl font-normal mb-6 tracking-tight">
  Big Seasonal <span class='font-bold'>Sale</span>
</h1>
<p className="text-xl md:text-2xl mb-8 max-w-2xl leading-relaxed opacity-90 text-[#787878]">
  Enjoy exclusive discounts on select items while supplies last.
</p>

        <button
          onClick={handleShopNow}
          className="border border-gray-400 px-6 py-2 [border-radius:6px] hover:bg-orange-500 hover:border-none hover:text-black transition"
        >
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default BigSummerSale;