import api from './axios';

/** GET /api/attendance/summary — floor metrics + today's roster */
export const getAttendanceSummary = () => api.get('/attendance/summary');

/** GET /api/attendance/today — today's roster only */
export const getTodayAttendance = () => api.get('/attendance/today');

/** POST /api/attendance/checkin — manual or self check-in */
export const manualCheckIn = (memberId) =>
  api.post('/attendance/checkin', { memberId });

/** POST /api/attendance/checkout */
export const manualCheckOut = (memberId) =>
  api.post('/attendance/checkout', { memberId });
