import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit, Trash2, Search, Gift, Calendar, Percent, DollarSign,
    Users, X, Check, AlertCircle, Tag, Layers, Building2, Truck,
    CreditCard, Bell, Lock, Globe, Share2, Package, Settings,
    Grid3x3, List, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import { adminAPI } from '../../api/admin';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const AdminCouponsPage = () => {
    const [coupons, setCoupons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState('grid');
    const [filterStatus, setFilterStatus] = useState('all');
    const [activeSettingsTab, setActiveSettingsTab] = useState('coupons');
    const [formData, setFormData] = useState({
        code: '', discount_type: 'percentage', discount_value: 0, minimum_order: 0,
        maximum_discount: 0, usage_limit: 0, per_user_limit: 0, valid_from: '', valid_to: '', is_active: true
    });

    const itemsPerPage = 9;

    const settingsMenu = [
        { id: 'coupons', label: 'Coupons', icon: Gift, description: 'Manage discount coupons' },
        { id: 'orders', label: 'Orders', icon: Package, description: 'Manage customer orders' },
        { id: 'customers', label: 'Customers', icon: Users, description: 'Manage customer accounts' },
        { id: 'riders', label: 'Riders', icon: Truck, description: 'Manage delivery riders' },
        { id: 'brands', label: 'Brands', icon: Building2, description: 'Manage product brands' },
        { id: 'categories', label: 'Categories', icon: Tag, description: 'Manage product categories' },
        { id: 'delivery', label: 'Delivery', icon: Truck, description: 'Configure delivery fees' },
        { id: 'payment', label: 'Payment', icon: CreditCard, description: 'Payment methods & settings' },
        { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email & SMS notifications' },
        { id: 'security', label: 'Security', icon: Lock, description: 'Security & access control' },
        { id: 'seo', label: 'SEO', icon: Globe, description: 'Search engine optimization' },
        { id: 'social-media', label: 'Social Media', icon: Share2, description: 'Social media integration' },
    ];

    useEffect(() => { fetchCoupons(); }, []);

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
            toast.error(editingCoupon ? 'Failed to save coupon' : 'Failed to create coupon');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setIsLoading(true);
        try {
            await adminAPI.deleteCoupon(id);
            toast.success('Coupon deleted successfully');
            setShowDeleteConfirm(null);
            fetchCoupons();
        } catch (err) {
            toast.error('Failed to delete coupon');
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                code: coupon.code, discount_type: coupon.discount_type, discount_value: coupon.discount_value,
                minimum_order: coupon.minimum_order || 0, maximum_discount: coupon.maximum_discount || 0,
                usage_limit: coupon.usage_limit || 0, per_user_limit: coupon.per_user_limit || 0,
                valid_from: coupon.valid_from.split('T')[0], valid_to: coupon.valid_to.split('T')[0], is_active: coupon.is_active
            });
        } else {
            setEditingCoupon(null);
            setFormData({ code: '', discount_type: 'percentage', discount_value: 0, minimum_order: 0, maximum_discount: 0, usage_limit: 0, per_user_limit: 0, valid_from: '', valid_to: '', is_active: true });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCoupon(null);
        setFormData({ code: '', discount_type: 'percentage', discount_value: 0, minimum_order: 0, maximum_discount: 0, usage_limit: 0, per_user_limit: 0, valid_from: '', valid_to: '', is_active: true });
    };

    const toggleCouponStatus = async (id, currentStatus) => {
        try {
            await adminAPI.updateCoupon(id, { is_active: !currentStatus });
            toast.success(currentStatus ? 'Coupon deactivated' : 'Coupon activated');
            fetchCoupons();
        } catch (err) {
            toast.error('Failed to update coupon status');
        }
    };

    const isExpired = (validTo) => new Date(validTo) < new Date();

    const filteredCoupons = coupons.filter(coupon => {
        const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && coupon.is_active && !isExpired(coupon.valid_to)) ||
            (filterStatus === 'expired' && isExpired(coupon.valid_to));
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
    const paginatedCoupons = filteredCoupons.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const activeCount = coupons.filter(c => c.is_active && !isExpired(c.valid_to)).length;
    const expiredCount = coupons.filter(c => isExpired(c.valid_to)).length;
    const totalUsed = coupons.reduce((sum, c) => sum + (c.times_used || 0), 0);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus]);

    const ActiveIcon = settingsMenu.find(m => m.id === activeSettingsTab)?.icon || Gift;

    const renderCouponsContent = () => (
        <>
            <div className="flex justify-between items-center mb-6"><div><h2 className="text-xl font-bold text-gray-800">Coupons</h2><p className="text-gray-500 text-sm">Manage discount coupons</p></div><button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"><Plus className="w-4 h-4" />Create Coupon</button></div>
            <div className="grid grid-cols-3 gap-4 mb-6"><div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500">Total</p><p className="text-xl font-bold text-gray-800">{coupons.length}</p></div><div className="bg-green-50 rounded-xl p-3"><p className="text-xs text-green-600">Active</p><p className="text-xl font-bold text-green-700">{activeCount}</p></div><div className="bg-blue-50 rounded-xl p-3"><p className="text-xs text-blue-600">Times Used</p><p className="text-xl font-bold text-blue-700">{totalUsed}</p></div></div>
            <div className="flex flex-col sm:flex-row gap-3 mb-6"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search coupons..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500" /></div><div className="flex gap-2"><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm"><option value="all">All Status</option><option value="active">Active</option><option value="expired">Expired</option></select><div className="flex border border-gray-200 rounded-xl overflow-hidden"><button onClick={() => setViewMode('grid')} className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}><Grid3x3 className="w-4 h-4" /></button><button onClick={() => setViewMode('list')} className={`px-3 py-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}><List className="w-4 h-4" /></button></div><button onClick={fetchCoupons} className="px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"><RefreshCw className={`w-4 h-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} /></button></div></div>
            {isLoading && <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}
            {!isLoading && (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paginatedCoupons.map((coupon) => (
                                <motion.div key={coupon.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition ${isExpired(coupon.valid_to) ? 'border-gray-200 opacity-60' : 'border-gray-100'}`}>
                                    <div className={`p-3 -m-3 mb-3 rounded-t-xl ${coupon.discount_type === 'percentage' ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gradient-to-r from-green-500 to-green-600'} text-white`}>
                                        <div className="flex justify-between items-center"><div className="flex items-center gap-2"><Gift className="w-4 h-4" /><span className="font-bold text-sm">{coupon.code}</span></div><button onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)} className={`px-2 py-0.5 rounded-full text-xs ${coupon.is_active && !isExpired(coupon.valid_to) ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>{coupon.is_active && !isExpired(coupon.valid_to) ? 'Active' : 'Inactive'}</button></div>
                                        <div className="mt-1"><span className="text-xl font-bold">{coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `${formatCurrency(coupon.discount_value)} OFF`}</span></div>
                                    </div>
                                    <div className="space-y-2 mt-3"><div className="flex items-center gap-2 text-sm">{coupon.minimum_order > 0 ? <><DollarSign className="w-3 h-3 text-gray-400" /><span>Min order: {formatCurrency(coupon.minimum_order)}</span></> : <><span className="text-gray-400">No minimum</span></>}</div>{coupon.maximum_discount > 0 && (<div className="flex items-center gap-2 text-sm"><Percent className="w-3 h-3 text-gray-400" /><span>Max discount: {formatCurrency(coupon.maximum_discount)}</span></div>)}<div className="flex items-center gap-2 text-sm"><Calendar className="w-3 h-3 text-gray-400" /><span>{new Date(coupon.valid_from).toLocaleDateString()} - {new Date(coupon.valid_to).toLocaleDateString()}</span></div><div className="flex items-center gap-2 text-sm"><Users className="w-3 h-3 text-gray-400" /><span>Used: {coupon.times_used || 0} / {coupon.usage_limit || '∞'}</span></div></div>
                                    <div className="flex justify-end gap-1 pt-2 border-t border-gray-100 mt-2"><button onClick={() => openModal(coupon)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-3.5 h-3.5" /></button><button onClick={() => setShowDeleteConfirm(coupon.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button></div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {paginatedCoupons.map((coupon) => (
                                <div key={coupon.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition">
                                    <div className="flex items-center gap-3 flex-1"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${coupon.discount_type === 'percentage' ? 'bg-primary-100' : 'bg-green-100'}`}>{coupon.discount_type === 'percentage' ? <Percent className="w-4 h-4 text-primary-600" /> : <DollarSign className="w-4 h-4 text-green-600" />}</div><div className="flex-1"><div className="flex items-center gap-2"><span className="font-medium text-gray-800">{coupon.code}</span><span className={`text-xs px-2 py-0.5 rounded-full ${coupon.is_active && !isExpired(coupon.valid_to) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{coupon.is_active && !isExpired(coupon.valid_to) ? 'Active' : 'Inactive'}</span></div><p className="text-xs text-gray-500">{coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `${formatCurrency(coupon.discount_value)} OFF`} • Used {coupon.times_used || 0} times</p></div></div>
                                    <div className="flex gap-1"><button onClick={() => openModal(coupon)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-3.5 h-3.5" /></button><button onClick={() => setShowDeleteConfirm(coupon.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button></div>
                                </div>
                            ))}
                        </div>
                    )}
                    {totalPages > 1 && (<div className="flex justify-center gap-2 mt-6"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button><span className="px-4 py-2 text-sm text-gray-600">Page {currentPage} of {totalPages}</span><button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button></div>)}
                </>
            )}
        </>
    );

    return (
        <div className="min-h-screen bg-gray-50"><div className="flex"><div className="w-72 bg-white border-r border-gray-200 min-h-screen flex-shrink-0"><div className="p-6 border-b border-gray-200"><h2 className="text-lg font-bold text-gray-800">Configure your store</h2><p className="text-sm text-gray-500 mt-1">Settings Menu</p><p className="text-xs text-gray-400 mt-2">Select a section to configure</p></div><nav className="p-3">{settingsMenu.map((item) => { const Icon = item.icon; const isActive = activeSettingsTab === item.id; return (<button key={item.id} onClick={() => setActiveSettingsTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 mb-1 ${isActive ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}><Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} /><div className="flex-1"><p className={`font-medium text-sm ${isActive ? 'text-primary-700' : 'text-gray-700'}`}>{item.label}</p><p className="text-xs text-gray-400">{item.description}</p></div></button>); })}</nav></div><div className="flex-1 p-6"><div className="max-w-5xl mx-auto"><div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200"><div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center"><ActiveIcon className="w-5 h-5 text-primary-600" /></div><div><h1 className="text-2xl font-bold text-gray-800">{settingsMenu.find(m => m.id === activeSettingsTab)?.label}</h1><p className="text-gray-500 text-sm">{settingsMenu.find(m => m.id === activeSettingsTab)?.description}</p></div></div><div className="bg-white rounded-xl border border-gray-200 p-6">{activeSettingsTab === 'coupons' ? renderCouponsContent() : <div className="text-center py-12"><p className="text-gray-500">Configure {settingsMenu.find(m => m.id === activeSettingsTab)?.label} settings here</p></div>}</div></div></div></div>

            <AnimatePresence>{isModalOpen && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-800">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2><button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button></div><form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label><input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="WELCOME10" className="w-full px-4 py-2 border border-gray-200 rounded-xl uppercase" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label><select value={formData.discount_type} onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl"><option value="percentage">Percentage (%)</option><option value="fixed">Fixed Amount</option></select></div><div><label className="block text-sm font-medium text-gray-700 mb-1">{formData.discount_type === 'percentage' ? 'Discount Percentage' : 'Discount Amount'} *</label><input type="number" value={formData.discount_value} onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order</label><input type="number" value={formData.minimum_order} onChange={(e) => setFormData({ ...formData, minimum_order: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl" placeholder="0 = no minimum" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Maximum Discount</label><input type="number" value={formData.maximum_discount} onChange={(e) => setFormData({ ...formData, maximum_discount: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl" placeholder="0 = unlimited" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Valid From *</label><input type="date" value={formData.valid_from} onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Valid To *</label><input type="date" value={formData.valid_to} onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl" required /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label><input type="number" value={formData.usage_limit} onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl" placeholder="Unlimited" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Per User Limit</label><input type="number" value={formData.per_user_limit} onChange={(e) => setFormData({ ...formData, per_user_limit: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl" placeholder="Unlimited" /></div></div><div className="mb-4"><label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 text-primary-600 rounded" /><span className="text-sm text-gray-700">Active</span></label></div><div className="flex gap-3 pt-4"><button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">{editingCoupon ? 'Update' : 'Create'}</button></div></form></motion.div></div>)}</AnimatePresence>

            <AnimatePresence>{showDeleteConfirm && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-sm p-6"><div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"><AlertCircle className="w-5 h-5 text-red-600" /></div><h2 className="text-lg font-bold text-gray-800">Delete Coupon?</h2></div><p className="text-gray-600 text-sm mb-6">This action cannot be undone.</p><div className="flex gap-3"><button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50">Cancel</button><button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">Delete</button></div></motion.div></div>)}</AnimatePresence>
        </div>
    );
};

export default AdminCouponsPage;
