import apiClient from './client';

export const cartAPI = {
  getCart: () => 
    apiClient.get('/cart/'),
  
  addToCart: (productId, quantity = 1) => 
    apiClient.post('/cart/add', { product_id: productId, quantity }),
  
  updateQuantity: (productId, quantity) => 
    apiClient.put(`/cart/item/${productId}`, { quantity }),
  
  removeItem: (productId) => 
    apiClient.delete(`/cart/item/${productId}`),
  
  clearCart: () => 
    apiClient.delete('/cart/clear'),
  
  getCartCount: () => 
    apiClient.get('/cart/count'),
  
  mergeCart: () => 
    apiClient.post('/cart/merge'),
};