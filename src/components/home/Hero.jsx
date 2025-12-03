import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";


// ✅ Smooth Fade Hero Slider
export default function HeroSlider() {
  const slides = [
    {
      id: 1,
      eyebrow: "Next-Gen Tech.",
      title: "T&G TG-676 Wireless Portable Stereo Woofer IPX5",
      titleAccent: "Beats+",
      subtitle: "Blazing speed, , and all-day performance.",
      img: "/public/slide-img1.png",
      cta: "view Speaker",
    },
    {
      id: 2,
      eyebrow: "Mini Audio",
      title: "T&G TG653 Mini Portable Speaker Outdoor Wireless Subwoofer",
      titleAccent: "Beats+",
      subtitle:
        "Track health, boost productivity, and stay connected in style.",
      img: "/public/slide-img2.png",
      cta: "View Speaker",
    },
    {
      id: 3,
      eyebrow: "Portable Beats",
      title: "T&G TG659 Trending High Quality Audio Music Player Extreme Wireless Radio Speaker",
      titleAccent: "Beats+",
      subtitle:
        "Immersive audio, deep bass, and noise-free clarity.",
      img: "/public/slide-img3.png",
      cta: "Shop Audio",
    },
  ];

  return (
    <div className="w-full bg-[#19171c] overflow-hidden" 
    style={{background :".slide img1.jpg"}}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 6500 }}
        loop

        // ⭐ Smooth fade effect settings
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1200} // smooth transition speed (1.2s)

        className="w-full h-[600px]"
      >
        {slides.map((s) => (
          <SwiperSlide key={s.id}>
            <div className="flex items-center justify-between h-[600px] max-w-7xl mx-auto px-10">
              
              {/* LEFT TEXT */}
              <div className="w-1/2 text-white">
                <p className="text-gray-400 mb-4">{s.eyebrow}</p>
                <h1 className="text-6xl font-light leading-tight mb-4">
                  {s.title} <span className="font-semibold">{s.titleAccent}</span>
                </h1>
                <p className="text-gray-400 max-w-md mb-8">{s.subtitle}</p>
                <button className="border border-gray-300 px-5 py-2 rounded text-sm">
                  {s.cta}
                </button>
              </div>

              {/* RIGHT IMAGE */}
              <div className="w-1/2 flex justify-end">
                <img
                  src={s.img}
                  alt="hero"
                  className="w-[420px] drop-shadow-2xl object-contain"
                />
              </div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
