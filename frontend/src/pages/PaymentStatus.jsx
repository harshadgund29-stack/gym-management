import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { paymentAPI } from "../api/paymentApi";

/**
 * PaymentStatus — shown after Razorpay checkout completes.
 *
 * Razorpay calls the handler() callback in Checkout.jsx directly (no redirect),
 * so this page is reached via navigate("/payment-status") after verification.
 * It reads state passed by navigate, or falls back to a generic success message.
 */
function PaymentStatus() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // State can be passed from Checkout.jsx via navigate("/payment-status", { state: {...} })
  const passed = location.state;
  const success = passed?.success !== false; // default to success if no state
  const message = passed?.message || "Your payment was processed successfully.";
  const planName = passed?.planName || "";
  const orderId = passed?.orderId || "";

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {success ? (
          <>
            <div style={styles.successIcon}>🎉</div>
            <h2 style={{ ...styles.heading, color: "#059669" }}>Payment Successful!</h2>
            <p style={styles.subtext}>{message}</p>

            {(planName || orderId) && (
              <div style={styles.detailBox}>
                {planName && (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Plan</span>
                    <span style={styles.detailValue}>{planName}</span>
                  </div>
                )}
                {orderId && (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Transaction ID</span>
                    <span style={{ ...styles.detailValue, fontFamily: "monospace", fontSize: "0.8rem" }}>
                      {orderId}
                    </span>
                  </div>
                )}
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Membership Status</span>
                  <span style={{ ...styles.detailValue, color: "#059669", fontWeight: 700 }}>✅ ACTIVE</span>
                </div>
              </div>
            )}

            <p style={styles.note}>
              A receipt has been sent to your registered email address.
            </p>

            <div style={styles.actions}>
              {isAuthenticated ? (
                <button style={styles.primaryBtn} onClick={() => navigate("/member-dashboard")}>
                  🏋️ Go to Dashboard
                </button>
              ) : (
                <button style={styles.primaryBtn} onClick={() => navigate("/login")}>
                  🔑 Log In
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={styles.failIcon}>❌</div>
            <h2 style={{ ...styles.heading, color: "#dc2626" }}>Payment Failed</h2>
            <p style={styles.subtext}>{message}</p>
            <p style={styles.note}>
              No charges were applied. Please try again or contact support.
            </p>
            <div style={styles.actions}>
              <button style={styles.primaryBtn} onClick={() => navigate("/checkout")}>
                🔄 Try Again
              </button>
              <Link to="/" style={styles.secondaryBtn}>← Home</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "2rem",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "2.5rem 2rem",
    maxWidth: "460px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  successIcon: { fontSize: "3.5rem", marginBottom: "1rem" },
  failIcon: { fontSize: "3.5rem", marginBottom: "1rem" },
  heading: { fontSize: "1.6rem", fontWeight: 800, marginBottom: "0.5rem" },
  subtext: { color: "#475569", fontSize: "0.95rem", marginBottom: "1.5rem", lineHeight: 1.6 },
  detailBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "1rem 1.25rem",
    marginBottom: "1.25rem",
    textAlign: "left",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.4rem 0",
    borderBottom: "1px solid #f1f5f9",
  },
  detailLabel: { fontSize: "0.82rem", color: "#64748b", fontWeight: 600 },
  detailValue: { fontSize: "0.88rem", color: "#0f172a", fontWeight: 700 },
  note: { fontSize: "0.82rem", color: "#94a3b8", marginBottom: "1.5rem", lineHeight: 1.5 },
  actions: { display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" },
  primaryBtn: {
    padding: "0.75rem 1.5rem",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(16,185,129,0.35)",
  },
  secondaryBtn: {
    padding: "0.75rem 1.5rem",
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "0.95rem",
    fontWeight: 600,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
  },
};

export default PaymentStatus;
