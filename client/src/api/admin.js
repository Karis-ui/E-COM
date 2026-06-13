import apiClient from "./client";

export const adminAPI = {
    getDashboardStats: () => apiClient.get('/admin/dashboard/stats'),
    getSalesChart: (days = 30) => apiClient.get(`/admin/dashboard/sales-chart?days=${days}`),
    getTopProducts: (limit = 10) => apiClient.get(`/admin/dashboard/top-products?limit=${limit}`),
    getRecentOrders: (limit = 10) => apiClient.get(`/admin/dashboard/recent-orders?limit=${limit}`),

    getProducts: (params) => apiClient.get('/admin/products', { params }),
    getProduct: (id) => apiClient.get(`/admin/products/${id}`),
    createProduct: (data) => apiClient.post('/admin/products', { data }),
    updateProduct: (id, data) => apiClient.put(`/admin/products/${id}`, { data }),
    deleeteProduct: (id) => apiClient.delete(`/admin/products/${id}`),
    updateStock: (id, quantity, operation) => apiClient.post(`/admin/products/${id}/stock`, { quantity, operation }),
    exportProducts: () => apiClient.get('/admin/products/export', { responseType: 'blob' }),

    getOrders: (params) => apiClient.get('/admin/orders', { params }),
    getOrder: (id) => apiClient.get(`/admin/orders/${id}`),
    updateOrderStatus: (id, status, note) => apiClient.put(`/admin/orders/${id}/status`, { status, note }),
    cancelOrder: (id, reason) => apiClient.post(`/admin/orders/${id}/cancel`, { reason }),

    getCategories: () => apiClient.get('/admin/categories'),
    createCategory: (data) => apiClient.post('/admin/categories', { data }),
    updateCategory: (id, data) => apiClient.put(`/admin/categories/${id}`, { data }),
    deleteCategory: (id) => apiClient.delete(`/admin/categories/${id}/delete`),

    getBrands: () => apiClient.get('/admin/brands'),
    createBrand: (data) => apiClient.post('/admin/brands', { data }),
    updateBrand: (id, data) => apiClient.put(`/admin/brands/${id}`, { data }),
    deleteBrand: (id) => apiClient.delete(`/admin/brands/${id}/delete`),

    getCoupons: () => apiClient.get('/admin/coupons'),
    createCoupon: (data) => apiClient.post('/admin/coupons', { data }),
    toggleCoupon: (id, isActive) => apiClient.put(`/admin/coupons/${id}/toggle`, { is_active: isActive }),

    getRiders: () => apiClient.get('/admin/riders'),
    createRIder: (data) => apiClient.post('/admin/riders', { data }),
    updateRider: (id, data) => apiClient.put(`/admin/riders/${id}`, { data }),
    deleteRider: (id) => apiClient.delete(`/admin/riders/${id}/delete`),

    getCustomers: (params) => apiClient.get('/admin/customers', { params }),
    getCustomer: (id) => apiClient.get(`/admin/customers/${id}`),
    updateCustomerStatus: (id, isActive) => apiClient.put(`/admin/customers/${id}/status`, { is_active: isActive }),

    getSettings: () => apiClient.get('/admin/settings'),
    updateSettings: (settings) => apiClient.put('/admin/settings', settings),
    getPublicSettings: () => apiClient.get('/admin/settings/public'),
};

export default adminAPI;