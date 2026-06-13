import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit, Trash2, Search, Users, X, Check, Mail, Phone, MapPin,
    Settings, Tag, Layers, Building2, Truck, CreditCard, Bell, Lock,
    Globe, Share2, Package, Gift, AlertCircle, Grid3x3, List,
    RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import { adminAPI } from '../../api/admin';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const AdminCustomersPage = () => {
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState('grid');
    const [filterStatus, setFilterStatus] = useState('all');
    const [activeSettingsTab, setActiveSettingsTab] = useState('customers');
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', address: '', city: '', state: '', zip_code: '', is_active: true
    });

    const itemsPerPage = 9;

    const settingsMenu = [
        { id: 'customers', label: 'Customers', icon: Users, description: 'Manage customer accounts' },
        { id: 'orders', label: 'Orders', icon: Package, description: 'Manage customer orders' },
        { id: 'riders', label: 'Riders', icon: Truck, description: 'Manage delivery riders' },
        { id: 'coupons', label: 'Coupons', icon: Gift, description: 'Manage discount coupons' },
        { id: 'brands', label: 'Brands', icon: Building2, description: 'Manage product brands' },
        { id: 'categories', label: 'Categories', icon: Tag, description: 'Manage product categories' },
        { id: 'delivery', label: 'Delivery', icon: Truck, description: 'Configure delivery fees' },
        { id: 'payment', label: 'Payment', icon: CreditCard, description: 'Payment methods & settings' },
        { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email & SMS notifications' },
        { id: 'security', label: 'Security', icon: Lock, description: 'Security & access control' },
        { id: 'seo', label: 'SEO', icon: Globe, description: 'Search engine optimization' },
        { id: 'social-media', label: 'Social Media', icon: Share2, description: 'Social media integration' },
    ];

    useEffect(() => { fetchCustomers(); }, []);

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const res = await adminAPI.getCustomers();
            setCustomers(res.data);
        } catch (err) {
            toast.error('Failed to load customers');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingCustomer) {
                await adminAPI.updateCustomer(editingCustomer.id, formData);
                toast.success('Customer updated successfully');
            } else {
                await adminAPI.createCustomer(formData);
                toast.success('Customer created successfully');
            }
            closeModal();
            fetchCustomers();
        } catch (err) {
            toast.error(editingCustomer ? 'Failed to save customer' : 'Failed to create customer');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setIsLoading(true);
        try {
            await adminAPI.deleteCustomer(id);
            toast.success('Customer deleted successfully');
            setShowDeleteConfirm(null);
            fetchCustomers();
        } catch (err) {
            toast.error('Failed to delete customer');
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = (customer = null) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({
                name: customer.name, email: customer.email, phone: customer.phone || '',
                address: customer.address || '', city: customer.city || '',
                state: customer.state || '', zip_code: customer.zip_code || '', is_active: customer.is_active
            });
        } else {
            setEditingCustomer(null);
            setFormData({ name: '', email: '', phone: '', address: '', city: '', state: '', zip_code: '', is_active: true });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
        setFormData({ name: '', email: '', phone: '', address: '', city: '', state: '', zip_code: '', is_active: true });
    };

    const toggleCustomerStatus = async (id, currentStatus) => {
        try {
            await adminAPI.updateCustomer(id, { is_active: !currentStatus });
            toast.success(currentStatus ? 'Customer deactivated' : 'Customer activated');
            fetchCustomers();
        } catch (err) {
            toast.error('Failed to update customer status');
        }
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.phone && customer.phone.includes(searchTerm));
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && customer.is_active) ||
            (filterStatus === 'inactive' && !customer.is_active);
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const activeCount = customers.filter(c => c.is_active).length;
    const totalOrders = customers.reduce((sum, c) => sum + (c.orders_count || 0), 0);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus]);

    const ActiveIcon = settingsMenu.find(m => m.id === activeSettingsTab)?.icon || Users;

    const renderCustomersContent = () => (
        <>
            <div className="flex justify-between items-center mb-6">
                <div><h2 className="text-xl font-bold text-gray-800">Customers</h2><p className="text-gray-500 text-sm">Manage customer accounts</p></div>
                <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"><Plus className="w-4 h-4" />Add Customer</button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500">Total</p><p className="text-xl font-bold text-gray-800">{customers.length}</p></div>
                <div className="bg-green-50 rounded-xl p-3"><p className="text-xs text-green-600">Active</p><p className="text-xl font-bold text-green-700">{activeCount}</p></div>
                <div className="bg-blue-50 rounded-xl p-3"><p className="text-xs text-blue-600">Total Orders</p><p className="text-xl font-bold text-blue-700">{totalOrders}</p></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500" /></div>
                <div className="flex gap-2">
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm"><option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
                    <div className="flex border border-gray-200 rounded-xl overflow-hidden"><button onClick={() => setViewMode('grid')} className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}><Grid3x3 className="w-4 h-4" /></button><button onClick={() => setViewMode('list')} className={`px-3 py-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}><List className="w-4 h-4" /></button></div>
                    <button onClick={fetchCustomers} className="px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"><RefreshCw className={`w-4 h-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} /></button>
                </div>
            </div>
            {isLoading && <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}
            {!isLoading && (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paginatedCustomers.map((customer) => (
                                <motion.div key={customer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3"><div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">{customer.name.charAt(0).toUpperCase()}</div><div><h3 className="font-semibold text-gray-800">{customer.name}</h3><p className="text-xs text-gray-500">ID: {customer.id}</p></div></div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${customer.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{customer.is_active ? 'Active' : 'Inactive'}</span>
                                    </div>
                                    <div className="space-y-2 text-sm"><div className="flex items-center gap-2"><Mail className="w-3 h-3 text-gray-400" /><span className="text-gray-600">{customer.email}</span></div><div className="flex items-center gap-2"><Phone className="w-3 h-3 text-gray-400" /><span className="text-gray-600">{customer.phone || '-'}</span></div><div className="flex items-center gap-2"><MapPin className="w-3 h-3 text-gray-400" /><span className="text-gray-600 text-xs">{customer.address ? `${customer.address}, ${customer.city}` : '-'}</span></div></div>
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100"><span className="text-xs text-gray-500">{customer.orders_count || 0} orders</span><div className="flex gap-1"><button onClick={() => openModal(customer)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-3.5 h-3.5" /></button><button onClick={() => setShowDeleteConfirm(customer.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button><button onClick={() => toggleCustomerStatus(customer.id, customer.is_active)} className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-lg">{customer.is_active ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}</button></div></div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {paginatedCustomers.map((customer) => (
                                <div key={customer.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition">
                                    <div className="flex items-center gap-3 flex-1"><div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">{customer.name.charAt(0).toUpperCase()}</div><div className="flex-1"><div className="flex items-center gap-2"><span className="font-medium text-gray-800">{customer.name}</span><span className={`text-xs px-2 py-0.5 rounded-full ${customer.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{customer.is_active ? 'Active' : 'Inactive'}</span></div><p className="text-xs text-gray-500">{customer.email} | {customer.phone || 'No phone'}</p></div></div>
                                    <div className="flex gap-1"><button onClick={() => openModal(customer)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-3.5 h-3.5" /></button><button onClick={() => setShowDeleteConfirm(customer.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button></div>
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
        <div className="min-h-screen bg-gray-50"><div className="flex"><div className="w-72 bg-white border-r border-gray-200 min-h-screen flex-shrink-0"><div className="p-6 border-b border-gray-200"><h2 className="text-lg font-bold text-gray-800">Configure your store</h2><p className="text-sm text-gray-500 mt-1">Settings Menu</p><p className="text-xs text-gray-400 mt-2">Select a section to configure</p></div><nav className="p-3">{settingsMenu.map((item) => { const Icon = item.icon; const isActive = activeSettingsTab === item.id; return (<button key={item.id} onClick={() => setActiveSettingsTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 mb-1 ${isActive ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}><Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} /><div className="flex-1"><p className={`font-medium text-sm ${isActive ? 'text-primary-700' : 'text-gray-700'}`}>{item.label}</p><p className="text-xs text-gray-400">{item.description}</p></div></button>); })}</nav></div><div className="flex-1 p-6"><div className="max-w-5xl mx-auto"><div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200"><div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center"><ActiveIcon className="w-5 h-5 text-primary-600" /></div><div><h1 className="text-2xl font-bold text-gray-800">{settingsMenu.find(m => m.id === activeSettingsTab)?.label}</h1><p className="text-gray-500 text-sm">{settingsMenu.find(m => m.id === activeSettingsTab)?.description}</p></div></div><div className="bg-white rounded-xl border border-gray-200 p-6">{activeSettingsTab === 'customers' ? renderCustomersContent() : <div className="text-center py-12"><p className="text-gray-500">Configure {settingsMenu.find(m => m.id === activeSettingsTab)?.label} settings here</p></div>}</div></div></div></div>

            <AnimatePresence>{isModalOpen && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-md p-6"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-800">{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h2><button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button></div><form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">State</label><input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl" /></div></div><div className="mb-4"><label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 text-primary-600 rounded" /><span className="text-sm text-gray-700">Active</span></label></div><div className="flex gap-3 pt-4"><button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">{editingCustomer ? 'Update' : 'Create'}</button></div></form></motion.div></div>)}</AnimatePresence>

            <AnimatePresence>{showDeleteConfirm && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-sm p-6"><div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"><AlertCircle className="w-5 h-5 text-red-600" /></div><h2 className="text-lg font-bold text-gray-800">Delete Customer?</h2></div><p className="text-gray-600 text-sm mb-6">This action cannot be undone.</p><div className="flex gap-3"><button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50">Cancel</button><button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">Delete</button></div></motion.div></div>)}</AnimatePresence>
        </div>
    );
};

export default AdminCustomersPage;