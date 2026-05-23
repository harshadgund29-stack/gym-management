import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import {
  getPlansByTrainer,
  assignWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
} from '../../api/workoutApi';
import { getMembersList } from '../../api/membersApi';

const emptyForm = { title: '', description: '', memberId: '', exercises: '', goal: '', weekDuration: '' };

const GOAL_PRESETS = ['Weight Loss', 'Muscle Gain', 'Cardio Endurance', 'Strength Training', 'Flexibility', 'General Fitness'];

function TrainerWorkoutPlans() {
  const { user } = useAuth();
  const [plans, setPlans]               = useState([]);
  const [members, setMembers]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [search, setSearch]             = useState('');
  const [filterMember, setFilterMember] = useState('ALL');
  const [showModal, setShowModal]       = useState(false);
  const [editingPlan, setEditingPlan]   = useState(null);
  const [form, setForm]                 = useState(emptyForm);
  const [saving, setSaving]             = useState(false);
  const [viewPlan, setViewPlan]         = useState(null);

  const fetchData = () => {
    Promise.all([getPlansByTrainer(user.userId), getMembersList()])
      .then(([planRes, memRes]) => { setPlans(planRes.data); setMembers(memRes.data); })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (user?.userId) fetchData(); }, [user]);

  const openCreate = () => { setEditingPlan(null); setForm(emptyForm); setShowModal(true); };
  const openEdit   = (p) => {
    setEditingPlan(p);
    setForm({ title: p.title, description: p.description || '', memberId: p.memberId, exercises: p.exercises || '', goal: p.goal || '', weekDuration: p.weekDuration || '' });
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('');
    try {
      if (editingPlan) {
        const payload = {
          ...form,
          trainerId: user.userId,
          memberId: parseInt(form.memberId, 10),
          weekDuration: form.weekDuration ? parseInt(form.weekDuration, 10) : null,
        };
        await updateWorkoutPlan(editingPlan.id, payload);
      } else {
        await assignWorkoutPlan({
          trainerId: user.userId,
          memberId: parseInt(form.memberId, 10),
          planTitle: form.title,
          goal: form.goal || '',
          totalWeeks: form.weekDuration ? parseInt(form.weekDuration, 10) : null,
          description: form.description || '',
          exercises: form.exercises || '',
        });
      }
      setShowModal(false);
      setSuccess('✅ Workout plan assigned successfully!');
      fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save plan.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workout plan?')) return;
    try { await deleteWorkoutPlan(id); setPlans(prev => prev.filter(p => p.id !== id)); if (viewPlan?.id === id) setViewPlan(null); }
    catch { setError('Failed to delete plan.'); }
  };

  const planMembers = [...new Map(plans.map(p => [p.memberId, p.memberName])).entries()];
  const filtered = plans.filter(p => {
    const matchSearch = `${p.title} ${p.memberName} ${p.goal || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchMember = filterMember === 'ALL' || String(p.memberId) === filterMember;
    return matchSearch && matchMember;
  });

  return (
    <Layout title="Workout Plans 📋">
      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', marginBottom: '1.5rem' }}>
        {[
          { icon: '📋', label: 'Total Plans',       value: plans.length,       color: '#e94560', delay: 1 },
          { icon: '👥', label: 'Members Assigned',  value: planMembers.length, color: '#4299e1', delay: 2 },
          { icon: '🎯', label: 'With Goals',        value: plans.filter(p => p.goal).length, color: '#48bb78', delay: 3 },
          { icon: '⏱️', label: 'Total Weeks',       value: plans.reduce((s, p) => s + (p.weekDuration || 0), 0), color: '#9f7aea', delay: 4 },
        ].map(c => (
          <div key={c.label} className={`stat-card animate-fade-up delay-${c.delay}`}>
            <span className="stat-icon">{c.icon}</span>
            <span className="stat-value" style={{ color: c.color }}>{c.value}</span>
            <span className="stat-label">{c.label}</span>
          </div>
        ))}
      </div>

      <div className="table-container animate-fade-up">
        <div className="table-header">
          <h2>My Workout Plans ({filtered.length}{(search || filterMember !== 'ALL') ? ` of ${plans.length}` : ''})</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={filterMember} onChange={e => setFilterMember(e.target.value)} style={{ padding: '0.5rem 0.75rem', border: '1.5px solid #c8ddd5', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontFamily: 'inherit' }}>
              <option value="ALL">All Members</option>
              {planMembers.map(([id, name]) => <option key={id} value={String(id)}>{name}</option>)}
            </select>
            <input type="text" placeholder="🔍 Search title, member, goal..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '0.5rem 0.875rem', border: '1.5px solid #c8ddd5', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', width: 220, fontFamily: 'inherit' }} />
            <button className="btn btn-primary" onClick={openCreate}>+ New Plan</button>
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="loading-spinner" />Loading plans...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>{search || filterMember !== 'ALL' ? 'No plans match your filters.' : 'No workout plans yet.'}</h3>
            <p>Create a personalised plan for your members!</p>
          </div>
        ) : (
          <table>
            <thead><tr><th>Title</th><th>Member</th><th>Goal</th><th>Duration</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, color: 'var(--accent)', padding: 0, fontSize: '0.9rem', fontFamily: 'inherit' }} onClick={() => setViewPlan(p)}>
                      {p.title}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 800 }}>
                        {p.memberName?.charAt(0)}
                      </div>
                      {p.memberName}
                    </div>
                  </td>
                  <td>
                    {p.goal ? (
                      <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-dark)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>
                        🎯 {p.goal}
                      </span>
                    ) : <span style={{ color: '#cbd5e0' }}>—</span>}
                  </td>
                  <td>{p.weekDuration ? <span style={{ fontWeight: 700, color: '#4299e1' }}>{p.weekDuration} wks</span> : '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View Plan Modal */}
      {viewPlan && (
        <div className="modal-overlay" onClick={() => setViewPlan(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ marginBottom: '0.25rem' }}>{viewPlan.title}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>For {viewPlan.memberName}</p>
              </div>
              <button onClick={() => setViewPlan(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {viewPlan.goal && <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-dark)', padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(16,185,129,0.2)' }}>🎯 {viewPlan.goal}</span>}
              {viewPlan.weekDuration && <span style={{ background: 'rgba(66,153,225,0.1)', color: '#2b6cb0', padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(66,153,225,0.2)' }}>⏱️ {viewPlan.weekDuration} weeks</span>}
              <span style={{ background: '#f9fafb', color: '#9ca3af', padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', border: '1px solid #e5e7eb' }}>📅 {new Date(viewPlan.createdAt).toLocaleDateString('en-IN')}</span>
            </div>
            {viewPlan.description && (
              <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.04)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid rgba(16,185,129,0.1)' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.65 }}>{viewPlan.description}</p>
              </div>
            )}
            {viewPlan.exercises && (
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e5e7eb' }}>
                <p style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.6rem', color: 'var(--dark-bg)' }}>📅 Exercise Schedule</p>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.82rem', color: '#374151', fontFamily: 'inherit', lineHeight: 1.75 }}>{viewPlan.exercises}</pre>
              </div>
            )}
            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => { openEdit(viewPlan); setViewPlan(null); }}>✏️ Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(viewPlan.id)}>🗑 Delete</button>
              <button className="btn btn-secondary" onClick={() => setViewPlan(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingPlan ? '✏️ Edit Workout Plan' : '➕ New Workout Plan'}</h2>
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Plan Title</label>
                <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. 8-Week Weight Loss Program" />
              </div>
              <div className="form-group">
                <label>Assign to Member</label>
                <select name="memberId" value={form.memberId} onChange={handleChange} required>
                  <option value="">Select a member</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Goal</label>
                  <input name="goal" value={form.goal} onChange={handleChange} placeholder="e.g. Lose 5kg" list="goal-presets" />
                  <datalist id="goal-presets">{GOAL_PRESETS.map(g => <option key={g} value={g} />)}</datalist>
                </div>
                <div className="form-group">
                  <label>Duration (weeks)</label>
                  <input type="number" name="weekDuration" value={form.weekDuration} onChange={handleChange} min="1" placeholder="e.g. 8" />
                </div>
              </div>
              <div className="form-group">
                <label>Description / Overview</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Brief overview of the plan..." />
              </div>
              <div className="form-group">
                <label>Exercise Schedule</label>
                <textarea name="exercises" value={form.exercises} onChange={handleChange} rows={6}
                  placeholder={'Monday: Squats 3×12, Lunges 3×10\nTuesday: Rest\nWednesday: Bench Press 4×8...'} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</> : editingPlan ? '💾 Update Plan' : '✅ Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default TrainerWorkoutPlans;
