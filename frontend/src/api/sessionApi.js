import api from './axios';

export const getAllSessions        = ()           => api.get('/sessions');
export const getSessionsByTrainer  = (trainerId)  => api.get(`/sessions/trainer/${trainerId}`);
export const getSessionsByMember   = (memberId)   => api.get(`/sessions/member/${memberId}`);
export const createSession         = (data)       => api.post('/sessions', data);
export const updateSession         = (id, data)   => api.put(`/sessions/${id}`, data);
export const deleteSession         = (id)         => api.delete(`/sessions/${id}`);
