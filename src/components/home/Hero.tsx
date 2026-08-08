"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const SHOWCASE_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&h=900&fit=crop&q=85",
    label: "Gaming Setup"
  },
  {
    src: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=900&fit=crop&q=85",
    label: "Fashion"
  },
  {
    src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=900&fit=crop&q=85",
    label: "Footwear"
  },
  {
    src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=900&fit=crop&q=85",
    label: "Audio"
  },
  {
    src: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=900&fit=crop&q=85",
    label: "Tech & Office"
  },
  {
    src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=900&fit=crop&q=85",
    label: "Accessories"
  },
];

const TEXT_SLIDES = [
  {
    title: (
      <>
        Discover Local Sellers.{" "}
        <br className="hidden lg:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Negotiate Bulk Deals.
        </span>
      </>
    ),
    description: "Euphoria Nexus connects you directly with the best local vendors. Save money with exclusive cross-seller bundles and real-time bulk negotiations.",
    actionLink: "/explore",
    actionText: "Start Shopping"
  },
  {
    title: (
      <>
        Welcome to{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
          Nexus.
        </span>
        <br className="hidden lg:block" />
        The Next-Generation{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          B2B Marketplace.
        </span>
      </>
    ),
    description: "Experience a unified platform where buyers and businesses seamlessly interact. Everything you need, all in one place with unprecedented transparency.",
    actionLink: "/about",
    actionText: "Learn More"
  },
  {
    title: (
      <>
        Not Just A Buyer?{" "}
        <br className="hidden lg:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
          Sell Your Products Here.
        </span>
      </>
    ),
    description: "Join hundreds of successful vendors on Euphoria Nexus. Set up your store in minutes, manage bulk negotiations, and reach millions of buyers nationwide.",
    actionLink: "/seller/apply",
    actionText: "Become a Seller"
  }
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [contentVisible, setContentVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setContentVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % SHOWCASE_IMAGES.length);
        setContentVisible(true);
      }, 1000); 
    }, 6000); 
    return () => clearInterval(timer);
  }, []);

  const currentTextSlide = current % TEXT_SLIDES.length;

  return (
    <section className="relative bg-[#050510] overflow-hidden rounded-2xl my-6 mx-4 sm:mx-6 lg:mx-8 shadow-2xl h-[520px] lg:h-[600px]">
      
      {/* Animated Cosmos Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#02020a]">
        
        {/* Moving Starry Sky (using multiple layers for parallax) */}
        <div 
          className="absolute inset-[-50%] w-[200%] h-[200%] bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&q=80')] bg-cover opacity-30 mix-blend-screen"
          style={{ animation: 'rotateSky 120s linear infinite' }}
        ></div>
        <div 
          className="absolute inset-[-20%] w-[140%] h-[140%] bg-[url('https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1600&q=80')] bg-cover opacity-20 mix-blend-screen"
          style={{ animation: 'panSky 80s linear infinite alternate' }}
        ></div>

        {/* Rotating Earth at the bottom */}
        <div className="absolute -bottom-[400px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full overflow-hidden opacity-80 shadow-[0_0_100px_40px_rgba(79,70,229,0.3)]">
          <div 
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1200&q=80')] bg-cover bg-center mix-blend-luminosity brightness-75"
            style={{ animation: 'rotateEarth 200s linear infinite' }}
          ></div>
          {/* Atmosphere glow */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_20px_50px_rgba(255,255,255,0.2)]"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-[#050510]/80"></div>
        </div>

        {/* Nebula Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[120px]" style={{ animation: 'pulse 8s infinite' }}></div>
        
        {/* Custom Keyframes */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes rotateSky {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes panSky {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-5%, -5%); }
          }
          @keyframes rotateEarth {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-360deg); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
        `}} />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row h-full">
        
        {/* Left — Text Content */}
        <div className="flex-1 flex items-center px-6 py-10 lg:px-16 relative">
          <div className="w-full max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-8 shadow-lg shadow-black/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              500+ Local Sellers Online
            </div>

            {/* Absolute positioning of text slides to prevent container resizing */}
            <div className="relative w-full h-[280px] lg:h-[320px]">
              {TEXT_SLIDES.map((slide, idx) => (
                <div
                  key={idx}
                  className={`absolute top-0 left-0 w-full transition-all duration-1000 ease-in-out transform ${
                    idx === currentTextSlide && contentVisible
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 translate-y-4 pointer-events-none'
                  }`}
                >
                  <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold text-white tracking-tight leading-[1.1] mb-6">
                    {slide.title}
                  </h1>
                  <p className="text-lg text-slate-300 mb-8 max-w-lg leading-relaxed font-light">
                    {slide.description}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link
                      href={slide.actionLink}
                      className="w-full sm:w-auto px-10 py-4 rounded-full bg-primary/90 backdrop-blur-md border border-primary-light/30 hover:bg-primary-dark text-white font-bold text-lg shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all hover:scale-105 active:scale-95 text-center"
                    >
                      {slide.actionText}
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Slide indicator dots */}
            <div className="flex items-center gap-3 mt-6">
              {SHOWCASE_IMAGES.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`transition-all duration-500 rounded-full h-2 ${
                    i === current
                      ? "w-8 bg-primary shadow-[0_0_10px_rgba(79,70,229,0.8)]"
                      : "w-2 bg-white/20 hover:bg-white/50"
                  }`}
                  aria-label={`Show ${img.label}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right — Floating Glassmorphism Image Display */}
        <div className="hidden lg:flex relative w-[450px] xl:w-[550px] flex-shrink-0 items-center justify-center p-8">
          
          <div 
            className="relative w-full max-w-[360px] aspect-[4/5] rounded-[2rem] p-3 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
            style={{ animation: 'float 6s ease-in-out infinite' }}
          >
            {/* The inner image container */}
            <div className="relative w-full h-full rounded-3xl overflow-hidden bg-black shadow-inner">
              {SHOWCASE_IMAGES.map((img, i) => (
                <img
                  key={i}
                  src={img.src}
                  alt={img.label}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1500ms] ease-out ${
                    i === current 
                      ? "opacity-100 scale-100 blur-0" 
                      : "opacity-0 scale-110 blur-sm"
                  }`}
                />
              ))}
              
              {/* Overlay gradient inside the image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              
              {/* Category label overlay inside the card */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-20">
                <span
                  className={`inline-block text-white text-lg font-bold tracking-wide transition-all duration-1000 delay-300 ${
                    contentVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  }`}
                >
                  {SHOWCASE_IMAGES[current].label}
                </span>
                <span className={`w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-1000 delay-500 ${
                    contentVisible ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
                  }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </span>
              </div>
            </div>
            
            {/* Outer Glow of the card */}
            <div className="absolute -inset-4 bg-primary/20 rounded-[2.5rem] blur-2xl -z-10"></div>
          </div>
          
        </div>

      </div>
    </section>
  );
}
