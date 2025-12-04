import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// ✅ Slide Animation Hero Slider
export default function HeroSlider() {
  const slides = [
    {
      id: 1,
      eyebrow: "Next-Gen Tech",
      title: "TG-676 Wireless Stereo Speaker",
      titleAccent: "Beats+",
      subtitle: "Blazing speed and all-day performance.",
      img: "/public/slide-img1.png",
      cta: "View Speaker",
    },
    {
      id: 2,
      eyebrow: "Mini Audio",
      title: "TG653 Portable Wireless Speaker",
      titleAccent: "Beats+",
      subtitle: "Track health and stay connected in style.",
      img: "/public/slide-img2.png",
      cta: "View Speaker",
    },
    {
      id: 3,
      eyebrow: "Portable Beats",
      title: "TG659 Premium Wireless Speaker",
      titleAccent: "Beats+",
      subtitle: "Immersive audio with deep bass clarity.",
      img: "/public/slide-img3.png",
      cta: "Shop Audio",
    },
  ];

  return (
    <div className="w-full bg-[#19171c] overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        
        // Smooth slide transition
        speed={800}
        spaceBetween={0}
        slidesPerView={1}
        
        // Responsive breakpoints
        breakpoints={{
          320: { // Mobile
            speed: 600,
          },
          768: { // Tablets
            speed: 700,
          },
          1024: { // Desktops
            speed: 800,
          },
        }}
        
        className="w-full h-[500px] md:h-[600px] lg:h-[700px]"
      >
        {slides.map((s) => (
          <SwiperSlide key={s.id}>
            <div className="flex flex-col lg:flex-row items-center justify-between h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-0">
              
              {/* LEFT TEXT */}
              <div className="w-full lg:w-1/2 text-white text-center lg:text-left order-2 lg:order-1 mt-8 lg:mt-0 z-10">
                <p className="text-gray-400 mb-2 sm:mb-4 text-sm sm:text-base">{s.eyebrow}</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-3 sm:mb-4">
                  {s.title} <span className="font-semibold">{s.titleAccent}</span>
                </h1>
                <p className="text-gray-400 max-w-md mx-auto lg:mx-0 mb-6 sm:mb-8 text-sm sm:text-base">
                  {s.subtitle}
                </p>
                <button className="border border-gray-300 px-4 sm:px-5 py-2 rounded text-sm hover:bg-white hover:text-black transition duration-300">
                  {s.cta}
                </button>
              </div>

              {/* RIGHT IMAGE */}
              <div className="w-full lg:w-1/2 flex justify-center lg:justify-end order-1 lg:order-2 z-10">
                <img
                  src={s.img}
                  alt="hero"
                  className="w-64 sm:w-80 md:w-96 lg:w-[420px] xl:w-[500px] drop-shadow-2xl object-contain"
                />
              </div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}