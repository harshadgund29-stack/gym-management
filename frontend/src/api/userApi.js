import api from './axios';

export const getAllUsers      = ()         => api.get('/users');
export const getAllMembers    = ()         => api.get('/users/members');
export const getAllTrainers   = ()         => api.get('/users/trainers');
export const getUserById     = (id)       => api.get(`/users/${id}`);
export const getProfile      = ()         => api.get('/users/profile');
export const updateProfile   = (data)     => api.put('/users/profile', data);
export const deleteUser      = (id)       => api.delete(`/users/${id}`);
export const changePassword  = (data)     => api.put('/users/change-password', data);
