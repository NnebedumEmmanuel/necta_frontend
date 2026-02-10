import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const images = [
  {
    src: "/px4.png",
    title: "Title 1",
    subtitle: "Subtitle for Image 1",
  },
  {
    src: "/px5.png",
    title: "Title 2",
    subtitle: "Subtitle for Image 2",
  },
  {
    src: "/px6.png",
    title: "Title 3",
    subtitle: "Subtitle for Image 3",
  },
  {
    src: "/px7.png",
    title: "Title 4",
    subtitle: "Subtitle for Image 4",
  },
];

export default function CategoryTab() {
  return (
    <div className="bg-zinc-950 p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <motion.div
            key={index}
            className="relative group overflow-hidden rounded-md aspect-square"
            whileHover="hover"
            initial="initial"
          >
            {}
            <img
              src={image.src}
              alt={image.title || `Gallery image ${index + 1}`}
              className="w-full h-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            {}
            <div className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/80 transition-all duration-500 flex flex-col justify-center items-center p-4 text-center">
              {}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0)_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </div>

              {}
              <motion.p
                variants={{
                  initial: { y: 20, opacity: 0 },
                  hover: { y: 0, opacity: 1 }
                }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-white text-lg md:text-xl font-semibold z-10 mb-2"
              >
                {image.title}
              </motion.p>
              <motion.p
                variants={{
                  initial: { y: 20, opacity: 0 },
                  hover: { y: 0, opacity: 1 }
                }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-white/80 text-sm md:text-base z-10 max-w-[80%]"
              >
                {image.subtitle}
              </motion.p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}