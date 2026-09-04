import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
let csrfToken = null;
let csrfRequest = null;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


apiClient.interceptors.request.use(
  async (config) => {
    const method = (config.method || 'get').toUpperCase();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && !csrfToken) {
      csrfRequest ||= fetch(`${API_BASE_URL}/auth/csrf-token`, { credentials: 'include' })
        .then((response) => response.json())
        .then((data) => {
          csrfToken = data.csrfToken;
          return csrfToken;
        })
        .finally(() => {
          csrfRequest = null;
        });
      await csrfRequest;
    }
    if (csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.url !== '/auth/logout') {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
