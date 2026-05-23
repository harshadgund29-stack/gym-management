import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { getPaymentsByMember } from '../../api/paymentApi';

const METHOD_ICONS = { CASH: '💵', CREDIT_CARD: '💳', DEBIT_CARD: '🏧', ONLINE: '🌐' };

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
  const pending   = payments.filter(p => p.status === 'PENDING');
  const total     = completed.reduce((s, p) => s + p.amount, 0);

  const filtered = payments.filter(p =>
    `${p.planName} ${p.paymentMethod || ''} ${p.status}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Payment History 💳">
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))' }}>
        {[
          { icon: '💳', label: 'Total Payments', value: payments.length,  color: '#e94560', delay: 1 },
          { icon: '💰', label: 'Total Paid',     value: `₹${total.toLocaleString('en-IN')}`, color: '#48bb78', delay: 2, small: true },
          { icon: '✅', label: 'Completed',      value: completed.length, color: '#4299e1', delay: 3 },
          { icon: '⏳', label: 'Pending',        value: pending.length,   color: '#ed8936', delay: 4 },
        ].map(c => (
          <div key={c.label} className={`stat-card animate-fade-up delay-${c.delay}`}>
            <span className="stat-icon">{c.icon}</span>
            <span className="stat-value" style={{ color: c.color, fontSize: c.small ? '1.4rem' : '2.2rem' }}>{c.value}</span>
            <span className="stat-label">{c.label}</span>
          </div>
        ))}
      </div>

      {/* CTA if no active membership */}
      {payments.length === 0 && !loading && (
        <div style={{
          background: 'linear-gradient(135deg, #071510 0%, #0d2b1f 100%)',
          borderRadius: 'var(--radius-xl)', padding: '2rem',
          marginBottom: '1.5rem', textAlign: 'center',
          animation: 'fadeInUp 0.5s ease',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem', animation: 'float 4s ease-in-out infinite' }}>🏋️</div>
          <h3 style={{ color: '#fff', fontWeight: 900, marginBottom: '0.5rem' }}>No payments yet</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Purchase a membership plan to start your fitness journey!
          </p>
          <Link to="/member/plans" className="btn btn-primary btn-lg">🔥 Browse Plans</Link>
        </div>
      )}

      <div className="table-container animate-fade-up">
        <div className="table-header">
          <h2>Payment History ({filtered.length}{search ? ` of ${payments.length}` : ''})</h2>
          <input
            type="text"
            placeholder="🔍 Search plan, method, status..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '0.5rem 0.875rem', border: '1.5px solid #c8ddd5', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', width: 240, fontFamily: 'inherit' }}
          />
        </div>

        {loading ? (
          <div className="loading"><div className="loading-spinner" />Loading payments...</div>
        ) : filtered.length === 0 && payments.length > 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3>No payments match your search.</h3>
          </div>
        ) : payments.length > 0 ? (
          <table>
            <thead><tr><th>#</th><th>Plan</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {filtered.map((p, idx) => (
                <tr key={p.id}>
                  <td style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: 700 }}>{idx + 1}</td>
                  <td>
                    <strong>{p.planName}</strong>
                    {p.transactionId && (
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontFamily: 'monospace', marginTop: '0.15rem' }}>
                        {p.transactionId}
                      </div>
                    )}
                  </td>
                  <td><strong style={{ color: '#16a34a', fontSize: '1rem' }}>₹{Number(p.amount).toLocaleString('en-IN')}</strong></td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{METHOD_ICONS[p.paymentMethod] || '—'}</span>
                      {p.paymentMethod?.replace('_', ' ') || '—'}
                    </span>
                  </td>
                  <td><span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(p.paymentDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      {/* Renew CTA */}
      {payments.length > 0 && (
        <div style={{
          marginTop: '1.5rem', padding: '1.25rem 1.5rem',
          background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)',
          borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem', animation: 'fadeInUp 0.5s ease 0.3s both',
        }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--dark-bg)', marginBottom: '0.2rem' }}>🔄 Need to renew your membership?</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Browse our plans and continue your fitness journey.</p>
          </div>
          <Link to="/member/plans" className="btn btn-primary btn-sm">Browse Plans →</Link>
        </div>
      )}
    </Layout>
  );
}

export default MemberPayments;
