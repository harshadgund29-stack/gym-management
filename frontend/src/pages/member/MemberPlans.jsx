import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getActivePlans } from '../../api/planApi';
import { paymentAPI } from '../../api/paymentApi';
import { useAuth } from '../../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import './MemberPlans.css';

const PLAN_ICONS = ['🥊', '🔥', '👑', '⚡', '💎'];
const PLAN_MOTTOS = [
  '"Every rep counts. Every session matters." 💪',
  '"Train hard, recover harder." 🔥',
  '"Champions are made in the gym." 🏆',
];

function MemberPlans() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans]                     = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(null);
  const [error, setError]                     = useState('');
  const [motto]                               = useState(() => PLAN_MOTTOS[Math.floor(Math.random() * PLAN_MOTTOS.length)]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await getActivePlans();
      setPlans(res.data);
    } catch {
      setError('Could not fetch active gym plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (plan) => {
    setError('');
    setPurchaseLoading(plan.id);

    try {
      // Step 1: Create Razorpay order on backend
      const res = await paymentAPI.createRazorpayOrder({ planId: plan.id });
      const orderData = res.data;

      if (!orderData.razorpay_order_id) {
        throw new Error('Backend did not return a Razorpay order ID.');
      }

      // Step 2: Open Razorpay checkout
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded. Please refresh the page.');
      }

      const options = {
        key: 'rzp_test_Ss5UHeAkg9rSKe',
        amount: Math.round(Number(orderData.amount) * 100), // paise
        currency: 'INR',
        name: 'FitPro Gym',
        description: `${plan.name} — ${plan.durationMonths} month${plan.durationMonths > 1 ? 's' : ''}`,
        order_id: orderData.razorpay_order_id,

        handler: async function (paymentResponse) {
          try {
            // Step 3: Verify signature with backend
            const verifyRes = await paymentAPI.verifyRazorpayPayment({
              order_id: orderData.order_id,
              razorpay_order_id: orderData.razorpay_order_id,
              payment_id: paymentResponse.razorpay_payment_id,
              signature: paymentResponse.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              toast.success(verifyRes.data.message || 'Membership activated!');
              setTimeout(() => navigate('/payment-status', {
                state: {
                  success: true,
                  message: verifyRes.data.message || 'Payment confirmed! Membership activated.',
                  planName: plan.name,
                  orderId: orderData.order_id,
                }
              }), 1200);
            } else {
              toast.error('Payment verification failed. Contact support.');
            }
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed.');
          } finally {
            setPurchaseLoading(null);
          }
        },

        prefill: {
          name:    user ? `${user.firstName} ${user.lastName}` : '',
          email:   user?.email   || '',
          // Razorpay requires a valid 10-digit Indian mobile to show UPI.
          // Fall back to a known test number so UPI always appears in test mode.
          contact: (user?.phone && /^\d{10}$/.test(user.phone.replace(/\D/g, '')))
            ? user.phone.replace(/\D/g, '')
            : '9999999999',
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
        theme: { color: '#10b981' },

        modal: {
          ondismiss: () => {
            setPurchaseLoading(null);
            toast('Payment cancelled.', { icon: 'ℹ️' });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        toast.error(`Payment failed: ${resp.error.description}`);
        setPurchaseLoading(null);
      });
      rzp.open();

    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Payment initiation failed.';
      setError(msg);
      toast.error(msg);
      setPurchaseLoading(null);
    }
  };

  const getBadgeLabel = (idx) => {
    if (idx === 0) return '💪 STARTER';
    if (idx === 1) return '🔥 POPULAR';
    if (idx === 2) return '👑 ELITE';
    return '⚡ PREMIUM';
  };

  if (loading) return (
    <Layout title="Membership Plans 🏋️">
      <div className="loading"><div className="loading-spinner" />Loading plans...</div>
    </Layout>
  );

  return (
    <Layout title="Membership Plans 🏋️">
      <Toaster position="top-center" />

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #071510 0%, #0d2b1f 60%, #0a4a30 100%)',
        borderRadius: 'var(--radius-xl)', padding: '2rem 2.5rem',
        marginBottom: '2rem', position: 'relative', overflow: 'hidden',
        animation: 'fadeInUp 0.5s ease',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 50%, rgba(16,185,129,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '1.4rem', marginBottom: '0.4rem' }}>
            Select Your Training Armor 🏋️
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontStyle: 'italic' }}>{motto}</p>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {plans.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🏋️</span>
          <h3>No active plans available</h3>
          <p>Check back soon — new plans are being added!</p>
        </div>
      ) : (
        <div className="plans-grid">
          {plans.map((plan, idx) => (
            <div
              key={plan.id}
              className={`plan-card animate-fade-up delay-${idx + 1} ${idx === 1 ? 'popular' : ''}`}
            >
              {idx === 1 && <div className="plan-popular-badge">Most Popular</div>}

              <span className="plan-icon">{PLAN_ICONS[idx % PLAN_ICONS.length]}</span>

              <div style={{
                display: 'inline-block', padding: '0.25rem 0.85rem', borderRadius: '30px',
                background: 'rgba(16,185,129,0.1)', color: 'var(--accent-dark)',
                fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.6px', marginBottom: '0.75rem',
                border: '1px solid rgba(16,185,129,0.2)',
              }}>
                {getBadgeLabel(idx)}
              </div>

              <div className="plan-name">{plan.name}</div>

              <div className="plan-price">
                ₹{Number(plan.price).toLocaleString('en-IN')}
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', fontWeight: 700, marginTop: '0.25rem' }}>
                  Packing: ₹{Number(plan.packingPrice ?? 0).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 900, marginTop: '0.25rem' }}>
                  Total: ₹{Number(plan.totalAmount ?? plan.price).toLocaleString('en-IN')}
                  <span style={{ fontWeight: 800, fontSize: '0.78rem' }}>
                    /{plan.durationMonths} {plan.durationMonths === 1 ? 'Month' : 'Months'}
                  </span>
                </div>
              </div>


              <div className="plan-duration">
                ⏱️ {plan.durationMonths} month{plan.durationMonths > 1 ? 's' : ''} access
              </div>

              {plan.description && (
                <p className="plan-description">{plan.description}</p>
              )}

              <ul className="plan-features">
                {plan.features
                  ? plan.features.split(',').map((f, i) => <li key={i}>{f.trim()}</li>)
                  : <li>Full Gym Floor Access</li>
                }
              </ul>

              <button
                className="plan-buy-btn"
                onClick={() => handlePurchase(plan)}
                disabled={purchaseLoading !== null}
              >
                {purchaseLoading === plan.id
                  ? <><span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing...</>
                  : '🔥 Purchase Membership'
                }
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Security note */}
      <div style={{
        marginTop: '2rem', padding: '1.25rem 1.5rem',
        background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)',
        borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.75rem',
        animation: 'fadeInUp 0.5s ease 0.4s both',
      }}>
        <span style={{ fontSize: '1.5rem' }}>🔒</span>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--dark-bg)', marginBottom: '0.2rem' }}>Secure Payment via Razorpay</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            All transactions are processed securely. A receipt will be emailed to you upon successful payment.
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default MemberPlans;
