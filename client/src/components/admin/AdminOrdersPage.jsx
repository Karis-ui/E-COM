import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    Eye,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    AlertCircle,
    X,
    CheckCircle,
    Clock,
    Truck,
    Home,
    DollarSign,
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    ShoppingBag
} from 'lucide-react';
import { adminAPI } from '../../api/admin';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const AdminOrdersPage = () => {
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const itemsPerPage = 20;

    const status = location.pathname.split('/').pop();
    const filterStatus = (status === 'orders' || status === 'admin') ? null : status;

    useEffect(() => {
        fetchOrders();
    }, [filterStatus, currentPage]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                status: filterStatus || undefined,
                search: searchTerm || undefined
            };
            const res = await adminAPI.getOrders(params);
            setOrders(res.data);
        } catch (err) {
            toast.error('Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await adminAPI.updateOrderStatus(orderId, newStatus);
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const viewOrderDetails = async (orderId) => {
        try {
            const res = await adminAPI.getOrder(orderId);
            setSelectedOrder(res.data);
            setIsDetailModalOpen(true);
        } catch (err) {
            toast.error('Failed to load order details');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
            processing: { color: 'bg-blue-100 text-blue-800', icon: Package, label: 'Processing' },
            shipped: { color: 'bg-purple-100 text-purple-800', icon: Truck, label: 'Shipped' },
            delivered: { color: 'bg-green-100 text-green-800', icon: Home, label: 'Delivered' },
            cancelled: { color: 'bg-red-100 text-red-800', icon: X, label: 'Cancelled' },
        };
        return badges[status] || badges.pending;
    };

    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const getStatusLabel = () => {
        if (!filterStatus) return 'All Orders';
        const labels = {
            pending: 'Pending Orders',
            processing: 'Processing Orders',
            shipped: 'Shipped Orders',
            delivered: 'Delivered Orders',
            cancelled: 'Cancelled Orders'
        };
        return labels[filterStatus] || 'Orders';
    };

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent">
                        {getStatusLabel()}
                    </h1>
                    <p className="text-gray-500 mt-1">Manage and track customer orders</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 shadow-sm border border-yellow-100">
                    <p className="text-xs text-yellow-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-700">
                        {orders.filter(o => o.status === 'pending').length}
                    </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-100">
                    <p className="text-xs text-blue-600">Processing</p>
                    <p className="text-2xl font-bold text-blue-700">
                        {orders.filter(o => o.status === 'processing').length}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by order number or customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && fetchOrders()}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <button
                        onClick={fetchOrders}
                        className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-medium"
                    >
                        Search
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">No orders found</h3>
                        <p className="text-sm text-gray-500">Try adjusting your filters or search terms</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order, idx) => {
                                    const statusBadge = getStatusBadge(order.status);
                                    const StatusIcon = statusBadge.icon;
                                    return (
                                        <motion.tr
                                            key={order.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="hover:bg-gray-50 transition"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-800">#{order.order_number}</p>
                                                <p className="text-xs text-gray-400 truncate max-w-[100px]">{order.id}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-800">{order.customer_name}</p>
                                                <p className="text-xs text-gray-500">{order.customer_phone}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-primary-600">{formatCurrency(order.total)}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 ${statusBadge.color} cursor-pointer outline-none`}
                                                    >
                                                        {statusOptions.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => viewOrderDetails(order.id)}
                                                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isDetailModalOpen && selectedOrder && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Order Details</h3>
                                    <p className="text-sm text-gray-500">#{selectedOrder.order_number}</p>
                                </div>
                                <button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500">Total Amount</p>
                                        <p className="text-xl font-bold text-primary-600">{formatCurrency(selectedOrder.total)}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500">Status</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedOrder.status).color}`}>
                                            {getStatusBadge(selectedOrder.status).label}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500">Payment</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${selectedOrder.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {selectedOrder.payment_status === 'paid' ? 'Paid' : 'Pending'}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500">Date</p>
                                        <p className="text-sm font-medium">{formatDate(selectedOrder.created_at)}</p>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4 text-primary-600" />
                                        Customer Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span>{selectedOrder.customer_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span>{selectedOrder.customer_phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span>{selectedOrder.customer_email || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary-600" />
                                        Delivery Address
                                    </h4>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p>{selectedOrder.address}</p>
                                        <p>{selectedOrder.city}, {selectedOrder.county}</p>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <ShoppingBag className="w-4 h-4 text-primary-600" />
                                        Items ({selectedOrder.items?.length || 0})
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedOrder.items?.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                                <img
                                                    src={item.image || 'https://via.placeholder.com/60'}
                                                    alt={item.name}
                                                    className="w-16 h-16 rounded-lg object-cover bg-gray-200"
                                                    onError={(e) => e.target.src = 'https://via.placeholder.com/60?text=No+Image'}
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-800">{item.name}</p>
                                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-primary-600">{formatCurrency(item.price)}</p>
                                                    <p className="text-xs text-gray-400">Total: {formatCurrency(item.price * item.quantity)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6">
                                    <div className="flex justify-end">
                                        <div className="w-64 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Subtotal</span>
                                                <span>{formatCurrency(selectedOrder.subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Delivery Fee</span>
                                                <span>{selectedOrder.delivery_fee === 0 ? 'Free' : formatCurrency(selectedOrder.delivery_fee)}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                                                <span>Total</span>
                                                <span className="text-primary-600">{formatCurrency(selectedOrder.total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminOrdersPage;