import React from 'react';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const categories = [
  {
    src: "/px4.png", // Tip: Swap this with a badass Bluetooth Speaker image
    title: "Premium Audio",
    subtitle: "Room-filling Bluetooth speakers and heavy-duty sound systems.",
    link: "/shop?category=Speakers"
  },
  {
    src: "/px5.png", // Tip: Swap this with a Power Bank/Charger image
    title: "Power Solutions",
    subtitle: "High-capacity power banks and fast chargers so you never go dark.",
    link: "/shop?category=Power"
  },
  {
    src: "/px6.png", // Tip: Swap this with a Smartphone image
    title: "Smart Devices",
    subtitle: "Latest phones, smart wearables, and everyday tech essentials.",
    link: "/shop?category=Phones"
  },
  {
    src: "/px7.png", // Tip: Swap this with an Earbuds/Headphones image
    title: "Personal Sound",
    subtitle: "Immersive headphones and earbuds for uninterrupted focus.",
    link: "/shop?category=Headphones"
  },
];

export default function CategoryTab() {
  return (
    <div className="bg-zinc-950 p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <Link to={category.link} key={index} className="block cursor-pointer">
            <motion.div
              className="relative group overflow-hidden rounded-xl aspect-square border border-white/5 hover:border-orange-500/50 transition-colors duration-500"
              whileHover="hover"
              initial="initial"
            >
              <img
                src={category.src}
                alt={category.title}
                className="w-full h-full aspect-square object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Text Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <motion.div
                  variants={{
                    initial: { y: 15, opacity: 0.8 },
                    hover: { y: 0, opacity: 1 }
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <h3 className="text-white text-lg md:text-xl font-bold mb-1 tracking-wide">
                    {category.title}
                  </h3>
                  
                  {/* Subtitle that fades in fully on hover */}
                  <motion.p
                    variants={{
                      initial: { height: 0, opacity: 0 },
                      hover: { height: "auto", opacity: 1, marginTop: "8px" }
                    }}
                    className="text-slate-300 text-sm md:text-sm line-clamp-2"
                  >
                    {category.subtitle}
                  </motion.p>

                  {/* Animated "Explore" CTA */}
                  <motion.div
                    variants={{
                      initial: { opacity: 0, x: -10 },
                      hover: { opacity: 1, x: 0 }
                    }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="mt-4 flex items-center gap-2 text-orange-400 text-sm font-semibold uppercase tracking-wider"
                  >
                    Explore <span>→</span>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}