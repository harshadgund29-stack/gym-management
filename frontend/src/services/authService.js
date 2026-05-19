import api from './api';

/**
 * authService — all authentication API calls.
 *
 * api.baseURL is already '/api' (set in api.js),
 * so paths here are relative to /api (e.g. '/auth/login' → POST /api/auth/login).
 */
export const authService = {

  // POST /api/auth/register
  register: (data) => api.post('/auth/register', data),

  // POST /api/auth/login
  login: (data) => api.post('/auth/login', data),

  /**
   * POST /api/auth/forgot-password (OTP-based)
   * Sends OTP email for password reset.
   */
  // POST /api/users/forgot-password (OTP-based)
  forgotPassword: (email) =>
    api.post('/users/forgot-password', { email }),

  // POST /api/users/verify-otp
  verifyOtp: ({ email, otp }) =>
    api.post('/users/verify-otp', { email, otp }),

  // POST /api/users/reset-password
  resetPassword: ({ email, newPassword }) =>
    api.post('/users/reset-password', { email, newPassword }),
};
