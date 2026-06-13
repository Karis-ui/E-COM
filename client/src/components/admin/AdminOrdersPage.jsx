import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Eye, Package, Truck, CheckCircle, XCircle, Clock, Filter,
    ChevronLeft, ChevronRight, AlertCircle, X, Settings, Tag, Layers,
    Building2, CreditCard, Bell, Lock, Globe, Share2, Home, DollarSign
} from 'lucide-react';
import { adminAPI } from '../../api/admin';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeSettingsTab, setActiveSettingsTab] = useState('orders');
    const itemsPerPage = 20;

    const settingsMenu = [
        { id: 'orders', label: 'Orders', icon: Package, description: 'Manage customer orders' },
        { id: 'brands', label: 'Brands', icon: Building2, description: 'Manage product brands' },
        { id: 'categories', label: 'Categories', icon: Tag, description: 'Manage product categories' },
        { id: 'riders', label: 'Riders', icon: Truck, description: 'Manage delivery riders' },
        { id: 'customers', label: 'Customers', icon: Users, description: 'Manage customer accounts' },
        { id: 'coupons', label: 'Coupons', icon: Gift, description: 'Manage discount coupons' },
        { id: 'delivery', label: 'Delivery', icon: Truck, description: 'Configure delivery fees' },
        { id: 'payment', label: 'Payment', icon: CreditCard, description: 'Payment methods & settings' },
        { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email & SMS notifications' },
        { id: 'security', label: 'Security', icon: Lock, description: 'Security & access control' },
        { id: 'seo', label: 'SEO', icon: Globe, description: 'Search engine optimization' },
        { id: 'social-media', label: 'Social Media', icon: Share2, description: 'Social media integration' },
    ];

    useEffect(() => {
        fetchOrders();
    }, [currentPage, statusFilter, searchTerm]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                search: searchTerm || undefined
            };
            const res = await adminAPI.getOrders(params);
            setOrders(res.data);
            setTotalPages(res.total);
        } catch (err) {
            toast.error('Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await adminAPI.updateOrderStatus(orderId, newStatus);
            toast.success('Order status updated successfully');
            fetchOrders();
        } catch (err) {
            toast.error('Failed to update order status');
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

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const ActiveIcon = settingsMenu.find(m => m.id === activeSettingsTab)?.icon || Package;

    const renderOrdersContent = () => (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Total Orders</p>
                    <p className="text-xl font-bold text-gray-800">{orders.length}</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-3">
                    <p className="text-xs text-yellow-600">Pending</p>
                    <p className="text-xl font-bold text-yellow-700">{orders.filter(o => o.status === 'pending').length}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs text-blue-600">Processing</p>
                    <p className="text-xl font-bold text-blue-700">{orders.filter(o => o.status === 'processing').length}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-xs text-green-600">Delivered</p>
                    <p className="text-xl font-bold text-green-700">{orders.filter(o => o.status === 'delivered').length}</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by order number or customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm"
                >
                    {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Order ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Customer</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition">
                                <td className="px-4 py-3 text-sm font-medium text-gray-800">#{order.order_number}</td>
                                <td className="px-4 py-3">
                                    <p className="font-medium text-gray-800">{order.customer_name}</p>
                                    <p className="text-xs text-gray-500">{order.customer_phone}</p>
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-primary-600">{formatCurrency(order.total)}</td>
                                <td className="px-4 py-3">
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                        className={`px-2 py-1 rounded-full text-xs font-semibold border-0 ${getStatusColor(order.status)}`}
                                    >
                                        {statusOptions.filter(opt => opt.value !== 'all').map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => viewOrderDetails(order.id)}
                                        className="p-1 text-primary-600 hover:bg-primary-50 rounded transition"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                <div className="w-72 bg-white border-r border-gray-200 min-h-screen flex-shrink-0">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800">Configure your store</h2>
                        <p className="text-sm text-gray-500 mt-1">Settings Menu</p>
                        <p className="text-xs text-gray-400 mt-2">Select a section to configure</p>
                    </div>
                    <nav className="p-3">
                        {settingsMenu.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeSettingsTab === item.id;
                            return (
                                <button key={item.id}
                                    onClick={() => setActiveSettingsTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 mb-1 ${isActive
                                            ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                                    <div className="flex-1">
                                        <p className={`font-medium text-sm ${isActive ? 'text-primary-700' : 'text-gray-700'}`}>
                                            {item.label}
                                        </p>
                                        <p className="text-xs text-gray-400">{item.description}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                                <ActiveIcon className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">
                                    {settingsMenu.find(m => m.id === activeSettingsTab)?.label}
                                </h1>
                                <p className="text-gray-500 text-sm">
                                    {settingsMenu.find(m => m.id === activeSettingsTab)?.description}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            {activeSettingsTab === 'orders' ? renderOrdersContent() : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">Configure {settingsMenu.find(m => m.id === activeSettingsTab)?.label} settings here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isDetailModalOpen && selectedOrder && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
                                <button onClick={() => setIsDetailModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Order Number</p>
                                        <p className="font-semibold">#{selectedOrder.order_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Date</p>
                                        <p className="font-semibold">{formatDate(selectedOrder.created_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Payment</p>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${selectedOrder.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {selectedOrder.payment_status === 'paid' ? 'Paid' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                                <div className="border-t border-gray-100 pt-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Customer Information</h3>
                                    <p className="text-gray-600">{selectedOrder.customer_name}</p>
                                    <p className="text-gray-600">{selectedOrder.customer_phone}</p>
                                    <p className="text-gray-600">{selectedOrder.customer_email}</p>
                                </div>
                                <div className="border-t border-gray-100 pt-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Delivery Address</h3>
                                    <p className="text-gray-600">{selectedOrder.address}</p>
                                </div>
                                <div className="border-t border-gray-100 pt-4">
                                    <h3 className="font-semibold text-gray-800 mb-3">Items</h3>
                                    <div className="space-y-3">
                                        {selectedOrder.items?.map((item, idx) => (
                                            <div key={idx} className="flex gap-3 pb-3 border-b border-gray-100">
                                                <img src={item.image} className="w-16 h-16 rounded-lg object-cover" />
                                                <div className="flex-1">
                                                    <p className="font-semibold">{item.name}</p>
                                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                    <p className="text-primary-600 font-semibold">{formatCurrency(item.price)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="border-t border-gray-100 pt-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span>{formatCurrency(selectedOrder.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Delivery Fee</span>
                                            <span>{selectedOrder.delivery_fee === 0 ? 'Free' : formatCurrency(selectedOrder.delivery_fee)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span className="text-primary-600">{formatCurrency(selectedOrder.total)}</span>
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