import api from './api';

// Backend UserController base: /api/users
export const userService = {
  // GET /api/users/profile  — own profile (any authenticated user)
  getMe:          ()           => api.get('/users/profile'),
  // PUT /api/users/profile  — update own profile
  updateMe:       (data)       => api.put('/users/profile', data),
  // GET /api/users          — all users (ADMIN only)
  getAllUsers:     ()           => api.get('/users'),
  // GET /api/users/members  — all members (ADMIN only)
  getMembers:     ()           => api.get('/users/members'),
  // GET /api/users/trainers — all trainers (ADMIN only)
  getTrainers:    ()           => api.get('/users/trainers'),
  // GET /api/users/{id}     — user by ID (ADMIN only)
  getUserById:    (id)         => api.get(`/users/${id}`),
  // DELETE /api/users/{id}  — delete user (ADMIN only)
  deleteUser:     (id)         => api.delete(`/users/${id}`),
  // PATCH /api/users/{id}/role   — change role (ADMIN only)
  changeRole:     (id, role)   => api.patch(`/users/${id}/role`, { role }),
  // PATCH /api/users/{id}/status — change status (ADMIN only)
  changeStatus:   (id, status) => api.patch(`/users/${id}/status`, { status }),
};
