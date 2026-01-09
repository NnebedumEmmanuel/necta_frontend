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

  const loopTexts = [...speakerTexts, ...speakerTexts, ...speakerTexts];

  const startMarquee = () => {
    const container = marqueeRef.current;
    if (!container) return;

    const content = container.children[0];
    const contentWidth = content.offsetWidth;
    
    let position = 0;
    const speed = 0.5;

    const animate = () => {
      position -= speed;
      
      if (Math.abs(position) >= contentWidth / 3) {
        position = 0;
      }
      
      container.style.transform = `translateX(${position}px)`;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      startMarquee();
    }, 100);
    
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