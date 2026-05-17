import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { getPlansByTrainer, createWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan } from '../../api/workoutApi';
import { getAllMembers } from '../../api/userApi';

const emptyForm = { title: '', description: '', memberId: '', exercises: '', goal: '', weekDuration: '' };

function TrainerWorkoutPlans() {
  const { user } = useAuth();
  const [plans, setPlans]         = useState([]);
  const [members, setMembers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [filterMember, setFilterMember] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [viewPlan, setViewPlan]   = useState(null);

  const fetchData = () => {
    Promise.all([getPlansByTrainer(user.userId), getAllMembers()])
      .then(([planRes, memRes]) => {
        setPlans(planRes.data);
        setMembers(memRes.data);
      })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (user?.userId) fetchData(); }, [user]);

  const openCreate = () => { setEditingPlan(null); setForm(emptyForm); setShowModal(true); };
  const openEdit   = (p) => {
    setEditingPlan(p);
    setForm({
      title: p.title, description: p.description || '', memberId: p.memberId,
      exercises: p.exercises || '', goal: p.goal || '', weekDuration: p.weekDuration || '',
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
        weekDuration: form.weekDuration ? parseInt(form.weekDuration) : null,
      };
      if (editingPlan) {
        await updateWorkoutPlan(editingPlan.id, payload);
      } else {
        await createWorkoutPlan(payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workout plan?')) return;
    try {
      await deleteWorkoutPlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
      if (viewPlan?.id === id) setViewPlan(null);
    } catch {
      setError('Failed to delete plan.');
    }
  };

  // Unique members in plans for filter dropdown
  const planMembers = [...new Map(plans.map(p => [p.memberId, p.memberName])).entries()];

  const filtered = plans.filter(p => {
    const matchSearch = `${p.title} ${p.memberName} ${p.goal || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchMember = filterMember === 'ALL' || String(p.memberId) === filterMember;
    return matchSearch && matchMember;
  });

  return (
    <Layout title="Workout Plans">
      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeftColor: '#e94560' }}>
          <span className="stat-icon">📋</span>
          <span className="stat-value" style={{ color: '#e94560' }}>{plans.length}</span>
          <span className="stat-label">Total Plans</span>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#4299e1' }}>
          <span className="stat-icon">👥</span>
          <span className="stat-value" style={{ color: '#4299e1' }}>{planMembers.length}</span>
          <span className="stat-label">Members Assigned</span>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>My Workout Plans ({filtered.length}{(search || filterMember !== 'ALL') ? ` of ${plans.length}` : ''})</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={filterMember}
              onChange={e => setFilterMember(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}
            >
              <option value="ALL">All Members</option>
              {planMembers.map(([id, name]) => (
                <option key={id} value={String(id)}>{name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="🔍 Search title, member, goal..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '0.5rem 0.875rem', border: '1px solid #e2e8f0',
                borderRadius: '8px', fontSize: '0.875rem', width: '220px', outline: 'none',
              }}
            />
            <button className="btn btn-primary" onClick={openCreate}>+ New Plan</button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading plans...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>{search || filterMember !== 'ALL' ? 'No plans match your filters.' : 'No workout plans yet.'}</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th><th>Member</th><th>Goal</th>
                <th>Duration</th><th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#e94560', padding: 0, fontSize: '0.9rem' }}
                      onClick={() => setViewPlan(p)}
                    >
                      {p.title}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #48bb78, #276749)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.65rem', fontWeight: 700,
                      }}>
                        {p.memberName?.charAt(0)}
                      </div>
                      {p.memberName}
                    </div>
                  </td>
                  <td style={{ color: '#718096', fontSize: '0.875rem' }}>{p.goal || '—'}</td>
                  <td>{p.weekDuration ? `${p.weekDuration} wks` : '—'}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
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

      {/* View Plan Detail Modal */}
      {viewPlan && (
        <div className="modal-overlay" onClick={() => setViewPlan(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ marginBottom: '0.25rem' }}>{viewPlan.title}</h2>
                <p style={{ color: '#718096', fontSize: '0.85rem' }}>For {viewPlan.memberName}</p>
              </div>
              <button onClick={() => setViewPlan(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#a0aec0' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {viewPlan.goal && (
                <span style={{ background: '#f0fff4', color: '#276749', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                  🎯 {viewPlan.goal}
                </span>
              )}
              {viewPlan.weekDuration && (
                <span style={{ background: '#ebf8ff', color: '#2a69ac', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                  ⏱️ {viewPlan.weekDuration} weeks
                </span>
              )}
              <span style={{ background: '#f7fafc', color: '#718096', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem' }}>
                📅 Created {new Date(viewPlan.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>

            {viewPlan.description && (
              <div style={{ marginBottom: '1rem', padding: '0.875rem', background: '#f7fafc', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.875rem', color: '#4a5568', lineHeight: 1.6 }}>{viewPlan.description}</p>
              </div>
            )}

            {viewPlan.exercises && (
              <div style={{ padding: '0.875rem', background: '#f7fafc', borderRadius: '8px' }}>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>📅 Exercise Schedule</p>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', color: '#4a5568', fontFamily: 'inherit', lineHeight: 1.7 }}>
                  {viewPlan.exercises}
                </pre>
              </div>
            )}

            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => { openEdit(viewPlan); setViewPlan(null); }}>Edit Plan</button>
              <button className="btn btn-danger" onClick={() => handleDelete(viewPlan.id)}>Delete</button>
              <button className="btn btn-secondary" onClick={() => setViewPlan(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingPlan ? 'Edit Workout Plan' : 'New Workout Plan'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Weight Loss Plan" />
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
                  <label>Goal</label>
                  <input name="goal" value={form.goal} onChange={handleChange} placeholder="e.g. Lose 5kg" />
                </div>
                <div className="form-group">
                  <label>Duration (weeks)</label>
                  <input type="number" name="weekDuration" value={form.weekDuration} onChange={handleChange} min="1" />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Plan overview..." />
              </div>
              <div className="form-group">
                <label>Exercises</label>
                <textarea
                  name="exercises" value={form.exercises} onChange={handleChange} rows={5}
                  placeholder={'Monday: Squats x3, Lunges x3\nWednesday: Bench Press x4...'} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
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
