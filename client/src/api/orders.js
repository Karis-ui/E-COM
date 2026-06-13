import apiClient from './client';

export const ordersAPI = {
  createOrder: (orderData) => 
    apiClient.post('/orders/checkout', orderData),
  
  getMyOrders: () => 
    apiClient.get('/orders/'),
  
  getOrder: (orderId) => 
    apiClient.get(`/orders/${orderId}`),
  
  cancelOrder: (orderId, reason) => 
    apiClient.post(`/orders/${orderId}/cancel`, { reason }),
  
  trackOrder: (orderId) => 
    apiClient.get(`/delivery/track/${orderId}`),
  
  initiateMpesaPayment: (orderId) => 
    apiClient.post(`/orders/${orderId}/pay-mpesa`),
  
  checkPaymentStatus: (checkoutRequestId) => 
    apiClient.get(`/payments/status/${checkoutRequestId}`),
};