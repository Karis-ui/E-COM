import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, MapPin, Phone, Clock, CheckCircle, Truck, Home, AlertCircle } from 'lucide-react';
import { ordersAPI } from '../api/orders';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    try {
      const res = await ordersAPI.getOrder(orderId);
      setOrder(res.data);
      const tres = await ordersAPI.trackOrder(orderId);
      setDelivery(tres.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError(err.response?.data?.detail || 'Failed to load order details');
      toast.error('Could not load order details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (order && order.status !== "delivered" && order.status !== 'cancelled') {
      const interval = setInterval(() => {
        fetchOrderDetails();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [order?.status]);

  const getStatusIcon = (status, isCompleted) => {
    if (isCompleted) return <CheckCircle className='w-6 h-6 text-green-600' />
    const icons = {
      'pending': <Clock className='w-6 h-6 text-gray-400' />,
      'processing': <Package className='w-6 h-6 text-gray-400' />,
      'packed': <Package className='w-6 h-6 text-gray-400' />,
      'shipped': <Truck className='w-6 h-6 text-gray-400' />,
      'delivered': <Home className='w-6 h-6 text-gray-400' />,
      'cancelled': <AlertCircle className='w-6 h-6 text-gray-400' />,
    };
    return icons[status] || <Clock className='w-6 h-6 text-gray-400' />;
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Order Placed',
      'processing': 'Payment Confirmed',
      'packed': 'Order Processed',
      'shipped': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Order Cancelled',
    };
    return statusMap[status] || status;
  };

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
          <p className="text-gray-500 mb-8">{error || "We couldn't find your order"}</p>
          <Link to="/orders" className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition">
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusFlow = ['pending', 'processing', 'packed', 'shipped', 'delivered'];
  const currentStatusIndex = statusFlow.indexOf(order.status);

  const timeline = statusFlow.map((status, idx) => {
    let timestamp = null;
    let completed = idx <= currentStatusIndex;

    if (order.status_history) {
      const historyEntry = order.status_history.find(h => h.status === status);
      if (historyEntry) {
        timestamp = historyEntry.timestamp;
      }
    }
    return {
      status: getStatusText(status),
      statusKey: status,
      timestamp,
      completed: completed && order.status !== 'cancelled',
    };
  });

  if (order.status === 'cancelled') {
    timeline.forEach(item => {
      if (item.statusKey !== 'cancelled') {
        item.completed = false;
      }
    });
    timeline.push({
      status: 'Cancelled',
      statusKey: 'cancelled',
      timestamp: order.cancelled_at,
      completed: true,
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent">
              Track Your Order
            </h1>
            <p className="text-gray-500 mt-2">Order #{order.order_number}</p>
            <p className="text-sm text-gray-400 mt-1">Placed on {formatDate(order.created_at)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-600" />
              Order Status
            </h3>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-6">
                {timeline.map((event, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div className="relative z-10 bg-white rounded-full p-1">
                      {getStatusIcon(event.statusKey, event.completed)}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${event.completed ? 'text-gray-800' : 'text-gray-400'}`}>
                        {event.status}
                      </p>
                      {event.timestamp && (
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(event.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {order.status === 'shipped' && delivery?.rider && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-8"
            >
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary-600" />
                Delivery Rider
              </h3>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{delivery.rider.name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${delivery.rider.phone}`} className="hover:text-primary-600">
                      {delivery.rider.phone}
                    </a>
                  </p>
                  <p className="text-sm text-gray-500">{delivery.rider.vehicle}</p>
                  {delivery.current_location && (
                    <div className="mt-3 p-3 bg-primary-50 rounded-lg">
                      <p className="text-sm text-primary-600 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {delivery.current_location.address || 'Currently in transit'}
                      </p>
                      {delivery.eta && (
                        <p className="text-xs text-primary-500 mt-1">ETA: {delivery.eta}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-3 pb-3 border-b border-gray-100">
                  <img
                    src={item.image || 'https://via.placeholder.com/80'}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/80'}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-primary-600 font-semibold">{formatCurrency(item.price)}</p>
                  </div>
                </div>
              ))}
              <div className="pt-3">
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
                <div className="flex justify-between text-lg font-bold text-gray-800 mt-2 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-primary-600">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="font-semibold text-gray-700 mb-2">Delivery Address</h4>
              <p className="text-gray-600">
                {order.customer_name}<br />
                {order.address}<br />
                {order.city}, {order.county}
              </p>
              <p className="text-gray-500 text-sm mt-2">📞 {order.customer_phone}</p>
            </div>
          </motion.div>

          <div className="flex justify-center gap-4 mt-8">
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-600 hover:text-white transition"
              >
                Refresh Status
              </button>
            )}
            <Link
              to="/orders"
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}