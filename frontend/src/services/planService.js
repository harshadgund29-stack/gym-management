import api from './api';

// Backend MembershipPlanController base: /api/plans
export const planService = {
  // GET /api/plans/active — active plans only (public page, member plans)
  getActivePlans: () => api.get('/plans/active'),
  // GET /api/plans        — all plans including inactive (admin)
  getAllPlans:    () => api.get('/plans'),
  // GET /api/plans/{id}
  getPlanById:   (id)   => api.get(`/plans/${id}`),
  // POST /api/plans       — create plan (ADMIN only)
  createPlan:    (data) => api.post('/plans', data),
  // PUT /api/plans/{id}   — update plan (ADMIN only)
  updatePlan:    (id, data) => api.put(`/plans/${id}`, data),
  // DELETE /api/plans/{id} — delete plan (ADMIN only)
  deactivatePlan:(id)   => api.delete(`/plans/${id}`),
};
