import api from './axios';

export const getAllMemberships       = ()           => api.get('/memberships');
export const getMembershipsByMember  = (memberId)   => api.get(`/memberships/member/${memberId}`);
export const getMembershipById       = (id)         => api.get(`/memberships/${id}`);
export const createMembership        = (data)       => api.post('/memberships', data);
export const updateMembershipStatus  = (id, status) => api.patch(`/memberships/${id}/status?status=${status}`);
