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
        <div className="flex items-center gap-4 mb-4">
          <img src="/logo-brand.png" alt="Euphoria Nexus Logo" className="h-16 w-auto object-contain drop-shadow-lg" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Welcome to Nexus.</span>
        </div>
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
      }, 600); // 600ms fade duration
    }, 4000); // 4s slide duration
    return () => clearInterval(timer);
  }, []);

  // Use modulo for text slides so it loops if there are fewer text slides than images
  const currentTextSlide = current % TEXT_SLIDES.length;

  return (
    <section className="relative bg-slate-900 overflow-hidden rounded-2xl my-6 mx-4 sm:mx-6 lg:mx-8 shadow-2xl min-h-[420px] lg:min-h-[520px]">
      
      {/* Animated Space/Galaxy Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#0a0a1a]">
        {/* Glow */}
        <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-gradient-to-b from-primary/20 to-transparent rounded-full blur-[100px] opacity-40 animate-pulse"></div>
        
        {/* CSS Stars */}
        <div className="absolute inset-0 opacity-50">
          {/* We'll generate a few div layers with different animation speeds for parallax */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-[spin_120s_linear_infinite] opacity-30 mix-blend-screen"></div>
          <div className="absolute w-full h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent bg-[length:20px_20px] animate-[slideUp_20s_linear_infinite]"></div>
          <div className="absolute w-full h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent bg-[length:40px_40px] animate-[slideUp_15s_linear_infinite] opacity-50"></div>
        </div>

        {/* Custom Keyframes embedded for the background animation */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes slideUp {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
        `}} />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row h-full min-h-[420px] lg:min-h-[520px]">
        
        {/* Left — Text Content */}
        <div className="flex-1 flex items-center px-6 py-14 md:py-20 lg:px-12 lg:py-0">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              500+ Local Sellers Online
            </div>

            {/* Text Slide Container */}
            <div className={`transition-all duration-700 ease-in-out transform ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6 min-h-[140px] lg:min-h-[180px]">
                {TEXT_SLIDES[currentTextSlide].title}
              </h1>
              <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-lg min-h-[80px]">
                {TEXT_SLIDES[currentTextSlide].description}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href={TEXT_SLIDES[currentTextSlide].actionLink}
                  className="w-full sm:w-auto px-10 py-4 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-lg shadow-lg shadow-primary/40 transition-all hover:scale-105 active:scale-95 text-center"
                >
                  {TEXT_SLIDES[currentTextSlide].actionText}
                </Link>
              </div>
            </div>

            {/* Slide indicator dots */}
            <div className="flex items-center gap-2 mt-10">
              {SHOWCASE_IMAGES.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === current
                      ? "w-6 h-2 bg-primary"
                      : "w-2 h-2 bg-white/30 hover:bg-white/60"
                  }`}
                  aria-label={`Show ${img.label}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right — Full-height Image Slideshow */}
        <div className="hidden lg:block relative w-[420px] xl:w-[480px] flex-shrink-0 overflow-hidden">
          {/* Gradient overlay on left edge to blend with dark background */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0a0a1a] to-transparent z-10 pointer-events-none"></div>
          {/* Gradient overlay on top and bottom */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0a0a1a] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0a1a] to-transparent z-10 pointer-events-none"></div>

          {SHOWCASE_IMAGES.map((img, i) => (
            <img
              key={i}
              src={img.src}
              alt={img.label}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-2000 ease-in-out ${
                i === current ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          {/* Category label overlay */}
          <div className="absolute bottom-6 right-6 z-20">
            <span
              className={`inline-block bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 transition-all duration-500 ${
                contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              {SHOWCASE_IMAGES[current].label}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
