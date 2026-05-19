import api from './api';

// Backend PaymentController base: /api/payments
export const paymentService = {

  // GET /api/payments — all payments (ADMIN only)
  getAllPayments: () => api.get('/payments'),

  // GET /api/payments/my — own payment history (any authenticated user)
  getMyPayments: () => api.get('/payments/my'),

  // GET /api/payments/member/{id} — payments by member ID (ADMIN/MEMBER)
  getByMember: (memberId) => api.get(`/payments/member/${memberId}`),

  // GET /api/payments/revenue — revenue stats (ADMIN only)
  getRevenue: () => api.get('/payments/revenue'),

  /**
   * POST /api/payments/paypal/create-order
   * Body: { planId }
   * Returns: { paymentId, planName, amount, currency }
   */
  createOrder: (planId) =>
    api.post('/payments/paypal/create-order', { planId }),

  /**
   * POST /api/payments/paypal/capture-order
   * Body: { paymentId, orderId }
   * Returns: PaymentDTO
   */
  captureOrder: (paymentId, orderId) =>
    api.post('/payments/paypal/capture-order', { paymentId, orderId }),
};

// Cashfree payments — /cashfree (proxied by Vite to port 8080)
export const cashfreeService = {
  // POST /cashfree/order — create Cashfree order (MEMBER only)
  createOrder: (planId, amount) =>
    api.post('/cashfree/order', { planId, amount }),
};
