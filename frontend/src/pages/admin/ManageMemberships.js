import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getAllMemberships, createMembership, updateMembershipStatus } from '../../api/membershipApi';
import { getAllMembers } from '../../api/userApi';
import { getAllPlans } from '../../api/planApi';

const emptyForm = { memberId: '', planId: '', startDate: '' };

function ManageMemberships() {
  const [memberships, setMemberships] = useState([]);
  const [members, setMembers]         = useState([]);
  const [plans, setPlans]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showModal, setShowModal]     = useState(false);
  const [form, setForm]               = useState(emptyForm);
  const [saving, setSaving]           = useState(false);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([getAllMemberships(), getAllMembers(), getAllPlans()])
      .then(([mRes, uRes, pRes]) => {
        setMemberships(mRes.data);
        setMembers(uRes.data);
        setPlans(pRes.data);
      })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createMembership({
        memberId:  parseInt(form.memberId),
        planId:    parseInt(form.planId),
        startDate: form.startDate,
      });
      setShowModal(false);
      setForm(emptyForm);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create membership.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateMembershipStatus(id, status);
      fetchAll();
    } catch {
      setError('Failed to update status.');
    }
  };

  const filtered = memberships.filter(m => {
    const matchSearch = `${m.memberName} ${m.planName}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusColor = { ACTIVE: '#48bb78', EXPIRED: '#e94560', CANCELLED: '#a0aec0', PENDING: '#ed8936' };

  return (
    <Layout title="Manage Memberships">
      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        {['ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING'].map(s => (
          <div key={s} className="stat-card" style={{ borderLeftColor: statusColor[s] }}>
            <span className="stat-value" style={{ color: statusColor[s] }}>
              {memberships.filter(m => m.status === s).length}
            </span>
            <span className="stat-label">{s}</span>
          </div>
        ))}
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>All Memberships ({filtered.length}{search ? ` of ${memberships.length}` : ''})</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="PENDING">Pending</option>
            </select>
            <input
              type="text"
              placeholder="🔍 Search member or plan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '0.5rem 0.875rem', border: '1px solid #e2e8f0',
                borderRadius: '8px', fontSize: '0.875rem', width: '220px', outline: 'none',
              }}
            />
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Assign Membership</button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading memberships...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>{search ? 'No memberships match your search.' : 'No memberships found.'}</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Plan</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days Left</th>
                <th>Status</th>
                <th>Change Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const daysLeft = Math.ceil((new Date(m.endDate) - new Date()) / (1000*60*60*24));
                const daysColor = m.status !== 'ACTIVE' ? '#a0aec0' : daysLeft <= 7 ? '#e94560' : daysLeft <= 14 ? '#ed8936' : '#48bb78';
                return (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #48bb78, #276749)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                      }}>
                        {m.memberName?.charAt(0)}
                      </div>
                      <strong>{m.memberName}</strong>
                    </div>
                  </td>
                  <td>{m.planName}</td>
                  <td>{new Date(m.startDate).toLocaleDateString('en-IN')}</td>
                  <td>{new Date(m.endDate).toLocaleDateString('en-IN')}</td>
                  <td>
                    {m.status === 'ACTIVE'
                      ? <span style={{ fontWeight: 700, color: daysColor }}>{daysLeft > 0 ? `${daysLeft}d` : 'Expired'}</span>
                      : <span style={{ color: '#a0aec0' }}>—</span>
                    }
                  </td>
                  <td>
                    <span className={`badge badge-${m.status.toLowerCase()}`}>{m.status}</span>
                  </td>
                  <td>
                    <select
                      value={m.status}
                      onChange={e => handleStatusChange(m.id, e.target.value)}
                      style={{
                        padding: '0.3rem 0.5rem', border: '1px solid #e2e8f0',
                        borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer',
                      }}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="EXPIRED">Expired</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="PENDING">Pending</option>
                    </select>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Assign Membership</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Member</label>
                <select name="memberId" value={form.memberId} onChange={handleChange} required>
                  <option value="">Select a member</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} ({m.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Membership Plan</label>
                <select name="planId" value={form.planId} onChange={handleChange} required>
                  <option value="">Select a plan</option>
                  {plans.filter(p => p.active).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{Number(p.price).toLocaleString('en-IN')} ({p.durationMonths} month{p.durationMonths > 1 ? 's' : ''})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Assigning...' : 'Assign Membership'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default ManageMemberships;
