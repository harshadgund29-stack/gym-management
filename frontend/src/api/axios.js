import axios from 'axios';

/**
 * Axios instance — pre-configured for our backend.
 *
 * In development, CRA's package.json proxy forwards /api/* to http://localhost:8080.
 * In other environments, use REACT_APP_API_URL to point directly at the backend.
 */
// In dev, Vite proxy forwards /api/* to the backend.
// baseURL must NOT include an extra /api prefix when the request path already starts with /api.
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor — automatically attaches the JWT token
 * to every outgoing request as "Authorization: Bearer <token>".
 */
api.interceptors.request.use(
  (config) => {
    // Support both token keys used across the codebase
    const token = localStorage.getItem('gymToken') || localStorage.getItem('fitpro_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor — if the server returns 401 (token expired/invalid),
 * clear local storage and redirect to login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gymToken');
      localStorage.removeItem('gymUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
