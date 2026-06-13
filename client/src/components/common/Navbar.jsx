// src/components/common/Navbar.jsx - CLEAN VERSION

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  Heart,
  Settings,
  Shield,
  Search,
  Zap,
  LayoutDashboard,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../../store/slices/authSlice';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);

  const { totalItems } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Deals', path: '/deals' },
    { name: 'Track Order', path: '/track-order' },
  ];

  return (
    <>
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white text-center py-3 text-sm font-medium">
        <div className="container mx-auto px-4">
          🔥 FREE DELIVERY on orders over KSh 3,000 | 12-Month Warranty | Price Match Guarantee
        </div>
      </div>

      <nav className={`sticky top-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-white/95 backdrop-blur-xl shadow-2xl'
        : 'bg-white/90 backdrop-blur-md'
        }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-shrink-0"
            >
              <Link to="/" className="group">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                      K-TECH ELECTRONICS AND INDUSTRIES
                    </span>
                    <p className="text-[10px] text-gray-500 -mt-1">Electronics & Networking</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl transition-all duration-300 ${location.pathname === link.path
                    ? 'bg-primary-50 text-primary-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-primary-600'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:flex p-2 rounded-xl hover:bg-gray-100 transition"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>

              <Link to="/cart" className="relative group">
                <div className="p-2 rounded-xl hover:bg-gray-100 transition">
                  <ShoppingBag className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition" />
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                    >
                      {totalItems > 99 ? '99+' : totalItems}
                    </motion.span>
                  )}
                </div>
              </Link>

              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                      {user?.first_name?.[0] || user?.email?.[0] || user?.phone?.[0] || 'U'}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="px-4 py-4 bg-gradient-to-r from-primary-50 to-white border-b border-gray-100">
                          <p className="font-bold text-gray-800">{user?.first_name} {user?.last_name}</p>
                          <p className="text-sm text-gray-500 mt-0.5">{user?.email || user?.phone}</p>
                        </div>
                        <div className="py-2">
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <User className="w-4 h-4 text-gray-400" />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            to="/orders"
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Package className="w-4 h-4 text-gray-400" />
                            <span>My Orders</span>
                          </Link>
                          <Link
                            to="/wishlist"
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Heart className="w-4 h-4 text-gray-400" />
                            <span>Wishlist</span>
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4 text-gray-400" />
                            <span>Settings</span>
                          </Link>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 transition"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-primary-600 px-3 py-2 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              <button
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed inset-0 z-[100] bg-white/98 backdrop-blur-md"
          >
            <div className="container mx-auto px-4 py-20">
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute top-8 right-8 p-2 rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-8">What are you looking for?</h2>
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for phones, laptops, accessories..."
                      className="w-full px-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 outline-none transition"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-3 bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700 transition"
                    >
                      Search
                    </button>
                  </div>
                </form>

                <div className="mt-8 text-center text-gray-500">
                  <p>Popular: iPhone, Samsung, Laptop, Headphones</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 overflow-hidden shadow-lg"
          >
            <div className="container mx-auto px-4 py-6">
              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </form>

              {[
                { name: 'Home', path: '/' },
                { name: 'Shop', path: '/shop' },
                { name: 'Deals', path: '/deals' },
                { name: 'Track Order', path: '/track-order' },
                { name: 'About', path: '/about' },
                { name: 'Contact', path: '/contact' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block py-3 text-gray-700 hover:text-primary-600 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <div className="border-t border-gray-100 my-3"></div>

              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="block py-3 text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>
                    Profile
                  </Link>
                  <Link to="/orders" className="block py-3 text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>
                    Orders
                  </Link>
                  <Link to="/wishlist" className="block py-3 text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>
                    Wishlist
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-3 text-red-600 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="block w-full text-center py-3 border border-primary-600 text-primary-600 rounded-xl font-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-center bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;