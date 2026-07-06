// src/pages/admin/AdminCustomersPage.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    UserPlus,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    AlertCircle,
    X,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ShoppingBag,
    Star,
    MoreVertical,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Eye
} from 'lucide-react';
import { adminAPI } from '../../api/admin';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const AdminCustomersPage = () => {
    const location = useLocation();
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const itemsPerPage = 20;

    // Check if we're on "add customer" page
    const isAddPage = location.pathname.includes('/add');

    useEffect(() => {
        if (!isAddPage) {
            fetchCustomers();
        }
    }, [filterStatus, currentPage, searchTerm]);

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search: searchTerm || undefined,
                is_active: filterStatus !== 'all' ? filterStatus === 'active' : undefined
            };
            const res = await adminAPI.getCustomers(params);
            setCustomers(res.data);
        } catch (err) {
            toast.error('Failed to load customers');
        } finally {
            setIsLoading(false);
        }
    };

    const viewCustomerDetails = async (customerId) => {
        try {
            const res = await adminAPI.getCustomer(customerId);
            setSelectedCustomer(res.data);
            setIsDetailModalOpen(true);
        } catch (err) {
            toast.error('Failed to load customer details');
        }
    };

    const toggleCustomerStatus = async (customerId, currentStatus) => {
        try {
            await adminAPI.updateCustomerStatus(customerId, !currentStatus);
            toast.success(currentStatus ? 'Customer deactivated' : 'Customer activated');
            fetchCustomers();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const getStatusBadge = (isActive) => {
        return isActive
            ? { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Active' }
            : { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Inactive' };
    };

    // Stats
    const totalCustomers = customers.length;
    const activeCount = customers.filter(c => c.is_active).length;
    const inactiveCount = customers.filter(c => !c.is_active).length;

    // If on Add Customer page
    if (isAddPage) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                    <Link
                        to="/admin/customers"
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Add New Customer</h1>
                        <p className="text-gray-500 text-sm">Create a new customer account</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    placeholder="0712345678"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                                <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                                    <option value="">Select County</option>
                                    <option value="nairobi">Nairobi</option>
                                    <option value="kisumu">Kisumu</option>
                                    <option value="mombasa">Mombasa</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    rows="2"
                                    placeholder="Street address, building, landmark"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-primary-600 rounded"
                                defaultChecked
                            />
                            <label className="text-sm text-gray-700">Active account</label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Link
                                to="/admin/customers"
                                className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
                            >
                                Create Customer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent">
                        Customers
                    </h1>
                    <p className="text-gray-500 mt-1">Manage your customer accounts</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/admin/customers/add"
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-sm"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Customer
                    </Link>
                    <button
                        onClick={fetchCustomers}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500">Total Customers</p>
                            <p className="text-2xl font-bold text-gray-800">{totalCustomers}</p>
                        </div>
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 rounded-xl p-5 shadow-sm border border-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-green-600">Active</p>
                            <p className="text-2xl font-bold text-green-700">{activeCount}</p>
                        </div>
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500">Inactive</p>
                            <p className="text-2xl font-bold text-gray-500">{inactiveCount}</p>
                        </div>
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-gray-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && fetchCustomers()}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <button
                            onClick={fetchCustomers}
                            className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-medium"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : customers.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">No customers found</h3>
                        <p className="text-sm text-gray-500">Try adjusting your filters or add a new customer</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Orders</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Spent</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {customers.map((customer, idx) => {
                                    const statusBadge = getStatusBadge(customer.is_active);
                                    const StatusIcon = statusBadge.icon;
                                    return (
                                        <motion.tr
                                            key={customer.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="hover:bg-gray-50 transition"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600">
                                                        {customer.full_name?.charAt(0) || customer.email?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{customer.full_name || 'N/A'}</p>
                                                        <p className="text-xs text-gray-400">ID: {customer.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" /> {customer.email || 'No email'}
                                                    </p>
                                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                                        <Phone className="w-3 h-3" /> {customer.phone || '-'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {customer.total_orders || 0}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-primary-600">
                                                {formatCurrency(customer.total_spent || 0)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatDate(customer.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => viewCustomerDetails(customer.id)}
                                                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleCustomerStatus(customer.id, customer.is_active)}
                                                        className={`p-2 rounded-lg transition ${customer.is_active
                                                                ? 'text-gray-400 hover:bg-gray-100'
                                                                : 'text-green-600 hover:bg-green-50'
                                                            }`}
                                                    >
                                                        {customer.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Customer Detail Modal */}
            <AnimatePresence>
                {isDetailModalOpen && selectedCustomer && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Customer Details</h3>
                                    <p className="text-sm text-gray-500">#{selectedCustomer.id}</p>
                                </div>
                                <button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600">
                                        {selectedCustomer.full_name?.charAt(0) || selectedCustomer.email?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800">{selectedCustomer.full_name || 'N/A'}</h4>
                                        <p className="text-gray-500">Customer since {formatDate(selectedCustomer.created_at)}</p>
                                        <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedCustomer.is_active).color}`}>
                                            {getStatusBadge(selectedCustomer.is_active).label}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="font-medium">{selectedCustomer.email || 'Not provided'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500">Phone</p>
                                        <p className="font-medium">{selectedCustomer.phone || 'Not provided'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500">Total Orders</p>
                                        <p className="text-2xl font-bold text-primary-600">{selectedCustomer.total_orders || 0}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500">Total Spent</p>
                                        <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedCustomer.total_spent || 0)}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 col-span-2">
                                        <p className="text-xs text-gray-500">Loyalty Points</p>
                                        <p className="text-2xl font-bold text-yellow-600">{selectedCustomer.loyalty_points || 0}</p>
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

export default AdminCustomersPage;