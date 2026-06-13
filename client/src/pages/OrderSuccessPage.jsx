import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Package,
  Truck,
  Receipt,
  ArrowRight,
  Home,
  Mail,
  Phone,
  Clock,
  Share2,
  Download,
  Printer
} from 'lucide-react';
import { ordersAPI } from '../api/orders';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    window.scrollTo(0, 0);
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.getOrder(orderId);
      setOrder(response.data);
    } catch (error) {
      toast.error('Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!order) return <div className="py-20 text-center">Order not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-xl"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-500">Thank you for shopping with K-TECH</p>
            <p className="text-sm text-gray-400 mt-1">Order #{order.order_number}</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 mb-8 shadow-xl"
          >
            <div className="flex justify-between items-center text-white">
              <div>
                <p className="text-primary-100 text-sm">Total Amount</p>
                <p className="text-3xl font-bold">{formatCurrency(order.total)}</p>
              </div>
              <div className="text-right">
                <p className="text-primary-100 text-sm">Payment Method</p>
                <p className="font-semibold capitalize">{order.payment_method}</p>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Link
              to={`/track-order/${order.order_number}`}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition"
            >
              <Truck className="w-5 h-5" />
              Track Order
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              <ArrowRight className="w-5 h-5" />
              Continue Shopping
            </Link>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              <Printer className="w-5 h-5" />
              Print Receipt
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">What's Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Order Confirmation Sent</p>
                  <p className="text-sm text-gray-500">SMS sent to {order.customer_phone}</p>
                  {order.customer_email && (
                    <p className="text-xs text-gray-400">Email sent to {order.customer_email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Order Processing</p>
                  <p className="text-sm text-gray-500">Estimated processing: 1-2 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Delivery Timeline</p>
                  <p className="text-sm text-gray-500">
                    {order.county === 'Nairobi' ? 'Same-day delivery' : '2-3 business days'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
          >
            <div className="border-b border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800">Order Details</h3>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Items</h4>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 pb-3 border-b border-gray-100 last:border-0">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-primary-600 font-semibold">{formatCurrency(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>{order.delivery_fee === 0 ? 'Free' : formatCurrency(order.delivery_fee)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-primary-600">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Delivery Address</h4>
                <p className="text-gray-600">
                  {order.customer_name}<br />
                  {order.address}<br />
                  {order.city}, {order.county}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  <Phone className="w-3 h-3 inline mr-1" /> {order.customer_phone}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="text-center">
            <p className="text-gray-500">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@ktech.co.ke" className="text-primary-600 hover:underline">
                support@ktech.co.ke
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;