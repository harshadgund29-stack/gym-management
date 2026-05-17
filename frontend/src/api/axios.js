import axios from 'axios';

/**
 * Axios instance — pre-configured for our backend.
 *
 * In development, CRA's package.json proxy forwards /api/* to http://localhost:8080.
 * In other environments, use REACT_APP_API_URL to point directly at the backend.
 */
const baseURL = process.env.REACT_APP_API_URL || '/api';

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
    const token = localStorage.getItem('gymToken');
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
