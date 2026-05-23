import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getAllPlans, createPlan, updatePlan, deletePlan } from '../../api/planApi';

const emptyForm = { name: '', description: '', price: '', durationMonths: '', features: '', active: true };

function ManagePlans() {
  const [plans, setPlans]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm]               = useState(emptyForm);
  const [saving, setSaving]           = useState(false);
  const [viewPlan, setViewPlan]       = useState(null);

  const fetchPlans = () => {
    getAllPlans()
      .then(res => setPlans(res.data))
      .catch(() => setError('Failed to load plans.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => { setEditingPlan(null); setForm(emptyForm); setShowModal(true); };
  const openEdit   = (plan) => {
    setEditingPlan(plan);
    setForm({ ...plan, price: plan.price.toString(), durationMonths: plan.durationMonths.toString() });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { ...form, price: parseFloat(form.price), durationMonths: parseInt(form.durationMonths) };
      editingPlan ? await updatePlan(editingPlan.id, payload) : await createPlan(payload);
      setShowModal(false); fetchPlans();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save plan.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete plan "${name}"? This cannot be undone.`)) return;
    try { await deletePlan(id); setPlans(prev => prev.filter(p => p.id !== id)); if (viewPlan?.id === id) setViewPlan(null); }
    catch { setError('Failed to delete plan. It may be in use by existing memberships.'); }
  };

  const FeaturePills = ({ features }) => {
    if (!features) return <span style={{ color: '#cbd5e0' }}>—</span>;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
        {features.split(',').map(f => f.trim()).filter(Boolean).map(f => (
          <span key={f} style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-dark)', padding: '0.15rem 0.55rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid rgba(16,185,129,0.2)', whiteSpace: 'nowrap' }}>
            {f}
          </span>
        ))}
      </div>
    );
  };

  return (
    <Layout title="Membership Plans 🏷️">
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', marginBottom: '1.5rem' }}>
        {[
          { icon: '📋', label: 'Total Plans',    value: plans.length,                       color: '#e94560', delay: 1 },
          { icon: '✅', label: 'Active Plans',   value: plans.filter(p => p.active).length, color: '#48bb78', delay: 2 },
          { icon: '🚫', label: 'Inactive Plans', value: plans.filter(p => !p.active).length, color: '#a0aec0', delay: 3 },
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
          <h2>All Plans ({plans.length})</h2>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Plan</button>
        </div>

        {loading ? (
          <div className="loading"><div className="loading-spinner" />Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>No plans yet</h3>
            <p>Create your first membership plan to get started!</p>
          </div>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Price</th><th>Duration</th><th>Features</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan.id}>
                  <td>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, color: 'var(--accent)', padding: 0, fontSize: '0.9rem', fontFamily: 'inherit' }} onClick={() => setViewPlan(plan)}>
                      {plan.name}
                    </button>
                  </td>
                  <td>
                    <strong style={{ color: '#16a34a' }}>₹{Number(plan.price).toLocaleString('en-IN')}</strong>
                    <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>/{plan.durationMonths > 1 ? `${plan.durationMonths}mo` : 'mo'}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#4299e1' }}>{plan.durationMonths} month{plan.durationMonths > 1 ? 's' : ''}</td>
                  <td style={{ maxWidth: 240 }}><FeaturePills features={plan.features} /></td>
                  <td><span className={`badge ${plan.active ? 'badge-active' : 'badge-cancelled'}`}>{plan.active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(plan)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(plan.id, plan.name)}>Delete</button>
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
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ marginBottom: '0.3rem' }}>{viewPlan.name}</h2>
                <span className={`badge ${viewPlan.active ? 'badge-active' : 'badge-cancelled'}`}>{viewPlan.active ? 'Active' : 'Inactive'}</span>
              </div>
              <button onClick={() => setViewPlan(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'rgba(16,185,129,0.06)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center', border: '1px solid rgba(16,185,129,0.15)' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16a34a' }}>₹{Number(viewPlan.price).toLocaleString('en-IN')}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>per {viewPlan.durationMonths > 1 ? `${viewPlan.durationMonths} months` : 'month'}</div>
              </div>
              <div style={{ background: 'rgba(66,153,225,0.06)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center', border: '1px solid rgba(66,153,225,0.15)' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#2b6cb0' }}>{viewPlan.durationMonths}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>month{viewPlan.durationMonths > 1 ? 's' : ''} duration</div>
              </div>
            </div>
            {viewPlan.description && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '1.25rem', padding: '0.875rem', background: '#f9fafb', borderRadius: 'var(--radius-md)' }}>{viewPlan.description}</p>}
            {viewPlan.features && (
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--dark-bg)', marginBottom: '0.6rem' }}>✅ Included Features</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {viewPlan.features.split(',').map(f => f.trim()).filter(Boolean).map(f => (
                    <span key={f} style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-dark)', padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(16,185,129,0.2)' }}>{f}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => { openEdit(viewPlan); setViewPlan(null); }}>✏️ Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(viewPlan.id, viewPlan.name)}>🗑 Delete</button>
              <button className="btn btn-secondary" onClick={() => setViewPlan(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingPlan ? '✏️ Edit Plan' : '➕ Create New Plan'}</h2>
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Plan Name</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Premium Monthly" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="What's included in this plan..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" step="0.01" placeholder="e.g. 4999" />
                </div>
                <div className="form-group">
                  <label>Duration (months)</label>
                  <input type="number" name="durationMonths" value={form.durationMonths} onChange={handleChange} required min="1" placeholder="e.g. 1" />
                </div>
              </div>
              <div className="form-group">
                <label>Features (comma-separated)</label>
                <input name="features" value={form.features} onChange={handleChange} placeholder="Gym Access, Pool, Sauna, Classes" />
                {form.features && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {form.features.split(',').map(f => f.trim()).filter(Boolean).map(f => (
                      <span key={f} style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-dark)', padding: '0.15rem 0.55rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}>{f}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <input type="checkbox" name="active" id="active-check" checked={form.active} onChange={handleChange} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--primary)' }} />
                <label htmlFor="active-check" style={{ marginBottom: 0, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>Active — visible to members for purchase</label>
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

export default ManagePlans;
