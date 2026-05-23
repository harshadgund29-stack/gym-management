import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getAllPayments, createPayment } from '../../api/paymentApi';
import { getAllMembers } from '../../api/userApi';
import { getAllMemberships } from '../../api/membershipApi';

const emptyForm = { memberId: '', membershipId: '', amount: '', paymentMethod: 'CASH', transactionId: '' };
const METHOD_ICONS = { CASH: '💵', CREDIT_CARD: '💳', DEBIT_CARD: '🏧', ONLINE: '🌐' };

function ManagePayments() {
  const [payments, setPayments]         = useState([]);
  const [members, setMembers]           = useState([]);
  const [memberships, setMemberships]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showModal, setShowModal]       = useState(false);
  const [form, setForm]                 = useState(emptyForm);
  const [saving, setSaving]             = useState(false);

  const memberMemberships = memberships.filter(m => m.memberId === parseInt(form.memberId) && m.status === 'ACTIVE');

  const fetchAll = () => {
    setLoading(true);
    Promise.all([getAllPayments(), getAllMembers(), getAllMemberships()])
      .then(([pRes, uRes, mRes]) => { setPayments(pRes.data); setMembers(uRes.data); setMemberships(mRes.data); })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    if (e.target.name === 'memberId') updated.membershipId = '';
    setForm(updated);
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await createPayment({ memberId: parseInt(form.memberId), membershipId: parseInt(form.membershipId), amount: parseFloat(form.amount), paymentMethod: form.paymentMethod, transactionId: form.transactionId || null });
      setShowModal(false); setForm(emptyForm); fetchAll();
    } catch (err) { setError(err.response?.data?.message || 'Failed to record payment.'); }
    finally { setSaving(false); }
  };

  const totalRevenue = payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0);
  const filtered = payments.filter(p => {
    const matchSearch = `${p.memberName} ${p.planName} ${p.transactionId || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <Layout title="Payments 💰">
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))' }}>
        {[
          { icon: '💳', label: 'Total Payments', value: payments.length, color: '#e94560', delay: 1 },
          { icon: '💰', label: 'Total Revenue',  value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: '#48bb78', delay: 2, small: true },
          { icon: '✅', label: 'Completed',      value: payments.filter(p => p.status === 'COMPLETED').length, color: '#4299e1', delay: 3 },
          { icon: '⏳', label: 'Pending',        value: payments.filter(p => p.status === 'PENDING').length,   color: '#ed8936', delay: 4 },
        ].map(c => (
          <div key={c.label} className={`stat-card animate-fade-up delay-${c.delay}`}>
            <span className="stat-icon">{c.icon}</span>
            <span className="stat-value" style={{ color: c.color, fontSize: c.small ? '1.4rem' : '2.2rem' }}>{c.value}</span>
            <span className="stat-label">{c.label}</span>
          </div>
        ))}
      </div>

      <div className="table-container animate-fade-up">
        <div className="table-header">
          <h2>Payment History ({filtered.length}{search || filterStatus !== 'ALL' ? ` of ${payments.length}` : ''})</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '0.5rem 0.75rem', border: '1.5px solid #c8ddd5', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontFamily: 'inherit' }}>
              <option value="ALL">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <input type="text" placeholder="🔍 Search member, plan, transaction..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '0.5rem 0.875rem', border: '1.5px solid #c8ddd5', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', width: 240, fontFamily: 'inherit' }} />
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Record Payment</button>
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="loading-spinner" />Loading payments...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">💳</span>
            <h3>{search || filterStatus !== 'ALL' ? 'No payments match your filters.' : 'No payments found.'}</h3>
          </div>
        ) : (
          <table>
            <thead><tr><th>Member</th><th>Plan</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Transaction ID</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0 }}>
                        {p.memberName?.charAt(0)}
                      </div>
                      <strong>{p.memberName}</strong>
                    </div>
                  </td>
                  <td>{p.planName}</td>
                  <td><strong style={{ color: '#16a34a' }}>₹{Number(p.amount).toLocaleString('en-IN')}</strong></td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                      {METHOD_ICONS[p.paymentMethod] || '—'} {p.paymentMethod?.replace('_', ' ') || '—'}
                    </span>
                  </td>
                  <td><span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(p.paymentDate).toLocaleDateString('en-IN')}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.transactionId || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Record Payment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>💳 Record Payment</h2>
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Member</label>
                <select name="memberId" value={form.memberId} onChange={handleChange} required>
                  <option value="">Select a member</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.email})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Membership</label>
                <select name="membershipId" value={form.membershipId} onChange={handleChange} required disabled={!form.memberId}>
                  <option value="">{form.memberId ? 'Select membership' : 'Select a member first'}</option>
                  {memberMemberships.map(m => <option key={m.id} value={m.id}>{m.planName} — Active until {new Date(m.endDate).toLocaleDateString('en-IN')}</option>)}
                  {form.memberId && memberMemberships.length === 0 && <option disabled>No active memberships for this member</option>}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input type="number" name="amount" value={form.amount} onChange={handleChange} required min="1" step="0.01" placeholder="e.g. 4999" />
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
                    <option value="CASH">💵 Cash</option>
                    <option value="CREDIT_CARD">💳 Credit Card</option>
                    <option value="DEBIT_CARD">🏧 Debit Card</option>
                    <option value="ONLINE">🌐 Online</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Transaction ID (optional)</label>
                <input name="transactionId" value={form.transactionId} onChange={handleChange} placeholder="e.g. TXN-2026-099" />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Recording...</> : '✅ Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default ManagePayments;
