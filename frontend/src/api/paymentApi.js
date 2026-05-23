import axios from "axios";
import api from "./axios";

const API_BASE = "http://localhost:8080/api/payments";

export const paymentAPI = {
  // 🔹 Razorpay endpoints
  createRazorpayOrder: async (data) => {
    return api.post("/razorpay/order", data);
  },

  verifyRazorpayPayment: async (data) => {
    return api.post("/razorpay/verify", data);
  },

  // 🔹 Admin: get all payments
  getAllPayments: async () => {
    return api.get("/payments");
  },

  // 🔹 Admin/Member: get payments by memberId
  getPaymentsByMember: async (memberId) => {
    return api.get(`/payments/member/${memberId}`);
  },

  // 🔹 Admin: revenue stats
  getRevenueStats: async () => {
    return api.get("/payments/revenue");
  },

  // 🔹 Admin: create a payment manually
  createPayment: async (payload) => {
    return api.post("/payments", payload);
  }
};

// Named exports for direct use in components (e.g. MemberDashboard, ManagePayments)
export const getPaymentsByMember = (memberId) => api.get(`/payments/member/${memberId}`);
export const getAllPayments       = ()          => api.get('/payments');
export const createPayment        = (payload)  => api.post('/payments', payload);
