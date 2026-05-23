import api from './axios';

/** GET /api/members/list */
export const getMembersList = () => api.get('/members/list');
