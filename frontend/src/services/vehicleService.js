import apiClient from './api';

export const vehicleService = {
  
  getVehicles: (params) => apiClient.get('/vehicles', { params }),

  createVehicle: (vehicle) => apiClient.post('/admin/vehicles', vehicle),

  updateVehicle: (id, vehicle) => apiClient.put(`/admin/vehicles/${id}`, vehicle),

  deleteVehicle: (id) => apiClient.delete(`/admin/vehicles/${id}`),

  
  getVehicleById: (id) => apiClient.get(`/vehicles/${id}`),

  
  getFeaturedVehicles: (limit = 10) =>
    apiClient.get('/vehicles/featured', { params: { limit } }),

  
  getVehiclesByCategory: (category, params) =>
    apiClient.get(`/vehicles/category/${category}`, { params }),

  
  getRecommendations: (vehicleId) =>
    apiClient.get(`/vehicles/${vehicleId}/recommendations`),

  
  getVehicleReviews: (vehicleId, params) =>
    apiClient.get(`/vehicles/${vehicleId}/reviews`, { params }),

  
  submitReview: (vehicleId, reviewData) =>
    apiClient.post(`/vehicles/${vehicleId}/reviews`, reviewData),

  
  getAvailability: (vehicleId, startDate, endDate) =>
    apiClient.get(`/vehicles/${vehicleId}/availability`, {
      params: { startDate, endDate },
    }),

  
  searchVehicles: (query, filters) =>
    apiClient.post('/vehicles/search', { query, filters }),

  
  compareVehicles: (vehicleIds) =>
    apiClient.post('/vehicles/compare', { vehicleIds }),

  
  getVehicleImages: (vehicleId) =>
    apiClient.get(`/vehicles/${vehicleId}/images`),

  
  getVehicle360: (vehicleId) =>
    apiClient.get(`/vehicles/${vehicleId}/360-view`),

  
  getSpecifications: (vehicleId) =>
    apiClient.get(`/vehicles/${vehicleId}/specifications`),
};
