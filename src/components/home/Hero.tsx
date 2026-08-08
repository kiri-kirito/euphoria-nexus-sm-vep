"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const SHOWCASE_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&h=900&fit=crop&q=85",
    label: "Gaming Setup",
    category: "electronics"
  },
  {
    src: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=900&fit=crop&q=85",
    label: "Fashion",
    category: "fashion"
  },
  {
    src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=900&fit=crop&q=85",
    label: "Footwear",
    category: "footwear"
  },
  {
    src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=900&fit=crop&q=85",
    label: "Audio",
    category: "audio"
  },
  {
    src: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=900&fit=crop&q=85",
    label: "Tech & Office",
    category: "tech"
  },
  {
    src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=900&fit=crop&q=85",
    label: "Accessories",
    category: "accessories"
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
  const router = useRouter();
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
    <section className="relative overflow-hidden rounded-2xl my-6 mx-4 sm:mx-6 lg:mx-8 shadow-2xl h-[520px] lg:h-[600px]">

      {/* ── Animated Space / Earth Background ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Base space image — very slow zoom+pan */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1800&q=80')",
            animation: "spacePan 60s ease-in-out infinite alternate",
          }}
        />
        {/* Earth horizon overlay at bottom — slow pan */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[65%] bg-cover bg-bottom opacity-60"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1600&q=80')",
            animation: "earthPan 80s ease-in-out infinite alternate",
            maskImage: "linear-gradient(to top, rgba(0,0,0,1) 30%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 30%, transparent 100%)",
          }}
        />
        {/* Atmosphere glow at horizon */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-blue-900/40 via-blue-600/10 to-transparent" />
        {/* Dark top vignette so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/50" />

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spacePan {
            0%   { transform: scale(1.05) translate(0px, 0px); }
            100% { transform: scale(1.12) translate(-2%, 1%); }
          }
          @keyframes earthPan {
            0%   { transform: scale(1) translate(0, 0); }
            100% { transform: scale(1.06) translate(1%, -1%); }
          }
        ` }} />
      </div>

      {/* ── Content Row ── */}
      <div className="relative z-10 flex flex-col lg:flex-row h-full">

        {/* Left — Text */}
        <div className="flex-1 flex flex-col justify-center px-6 lg:px-16 py-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-8 w-fit shadow-lg shadow-black/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            500+ Local Sellers Online
          </div>

          {/* Fixed-height slide zone — prevents height jump */}
          <div className="relative h-[260px] lg:h-[300px]">
            {TEXT_SLIDES.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  idx === currentTextSlide && contentVisible
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-4 pointer-events-none"
                }`}
              >
                <h1 className="text-4xl md:text-5xl lg:text-[52px] font-extrabold text-white tracking-tight leading-[1.1] mb-5">
                  {slide.title}
                </h1>
                <p className="text-base md:text-lg text-slate-300 mb-8 max-w-lg leading-relaxed font-light">
                  {slide.description}
                </p>
                <Link
                  href={slide.actionLink}
                  className="inline-block px-10 py-4 rounded-full bg-primary/90 backdrop-blur-md border border-white/20 hover:bg-primary text-white font-bold text-lg shadow-[0_0_24px_rgba(79,70,229,0.5)] transition-all hover:scale-105 active:scale-95"
                >
                  {slide.actionText}
                </Link>
              </div>
            ))}
          </div>

          {/* Dots — centered below text zone */}
          <div className="flex items-center gap-3 mt-6">
            {SHOWCASE_IMAGES.map((img, i) => (
              <button
                key={i}
                onClick={() => { setContentVisible(false); setTimeout(() => { setCurrent(i); setContentVisible(true); }, 400); }}
                className={`transition-all duration-500 rounded-full h-2 ${
                  i === current
                    ? "w-8 bg-primary shadow-[0_0_10px_rgba(79,70,229,0.8)]"
                    : "w-2 bg-white/25 hover:bg-white/60"
                }`}
                aria-label={`Show ${img.label}`}
              />
            ))}
          </div>
        </div>

        {/* Right — Full-bleed image, clickable → category */}
        <div
          className="hidden lg:block relative w-[380px] xl:w-[460px] flex-shrink-0 overflow-hidden cursor-pointer group"
          onClick={() => router.push(`/explore?category=${SHOWCASE_IMAGES[current].category}`)}
        >
          {/* Left-edge blend into space bg */}
          <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-black/60 to-transparent z-10 pointer-events-none" />
          {/* Top and bottom blends */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent z-10 pointer-events-none" />

          {/* Product images — crossfade */}
          {SHOWCASE_IMAGES.map((img, i) => (
            <img
              key={i}
              src={img.src}
              alt={img.label}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1500ms] ease-in-out ${
                i === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
            />
          ))}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300 z-20" />

          {/* Category label + "Explore" hint */}
          <div className="absolute bottom-6 left-0 right-6 flex items-end justify-between z-30 px-6">
            <span
              className={`text-white font-bold text-xl drop-shadow-lg transition-all duration-700 ${
                contentVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`}
            >
              {SHOWCASE_IMAGES[current].label}
            </span>
            <span className="bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Explore Category →
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
