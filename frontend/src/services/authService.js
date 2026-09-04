import apiClient from './api';

export const authService = {
  
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),

  adminLogin: (email, password) =>
    apiClient.post('/auth/admin/login', { email, password }),

  
  register: (userData) =>
    apiClient.post('/auth/register', userData),

  startOAuth: (provider, params = {}) =>
    apiClient.get(`/auth/${provider}/start`, { params }),

  exchangeOAuthCode: (code) =>
    apiClient.post('/auth/oauth/exchange', { code }),

  
  verifyEmail: (token) =>
    apiClient.post('/auth/verify-email', { token }),

  
  resendVerificationEmail: (email) =>
    apiClient.post('/auth/resend-verification', { email }),

  
  forgotPassword: (email) =>
    apiClient.post('/auth/forgot-password', { email }),

  
  resetPassword: (token, newPassword) =>
    apiClient.post('/auth/reset-password', { token, newPassword }),

  
  enableTwoFactor: () =>
    apiClient.post('/auth/2fa/enable'),

  
  verifyTwoFactor: (code) =>
    apiClient.post('/auth/2fa/verify', { code }),

  
  disableTwoFactor: (password) =>
    apiClient.post('/auth/2fa/disable', { password }),

  
  refreshToken: () =>
    apiClient.post('/auth/refresh-token'),

  
  logout: () =>
    apiClient.post('/auth/logout'),

  logoutAll: () =>
    apiClient.post('/auth/logout-all'),

  
  getCurrentUser: () =>
    apiClient.get('/auth/me'),

  
  updateProfile: (userData) =>
    apiClient.put('/auth/profile', userData),

  
  changePassword: (oldPassword, newPassword) =>
    apiClient.post('/auth/change-password', { oldPassword, newPassword }),
};
