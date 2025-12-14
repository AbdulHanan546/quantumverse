import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { tokenStorage } from './tokenStorage';

const baseURL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL,
  timeout: 120000, // 2 minutes for long-running requests like AI generation
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.get();
    // Ensure headers exist and are of correct type
    config.headers = config.headers ?? {};
    if (token) {
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
      if (
        !location.pathname.startsWith('/signin') &&
        !location.pathname.startsWith('/signup')
      ) {
        location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);
