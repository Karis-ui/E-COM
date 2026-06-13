import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { productsAPI } from '../api/products';
import FlashSaleSection from '../components/home/FlashSaleSection';
import ProductCard from '../components/product/ProductCard';
import { MOCK_PRODUCTS, ALL_MOCK_PRODUCTS } from '../utils/mockProducts';
import Caurosel from '../components/home/Caurosel';
import {
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  TrendingUp,
  Clock,
  Zap,
  Award,
  Shield,
  Truck,
  Headphones,
  Cpu,
  Wifi,
  Server,
  Router,
  HardDrive,
  Monitor,
  Smartphone,
  Watch,
  Gamepad2,
  Sparkles,
  ChevronRight,
  Infinity,
  Rocket,
  Flame,
  Gift,
  Star,
  User2,
  HelpCircle,
  FileText,
  Heart,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  LogIn,
  LayoutDashboard,
  ShieldX
} from 'lucide-react';
import { useSelector } from 'react-redux';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    { id: 'all', name: 'All Products', icon: Cpu, count: ALL_MOCK_PRODUCTS.length },
    { id: 'smartphones', name: 'Smartphones', icon: Smartphone, count: MOCK_PRODUCTS.smartphones.length },
    { id: 'laptops', name: 'Computing', icon: Monitor, count: MOCK_PRODUCTS.laptops.length },
    { id: 'networking', name: 'Networking', icon: Router, count: MOCK_PRODUCTS.networking.length },
    { id: 'power', name: 'Power & Chargers', icon: Zap, count: MOCK_PRODUCTS.power.length },
    { id: 'cables', name: 'Cables & Storage', icon: HardDrive, count: MOCK_PRODUCTS.cables.length },
    { id: 'smart-home', name: 'Smart Home', icon: Wifi, count: MOCK_PRODUCTS.smartHome.length },
    { id: 'audio', name: 'Audio', icon: Headphones, count: MOCK_PRODUCTS.audio.length },
    { id: 'gaming', name: 'Gaming', icon: Gamepad2, count: MOCK_PRODUCTS.gaming.length },
    { id: 'components', name: 'Components', icon: Server, count: MOCK_PRODUCTS.components.length },
  ];

  const handleAdminClick = () => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin');
    } else {
      navigate('/admin-login');
    }
  };

  const sidebarLinks = [
    { name: 'Profile', path: '/profile', icon: User2, color: 'text-blue-600' },
    { name: 'Orders', path: '/orders', icon: ShoppingCart, color: 'text-green-600' },
    { name: 'Wishlist', path: '/wishlist', icon: Heart, color: 'text-red-600' },
    { name: 'Shopping Cart', path: '/cart', icon: ShoppingCart, color: 'text-yellow-600' },
    { name: 'Checkout', path: '/checkout', icon: CreditCard, color: 'text-purple-600' },
    { name: 'Track Order', path: '/track-order', icon: MapPin, color: 'text-orange-600' },
    { name: 'Support', path: '/support', icon: HelpCircle, color: 'text-pink-600' },
    { name: 'Settings', path: '/settings', icon: Settings, color: 'text-teal-600' },
  ];

  const loadMoreProducts = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    if (page === 1) {
      if (selectedCategory === 'all') {
        setProducts(ALL_MOCK_PRODUCTS.slice(0, 24));
      } else {
        const categoryMap = {
          smartphones: MOCK_PRODUCTS.smartphones,
          laptops: MOCK_PRODUCTS.laptops,
          networking: MOCK_PRODUCTS.networking,
          power: MOCK_PRODUCTS.power,
          cables: MOCK_PRODUCTS.cables,
          'smart-home': MOCK_PRODUCTS.smartHome,
          audio: MOCK_PRODUCTS.audio,
          gaming: MOCK_PRODUCTS.gaming,
          components: MOCK_PRODUCTS.components,
        };
        setProducts(categoryMap[selectedCategory] || ALL_MOCK_PRODUCTS);
        setHasMore(false);
        setIsLoading(false);
        return;
      }
    }

    setTimeout(() => {
      const allProducts = selectedCategory === 'all' ? ALL_MOCK_PRODUCTS :
        (MOCK_PRODUCTS[selectedCategory] || ALL_MOCK_PRODUCTS);

      const start = (page - 1) * 24;
      const end = start + 24;
      const newProducts = allProducts.slice(start, end);

      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
        setPage(prev => prev + 1);
      }
      setIsLoading(false);
    }, 500);
  }, [page, hasMore, isLoading, selectedCategory]);

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    loadMoreProducts();
  }, [selectedCategory]);

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMoreProducts();
    }
  }, [inView, hasMore, isLoading, loadMoreProducts]);

  const SectionHeader = ({ icon: Icon, title, highlight, color = 'primary', linkText, linkTo }) => (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-3 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          {title} <span className={`text-${color}-600`}>{highlight}</span>
        </h2>
      </div>
      {linkTo && (
        <Link to={linkTo} className={`text-${color}-600 hover:text-${color}-700 text-sm font-medium flex items-center gap-1 mt-3 md:mt-0`}>
          {linkText} <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-800 text-white text-xs py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-4">
            <span>⚡ Electronics & Networking Store</span>
            <span>|</span>
            <span>🚚 Free Shipping on Orders over KSh 3,000</span>
            <span>|</span>
            <span>🔒 100% Secure Payment</span>
          </div>
          <div className="flex gap-4">
            <Link to="/track-order" className="hover:text-primary-400">Track Order</Link>
            <Link to="/support" className="hover:text-primary-400">Support</Link>
            <Link to="/sell" className="hover:text-primary-400">Sell on K-TECH</Link>
          </div>
        </div>
      </div>

      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary-600">K-TECH</h1>
              <p className="text-[10px] text-gray-500 -mt-1">Electronics & Networking</p>
            </Link>

            <div className="flex-1 max-w-2xl">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search electronics, networking equipment, components..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  color='green'
                />
                <button className="bg-primary-600 text-white px-6 py-2 rounded-r-lg hover:bg-primary-700 transition">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-700 hover:text-primary-600"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link to="/account" className="text-gray-700 hover:text-primary-600">
                <User className="w-5 h-5" />
              </Link>
              <Link to="/cart" className="relative">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">0</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-28 bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Welcome Back!</h3>
                    <p className="text-sm text-primary-100">Sign in for better experience</p>
                    <div className="flex gap-2 mt-2">
                      <Link to="/login" className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition">Sign In</Link>
                      <Link to="/register" className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition">Register</Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Links</p>
                <div className="space-y-1">
                  {sidebarLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition group"
                      >
                        <Icon className={`w-5 h-5 ${link.color} group-hover:scale-110 transition`} />
                        <span className="text-sm font-medium">{link.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className='border-t border-gray-100 my-2'></div>
              <div className='p-4'>
                <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3'>Admin</p>
                {isAuthenticated && isAdmin ? (
                  <Link to="/admin" className='flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 transition group'>
                    <LayoutDashboard className='w-5 h-5 text-primary-600 group-hovers:scale-100 transition' />
                    <span className='text-sm font-medium'>Admin Dashboard</span>
                  </Link>
                ) : (
                  <button onClick={handleAdminClick} className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 transition group'>
                    <LayoutDashboard className='w-5 h-5 text-primary-600 group-hovers:scale-100 transition' />
                    <span className='text-sm font-medium'>Admin Login</span>
                    <LogIn className='w-5 h-5 text-primary-600 group-hovers:scale-100 transition' />
                  </button>
                )}
              </div>

              <div className="border-t border-gray-100 p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Need Help?</p>
                <Link to="/contact" className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition group">
                  <HelpCircle className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                  <span className="text-sm">24/7 Customer Support</span>
                </Link>
                <Link to="/faq" className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition group">
                  <FileText className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                  <span className="text-sm">FAQs</span>
                </Link>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <FlashSaleSection />
            <Caurosel />
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 my-6'>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                <Smartphone className="w-8 h-8 mb-2" />
                <h3 className="font-bold">Smartphones</h3>
                <p className="text-sm opacity-90">Latest models</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                <Monitor className="w-8 h-8 mb-2" />
                <h3 className="font-bold">Laptops</h3>
                <p className="text-sm opacity-90">Gaming & Work</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                <Router className="w-8 h-8 mb-2" />
                <h3 className="font-bold">Networking</h3>
                <p className="text-sm opacity-90">WiFi 6 & Mesh</p>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                <Headphones className="w-8 h-8 mb-2" />
                <h3 className="font-bold">Audio</h3>
                <p className="text-sm opacity-90">Premium Sound</p>
              </div>
            </div>

            <section className="py-8 bg-white rounded-2xl">
              <div className="px-4">
                <SectionHeader icon={Zap} title="Flash" highlight="Deals" color="red" linkText="View All" linkTo="/flash-deals" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {ALL_MOCK_PRODUCTS.slice(0, 12).map((product, idx) => (
                    <ProductCard key={`flash-${product._id}-${idx}`} product={product} />
                  ))}
                </div>
              </div>
            </section>

            <section className="py-8 bg-gray-100 rounded-2xl mt-6">
              <div className="px-4">
                <SectionHeader icon={Award} title="Elite" highlight="Hardware" color="yellow" linkText="View All" linkTo="/top-rated" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {ALL_MOCK_PRODUCTS.slice(12, 24).map((product, idx) => (
                    <ProductCard key={`top-${product._id}-${idx}`} product={product} />
                  ))}
                </div>
              </div>
            </section>

            <section className="py-8 bg-white rounded-2xl mt-6">
              <div className="px-4">
                <SectionHeader icon={Sparkles} title="New" highlight="Arrivals" color="green" linkText="View All" linkTo="/new-arrivals" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {ALL_MOCK_PRODUCTS.slice(24, 36).map((product, idx) => (
                    <ProductCard key={`new-${product._id}-${idx}`} product={product} />
                  ))}
                </div>
              </div>
            </section>

            <section className="py-8 bg-gray-50 rounded-2xl mt-6">
              <div className="px-4">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name}
                    </h2>
                    <p className="text-sm text-gray-500">{products.length}+ products found</p>
                  </div>
                  <select className="text-sm border rounded-lg px-3 py-1.5 bg-white">
                    <option>Best Match</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest First</option>
                    <option>Top Rated</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {products.map((product, idx) => (
                    <ProductCard key={`${product._id}-${idx}`} product={product} />
                  ))}
                </div>

                {isLoading && (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {hasMore && !isLoading && products.length > 0 && (
                  <div ref={ref} className="h-10" />
                )}
                {!hasMore && products.length > 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    — More Products Coming Soon —
                  </div>
                )}
              </div>
            </section>

            <section className="py-12 bg-white rounded-2xl mt-6">
              <div className="px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <Truck className="w-10 h-10 text-primary-600 mx-auto mb-3" />
                    <h3 className="font-semibold">Free Shipping</h3>
                    <p className="text-sm text-gray-500">On orders over KSh 5,000</p>
                  </div>
                  <div>
                    <Shield className="w-10 h-10 text-primary-600 mx-auto mb-3" />
                    <h3 className="font-semibold">Secure Payment</h3>
                    <p className="text-sm text-gray-500">100% secure transactions</p>
                  </div>
                  <div>
                    <Clock className="w-10 h-10 text-primary-600 mx-auto mb-3" />
                    <h3 className="font-semibold">Fast Delivery</h3>
                    <p className="text-sm text-gray-500">2-3 business days</p>
                  </div>
                  <div>
                    <Award className="w-10 h-10 text-primary-600 mx-auto mb-3" />
                    <h3 className="font-semibold">12-Month Warranty</h3>
                    <p className="text-sm text-gray-500">On all electronics</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-12 bg-gray-800 rounded-2xl mt-6">
              <div className="px-4 text-center">
                <h3 className="text-2xl font-bold text-white mb-3">Subscribe to our Newsletter</h3>
                <p className="text-gray-300 mb-6">Get the latest updates on new products and exclusive offers</p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="flex-1 px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <button className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition">
                    Subscribe
                  </button>
                </div>
              </div>
            </section>

            <footer className="bg-white border-t py-8 mt-6 rounded-2xl">
              <div className="px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                  <div>
                    <h3 className="font-bold mb-3">Customer Service</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li><Link to="/help">Help Center</Link></li>
                      <li><Link to="/returns">Returns & Refunds</Link></li>
                      <li><Link to="/shipping">Shipping Info</Link></li>
                      <li><Link to="/faq">FAQ</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold mb-3">About K-TECH</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li><Link to="/about">About Us</Link></li>
                      <li><Link to="/contact">Contact Us</Link></li>
                      <li><Link to="/careers">Careers</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold mb-3">Payment Methods</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">M-Pesa</span>
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">Visa</span>
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">Mastercard</span>
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">Cash on Delivery</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold mb-3">Download App</h3>
                    <p className="text-gray-600 text-xs">Coming soon to Google Play & App Store</p>
                    <div className="flex gap-2 mt-3">
                      <span className="px-3 py-1 bg-gray-100 rounded text-xs">iOS</span>
                      <span className="px-3 py-1 bg-gray-100 rounded text-xs">Android</span>
                    </div>
                  </div>
                </div>
                <div className="text-center text-xs text-gray-400 pt-8 mt-8 border-t">
                  © 2024 K-TECH Electronics & Networking. All rights reserved.
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl lg:hidden overflow-y-auto"
          >
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-5 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold">Welcome Back!</p>
                    <div className="flex gap-2 mt-1">
                      <Link to="/login" className="text-xs bg-white/20 px-2 py-0.5 rounded">Sign In</Link>
                      <Link to="/register" className="text-xs bg-white/20 px-2 py-0.5 rounded">Register</Link>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsSidebarOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Links</p>
              <div className="space-y-1">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Icon className={`w-5 h-5 ${link.color}`} />
                      <span className="text-sm font-medium">{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Need Help?</p>
              <Link to="/contact" className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition">
                <HelpCircle className="w-5 h-5 text-gray-400" />
                <span className="text-sm">Customer Support</span>
              </Link>
              <Link to="/faq" className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-sm">FAQs</span>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default HomePage;