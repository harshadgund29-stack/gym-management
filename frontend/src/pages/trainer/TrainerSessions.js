import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { getSessionsByTrainer, createSession, updateSession, deleteSession } from '../../api/sessionApi';
import { getAllMembers } from '../../api/userApi';

const emptyForm = {
  title: '', description: '', memberId: '', sessionDate: '',
  durationMinutes: '', status: 'SCHEDULED', notes: '',
};

function TrainerSessions() {
  const { user } = useAuth();
  const [sessions, setSessions]   = useState([]);
  const [members, setMembers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);

  const fetchData = () => {
    Promise.all([getSessionsByTrainer(user.userId), getAllMembers()])
      .then(([sessRes, memRes]) => {
        setSessions(sessRes.data);
        setMembers(memRes.data);
      })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (user?.userId) fetchData(); }, [user]);

  const openCreate = () => { setEditingSession(null); setForm(emptyForm); setShowModal(true); };
  const openEdit   = (s) => {
    setEditingSession(s);
    setForm({
      title: s.title, description: s.description || '', memberId: s.memberId,
      sessionDate: s.sessionDate?.slice(0, 16) || '',
      durationMinutes: s.durationMinutes || '', status: s.status, notes: s.notes || '',
    });
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        trainerId: user.userId,
        memberId: parseInt(form.memberId),
        durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : null,
      };
      if (editingSession) {
        await updateSession(editingSession.id, payload);
      } else {
        await createSession(payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save session.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session?')) return;
    try {
      await deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch {
      setError('Failed to delete session.');
    }
  };

  const statusBadge = (status) => {
    const map = { SCHEDULED: 'badge-scheduled', COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled' };
    return <span className={`badge ${map[status] || ''}`}>{status}</span>;
  };

  const filtered = sessions.filter(s => {
    const matchSearch = `${s.title} ${s.memberName} ${s.notes || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    SCHEDULED: sessions.filter(s => s.status === 'SCHEDULED').length,
    COMPLETED: sessions.filter(s => s.status === 'COMPLETED').length,
    CANCELLED: sessions.filter(s => s.status === 'CANCELLED').length,
  };

  return (
    <Layout title="Training Sessions">
      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeftColor: '#9f7aea' }}>
          <span className="stat-icon">🗓️</span>
          <span className="stat-value" style={{ color: '#9f7aea' }}>{counts.SCHEDULED}</span>
          <span className="stat-label">Scheduled</span>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#48bb78' }}>
          <span className="stat-icon">✅</span>
          <span className="stat-value" style={{ color: '#48bb78' }}>{counts.COMPLETED}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#a0aec0' }}>
          <span className="stat-icon">❌</span>
          <span className="stat-value" style={{ color: '#a0aec0' }}>{counts.CANCELLED}</span>
          <span className="stat-label">Cancelled</span>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#e94560' }}>
          <span className="stat-icon">📊</span>
          <span className="stat-value" style={{ color: '#e94560' }}>{sessions.length}</span>
          <span className="stat-label">Total</span>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>My Sessions ({filtered.length}{(search || filterStatus !== 'ALL') ? ` of ${sessions.length}` : ''})</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}
            >
              <option value="ALL">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <input
              type="text"
              placeholder="🔍 Search title, member, notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '0.5rem 0.875rem', border: '1px solid #e2e8f0',
                borderRadius: '8px', fontSize: '0.875rem', width: '220px', outline: 'none',
              }}
            />
            <button className="btn btn-primary" onClick={openCreate}>+ New Session</button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading sessions...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🗓️</div>
            <p>{search || filterStatus !== 'ALL' ? 'No sessions match your filters.' : 'No sessions yet. Create your first!'}</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th><th>Member</th><th>Date & Time</th>
                <th>Duration</th><th>Status</th><th>Notes</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.title}</strong></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #48bb78, #276749)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.65rem', fontWeight: 700,
                      }}>
                        {s.memberName?.charAt(0)}
                      </div>
                      {s.memberName}
                    </div>
                  </td>
                  <td>{new Date(s.sessionDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td>{s.durationMinutes ? `${s.durationMinutes} min` : '—'}</td>
                  <td>{statusBadge(s.status)}</td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#718096', fontSize: '0.85rem' }}>
                    {s.notes || <span style={{ color: '#cbd5e0' }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingSession ? 'Edit Session' : 'New Training Session'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Cardio Blast" />
              </div>
              <div className="form-group">
                <label>Member</label>
                <select name="memberId" value={form.memberId} onChange={handleChange} required>
                  <option value="">Select a member</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date & Time</label>
                  <input type="datetime-local" name="sessionDate" value={form.sessionDate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input type="number" name="durationMinutes" value={form.durationMinutes} onChange={handleChange} min="1" />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Session details..." />
              </div>
              {editingSession && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <input name="notes" value={form.notes} onChange={handleChange} placeholder="Post-session notes" />
                  </div>
                </div>
              )}
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingSession ? 'Update' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default TrainerSessions;
