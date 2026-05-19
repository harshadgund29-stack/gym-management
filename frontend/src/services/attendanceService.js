import api from './api';

// Backend AttendanceController base: /api/attendance
export const attendanceService = {
  // POST /api/attendance/mark           — self check-in/out
  markAttendance:    ()         => api.post('/attendance/mark'),
  // POST /api/attendance/mark/{userId}  — mark for a specific user (ADMIN/TRAINER)
  markForUser:       (userId)   => api.post(`/attendance/mark/${userId}`),
  // GET  /api/attendance/my             — own attendance history
  getMyAttendance:   ()         => api.get('/attendance/my'),
  // GET  /api/attendance/my/count       — own total check-in count
  getMyCount:        ()         => api.get('/attendance/my/count'),
  // GET  /api/attendance/today          — today's check-ins (ADMIN/TRAINER)
  getTodayAttendance:()         => api.get('/attendance/today'),
  // GET  /api/attendance                — all attendance records (ADMIN)
  getAllAttendance:   ()         => api.get('/attendance'),
};
