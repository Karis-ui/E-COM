import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Star,
  Zap,
  Loader2
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { fetchProducts, fetchCategories, fetchBrands } from '../store/slices/productSlice';
import { ALL_MOCK_PRODUCTS } from '../utils/mockProducts';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '-created_at',
  });

  const dispatch = useDispatch();
  const { products, categories, brands, total, isLoading } = useSelector((state) => state.products);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const itemsPerPage = 20;

  const displayProducts = products?.length > 0 ? products : ALL_MOCK_PRODUCTS;
  const displayTotal = total > 0 ? total : ALL_MOCK_PRODUCTS.length;

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    const params = {
      ...filters,
      page: currentPage,
      limit: itemsPerPage,
    };
    Object.keys(params).forEach(key => !params[key] && delete params[key]);
    dispatch(fetchProducts(params));
  }, [dispatch, filters, currentPage]);

  const sortOptions = [
    { value: '-created_at', label: 'Newest First' },
    { value: 'created_at', label: 'Oldest First' },
    { value: '-regular_price', label: 'Price: High to Low' },
    { value: 'regular_price', label: 'Price: Low to High' },
    { value: '-total_reviews', label: 'Most Popular' },
    { value: '-average_rating', label: 'Top Rated' },
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      sort: '-created_at',
    });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(displayTotal / itemsPerPage);
  const activeFilterCount = Object.values(filters).filter(v => v && v !== '-created_at').length;

  const safeCategories = categories || [];
  const safeBrands = brands || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent">
            Shop Electronics
          </h1>
          <p className="text-gray-500 mt-2">Discover the best deals on electronics in Kenya</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:hidden">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                <span className="font-medium">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <SlidersHorizontal className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">Filters</h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {safeCategories.map((cat) => (
                    <label key={cat._id || cat.id} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        value={cat._id || cat.id}
                        checked={filters.category === (cat._id || cat.id)}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-4 h-4 text-primary-600 rounded-full"
                      />
                      <span className="text-gray-700 group-hover:text-primary-600 transition">
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Brands</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {safeBrands.map((brand) => (
                    <label key={brand._id || brand.id} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        value={brand._id || brand.id}
                        checked={filters.brand === (brand._id || brand.id)}
                        onChange={(e) => handleFilterChange('brand', e.target.checked ? (brand._id || brand.id) : '')}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="text-gray-700 group-hover:text-primary-600 transition">
                        {brand.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Price Range (KSh)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <button
                onClick={clearFilters}
                className="w-full py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-600 hover:text-white transition"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-800">{displayProducts.length}</span> of{' '}
                <span className="font-semibold text-gray-800">{displayTotal}</span> products
              </p>

              <div className="flex items-center gap-4">
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.category && safeCategories.find(c => (c._id || c.id) === filters.category) && (
                  <div className="flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full text-sm">
                    Category: {safeCategories.find(c => (c._id || c.id) === filters.category)?.name}
                    <button onClick={() => handleFilterChange('category', '')}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {filters.brand && safeBrands.find(b => (b._id || b.id) === filters.brand) && (
                  <div className="flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full text-sm">
                    Brand: {safeBrands.find(b => (b._id || b.id) === filters.brand)?.name}
                    <button onClick={() => handleFilterChange('brand', '')}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <div className="flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full text-sm">
                    Price: {filters.minPrice || '0'} - {filters.maxPrice || '∞'} KSh
                    <button onClick={() => {
                      handleFilterChange('minPrice', '');
                      handleFilterChange('maxPrice', '');
                    }}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className={`grid ${viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'grid-cols-1 gap-4'
                }`}>
                {displayProducts.map((product, idx) => (
                  <ProductCard key={product._id || idx} product={product} index={idx} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg transition ${currentPage === pageNum
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'border border-gray-300 hover:bg-gray-100'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
                  <div className="space-y-2">
                    {safeCategories.map((cat) => (
                      <label key={cat._id || cat.id} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="mobile_category"
                          value={cat._id || cat.id}
                          checked={filters.category === (cat._id || cat.id)}
                          onChange={(e) => {
                            handleFilterChange('category', e.target.value);
                            setIsFilterOpen(false);
                          }}
                          className="w-4 h-4 text-primary-600"
                        />
                        <span>{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    clearFilters();
                    setIsFilterOpen(false);
                  }}
                  className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopPage;