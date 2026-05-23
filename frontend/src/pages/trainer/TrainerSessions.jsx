import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { getSessionsByTrainer, createSession, updateSession, deleteSession } from '../../api/sessionApi';
import { getAllMembers } from '../../api/userApi';

const emptyForm = { title: '', description: '', memberId: '', sessionDate: '', durationMinutes: '', status: 'SCHEDULED', notes: '' };

const INPUT_STYLE = { padding: '0.7rem 1rem', border: '1.5px solid #c8ddd5', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontFamily: 'inherit', width: '100%', outline: 'none', transition: 'border-color 0.2s' };

function TrainerSessions() {
  const { user } = useAuth();
  const [sessions, setSessions]         = useState([]);
  const [members, setMembers]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showModal, setShowModal]       = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [form, setForm]                 = useState(emptyForm);
  const [saving, setSaving]             = useState(false);

  const fetchData = () => {
    Promise.all([getSessionsByTrainer(user.userId), getAllMembers()])
      .then(([sessRes, memRes]) => { setSessions(sessRes.data); setMembers(memRes.data); })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (user?.userId) fetchData(); }, [user]);

  const openCreate = () => { setEditingSession(null); setForm(emptyForm); setShowModal(true); };
  const openEdit   = (s) => {
    setEditingSession(s);
    setForm({ title: s.title, description: s.description || '', memberId: s.memberId, sessionDate: s.sessionDate?.slice(0, 16) || '', durationMinutes: s.durationMinutes || '', status: s.status, notes: s.notes || '' });
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { ...form, trainerId: user.userId, memberId: parseInt(form.memberId), durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : null };
      editingSession ? await updateSession(editingSession.id, payload) : await createSession(payload);
      setShowModal(false); fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save session.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session?')) return;
    try { await deleteSession(id); setSessions(prev => prev.filter(s => s.id !== id)); }
    catch { setError('Failed to delete session.'); }
  };

  const statusBadge = (s) => {
    const map = { SCHEDULED: 'badge-scheduled', COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled' };
    return <span className={`badge ${map[s] || ''}`}>{s}</span>;
  };

  const filtered = sessions.filter(s => {
    const matchSearch = `${s.title} ${s.memberName} ${s.notes || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = { SCHEDULED: sessions.filter(s => s.status === 'SCHEDULED').length, COMPLETED: sessions.filter(s => s.status === 'COMPLETED').length, CANCELLED: sessions.filter(s => s.status === 'CANCELLED').length };
  const completionRate = sessions.length > 0 ? Math.round((counts.COMPLETED / sessions.length) * 100) : 0;

  return (
    <Layout title="Training Sessions 🗓️">
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', marginBottom: '1.5rem' }}>
        {[
          { icon: '🗓️', label: 'Scheduled',  value: counts.SCHEDULED,  color: '#9f7aea', delay: 1 },
          { icon: '✅', label: 'Completed',  value: counts.COMPLETED,  color: '#48bb78', delay: 2 },
          { icon: '❌', label: 'Cancelled',  value: counts.CANCELLED,  color: '#a0aec0', delay: 3 },
          { icon: '📊', label: 'Total',      value: sessions.length,   color: '#e94560', delay: 4 },
        ].map(c => (
          <div key={c.label} className={`stat-card animate-fade-up delay-${c.delay}`}>
            <span className="stat-icon">{c.icon}</span>
            <span className="stat-value" style={{ color: c.color }}>{c.value}</span>
            <span className="stat-label">{c.label}</span>
          </div>
        ))}
      </div>

      {/* Completion progress bar */}
      {sessions.length > 0 && (
        <div className="table-container animate-fade-up" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--dark-bg)' }}>📊 Session Completion Rate</span>
            <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1rem' }}>{completionRate}%</span>
          </div>
          <div style={{ height: 10, background: '#e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${completionRate}%`, background: 'linear-gradient(90deg, var(--primary), var(--lime))', borderRadius: 8, transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: '0 2px 8px rgba(16,185,129,0.35)' }} />
          </div>
        </div>
      )}

      <div className="table-container animate-fade-up">
        <div className="table-header">
          <h2>My Sessions ({filtered.length}{(search || filterStatus !== 'ALL') ? ` of ${sessions.length}` : ''})</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...INPUT_STYLE, width: 'auto', padding: '0.5rem 0.75rem' }}>
              <option value="ALL">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <input type="text" placeholder="🔍 Search title, member, notes..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...INPUT_STYLE, width: 220 }} />
            <button className="btn btn-primary" onClick={openCreate}>+ New Session</button>
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="loading-spinner" />Loading sessions...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🗓️</span>
            <h3>{search || filterStatus !== 'ALL' ? 'No sessions match your filters.' : 'No sessions yet.'}</h3>
            <p>Create your first training session to get started!</p>
          </div>
        ) : (
          <table>
            <thead><tr><th>Title</th><th>Member</th><th>Date & Time</th><th>Duration</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.title}</strong></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 800 }}>
                        {s.memberName?.charAt(0)}
                      </div>
                      {s.memberName}
                    </div>
                  </td>
                  <td>{new Date(s.sessionDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td>{s.durationMinutes ? `${s.durationMinutes} min` : '—'}</td>
                  <td>{statusBadge(s.status)}</td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
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
            <h2>{editingSession ? '✏️ Edit Session' : '➕ New Training Session'}</h2>
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Session Title</label>
                <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Cardio Blast" />
              </div>
              <div className="form-group">
                <label>Member</label>
                <select name="memberId" value={form.memberId} onChange={handleChange} required>
                  <option value="">Select a member</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date & Time</label>
                  <input type="datetime-local" name="sessionDate" value={form.sessionDate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input type="number" name="durationMinutes" value={form.durationMinutes} onChange={handleChange} min="1" placeholder="e.g. 60" />
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
                    <label>Post-Session Notes</label>
                    <input name="notes" value={form.notes} onChange={handleChange} placeholder="How did it go?" />
                  </div>
                </div>
              )}
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</> : editingSession ? '💾 Update' : '✅ Create Session'}
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
