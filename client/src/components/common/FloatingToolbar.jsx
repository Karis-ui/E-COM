import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShoppingCart, Heart, MessageCircle, ArrowUp } from 'lucide-react';

const FloatingToolbar = () => {
  const [showTop, setShowTop] = useState(false);
  const { totalItems } = useSelector((state) => state.cart);

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[90] flex flex-col gap-1 pr-2">

      <Link to="/support" className="group relative bg-white w-12 h-12 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_5px_20px_rgba(0,0,0,0.2)] flex items-center justify-center text-gray-700 hover:text-[var(--color-deal)] transition-all border border-gray-100 mb-2">
        <MessageCircle className="w-5 h-5" />
        <div className="absolute right-full mr-2 px-3 py-1 bg-gray-900 text-white text-[12px] rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
          Live Chat
        </div>
      </Link>

      <Link to="/cart" className="group relative bg-gradient-to-b from-gray-50 to-white w-12 h-12 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.1)] flex items-center justify-center text-gray-700 hover:text-[var(--color-deal)] transition-all border border-gray-100">
        <ShoppingCart className="w-5 h-5" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-[var(--color-deal)] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
        <div className="absolute right-full mr-2 px-3 py-1 bg-gray-900 text-white text-[12px] rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
          Cart
        </div>
      </Link>

      <Link to="/wishlist" className="group relative bg-gradient-to-b from-gray-50 to-white w-12 h-12 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.1)] flex items-center justify-center text-gray-700 hover:text-[var(--color-deal)] transition-all border border-gray-100 mt-2">
        <Heart className="w-5 h-5" />
        <div className="absolute right-full mr-2 px-3 py-1 bg-gray-900 text-white text-[12px] rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
          Wishlist
        </div>
      </Link>

      <button
        onClick={scrollToTop}
        className={`group relative bg-white w-12 h-12 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.1)] flex items-center justify-center text-gray-700 hover:text-[var(--color-deal)] transition-all border border-gray-100 mt-8 ${showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <ArrowUp className="w-5 h-5" />
        <div className="absolute right-full mr-2 px-3 py-1 bg-gray-900 text-white text-[12px] rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
          Back to top
        </div>
      </button>

    </div>
  );
};

export default FloatingToolbar;
