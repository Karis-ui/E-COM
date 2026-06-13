import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  Shield,
  Truck,
  CreditCard,
  RefreshCw,
  X,
  Gift
} from 'lucide-react';
import { updateCartItem, removeCartItem, clearCart } from '../store/slices/cartSlice';
import { formatCurrency } from '../utils/formatCurrency';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, subtotal, isLoading } = useSelector((state) => state.cart);;
  const deliveryFee = subtotal >= 3000 ? 0 : 200;
  const [discount, setDiscount] = useState(0);
  const total = subtotal + deliveryFee - discount;
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const handleQuantityChange = (productId, currentQuantity, delta) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity < 1) return;
    try {
      dispatch(updateCartItem({ productId, quantity: newQuantity })).unwrap();
      toast.success('Cart updated');
    }
    catch (error) {
      console.error('Error updating cart item:', error);
    }
  };

  const handleRemoveItem = (productId, productName) => {
    try {
      dispatch(removeCartItem(productId)).unwrap();
      toast.success(`${productName} removed from cart`);
    }
    catch (error) {
      console.error('Error removing cart item:', error);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear the cart?')) {
      try {
        dispatch(clearCart()).unwrap();
        toast.success('Cart cleared');
      }
      catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  const handleApplyPromo = () => {
    setIsApplyingPromo(true);
    setTimeout(() => {
      if (promoCode.trim().toUpperCase() === 'SAVE20') {
        setDiscount(subtotal * 0.1);
        toast.success('Promo code applied! You saved KES ' + (subtotal * 0.1).toFixed(2));
      } else {
        toast.error('Invalid promo code');
      }
      setIsApplyingPromo(false);
    }, 1500);
  };
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-16 h-16 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-500 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition"
            >
              Continue Shopping
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent">
            Shopping Cart
          </h1>
          <p className="text-gray-500 mt-2">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <AnimatePresence>
                {items.map((item, idx) => (
                  <motion.div
                    key={item.product_id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ delay: idx * 0.05 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 border-b border-gray-100 hover:bg-gray-50/50 transition"
                  >
                    <div className="col-span-1 md:col-span-6">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{item.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {item.specifications?.storage && `${item.specifications.storage} | `}
                            {item.specifications?.color || ''}
                          </p>
                          <button
                            onClick={() => handleRemoveItem(item.product_id, item.name)}
                            className="text-red-500 text-sm hover:text-red-600 transition flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-center">
                      <span className="font-semibold text-gray-800">{formatCurrency(item.price)}</span>
                    </div>

                    <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-center">
                      <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity, -1)}
                          className="w-8 h-8 rounded-lg bg-white hover:bg-gray-200 flex items-center justify-center transition shadow-sm"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity, 1)}
                          className="w-8 h-8 rounded-lg bg-white hover:bg-gray-200 flex items-center justify-center transition shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-end">
                      <span className="font-bold text-primary-600 text-lg">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <button
                  onClick={handleClearCart}
                  className="text-red-500 hover:text-red-600 transition text-sm flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Cart
                </button>
                <Link
                  to="/shop"
                  className="text-primary-600 hover:text-primary-700 transition text-sm flex items-center gap-1"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={isApplyingPromo || !promoCode}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    {isApplyingPromo ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <div className="flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    <span>Delivery Fee</span>
                  </div>
                  <span>{deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-2xl text-primary-600">{formatCurrency(total)}</span>
                  </div>
                  {deliveryFee === 0 && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      You saved KSh 300 on delivery!
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>Secure checkout - SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <RefreshCw className="w-5 h-5 text-primary-600" />
                  <span>Easy returns within 7 days</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span>M-Pesa | Card | Cash on Delivery</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(isAuthenticated ? '/checkout' : '/checkout')}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-xl transition"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <p className="text-xs text-gray-400 text-center mt-4">
                By completing your purchase, you agree to our Terms of Service
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;