import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import './PaymentStatus.css';

function PaymentStatus() {
  const [loading, setLoading]       = useState(true);
  const [success, setSuccess]       = useState(false);
  const [statusDetails, setStatusDetails] = useState(null);
  const [errorMsg, setErrorMsg]     = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params  = new URLSearchParams(location.search);
    const orderId = params.get('order_id');
    if (orderId) verifyTransaction(orderId);
    else { setErrorMsg('No transaction ID found in URL.'); setLoading(false); }
  }, [location]);

  const verifyTransaction = async (orderId) => {
    try {
      setLoading(true);
      const res = await axios.get(`/cashfree/verify/${orderId}`);
      if (res.data.success) { setSuccess(true); setStatusDetails(res.data); }
      else { setSuccess(false); setErrorMsg(res.data.message || 'Payment verification failed.'); }
    } catch (err) {
      setSuccess(false);
      setErrorMsg(err.response?.data?.message || 'Could not verify this transaction.');
    } finally { setLoading(false); }
  };

  if (loading) return (
    <div className="payment-status-page">
      <div className="payment-status-card">
        <div className="payment-verifying">
          <div className="payment-verifying-spinner" />
          <h3>Verifying Payment...</h3>
          <p>Checking Cashfree ledger. Please do not close this page.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="payment-status-page">
      <div className="payment-status-card">
        {success ? (
          <>
            <div className="payment-success-icon">🎉</div>
            <h2 style={{ color: 'var(--accent-dark)', marginBottom: '0.5rem' }}>Payment Successful!</h2>
            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              "The only bad workout is the one that didn't happen." 💪
            </p>
            <div className="payment-details">
              {[
                { label: 'Transaction ID', value: statusDetails?.order_id, mono: true },
                { label: 'Payment Gateway', value: 'Cashfree Sandbox' },
                { label: 'Membership Status', value: '✅ ACTIVE' },
              ].map(row => (
                <div key={row.label} className="payment-detail-row">
                  <span className="payment-detail-label">{row.label}</span>
                  <span className="payment-detail-value" style={row.mono ? { fontFamily: 'monospace', fontSize: '0.82rem' } : {}}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
              Your membership is now active! A receipt has been sent to your registered email address.
            </p>
            <div className="payment-status-actions">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/member')}>
                🏋️ Go to Dashboard
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="payment-failed-icon">❌</div>
            <h2 style={{ color: '#991b1b', marginBottom: '0.5rem' }}>Payment Failed</h2>
            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              "Suffer the pain of discipline, or suffer the pain of regret!" ⚡
            </p>
            <div className="alert alert-error">{errorMsg || 'Transaction was cancelled or rejected.'}</div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
              No charges were applied. Any pending amounts will be auto-refunded within 3 business days.
            </p>
            <div className="payment-status-actions">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/member/plans')}>
                🔄 Try Again
              </button>
              <Link to="/member" className="btn btn-secondary btn-lg">← Dashboard</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentStatus;
