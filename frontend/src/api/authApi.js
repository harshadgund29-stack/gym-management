import api from './axios';

/** POST /api/auth/login */
export const loginApi = (credentials) => api.post('/auth/login', credentials);

/** POST /api/auth/register */
export const registerApi = (userData) => api.post('/auth/register', userData);
