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
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
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
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
          Nexus.
        </span>
        <br className="hidden lg:block" />
        The Next-Generation{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
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
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
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
    <section className="relative overflow-hidden rounded-2xl my-6 mx-4 sm:mx-6 lg:mx-8 shadow-2xl h-[520px] lg:h-[600px] bg-[#020617]">

      {/* ── Animated Space & Earth Horizon Background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        
        {/* Layer 1: Deep Cosmos Starfield with slow continuous panning */}
        <div
          className="absolute -inset-[30%] w-[160%] h-[160%] bg-cover bg-center opacity-70"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1800&q=80')",
            animation: "cosmosOrbit 45s linear infinite alternate",
          }}
        />

        {/* Layer 2: Earth Horizon Curve with glowing atmosphere light burst (Matches reference image) */}
        <div
          className="absolute -bottom-10 -left-10 w-[120%] h-[110%] bg-contain bg-left-bottom bg-no-repeat opacity-90 mix-blend-screen"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1800&q=80')",
            animation: "earthAtmosphereFloat 25s ease-in-out infinite alternate",
          }}
        />

        {/* Layer 3: Dynamic Pulsing Atmospheric Blue Light Flare */}
        <div 
          className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-gradient-to-tr from-cyan-500/40 via-blue-600/20 to-transparent rounded-full blur-[100px]"
          style={{ animation: 'atmospherePulse 6s ease-in-out infinite alternate' }}
        />

        {/* Top/Right vignetting to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40" />

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes cosmosOrbit {
            0% { transform: scale(1) translate(0px, 0px) rotate(0deg); }
            50% { transform: scale(1.08) translate(-3%, -2%) rotate(1deg); }
            100% { transform: scale(1.15) translate(-5%, -4%) rotate(-1deg); }
          }
          @keyframes earthAtmosphereFloat {
            0% { transform: scale(1) translate(0px, 0px); }
            100% { transform: scale(1.05) translate(15px, -10px); }
          }
          @keyframes atmospherePulse {
            0% { opacity: 0.5; transform: scale(0.95); }
            100% { opacity: 0.9; transform: scale(1.1); }
          }
        ` }} />
      </div>

      {/* ── Main Content Grid ── */}
      <div className="relative z-10 flex flex-col lg:flex-row h-full">

        {/* Left — Text Content Section */}
        <div className="flex-1 flex flex-col justify-center px-6 lg:px-16 py-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-8 w-fit shadow-lg shadow-black/30">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            500+ Local Sellers Online
          </div>

          {/* Fixed Height Container for Text Slides to stop layout jumping */}
          <div className="relative h-[260px] lg:h-[290px] w-full">
            {TEXT_SLIDES.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  idx === currentTextSlide && contentVisible
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-4 pointer-events-none"
                }`}
              >
                <h1 className="text-4xl md:text-5xl lg:text-[54px] font-extrabold text-white tracking-tight leading-[1.1] mb-5 drop-shadow-md">
                  {slide.title}
                </h1>
                <p className="text-base md:text-lg text-slate-300 mb-8 max-w-lg leading-relaxed font-light drop-shadow">
                  {slide.description}
                </p>
                <Link
                  href={slide.actionLink}
                  className="inline-block px-10 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all hover:scale-105 active:scale-95 border border-white/20"
                >
                  {slide.actionText}
                </Link>
              </div>
            ))}
          </div>

          {/* Dots Indicator - Cleanly positioned below text on the left */}
          <div className="flex items-center gap-3 mt-6">
            {SHOWCASE_IMAGES.map((img, i) => (
              <button
                key={i}
                onClick={() => { setContentVisible(false); setTimeout(() => { setCurrent(i); setContentVisible(true); }, 400); }}
                className={`transition-all duration-500 rounded-full h-2 ${
                  i === current
                    ? "w-8 bg-cyan-400 shadow-[0_0_12px_#22d3ee]"
                    : "w-2 bg-white/30 hover:bg-white/70"
                }`}
                aria-label={`Show ${img.label}`}
              />
            ))}
          </div>
        </div>

        {/* Right — Product Showcase Seamlessly Blended into Space */}
        <div
          className="hidden lg:flex relative w-[420px] xl:w-[500px] flex-shrink-0 items-center justify-center p-8 cursor-pointer group"
          onClick={() => router.push(`/explore?category=${SHOWCASE_IMAGES[current].category}`)}
        >
          {/* Radial Light Aura behind product */}
          <div className="absolute w-[360px] h-[360px] bg-cyan-500/20 rounded-full blur-[80px] group-hover:bg-cyan-500/35 transition-all duration-700" />

          {/* Product Image Container with Masked Feathered Radial Edges (NO RECTANGULAR BORDERS!) */}
          <div 
            className="relative w-full h-[400px] rounded-3xl overflow-hidden"
            style={{
              maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 85%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 85%)",
            }}
          >
            {SHOWCASE_IMAGES.map((img, i) => (
              <img
                key={i}
                src={img.src}
                alt={img.label}
                className={`absolute inset-0 w-full h-full object-cover mix-blend-lighten transition-all duration-[1500ms] ease-in-out ${
                  i === current 
                    ? "opacity-90 scale-100 blur-0" 
                    : "opacity-0 scale-110 blur-md"
                }`}
              />
            ))}

            {/* Dark vignette blending layer */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/60 mix-blend-multiply" />
          </div>

          {/* Floating Category Label Badge */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-slate-950/70 backdrop-blur-xl border border-white/15 px-6 py-3 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:border-cyan-400/50 transition-all duration-300">
            <span className="text-white text-base font-bold tracking-wide">
              {SHOWCASE_IMAGES[current].label}
            </span>
            <span className="text-cyan-400 text-xs font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Explore Category →
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
