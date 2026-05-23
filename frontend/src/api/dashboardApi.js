import api from './axios';

export const getDashboardStats = () => api.get('/dashboard/stats');
export const getAdminSummary = () => api.get('/dashboard/summary');




