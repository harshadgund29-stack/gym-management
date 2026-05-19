import axios from 'axios';

// In dev: Vite proxy forwards /api → http://localhost:8080/api
// In prod: set VITE_API_BASE_URL=https://your-backend.com/api
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor — attach JWT ─────────────────────────
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('gymUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch { /* ignore parse errors */ }
    }

    if (import.meta.env.DEV) {
      console.debug(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
        config.data ?? '');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.debug(`[API] ✓ ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    const status  = error.response?.status;
    const url     = error.config?.url ?? '';
    const msg     = error.response?.data?.message || error.message;

    if (import.meta.env.DEV) {
      console.error(`[API] ✗ ${status} ${url} — ${msg}`);
    }

    // Auto-logout on 401 ONLY for protected routes.
    // Do NOT redirect when the 401 comes from login/register/forgot-password —
    // those endpoints return 401 for wrong credentials, not expired sessions.
    const isAuthEndpoint = url.includes('/auth/');
    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('gymUser');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
