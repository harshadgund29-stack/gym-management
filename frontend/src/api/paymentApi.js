import api from './axios';

export const getAllPayments       = ()         => api.get('/payments');
export const getPaymentsByMember  = (memberId) => api.get(`/payments/member/${memberId}`);
export const createPayment        = (data)     => api.post('/payments', data);
