import api from './axios';

/** GET /api/floor/summary — floor metrics + today's roster */
export const getFloorSummary = () => api.get('/floor/summary');
