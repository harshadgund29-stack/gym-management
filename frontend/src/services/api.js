import axios from 'axios'
import toast from 'react-hot-toast'

// Use environment variable for backend URL
// In your frontend root, create a .env file with:
// VITE_API_URL=http://localhost:8080/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
})

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('fitpro_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global error handler
api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.message || 'Something went wrong'
    if (err.response?.status === 401) {
      localStorage.removeItem('fitpro_token')
      localStorage.removeItem('fitpro_user')
      window.location.href = '/login'
    } else if (err.response?.status !== 400) {
      toast.error(msg)
    }
    return Promise.reject(err)
  }
)

// ============================
// Auth
// ============================
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (email) => api.post('/users/forgot-password', { email }),
  verifyOtp: (data) => api.post('/users/verify-otp', data),
  resetPassword: (data) => api.post('/users/reset-password', data),
}

// ============================
// Users
// ============================
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  uploadPicture: (formData) =>
    api.post('/users/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getAllUsers: () => api.get('/users'),
  getMembers: () => api.get('/users/members'),
  getTrainers: () => api.get('/users/trainers'),
  getUserById: (id) => api.get(`/users/${id}`),
  deleteUser: (id) => api.delete(`/users/${id}`),
}

// ============================
// Plans
// ============================
export const planAPI = {
  getAll: () => api.get('/plans'),
  getActive: () => api.get('/plans/active'),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
}

// ============================
// Memberships
// ============================
export const membershipAPI = {
  getAll: () => api.get('/memberships'),
  getByMember: (id) => api.get(`/memberships/member/${id}`),
}

// ============================
// Payments / Razorpay
// ============================
export const paymentAPI = {
  getAll: () => api.get('/payments'),
  getByMember: (id) => api.get(`/payments/member/${id}`),
  createRazorpayOrder: (data) => api.post('/razorpay/order', data),
  verifyRazorpayPayment: (payload) => api.post('/razorpay/verify', payload)
}

// ============================
// Attendance
// ============================
export const attendanceAPI = {
  mark: () => api.post('/attendance/mark'),
  getMy: () => api.get('/attendance/my'),
  getMyCount: () => api.get('/attendance/my/count'),
  getToday: () => api.get('/attendance/today'),
}

// ============================
// Sessions
// ============================
export const sessionAPI = {
  getAll: () => api.get('/sessions'),
  getByTrainer: (id) => api.get(`/sessions/trainer/${id}`),
  getByMember: (id) => api.get(`/sessions/member/${id}`),
  create: (data) => api.post('/sessions', data),
  update: (id, data) => api.put(`/sessions/${id}`, data),
  delete: (id) => api.delete(`/sessions/${id}`),
}

// ============================
// Workout Plans
// ============================
export const workoutAPI = {
  getByTrainer: (id) => api.get(`/workout-plans/trainer/${id}`),
  getByMember: (id) => api.get(`/workout-plans/member/${id}`),
  create: (data) => api.post('/workout-plans', data),
  update: (id, data) => api.put(`/workout-plans/${id}`, data),
  delete: (id) => api.delete(`/workout-plans/${id}`),
}

// ============================
// Dashboard
// ============================
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getAdminSummary: () => api.get('/dashboard/summary'),
}

export default api
