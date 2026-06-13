import apiClient from './client';

export const deliveryAPI = {
  trackOrder: (orderId) => 
    apiClient.get(`/delivery/track/${orderId}`),
  getMyDeliveries: () => 
    apiClient.get('/delivery/my-deliveries'),
  
  updateDeliveryStatus: (deliveryId, status) => 
    apiClient.post(`/delivery/update-status/${deliveryId}?status=${status}`),
  getAvailableRiders: () => 
    apiClient.get('/delivery/available-riders'),
  assignRider: (orderId, riderId) => 
    apiClient.post(`/delivery/assign/${orderId}`, { rider_id: riderId }),
};