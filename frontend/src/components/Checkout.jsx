import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { paymentAPI } from "../api/paymentApi";

function Checkout() {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handlePayment = async () => {
    // Guard: must be logged in to pay
    if (!isAuthenticated) {
      toast.error("Please log in first to purchase a plan.");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Call backend to create Razorpay order
      const response = await paymentAPI.createRazorpayOrder({ planId: 2 });
      const orderData = response.data;

      if (!orderData.razorpay_order_id) {
        throw new Error("Backend did not return a Razorpay order ID.");
      }

      // Step 2: Configure Razorpay Checkout options
      const options = {
        key: "rzp_test_Ss5UHeAkg9rSKe",
        // amount is in rupees from backend — convert to paise for Razorpay
        amount: Math.round(Number(orderData.amount) * 100),

        currency: "INR",
        name: "FitPro Gym",
        description: `${orderData.planName || "Membership"} Plan`,
        // razorpay_order_id is Razorpay's own order ID (e.g. order_abc123)
        order_id: orderData.razorpay_order_id,

        handler: async function (paymentResponse) {
          // Step 3: Verify payment signature with backend
          try {
            const verifyRes = await paymentAPI.verifyRazorpayPayment({
              order_id: orderData.order_id,               // our internal DB transaction ID
              razorpay_order_id: orderData.razorpay_order_id, // Razorpay's order ID for sig check
              payment_id: paymentResponse.razorpay_payment_id,
              signature: paymentResponse.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              toast.success(verifyRes.data.message || "Payment confirmed! Membership activated.");
              // Redirect to payment status page after short delay
              setTimeout(() => navigate("/payment-status", {
                state: {
                  success: true,
                  message: verifyRes.data.message || "Payment confirmed! Membership activated.",
                  planName: orderData.planName,
                  orderId: orderData.order_id,
                }
              }), 1500);
            } else {
              toast.error("Payment verification failed. Contact support.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error(
              err.response?.data?.message || "Payment verification failed. Contact support."
            );
          }
        },

        prefill: {
          name:    user ? `${user.firstName} ${user.lastName}` : "",
          email:   user?.email   || "",
          // Razorpay requires a valid 10-digit Indian mobile to show UPI.
          // Fall back to a known test number so UPI always appears in test mode.
          contact: (user?.phone && /^\d{10}$/.test(user.phone.replace(/\D/g, "")))
            ? user.phone.replace(/\D/g, "")
            : "9999999999",
        },

        // ── Payment methods ──────────────────────────────────────────────────
        // Do NOT combine `method` with `config.display` — they conflict in
        // Razorpay Standard Checkout. Use `method` alone to enable/disable tabs.
        method: {
          upi:        true,   // UPI (requires valid contact number above)
          card:       true,   // Credit & Debit cards
          netbanking: true,   // Net banking
          wallet:     true,   // Paytm, PhonePe, etc.
          paylater:   true,   // Simpl, ICICI PayLater, etc.
        },
        theme: { color: "#10b981" },

        modal: {
          // When user closes the Razorpay modal without paying
          ondismiss: () => {
            setLoading(false);
            toast("Payment cancelled.", { icon: "ℹ️" });
          },
        },
      };

      // Step 4: Open Razorpay checkout
      if (!window.Razorpay) {
        throw new Error(
          "Razorpay SDK not loaded. Check your internet connection and try again."
        );
      }

      const rzp = new window.Razorpay(options);

      // Handle payment failure from Razorpay (e.g. card declined)
      rzp.on("payment.failed", (resp) => {
        console.error("Razorpay payment failed:", resp.error);
        toast.error(`Payment failed: ${resp.error.description}`);
        setLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong while initiating payment.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <Toaster position="top-center" />
      <div style={styles.card}>
        <div style={styles.icon}>💳</div>
        <h2 style={styles.title}>Pay Membership Fee</h2>
        <p style={styles.subtitle}>
          You are purchasing the <strong>Premium Plan</strong> — ₹59.99/month
        </p>

        {!isAuthenticated && (
          <div style={styles.warning}>
            ⚠️ You must be <a href="/login" style={{ color: "#e94560" }}>logged in</a> to make a payment.
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "⏳ Processing..." : "🔒 Pay Now with Razorpay"}
        </button>

        <p style={styles.note}>
          Secured by Razorpay · Test mode active
        </p>
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
    maxWidth: "420px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  icon: { fontSize: "3rem", marginBottom: "1rem" },
  title: { fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" },
  subtitle: { color: "#64748b", fontSize: "0.95rem", marginBottom: "1.5rem" },
  warning: {
    background: "#fff5f5",
    border: "1px solid #fed7d7",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    color: "#c53030",
    fontSize: "0.875rem",
    marginBottom: "1.25rem",
  },
  button: {
    width: "100%",
    padding: "0.875rem",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: 700,
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    boxShadow: "0 4px 15px rgba(16,185,129,0.4)",
  },
  note: { marginTop: "1rem", fontSize: "0.78rem", color: "#94a3b8" },
};

export default Checkout;
