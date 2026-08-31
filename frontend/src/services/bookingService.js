import apiClient from './api';

export const bookingService = {
  bookTestDrive: (bookingData) =>
    apiClient.post('/bookings/test-drive', bookingData),

  bookShowroomVisit: (bookingData) =>
    apiClient.post('/bookings/showroom', bookingData),

  getBookingById: (id) =>
    apiClient.get(`/bookings/${id}`),

  getUserBookings: (userId, params) => {
    const url = userId ? `/users/${userId}/bookings` : '/bookings/user';
    return apiClient.get(url, { params });
  },

  updateBookingStatus: (bookingId, status) =>
    apiClient.patch(`/bookings/${bookingId}/status`, { status }),

  cancelBooking: (bookingId, reason) =>
    apiClient.put(`/bookings/${bookingId}/cancel`, { reason }),

  rescheduleBooking: (bookingId, newDate, newTime) =>
    apiClient.put(`/bookings/${bookingId}/reschedule`, { newDate, newTime }),

  getBookingConfirmation: (bookingId) =>
    apiClient.get(`/bookings/${bookingId}/confirmation`),

  sendBookingReminder: (bookingId) =>
    apiClient.post(`/bookings/${bookingId}/reminder`),

  getAvailableSlots: (dealerId, date) =>
    apiClient.get(`/dealers/${dealerId}/available-slots`, {
      params: { date },
    }),

  getDealerInfo: (dealerId) =>
    apiClient.get(`/dealers/${dealerId}`),

  getDealers: (params) =>
    apiClient.get('/dealers', { params }),
};
