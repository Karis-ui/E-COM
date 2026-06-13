import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, CreditCard, Shield, Truck, Headphones } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const quickLinks = [
    { name: "Home", to: "/" },
    { name: "Track Order", to: "/track-order" },
    { name: "Returns Policy", to: "/returns" },
    { name: "Contact Us", to: "/contact" },
    { name: "About Us", to: "/about" },
    { name: "FAQ", to: "/faq" },
  ];

  const categories = [
    { name: "Smartphones", to: "/shop?category=smartphones" },
    { name: "Laptops", to: "/shop?category=laptops" },
    { name: "Tablets", to: "/shop?category=tablets" },
    { name: "Accessories", to: "/shop?category=accessories" },
    { name: "Audio", to: "/shop?category=audio" },
    { name: "Wearables", to: "/shop?category=wearables" },
  ];

  const paymentMethods = [
    { name: "M-Pesa", icon: '📱' },
    { name: "Visa", icon: <CreditCard className='w-6 h-6' /> },
    { name: "MasterCard", icon: <CreditCard className='w-6 h-6' /> },
    { name: "PayPal", icon: <CreditCard className='w-6 h-6' /> },
    { name: "Cash on Delivery", icon: '💵' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Subscribe to our Newsletter</h3>
              <p className="text-gray-400">Get the latest updates on new products and upcoming sales</p>
            </div>
            <div className="flex gap-4">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-white"
              />
              <button className="bg-primary-600 hover:bg-primary-700 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">K.Tech Electronics and Industries</h3>
            <p className="text-gray-400 mb-4">
              Your trusted electronics retailer in Kenya. Quality products, competitive prices(affordable), fast delivery, and excellent customer service.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-500" />
                <span>+254 727 537 684</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-500" />
                <span>support@k_tech.co.ke</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary-500" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="hover:text-primary-500 transition">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat.name}>
                  <Link to={cat.path} className="hover:text-primary-500 transition">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">We Accept</h3>
            <div className="flex flex-wrap gap-3 mb-6">
              {paymentMethods.map(method => (
                <div key={method.name} className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg">
                  <span className="text-xl">{method.icon}</span>
                  <span className="text-sm">{method.name}</span>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-800">
          <div className="flex items-center gap-4">
            <Truck className="w-10 h-10 text-primary-500" />
            <div>
              <h4 className="font-semibold text-white">Free Delivery</h4>
              <p className="text-sm text-gray-400">On orders over KSh 3,000</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Shield className="w-10 h-10 text-primary-500" />
            <div>
              <h4 className="font-semibold text-white">Secure Payment</h4>
              <p className="text-sm text-gray-400">100% secure transactions</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Headphones className="w-10 h-10 text-primary-500" />
            <div>
              <h4 className="font-semibold text-white">24/7 Support</h4>
              <p className="text-sm text-gray-400">Dedicated customer service</p>
            </div>
          </div>
        </div>

        <div className="text-center pt-8 mt-8 border-t border-gray-800">
          <p className="text-gray-400">
            &copy; {currentYear} K-Tech Electronics and Industries. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;