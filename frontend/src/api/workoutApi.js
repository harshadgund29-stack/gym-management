import api from './axios';

export const getPlansByTrainer = (trainerId) => api.get(`/workout-plans/trainer/${trainerId}`);
export const getPlansByMember  = (memberId)  => api.get(`/workout-plans/member/${memberId}`);
export const getWorkoutPlanById= (id)        => api.get(`/workout-plans/${id}`);
export const createWorkoutPlan = (data)      => api.post('/workout-plans', data);
export const updateWorkoutPlan = (id, data)  => api.put(`/workout-plans/${id}`, data);
export const deleteWorkoutPlan = (id)        => api.delete(`/workout-plans/${id}`);

/** POST /api/workout/assign — trainer assigns plan to member */
export const assignWorkoutPlan = (data) => api.post('/workout/assign', data);

/** GET /api/workout/member/{memberId} */
export const getWorkoutPlansForMember = (memberId) => api.get(`/workout/member/${memberId}`);
