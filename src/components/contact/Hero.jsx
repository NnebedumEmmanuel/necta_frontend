import React from "react";
import { Link } from "react-router-dom";

const Hero = ({
  title = "Contact us",
  breadcrumbs = ["Home", "Contact Us"],
  backgroundImage = "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80",
  overlayOpacity = "bg-black/50",
  blur = "backdrop-blur-sm",
  heightClass = "h-[600px]"
}) => {
  return (
    <section
      className={`relative w-full ${heightClass} flex items-center justify-center text-center text-white`}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      {}
      <div className={`absolute inset-0 ${overlayOpacity} ${blur}`}></div>

      {}
      <div className="relative z-10 space-y-4">
        {}
        <h1 className="text-4xl font-bold">{title}</h1>

        {}
        <nav className="text-sm text-gray-200">
          {breadcrumbs.map((crumb, index) => (
            <span key={index}>
              {index === 0 ? (
                <Link to="/" className="hover:underline">{crumb}</Link>
              ) : (
                crumb
              )}
              {index < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
            </span>
          ))}
        </nav>
      </div>
    </section>
  );
};

export default Hero;
