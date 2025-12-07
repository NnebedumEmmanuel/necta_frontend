import React, { useEffect, useRef } from "react";

const SpeakerMarquee = () => {
  const marqueeRef = useRef(null);
  const animationRef = useRef(null);
  
  const speakerTexts = [
    "Extreme Bass",
    "High Quality Audio",
    "Portable Bluetooth Speaker",
    "Outdoor Party Sound",
    "360° Surround Audio",
    "Wireless Subwoofer",
    "Hi-Fi Sound Quality",
    "RGB Lighting Effects",
    "TWS Stereo Pairing",
    "FM Radio & TF Card",
    "Long Battery Life",
    "Waterproof Speaker",
    "Premium Fabric Design",
    "Deep Punchy Bass",
    "Professional DSP Audio",
    "Power Bank Speaker",
    "Mini Portable Speaker",
    "Dual Driver Sound",
    "Super Subwoofer Technology",
    "Crystal Clear Vocals",
    "Outdoor Rugged Design",
    "Fashion Drum Speaker",
    "Enhanced Woofer Power",
    "Studio-Quality Sound"
  ];

  // Duplicate for seamless loop
  const loopTexts = [...speakerTexts, ...speakerTexts, ...speakerTexts];

  // Function to handle marquee animation
  const startMarquee = () => {
    const container = marqueeRef.current;
    if (!container) return;

    const content = container.children[0];
    const contentWidth = content.offsetWidth;
    
    // Calculate how much to duplicate based on screen width
    let position = 0;
    const speed = 0.5; // Slower speed for smoother animation

    const animate = () => {
      position -= speed;
      
      // When the first duplicate has moved completely out of view
      // reset to the beginning of the second duplicate
      if (Math.abs(position) >= contentWidth / 3) {
        position = 0;
      }
      
      container.style.transform = `translateX(${position}px)`;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    // Wait a bit for DOM to render
    const timeoutId = setTimeout(() => {
      startMarquee();
    }, 100);
    
    // Cleanup animation on unmount
    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="overflow-hidden w-full bg-black py-3 relative">
      <div className="flex" ref={marqueeRef}>
        <div className="flex whitespace-nowrap">
          {loopTexts.map((text, index) => (
            <span
              key={index}
              className="text-white text-lg font-semibold mx-10"
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpeakerMarquee;