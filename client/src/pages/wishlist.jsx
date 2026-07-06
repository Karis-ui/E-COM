import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Star,
  X,
  AlertCircle,
  Eye,
  Share2,
  RefreshCw
} from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { wishlistAPI } from '../api/wishlist';
import { cartAPI } from '../api/cart';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      const response = await wishlistAPI.getWishlist();
      setWishlistItems(response.data);
    } catch (error) {
      toast.error('Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const moveToCart = async (product) => {
    setIsAddingToCart(true);
    try {
      await cartAPI.addToCart(product.id, 1);
      toast.success(`${product.name} added to cart!`);
      // Optionally remove from wishlist after adding to cart
      // await wishlistAPI.removeFromWishlist(product.id);
      // fetchWishlist();
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const clearWishlist = async () => {
    if (!window.confirm('Clear all items from wishlist?')) return;
    try {
      await wishlistAPI.clearWishlist();
      setWishlistItems([]);
      toast.success('Wishlist cleared');
    } catch (error) {
      toast.error('Failed to clear wishlist');
    }
  };

  const shareWishlist = async () => {
    try {
      const response = await wishlistAPI.shareWishlist();
      navigator.clipboard.writeText(response.data.share_link);
      toast.success('Wishlist link copied!');
    } catch (error) {
      toast.error('Failed to share wishlist');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <RefreshCw className="w-8 h-8 text-primary-600 animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent">
              My Wishlist
            </h1>
            <p className="text-gray-500 mt-1">{wishlistItems.length} items saved</p>
          </div>
          <div className="flex gap-3">
            {wishlistItems.length > 0 && (
              <>
                <button
                  onClick={shareWishlist}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={clearWishlist}
                  className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6">Start saving your favorite items</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
            >
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {wishlistItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group"
              >
                <div className="relative">
                  <Link to={`/product/${item.slug}`}>
                    <img
                      src={item.main_image}
                      alt={item.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/200'}
                    />
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {item.stock_quantity === 0 && (
                    <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      Out of Stock
                    </div>
                  )}
                  {item.discount_percent > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      -{item.discount_percent}%
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400">{item.brand}</span>
                    {item.average_rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-medium">{item.average_rating}</span>
                        <span className="text-xs text-gray-400">({item.total_reviews})</span>
                      </div>
                    )}
                  </div>
                  <Link to={`/product/${item.slug}`}>
                    <h3 className="font-medium text-gray-800 hover:text-primary-600 transition line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  <div className="mt-2">
                    {item.sale_price ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary-600">
                          {formatCurrency(item.sale_price)}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {formatCurrency(item.regular_price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-primary-600">
                        {formatCurrency(item.regular_price)}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => moveToCart(item)}
                      disabled={item.stock_quantity === 0 || isAddingToCart}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <Link
                      to={`/product/${item.slug}`}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </Link>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Added {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;