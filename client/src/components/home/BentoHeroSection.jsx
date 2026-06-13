import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Zap, Shield, Truck, UserCircle, Star, Sparkles, Monitor, Smartphone, Headphones, Gamepad, Watch, Camera } from 'lucide-react';

const categories = [
  { name: "Smartphones & Tablets", icon: <Smartphone className="w-5 h-5" />, path: "/shop?category=smartphones" },
  { name: "Laptops & Displays", icon: <Monitor className="w-5 h-5" />, path: "/shop?category=laptops" },
  { name: "Audio & Headphones", icon: <Headphones className="w-5 h-5" />, path: "/shop?category=headphones" },
  { name: "Gaming & VR", icon: <Gamepad className="w-5 h-5" />, path: "/shop?category=gaming" },
  { name: "Smart Watches", icon: <Watch className="w-5 h-5" />, path: "/shop?category=watches" },
  { name: "Cameras & Drones", icon: <Camera className="w-5 h-5" />, path: "/shop?category=cameras" },
];

const carouselSlides = [
  {
    id: 1,
    title: "Next-Gen Gaming Consoles",
    subtitle: "PERFORMANCE UNLEASHED",
    description: "Experience ultra high-speed SSDs and deep immersion with haptic feedback.",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=1200&fit=crop",
    colors: "from-blue-600/20 to-purple-900/40",
    glow: "primary-500",
  },
  {
    id: 2,
    title: "Pro Creator Laptops",
    subtitle: "UNCOMPROMISED POWER",
    description: "M-Series chips & RTX graphics for seamless rendering.",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1200&fit=crop",
    colors: "from-gray-800/40 to-black/60",
    glow: "gray-500",
  },
  {
    id: 3,
    title: "Premium Spatial Audio",
    subtitle: "HEAR THE UNSEEN",
    description: "Industry-leading noise cancellation and 360 audio.",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1200&fit=crop",
    colors: "from-red-900/30 to-black/40",
    glow: "red-500",
  }
];

const BentoHeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 relative z-10">

        <div className="hidden lg:flex flex-col w-72 shrink-0 bg-[#0a0a0a]/80 backdrop-blur-xl rounded-[24px] border border-white/5 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
          <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary-500 animate-glow" />
            <h3 className="font-bold text-white tracking-widest uppercase text-sm">Tech Categories</h3>
          </div>
          <div className="py-3 flex-1 flex flex-col">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                to={cat.path}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-white/5 transition-all group border-l-2 border-transparent hover:border-primary-500"
              >
                <div className="flex items-center gap-4">
                  <div className="text-gray-400 group-hover:text-primary-400 transition-colors">
                    {cat.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{cat.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-primary-500 transform group-hover:translate-x-1 transition-all" />
              </Link>
            ))}

            <div className="mt-auto px-6 py-4 border-t border-white/5">
              <Link to="/shop?sale=true" className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl transition-colors border border-white/10 group cursor-pointer">
                <span className="text-sm font-bold tracking-wider">VIEW ALL</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Center: Main Carousel */}
        <div className="flex-1 rounded-[24px] overflow-hidden relative h-[450px] lg:h-[550px] group shadow-[0_8px_30px_rgb(0,0,0,0.5)] bg-[#050505] border border-white/5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <img
                src={carouselSlides[currentSlide].image}
                alt={carouselSlides[currentSlide].title}
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${carouselSlides[currentSlide].colors}`} />
              <div className="absolute inset-0 bg-black/40" />

              <div className="relative z-10 h-full flex flex-col justify-center p-8 md:p-14">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 mb-4"
                >
                  <span className="w-8 h-px bg-primary-500"></span>
                  <span className={`text-${carouselSlides[currentSlide].glow} text-xs font-black tracking-[0.3em] uppercase drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]`}>
                    {carouselSlides[currentSlide].subtitle}
                  </span>
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 max-w-2xl leading-[1.1] tracking-tight drop-shadow-xl"
                >
                  {carouselSlides[currentSlide].title}
                </motion.h2>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-gray-300 mb-10 max-w-lg leading-relaxed font-light"
                >
                  {carouselSlides[currentSlide].description}
                </motion.p>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-primary-500 hover:text-white transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]"
                  >
                    Explore Now <ChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <button
            onClick={() => setCurrentSlide(prev => (prev - 1 + carouselSlides.length) % carouselSlides.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide(prev => (prev + 1) % carouselSlides.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 hover:scale-110"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Status Bars */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
            {carouselSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 overflow-hidden ${currentSlide === idx ? "w-12 bg-white/20" : "w-6 bg-white/10"}`}
              >
                {currentSlide === idx && (
                  <motion.div
                    layoutId="progress"
                    className="h-full bg-primary-500 shadow-[0_0_10px_#3b82f6]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Gamified / Offers Widget */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">

          {/* Neon Welcome Card */}
          <div className="bg-[#0a0a0a]/80 backdrop-blur-xl p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/5 flex flex-col items-center flex-1 relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
            <div className="relative z-10 text-center flex flex-col items-center w-full h-full justify-center">
              <div className="relative mb-4 neon-glow">
                <div className="w-16 h-16 bg-[#111] border border-white/10 rounded-2xl flex items-center justify-center text-primary-400 group-hover:border-primary-500/50 transition-colors shadow-inner">
                  <UserCircle className="w-8 h-8" />
                </div>
              </div>
              <h3 className="font-bold text-white text-lg tracking-wide">K-TECH ELITE</h3>
              <p className="text-xs text-gray-400 mt-2 mb-6">Unlock exclusive tech drops & perks</p>

              <div className="flex gap-3 w-full mt-auto">
                <Link to="/login" className="flex-1 bg-primary-600 hover:bg-primary-500 text-white py-3 rounded-xl font-bold text-xs tracking-widest transition-all text-center shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] uppercase">
                  Join Now
                </Link>
              </div>
            </div>
          </div>

          {/* Cyber Deal Banner */}
          <div className="bg-black p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/10 text-white flex-1 relative overflow-hidden group hover:border-red-500/50 transition-colors cursor-pointer">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity group-hover:scale-105 group-hover:opacity-40 transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90" />

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-500 border border-red-500/30 text-[10px] font-black tracking-widest uppercase rounded">Cyber Drop</span>
                </div>
                <p className="text-2xl font-black leading-none drop-shadow-md">NVIDIA RTX <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 text-5xl">4090</span></p>
              </div>
              <Link to="/shop" className="mt-6 flex items-center justify-between text-xs font-bold tracking-widest uppercase text-gray-300 group-hover:text-red-400 transition-colors">
                Claim Offer <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {/* Scanner line effect */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500/50 shadow-[0_0_10px_red] -translate-y-full group-hover:translate-y-[200px] transition-transform duration-1000 ease-in-out" />
          </div>

        </div>
      </div>

      {/* Neo Trust Bar */}
      <div className="max-w-7xl mx-auto mt-8 bg-[#0a0a0a]/80 backdrop-blur-xl px-8 py-5 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-6 shadow-xl relative z-10">
        <div className="flex items-center gap-3 text-sm font-bold text-gray-300 tracking-wider">
          <div className="p-2 rounded-lg bg-green-500/10"><Shield className="w-5 h-5 text-green-500" /></div> SECURE CHECKOUT
        </div>
        <div className="hidden sm:block w-px h-8 bg-white/10" />
        <div className="flex items-center gap-3 text-sm font-bold text-gray-300 tracking-wider">
          <div className="p-2 rounded-lg bg-primary-500/10"><Truck className="w-5 h-5 text-primary-500" /></div> EXPRESS DELIVERY
        </div>
        <div className="hidden md:block w-px h-8 bg-white/10" />
        <div className="flex items-center gap-3 text-sm font-bold text-gray-300 tracking-wider">
          <div className="p-2 rounded-lg bg-yellow-500/10"><Sparkles className="w-5 h-5 text-yellow-500" /></div> OFFICIAL WARANTY
        </div>
        <div className="hidden lg:block w-px h-8 bg-white/10" />
        <div className="flex items-center gap-3 text-sm font-bold text-gray-300 tracking-wider">
          <div className="p-2 rounded-lg bg-indigo-500/10"><Star className="w-5 h-5 text-indigo-500" /></div> 24/7 EXPERT SUPPORT
        </div>
      </div>
    </div>
  );
};

export default BentoHeroSection;
