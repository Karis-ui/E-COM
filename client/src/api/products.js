import apiClient from "./client";

export const productsAPI = {
    getProducts: (params = {}) => apiClient.get('/products/', { params }),
    getProduct: (slugOrId) => apiClient.get(`/products/${slugOrId}`),
    getFeatured: (limit = 10) => apiClient.get('/products/featured', { params: { limit } }),
    getCategories: () => apiClient.get('/categories/'),
    getBrands: () => apiClient.get('/brands/'),
    getProductReviews: (Id, page = 1, limit = 10) => apiClient.get(`/products/${Id}/reviews`, { params: { page, limit } }),
    addReview: (data) => apiClient.post('/customer/reviews/', data),
    markReviewHelpful: (Id) => apiClient.post(`/customer/reviews/${Id}/helpful`),
};