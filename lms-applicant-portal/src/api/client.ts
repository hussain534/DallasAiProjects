import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

const API_BASE_URL = 'https://lmsdemo1.temenos.com/LendingAPI';
const API_VERSION = '1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Replace version placeholder in URL
    if (config.url) {
      config.url = config.url.replace('{version}', API_VERSION);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const endpoints = {
  login: '/api/v{version}/login',
  verifyApplicant: '/api/v{version}/verifyapplicant',
  application: {
    search: '/api/v{version}/application/search',
    get: (id: string) => `/api/v{version}/application/${id}`,
    create: '/api/v{version}/application',
    update: (id: string) => `/api/v{version}/application/${id}`,
  },
  applicants: {
    list: (appId: string) => `/api/v{version}/application/${appId}/applicants`,
    get: (appId: string, applicantId: string) =>
      `/api/v{version}/application/${appId}/applicants/${applicantId}`,
  },
  products: {
    list: '/api/v{version}/Products/products',
    subProducts: '/api/v{version}/SubProducts',
  },
  prescreen: {
    getOffers: (tin: string) => `/api/v{version}/ExperianPrescreen/${tin}/GetPrescreenOffers`,
  },
};
