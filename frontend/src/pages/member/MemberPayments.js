import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { getPaymentsByMember } from '../../api/paymentApi';

function MemberPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');

  useEffect(() => {
    if (!user?.userId) return;
    getPaymentsByMember(user.userId)
      .then(res => setPayments(res.data))
      .catch(() => setError('Failed to load payment history.'))
      .finally(() => setLoading(false));
  }, [user]);

  const completed = payments.filter(p => p.status === 'COMPLETED');
  const total     = completed.reduce((sum, p) => sum + p.amount, 0);

  const filtered = payments.filter(p =>
    `${p.planName} ${p.paymentMethod || ''} ${p.status}`.toLowerCase().includes(search.toLowerCase())
  );

  const methodIcon = { CASH: '💵', CREDIT_CARD: '💳', DEBIT_CARD: '🏧', ONLINE: '🌐' };

  return (
    <Layout title="Payment History">
      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))' }}>
        <div className="stat-card" style={{ borderLeftColor: '#e94560' }}>
          <span className="stat-icon">💳</span>
          <span className="stat-value" style={{ color: '#e94560' }}>{payments.length}</span>
          <span className="stat-label">Total Payments</span>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#48bb78' }}>
          <span className="stat-icon">💰</span>
          <span className="stat-value" style={{ color: '#48bb78', fontSize: '1.4rem' }}>
            ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="stat-label">Total Paid</span>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#4299e1' }}>
          <span className="stat-icon">✅</span>
          <span className="stat-value" style={{ color: '#4299e1' }}>{completed.length}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Payment History ({filtered.length}{search ? ` of ${payments.length}` : ''})</h2>
          <input
            type="text"
            placeholder="🔍 Search plan, method, status..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '0.5rem 0.875rem', border: '1px solid #e2e8f0',
              borderRadius: '8px', fontSize: '0.875rem', width: '240px', outline: 'none',
            }}
          />
        </div>

        {loading ? (
          <div className="loading">Loading payments...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <p>{search ? 'No payments match your search.' : 'No payment history found.'}</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th><th>Plan</th><th>Amount</th>
                <th>Method</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => (
                <tr key={p.id}>
                  <td style={{ color: '#a0aec0', fontSize: '0.8rem' }}>{idx + 1}</td>
                  <td><strong>{p.planName}</strong></td>
                  <td><strong style={{ color: '#48bb78' }}>₹{Number(p.amount).toLocaleString('en-IN')}</strong></td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {methodIcon[p.paymentMethod] || '—'}
                      <span style={{ fontSize: '0.85rem' }}>{p.paymentMethod?.replace('_', ' ') || '—'}</span>
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span>
                  </td>
                  <td>{new Date(p.paymentDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

export default MemberPayments;
