import apiClient from './api';

export const authService = {
  
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),

  
  register: (userData) =>
    apiClient.post('/auth/register', userData),

  googleLogin: (googleProfile) =>
    apiClient.post('/auth/google', googleProfile),

  
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

  
  getCurrentUser: () =>
    apiClient.get('/auth/me'),

  
  updateProfile: (userData) =>
    apiClient.put('/auth/profile', userData),

  
  changePassword: (oldPassword, newPassword) =>
    apiClient.post('/auth/change-password', { oldPassword, newPassword }),
};
