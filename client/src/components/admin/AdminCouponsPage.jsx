import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Gift,
    Plus,
    Search,
    RefreshCw,
    AlertCircle,
    X,
    Calendar,
    ChevronLeft,
    Users,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    Copy,
    Eye
} from 'lucide-react';
import { adminAPI } from '../../api/admin';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const AdminCouponsPage = () => {
    const location = useLocation();
    const [coupons, setCoupons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const itemsPerPage = 20;

    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        minimum_order: '',
        maximum_discount: '',
        usage_limit: '',
        per_user_limit: 1,
        valid_from: '',
        valid_to: '',
        is_active: true
    });

    const isAddPage = location.pathname.includes('/add');
    useEffect(() => {
        if (!isAddPage) {
            fetchCoupons();
        }
    }, [filterStatus, currentPage, searchTerm]);

    const fetchCoupons = async () => {
        setIsLoading(true);
        try {
            const res = await adminAPI.getCoupons();
            setCoupons(res.data);
        } catch (err) {
            toast.error('Failed to load coupons');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingCoupon) {
                await adminAPI.updateCoupon(editingCoupon.id, formData);
                toast.success('Coupon updated successfully');
            } else {
                await adminAPI.createCoupon(formData);
                toast.success('Coupon created successfully');
            }
            closeModal();
            fetchCoupons();
        } catch (err) {
            toast.error(editingCoupon ? 'Failed to update coupon' : 'Failed to create coupon');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await adminAPI.deleteCoupon(id);
            toast.success('Coupon deleted successfully');
            setShowDeleteConfirm(null);
            fetchCoupons();
        } catch (err) {
            toast.error('Failed to delete coupon');
        }
    };

    const toggleCouponStatus = async (id, currentStatus) => {
        try {
            await adminAPI.toggleCoupon(id, !currentStatus);
            toast.success(currentStatus ? 'Coupon deactivated' : 'Coupon activated');
            fetchCoupons();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const openModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                code: coupon.code,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value,
                minimum_order: coupon.minimum_order || '',
                maximum_discount: coupon.maximum_discount || '',
                usage_limit: coupon.usage_limit || '',
                per_user_limit: coupon.per_user_limit || 1,
                valid_from: coupon.valid_from?.split('T')[0] || '',
                valid_to: coupon.valid_to?.split('T')[0] || '',
                is_active: coupon.is_active
            });
        } else {
            setEditingCoupon(null);
            setFormData({
                code: '',
                discount_type: 'percentage',
                discount_value: '',
                minimum_order: '',
                maximum_discount: '',
                usage_limit: '',
                per_user_limit: 1,
                valid_from: '',
                valid_to: '',
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCoupon(null);
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        toast.success('Coupon code copied!');
    };

    const isExpired = (validTo) => {
        return new Date(validTo) < new Date();
    };

    const getStatusBadge = (coupon) => {
        if (!coupon.is_active) {
            return { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Inactive' };
        }
        if (isExpired(coupon.valid_to)) {
            return { color: 'bg-red-100 text-red-800', icon: Clock, label: 'Expired' };
        }
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Active' };
    };

    const totalCoupons = coupons.length;
    const activeCount = coupons.filter(c => c.is_active && !isExpired(c.valid_to)).length;
    const expiredCount = coupons.filter(c => isExpired(c.valid_to)).length;
    const totalUsed = coupons.reduce((sum, c) => sum + (c.times_used || 0), 0);

    if (isAddPage) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                    <Link
                        to="/admin/coupons"
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Create New Coupon</h1>
                        <p className="text-gray-500 text-sm">Create a discount coupon for your customers</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="WELCOME10"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none uppercase"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                                <select
                                    value={formData.discount_type}
                                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {formData.discount_type === 'percentage' ? 'Discount Percentage' : 'Discount Amount'} *
                                </label>
                                <input
                                    type="number"
                                    value={formData.discount_value}
                                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order</label>
                                <input
                                    type="number"
                                    value={formData.minimum_order}
                                    onChange={(e) => setFormData({ ...formData, minimum_order: e.target.value })}
                                    placeholder="0 = no minimum"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Discount</label>
                                <input
                                    type="number"
                                    value={formData.maximum_discount}
                                    onChange={(e) => setFormData({ ...formData, maximum_discount: e.target.value })}
                                    placeholder="0 = unlimited"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                                <input
                                    type="number"
                                    value={formData.usage_limit}
                                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                    placeholder="Unlimited"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Per User Limit</label>
                                <input
                                    type="number"
                                    value={formData.per_user_limit}
                                    onChange={(e) => setFormData({ ...formData, per_user_limit: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valid From *</label>
                                <input
                                    type="date"
                                    value={formData.valid_from}
                                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valid To *</label>
                                <input
                                    type="date"
                                    value={formData.valid_to}
                                    onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-4 h-4 text-primary-600 rounded"
                            />
                            <label className="text-sm text-gray-700">Active</label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Link
                                to="/admin/coupons"
                                className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
                            >
                                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent">
                        Coupons
                    </h1>
                    <p className="text-gray-500 mt-1">Manage discount coupons and promotions</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/admin/coupons/add"
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Create Coupon
                    </Link>
                    <button
                        onClick={fetchCoupons}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500">Total Coupons</p>
                            <p className="text-2xl font-bold text-gray-800">{totalCoupons}</p>
                        </div>
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <Gift className="w-5 h-5 text-primary-600" />
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
                <div className="bg-red-50 rounded-xl p-5 shadow-sm border border-red-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-red-600">Expired</p>
                            <p className="text-2xl font-bold text-red-700">{expiredCount}</p>
                        </div>
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <Clock className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-5 shadow-sm border border-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-blue-600">Times Used</p>
                            <p className="text-2xl font-bold text-blue-700">{totalUsed}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search coupons by code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && fetchCoupons()}
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
                            <option value="expired">Expired</option>
                        </select>
                        <button
                            onClick={fetchCoupons}
                            className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-medium"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="col-span-3 flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="col-span-3 text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Gift className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">No coupons found</h3>
                        <p className="text-sm text-gray-500">Create your first coupon to get started</p>
                    </div>
                ) : (
                    coupons.map((coupon, idx) => {
                        const statusBadge = getStatusBadge(coupon);
                        const StatusIcon = statusBadge.icon;
                        return (
                            <motion.div
                                key={coupon.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
                            >
                                <div className={`p-4 ${coupon.discount_type === 'percentage'
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600'
                                    : 'bg-gradient-to-r from-green-500 to-green-600'
                                    } text-white`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Gift className="w-4 h-4" />
                                                <span className="font-bold text-lg">{coupon.code}</span>
                                            </div>
                                            <div className="mt-1">
                                                <span className="text-2xl font-bold">
                                                    {coupon.discount_type === 'percentage'
                                                        ? `${coupon.discount_value}% OFF`
                                                        : `${formatCurrency(coupon.discount_value)} OFF`}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(coupon.code)}
                                            className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition"
                                            title="Copy code"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-400">Min order:</span>
                                        <span className="font-medium">{coupon.minimum_order > 0 ? formatCurrency(coupon.minimum_order) : 'No minimum'}</span>
                                    </div>
                                    {coupon.maximum_discount > 0 && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">Max discount:</span>
                                            <span className="font-medium">{formatCurrency(coupon.maximum_discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600 text-xs">
                                            {formatDate(coupon.valid_from)} - {formatDate(coupon.valid_to)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600 text-xs">Used {coupon.times_used || 0} / {coupon.usage_limit || '∞'} times</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {statusBadge.label}
                                        </span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                            >
                                                {coupon.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => openModal(coupon)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(coupon.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">
                                    {editingCoupon ? "Edit Coupon" : "Create Coupon"}
                                </h2>

                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Coupon Code
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    code: e.target.value.toUpperCase(),
                                                })
                                            }
                                            className="w-full px-4 py-2 border rounded-xl"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Discount Type
                                        </label>
                                        <select
                                            value={formData.discount_type}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    discount_type: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2 border rounded-xl"
                                        >
                                            <option value="percentage">Percentage</option>
                                            <option value="fixed">Fixed Amount</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Discount Value
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.discount_value}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    discount_value: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2 border rounded-xl"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Minimum Order
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.minimum_order}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    minimum_order: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2 border rounded-xl"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Valid From
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.valid_from}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    valid_from: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2 border rounded-xl"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Valid To
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.valid_to}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    valid_to: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2 border rounded-xl"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 border rounded-xl"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary-600 text-white rounded-xl"
                                    >
                                        Update Coupon
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-sm p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-800">Delete Coupon?</h2>
                            </div>
                            <p className="text-gray-600 text-sm mb-6">This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(showDeleteConfirm)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCouponsPage;