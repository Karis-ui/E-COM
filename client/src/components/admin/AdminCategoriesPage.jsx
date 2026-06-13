import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    FolderTree,
    ChevronLeft,
    ChevronRight,
    X,
    Check,
    Grid3x3,
    List,
    Filter,
    ChevronDown,
    Settings,
    Tag,
    Layers,
    Archive,
    RefreshCw,
    AlertCircle,
    DollarSign,
    Truck,
    Bell,
    Lock,
    Globe,
    Share2,
    CreditCard,
    Home
} from 'lucide-react';
import { adminAPI } from '../../api/admin';
import toast from 'react-hot-toast';

const AdminCategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState('grid');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [activeSettingsTab, setActiveSettingsTab] = useState('categories');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        display_order: 0,
        is_active: true,
    });

    const itemsPerPage = 9;

    // Settings Menu Items
    const settingsMenu = [
        { id: 'categories', label: 'Categories', icon: Tag, description: 'Manage product categories' },
        { id: 'subcategories', label: 'Subcategories', icon: Layers, description: 'Manage product subcategories' },
        { id: 'delivery', label: 'Delivery', icon: Truck, description: 'Configure delivery fees' },
        { id: 'shop-info', label: 'Shop Info', icon: Home, description: 'Manage store information' },
        { id: 'payment', label: 'Payment', icon: CreditCard, description: 'Payment methods & settings' },
        { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email & SMS notifications' },
        { id: 'security', label: 'Security', icon: Lock, description: 'Security & access control' },
        { id: 'seo', label: 'SEO', icon: Globe, description: 'Search engine optimization' },
        { id: 'social-media', label: 'Social Media', icon: Share2, description: 'Social media integration' },
    ];

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const res = await adminAPI.getCategories();
            setCategories(res.data.categories);
        } catch (err) {
            toast.error('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingCategory) {
                await adminAPI.updateCategory(editingCategory.id, formData);
                toast.success('Category updated successfully');
            } else {
                await adminAPI.createCategory(formData);
                toast.success('Category created successfully');
            }
            setIsModalOpen(false);
            setEditingCategory(null);
            setFormData({
                name: '',
                description: '',
                display_order: 0,
                is_active: true,
            });
            fetchCategories();
        } catch (err) {
            toast.error('Failed to save category');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setIsLoading(true);
        try {
            await adminAPI.deleteCategory(id);
            toast.success('Category deleted successfully');
            setShowDeleteConfirm(null);
            fetchCategories();
        } catch (err) {
            toast.error('Failed to delete category');
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name || '',
                description: category.description || '',
                display_order: category.display_order || 0,
                is_active: category.is_active !== undefined ? category.is_active : true,
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                description: '',
                display_order: categories.length + 1,
                is_active: true,
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({
            name: '',
            description: '',
            display_order: 0,
            is_active: true,
        });
    };

    // Filter and search logic
    const filteredCategories = categories.filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && category.is_active) ||
            (filterStatus === 'inactive' && !category.is_active);
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const paginatedCategories = filteredCategories.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Stats
    const activeCount = categories.filter(c => c.is_active).length;
    const inactiveCount = categories.filter(c => !c.is_active).length;

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    // Placeholder content for other settings tabs
    const renderSettingsContent = () => {
        switch (activeSettingsTab) {
            case 'categories':
                return renderCategoriesContent();
            case 'subcategories':
                return (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Layers className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Subcategories Management</h3>
                        <p className="text-gray-500">Coming soon - Manage product subcategories</p>
                    </div>
                );
            case 'delivery':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee - Nairobi (KSh)</label>
                            <input type="number" className="w-full px-4 py-2 border border-gray-200 rounded-xl" placeholder="500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee - Other Counties (KSh)</label>
                            <input type="number" className="w-full px-4 py-2 border border-gray-200 rounded-xl" placeholder="500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Threshold (KSh)</label>
                            <input type="number" className="w-full px-4 py-2 border border-gray-200 rounded-xl" placeholder="10000" />
                        </div>
                        <p className="text-xs text-gray-500">Orders above this amount get free delivery</p>
                    </div>
                );
            default:
                return (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Configure {settingsMenu.find(m => m.id === activeSettingsTab)?.label} settings here</p>
                    </div>
                );
        }
    };

    const renderCategoriesContent = () => (
        <>
            {/* Header with Add Button */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Categories</h2>
                    <p className="text-gray-500 text-sm">Manage your product categories</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-xl font-bold text-gray-800">{categories.length}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-xs text-green-600">Active</p>
                    <p className="text-xl font-bold text-green-700">{activeCount}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Inactive</p>
                    <p className="text-xl font-bold text-gray-500">{inactiveCount}</p>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}
                        >
                            <Grid3x3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={fetchCategories}
                        className="px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                        <RefreshCw className={`w-4 h-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            )}

            {/* Categories Grid */}
            {!isLoading && (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paginatedCategories.map((category) => (
                                <motion.div
                                    key={category._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -2 }}
                                    className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                                <FolderTree className="w-4 h-4 text-primary-600" />
                                            </div>
                                            <h3 className="font-semibold text-gray-800">{category.name}</h3>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${category.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {category.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{category.description || 'No description'}</p>
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <span className="text-xs text-gray-400">Order: {category.display_order}</span>
                                        <div className="flex gap-1">
                                            <button onClick={() => openModal(category)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => setShowDeleteConfirm(category._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {paginatedCategories.map((category) => (
                                <div key={category._id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <FolderTree className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-800">{category.name}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${category.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {category.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">{category.description || 'No description'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openModal(category)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => setShowDeleteConfirm(category._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {filteredCategories.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FolderTree className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="font-medium text-gray-700 mb-1">No categories found</h3>
                            <p className="text-sm text-gray-500">{searchTerm ? 'Try a different search' : 'Create your first category'}</p>
                        </div>
                    )}
                </>
            )}
        </>
    );

    const ActiveIcon = settingsMenu.find(m => m.id === activeSettingsTab)?.icon || Settings;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                {/* LEFT SIDEBAR - Settings Menu */}
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
                                <button
                                    key={item.id}
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

                {/* RIGHT MAIN CONTENT */}
                <div className="flex-1 p-6">
                    <div className="max-w-5xl mx-auto">
                        {/* Section Header */}
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

                        {/* Dynamic Content */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            {renderSettingsContent()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-md p-6"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingCategory ? 'Edit Category' : 'Add Category'}
                                </h2>
                                <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.display_order}
                                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="w-4 h-4 text-primary-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700">Active</span>
                                    </label>
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
                                        {editingCategory ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-sm p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-800">Delete Category?</h2>
                            </div>
                            <p className="text-gray-600 text-sm mb-6">This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">
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

export default AdminCategoriesPage;