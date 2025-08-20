import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,   
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const payload = response?.data;
    if (payload && typeof payload === 'object' && 'data' in payload) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response.data = (payload as any).data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const isAuthEndpoint = typeof error.config?.url === 'string' && error.config.url.includes('/auth/');
      if (!isAuthEndpoint && window.location.pathname !== '/login') {
        localStorage.removeItem('auth-token');
        window.history.pushState({}, '', '/login');
      }
    } else if (error.response?.status >= 500) {
      toast.error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
    }
    return Promise.reject(error);
  }
);