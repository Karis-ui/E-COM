import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  CheckCircle,
  Truck,
  CreditCard,
  Smartphone,
  Building2,
  MapPin,
  User,
  Mail,
  ArrowRight,
  ArrowLeft,
  Shield,
  Lock,
  AlertCircle,
  Home,
  Clock,
  Gift
} from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { initiateCheckout, verifyOTP } from '../store/slices/authSlice';
import { createOrder } from '../store/slices/orderSlice';
import { clearCart } from '../store/slices/cartSlice';
import { formatCurrency } from '../utils/formatCurrency';
import { COUNTIES } from '../utils/constant';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [deliveryDetails, setDeliveryDetails] = useState({
    full_name: '',
    email: '',
    county: '',
    city: '',
    address: '',
    delivery_instructions: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { items, subtotal } = useSelector((state) => state.cart);
  const { checkoutPhone, isLoading, isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const deliveryFee = subtotal >= 10000 ? 0 : 300;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (isAuthenticated && user) {
      setDeliveryDetails({
        full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email || '',
        county: user.profile?.county || '',
        city: user.profile?.city || '',
        address: user.profile?.address || '',
        delivery_instructions: '',
      });
      if (user.phone) {
        setPhone(user.phone);
        setStep(2);
      }
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleSendOTP = async () => {
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }
    try {
      await dispatch(initiateCheckout(phone)).unwrap();
      setOtpTimer(60);
      toast.success('OTP sent successfully!');
    } catch {
      toast.error('Failed to send OTP');
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }
    try {
      await dispatch(verifyOTP({ phone: checkoutPhone || phone, otp })).unwrap();
      setStep(3);
      toast.success('Phone verified successfully!');
    } catch {
      toast.error('Invalid OTP');
    }
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const orderData = {
        delivery_details: { ...deliveryDetails, phone: checkoutPhone || phone },
        payment_method: paymentMethod,
      };
      const result = await dispatch(createOrder(orderData)).unwrap();
      toast.success('Order placed successfully!');
      navigate(`/order-success/${result.order.order_number}`);
    } catch {
      toast.error('Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Phone', icon: Phone, description: 'Enter your number' },
    { number: 2, title: 'Verify', icon: CheckCircle, description: 'Enter OTP' },
    { number: 3, title: 'Delivery', icon: Truck, description: 'Address details' },
    { number: 4, title: 'Payment', icon: CreditCard, description: 'Choose method' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent">
              Secure Checkout
            </h1>
            <p className="text-gray-500 mt-2">Complete your purchase with confidence</p>
          </motion.div>

          <div className="mb-12">
            <div className="flex justify-between items-center relative">
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
              {steps.map((s, idx) => {
                const Icon = s.icon;
                const isActive = step === s.number;
                const isCompleted = step > s.number;
                return (
                  <div key={s.number} className="flex flex-col items-center flex-1">
                    <div className={`
                      w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 z-10
                      ${isActive ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-110' : ''}
                      ${isCompleted ? 'bg-green-500 text-white' : 'bg-white border-2 border-gray-200 text-gray-400'}
                    `}>
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <p className={`text-sm font-medium mt-3 ${isActive ? 'text-primary-600' : 'text-gray-500'}`}>
                      {s.title}
                    </p>
                    <p className="text-xs text-gray-400 hidden md:block">{s.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-2xl shadow-xl p-8"
                  >
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="w-10 h-10 text-primary-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">Welcome to K-TECH</h2>
                      <p className="text-gray-500 mt-2">Enter your phone number to continue</p>
                    </div>

                    <PhoneInput
                      country={'ke'}
                      value={phone}
                      onChange={setPhone}
                      inputClass="w-full !px-4 !py-4 !rounded-xl !text-lg"
                      buttonClass="!rounded-l-xl"
                      containerClass="w-full mb-6"
                      inputProps={{ required: true, autoFocus: true }}
                    />

                    <button
                      onClick={handleSendOTP}
                      className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition transform hover:scale-[1.02]"
                    >
                      Continue
                    </button>

                    <p className="text-center text-xs text-gray-400 mt-4">
                      By continuing, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-2xl shadow-xl p-8"
                  >
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-10 h-10 text-primary-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">Verify Your Number</h2>
                      <p className="text-gray-500 mt-2">
                        We sent a 6-digit code to <span className="font-semibold text-gray-700">{checkoutPhone || phone}</span>
                      </p>
                    </div>

                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className="w-full px-4 py-4 text-center text-2xl tracking-widest border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none mb-6"
                      autoFocus
                    />

                    <button
                      onClick={handleVerifyOTP}
                      className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition"
                    >
                      Verify & Continue
                    </button>

                    {otpTimer > 0 ? (
                      <p className="text-center text-gray-500 mt-4">Resend code in {otpTimer}s</p>
                    ) : (
                      <button
                        onClick={handleSendOTP}
                        className="w-full text-primary-600 hover:text-primary-700 transition mt-4"
                      >
                        Resend Code
                      </button>
                    )}
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-2xl shadow-xl p-8"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <Home className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">Delivery Information</h2>
                        <p className="text-sm text-gray-500">Where should we deliver your order?</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              value={deliveryDetails.full_name}
                              onChange={(e) => setDeliveryDetails({ ...deliveryDetails, full_name: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                              type="email"
                              value={deliveryDetails.email}
                              onChange={(e) => setDeliveryDetails({ ...deliveryDetails, email: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">County *</label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <select
                              value={deliveryDetails.county}
                              onChange={(e) => setDeliveryDetails({ ...deliveryDetails, county: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 appearance-none"
                              required
                            >
                              <option value="">Select County</option>
                              {COUNTIES.map(county => (
                                <option key={county} value={county}>{county}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City/Town *</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              value={deliveryDetails.city}
                              onChange={(e) => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                        <textarea
                          value={deliveryDetails.address}
                          onChange={(e) => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })}
                          placeholder="Building name, street, landmark"
                          rows="2"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Instructions (optional)</label>
                        <textarea
                          value={deliveryDetails.delivery_instructions}
                          onChange={(e) => setDeliveryDetails({ ...deliveryDetails, delivery_instructions: e.target.value })}
                          placeholder="Gate code, floor number, etc."
                          rows="2"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button
                        onClick={() => setStep(2)}
                        className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setStep(4)}
                        className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-2xl shadow-xl p-8"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">Payment Method</h2>
                        <p className="text-sm text-gray-500">Choose how you want to pay</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <label className={`flex items-center justify-between p-5 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'mpesa' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                            <Smartphone className="w-7 h-7 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-lg">M-Pesa</p>
                            <p className="text-sm text-gray-500">Pay with M-Pesa via STK Push</p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="payment"
                          value="mpesa"
                          checked={paymentMethod === 'mpesa'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 text-primary-600"
                        />
                      </label>

                      <label className={`flex items-center justify-between p-5 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                            <CreditCard className="w-7 h-7 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-lg">Card Payment</p>
                            <p className="text-sm text-gray-500">Visa, Mastercard, American Express</p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 text-primary-600"
                        />
                      </label>

                      <label className={`flex items-center justify-between p-5 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Truck className="w-7 h-7 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-lg">Cash on Delivery</p>
                            <p className="text-sm text-gray-500">Pay when you receive the order</p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="payment"
                          value="cash"
                          checked={paymentMethod === 'cash'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 text-primary-600"
                        />
                      </label>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setStep(3)}
                        className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
                      >
                        Back
                      </button>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? <LoadingSpinner /> : 'Place Order'}
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>

                <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div key={item.product_id} className="flex gap-3">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm line-clamp-2">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-primary-600 font-semibold text-sm">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold text-gray-800">
                      <span>Total</span>
                      <span className="text-2xl text-primary-600">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center gap-2 text-xs text-gray-500">
                  <Lock className="w-4 h-4 text-green-600" />
                  <span>Your payment information is secure with 256-bit SSL encryption</span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>Estimated delivery: 2-3 business days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;