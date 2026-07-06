// src/pages/admin/AdminProductsPage.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  X,
  Edit,
  Trash2,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Tag,
  Building2,
  DollarSign,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Download,
  Grid3x3,
  List
} from 'lucide-react';
import { adminAPI } from '../../api/admin';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const AdminProductsPage = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const itemsPerPage = 20;

  // Check if we're on "add product" page
  const isAddPage = location.pathname.includes('/add');

  useEffect(() => {
    if (!isAddPage) {
      fetchProducts();
      fetchCategories();
      fetchBrands();
    }
  }, [filterStatus, currentPage, searchTerm]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        is_active: filterStatus !== 'all' ? filterStatus === 'active' : undefined
      };
      const res = await adminAPI.getProducts(params);
      setProducts(res.data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await adminAPI.getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await adminAPI.getBrands();
      setBrands(res.data);
    } catch (err) {
      console.error('Failed to load brands');
    }
  };

  const viewProductDetails = async (productId) => {
    try {
      const res = await adminAPI.getProduct(productId);
      setSelectedProduct(res.data);
      setIsDetailModalOpen(true);
    } catch (err) {
      toast.error('Failed to load product details');
    }
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      await adminAPI.updateProduct(productId, { is_active: !currentStatus });
      toast.success(currentStatus ? 'Product deactivated' : 'Product activated');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminAPI.deleteProduct(productId);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (err) {
        toast.error('Failed to delete product');
      }
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive
      ? { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Active' }
      : { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Inactive' };
  };

  const getStockStatus = (product) => {
    if (product.stock_quantity === 0) {
      return { color: 'bg-red-100 text-red-800', label: 'Out of Stock' };
    }
    if (product.stock_quantity <= product.low_stock_threshold) {
      return { color: 'bg-yellow-100 text-yellow-800', label: 'Low Stock' };
    }
    return { color: 'bg-green-100 text-green-800', label: 'In Stock' };
  };

  // Stats
  const totalProducts = products.length;
  const activeCount = products.filter(p => p.is_active).length;
  const lowStockCount = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= (p.low_stock_threshold || 5)).length;
  const outOfStockCount = products.filter(p => p.stock_quantity === 0).length;

  // If on Add Product page
  if (isAddPage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/admin/products"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
            <p className="text-gray-500 text-sm">Create a new product listing</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="iPhone 15 Pro Max"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="IP15PM-256-SB"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                  <option value="">Select Brand</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regular Price (KSh) *</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="165000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (KSh)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="159999"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="5"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  rows="4"
                  placeholder="Product description..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Main Image URL *</label>
                <input
                  type="url"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-600 rounded"
                defaultChecked
              />
              <label className="text-sm text-gray-700">Active (visible to customers)</label>
            </div>

            <div className="flex gap-3 pt-4">
              <Link
                to="/admin/products"
                className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
              >
                Create Product
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
            Products
          </h1>
          <p className="text-gray-500 mt-1">Manage your product inventory</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/products/add"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
          <button
            onClick={fetchProducts}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-800">{totalProducts}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-600" />
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
        <div className="bg-yellow-50 rounded-xl p-5 shadow-sm border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-700">{lowStockCount}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-red-50 rounded-xl p-5 shadow-sm border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-700">{outOfStockCount}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
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
              placeholder="Search by name, SKU or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchProducts()}
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
              onClick={fetchProducts}
              className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-medium"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No products found</h3>
          <p className="text-sm text-gray-500">Try adjusting your filters or add a new product</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product, idx) => {
            const statusBadge = getStatusBadge(product.is_active);
            const stockStatus = getStockStatus(product);
            const StatusIcon = statusBadge.icon;
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
              >
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={product.main_image || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=No+Image'}
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => toggleProductStatus(product.id, product.is_active)}
                      className={`p-1.5 rounded-lg transition ${product.is_active
                          ? 'bg-white/90 text-gray-600 hover:bg-gray-100'
                          : 'bg-white/90 text-green-600 hover:bg-green-50'
                        }`}
                    >
                      {product.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => viewProductDetails(product.id)}
                      className="p-1.5 bg-white/90 rounded-lg hover:bg-gray-100 transition"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${stockStatus.color}`}>
                      {stockStatus.label}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800 text-sm line-clamp-1">{product.name}</h3>
                      <p className="text-xs text-gray-400">{product.sku}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge.color}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-primary-600">{formatCurrency(product.regular_price)}</p>
                      {product.sale_price && (
                        <p className="text-xs text-gray-400 line-through">{formatCurrency(product.sale_price)}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Stock: {product.stock_quantity}</p>
                  </div>
                  <div className="mt-3 flex justify-end gap-1 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => viewProductDetails(product.id)}
                      className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product, idx) => {
                  const statusBadge = getStatusBadge(product.is_active);
                  const stockStatus = getStockStatus(product);
                  const StatusIcon = statusBadge.icon;
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={product.main_image || 'https://via.placeholder.com/40'}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                            />
                          </div>
                          <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{product.sku}</td>
                      <td className="px-6 py-4 font-bold text-primary-600">{formatCurrency(product.regular_price)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${stockStatus.color}`}>
                          {stockStatus.label} ({product.stock_quantity})
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => viewProductDetails(product.id)}
                            className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleProductStatus(product.id, product.is_active)}
                            className={`p-1.5 rounded-lg transition ${product.is_active
                                ? 'text-gray-400 hover:bg-gray-100'
                                : 'text-green-600 hover:bg-green-50'
                              }`}
                          >
                            {product.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {products.length > 0 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {currentPage} of {Math.ceil(totalProducts / itemsPerPage)}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalProducts / itemsPerPage), p + 1))}
            disabled={currentPage === Math.ceil(totalProducts / itemsPerPage)}
            className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Product Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Product Details</h3>
                  <p className="text-sm text-gray-500">{selectedProduct.sku}</p>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex gap-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={selectedProduct.main_image || 'https://via.placeholder.com/128'}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/128'}
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">{selectedProduct.name}</h4>
                    <p className="text-sm text-gray-500">{selectedProduct.brand}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedProduct.is_active).color}`}>
                        {getStatusBadge(selectedProduct.is_active).label}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStockStatus(selectedProduct).color}`}>
                        {getStockStatus(selectedProduct).label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="text-lg font-bold text-primary-600">{formatCurrency(selectedProduct.regular_price)}</p>
                    {selectedProduct.sale_price && (
                      <p className="text-xs text-gray-400 line-through">{formatCurrency(selectedProduct.sale_price)}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Stock</p>
                    <p className="text-lg font-bold">{selectedProduct.stock_quantity} units</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 col-span-2">
                    <p className="text-xs text-gray-500">Description</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedProduct.description || 'No description'}</p>
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

export default AdminProductsPage;