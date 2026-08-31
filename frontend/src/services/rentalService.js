import apiClient from './api';

export const rentalService = {
  
  createRental: (rentalData) =>
    apiClient.post('/rentals', rentalData),

  
  getRentalById: (id) =>
    apiClient.get(`/rentals/${id}`),

  
  getRentalHistory: (userId, params) =>
    apiClient.get(`/users/${userId}/rentals`, { params }),

  
  getAvailableVehicles: (params) =>
    apiClient.get('/rentals/available', { params }),

  
  calculatePrice: (vehicleId, startDate, endDate, options = {}) =>
    apiClient.post('/rentals/calculate-price', {
      vehicleId,
      startDate,
      endDate,
      ...options,
    }),

  
  checkAvailability: (vehicleId, startDate, endDate) =>
    apiClient.post('/rentals/check-availability', {
      vehicleId,
      startDate,
      endDate,
    }),

  
  getRentalTerms: () =>
    apiClient.get('/rentals/terms'),

  
  applyCoupon: (code, rentalData) =>
    apiClient.post('/rentals/apply-coupon', { code, ...rentalData }),

  
  cancelRental: (rentalId, reason) =>
    apiClient.put(`/rentals/${rentalId}/cancel`, { reason }),

  
  extendRental: (rentalId, newEndDate) =>
    apiClient.put(`/rentals/${rentalId}/extend`, { newEndDate }),

  
  getRentalInvoice: (rentalId) =>
    apiClient.get(`/rentals/${rentalId}/invoice`),
};
