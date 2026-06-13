import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  Zap,
  ChevronRight,
  Gift,
  Ticket,
  Percent,
  TrendingUp,
  Package,
  Headphones,
  Smartphone,
  Watch,
  Shirt,
  Gem,
  Car,
  Tv,
  Dumbbell,
  Sparkles,
  Flame,
  Laptop,
  Laptop2,
  RouterIcon,
  SmartphoneCharging,
  Gamepad2,
  LucideGamepad2
} from 'lucide-react';

const FlashSaleSection = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 48,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 48);

    const timer = setInterval(() => {
      const now = new Date();
      const diff = endTime - now;

      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const categories = [
    {
      name: 'Consumer Electronics',
      icon: Smartphone,
      image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200&h=200&fit=crop',
      color: 'from-blue-500 to-blue-600',
      count: '2,345',
      deals: 'Today',
      bg: 'bg-blue-500'
    },
    {
      name: 'Smart Watches',
      icon: Watch,
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&h=200&fit=crop',
      color: 'from-green-500 to-green-600',
      count: '567',
      deals: 'New',
      bg: 'bg-green-500'
    },
    {
      name: 'Gaming Laptops',
      icon: LucideGamepad2,
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=200&h=200&fit=crop',
      color: 'from-pink-500 to-pink-600',
      count: '3,421',
      deals: 'Flash',
      bg: 'bg-pink-500'
    },
    {
      name: 'Computers & Office',
      icon: Laptop2,
      image: 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=200&h=200&fit=crop',
      color: 'from-yellow-500 to-yellow-600',
      count: '892',
      deals: 'Trending',
      bg: 'bg-yellow-500'
    },
    {
      name: 'Routers',
      icon: RouterIcon,
      image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=200&h=200&fit=crop',
      color: 'from-red-500 to-red-600',
      count: '234',
      deals: 'Hot',
      bg: 'bg-red-500'
    },
    {
      name: 'Smart Phones',
      icon: SmartphoneCharging,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
      color: 'from-purple-500 to-purple-600',
      count: '1,567',
      deals: 'Live',
      bg: 'bg-purple-500'
    },
    {
      name: 'Gaming Accessories',
      icon: Gamepad2,
      image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=200&h=200&fit=crop',
      color: 'from-orange-500 to-orange-600',
      count: '2,103',
      deals: 'Sale',
      bg: 'bg-orange-500'
    },
    {
      name: 'TV & Home Theater',
      icon: Tv,
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&h=200&fit=crop',
      color: 'from-indigo-500 to-indigo-600',
      count: '789',
      deals: 'Limited',
      bg: 'bg-indigo-500'
    },
  ];

  const hotDeals = [
    { name: 'iPhone 15 Pro Max', price: 'KSh 299,999', original: 'KSh 349,999', discount: '-14%', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&h=200&fit=crop', sold: '1.2k' },
    { name: 'Samsung Galaxy S24', price: 'KSh 219,999', original: 'KSh 259,999', discount: '-15%', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop', sold: '892' },
    { name: 'MacBook Pro M3', price: 'KSh 429,999', original: 'KSh 489,999', discount: '-12%', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop', sold: '567' },
    { name: 'Sony WH-1000XM5', price: 'KSh 44,999', original: 'KSh 54,999', discount: '-18%', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=200&h=200&fit=crop', sold: '2.3k' },
    { name: 'iPad Pro 12.9"', price: 'KSh 174,999', original: 'KSh 199,999', discount: '-12%', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200&h=200&fit=crop', sold: '1.1k' },
    { name: 'Apple Watch Ultra', price: 'KSh 109,999', original: 'KSh 129,999', discount: '-15%', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&h=200&fit=crop', sold: '789' },
  ];

  const coupons = [
    { code: 'SAVE50', discount: 'KSh 500 OFF', minOrder: 'KSh 5,000+', color: 'from-red-500 to-red-600' },
    { code: 'SAVE100', discount: 'KSh 1,000 OFF', minOrder: 'KSh 10,000+', color: 'from-orange-500 to-orange-600' },
    { code: 'SAVE200', discount: 'KSh 2,000 OFF', minOrder: 'KSh 20,000+', color: 'from-yellow-500 to-yellow-600' },
  ];

  return (
    <div className="w-full">
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                <span className="font-semibold text-red-600">Flash Sale</span>
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <span className="text-gray-700">Top Ranking</span>
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700">Fast customization</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500">Ends in:</span>
                <div className="flex gap-1">
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded text-sm font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-red-600">:</span>
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded text-sm font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-red-600">:</span>
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded text-sm font-mono">{String(timeLeft.seconds).padStart(2, '0')}</span>
                </div>
              </div>
              <Link to="/flash-deals" className="text-red-600 text-sm hover:underline flex items-center gap-1">
                Shop Now <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-6">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4 mb-8 flex flex-wrap justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 w-10 h-10 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Request for Quotation</h3>
                <p className="text-sm text-gray-600">Get best prices from verified suppliers</p>
              </div>
            </div>
            <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition text-sm font-medium">
              Submit RFQ
            </button>
          </div>

          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Categories for you</h2>
              <Link to="/categories" className="text-primary-600 text-sm hover:underline flex items-center gap-1">
                View more <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {categories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-white border border-gray-100 rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="relative h-28 overflow-hidden">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-60 group-hover:opacity-70 transition`}></div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className={`w-8 h-8 ${cat.bg} rounded-full flex items-center justify-center mb-1 shadow-lg`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-white font-bold text-sm drop-shadow-md">{cat.name}</p>
                        <p className="text-white/90 text-xs">{cat.count} products</p>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-lg">
                          {cat.deals}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Frequently searched</h2>
              <Link to="/trending" className="text-primary-600 text-sm hover:underline">View all →</Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {['iPhone 15 Pro', 'Samsung S24', 'PS5', 'MacBook', 'AirPods', 'Smart Watch', 'Gaming Laptop', 'Wireless Headphones', '4K TV', 'Drone', 'Action Camera', 'Tablet'].map((item, idx) => (
                <Link
                  key={idx}
                  to={`/search?q=${encodeURIComponent(item)}`}
                  className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-primary-100 hover:text-primary-600 transition"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                <h2 className="text-xl font-bold text-gray-800">Hot Deals</h2>
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">Limited Time</span>
              </div>
              <Link to="/hot-deals" className="text-primary-600 text-sm hover:underline">View All →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {hotDeals.map((deal, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition group"
                >
                  <div className="relative">
                    <img src={deal.image} alt={deal.name} className="w-full h-36 object-cover group-hover:scale-105 transition duration-300" />
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                      {deal.discount}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded backdrop-blur-sm">
                      🔥 {deal.sold} sold
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2">{deal.name}</h3>
                    <div className="mt-2">
                      <span className="text-lg font-bold text-red-600">{deal.price}</span>
                      <span className="text-xs text-gray-400 line-through ml-2">{deal.original}</span>
                    </div>
                    <button className="mt-3 w-full bg-gray-100 text-gray-700 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-600 hover:text-white transition">
                      Shop Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-green-500" />
                <h2 className="text-xl font-bold text-gray-800">Grab Coupons</h2>
              </div>
              <Link to="/coupons" className="text-primary-600 text-sm hover:underline">View All →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {coupons.map((coupon, idx) => (
                <div key={idx} className={`bg-gradient-to-r ${coupon.color} rounded-xl p-4 text-white relative overflow-hidden group cursor-pointer`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition"></div>
                  <div className="relative z-10">
                    <div className="text-2xl font-bold">{coupon.discount}</div>
                    <div className="text-white/80 text-sm mt-1">Orders {coupon.minOrder}</div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-mono">{coupon.code}</span>
                      <button className="text-white/80 text-xs hover:text-white transition">📋 Copy</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashSaleSection;
