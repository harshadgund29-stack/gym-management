import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getAllPlans, createPlan, updatePlan, deletePlan } from '../../api/planApi';

const emptyForm = { name: '', description: '', price: '', durationMonths: '', features: '', active: true };

function ManagePlans() {
  const [plans, setPlans]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [viewPlan, setViewPlan]   = useState(null);

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
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, price: parseFloat(form.price), durationMonths: parseInt(form.durationMonths) };
      if (editingPlan) {
        await updatePlan(editingPlan.id, payload);
      } else {
        await createPlan(payload);
      }
      setShowModal(false);
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete plan "${name}"? This cannot be undone.`)) return;
    try {
      await deletePlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
      if (viewPlan?.id === id) setViewPlan(null);
    } catch {
      setError('Failed to delete plan. It may be in use by existing memberships.');
    }
  };

  const FeaturePills = ({ features }) => {
    if (!features) return <span style={{ color: '#a0aec0' }}>—</span>;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
        {features.split(',').map(f => f.trim()).filter(Boolean).map(f => (
          <span key={f} style={{
            background: '#f0fff4', color: '#276749', padding: '0.15rem 0.5rem',
            borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap',
          }}>
            {f}
          </span>
        ))}
      </div>
    );
  };

  return (
    <Layout title="Membership Plans">
      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeftColor: '#e94560' }}>
          <span className="stat-icon">📋</span>
          <span className="stat-value" style={{ color: '#e94560' }}>{plans.length}</span>
          <span className="stat-label">Total Plans</span>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#48bb78' }}>
          <span className="stat-icon">✅</span>
          <span className="stat-value" style={{ color: '#48bb78' }}>{plans.filter(p => p.active).length}</span>
          <span className="stat-label">Active Plans</span>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#a0aec0' }}>
          <span className="stat-icon">🚫</span>
          <span className="stat-value" style={{ color: '#a0aec0' }}>{plans.filter(p => !p.active).length}</span>
          <span className="stat-label">Inactive Plans</span>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>All Plans ({plans.length})</h2>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Plan</button>
        </div>

        {loading ? (
          <div className="loading">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No plans yet. Create your first membership plan!</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Price</th><th>Duration</th>
                <th>Features</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan.id}>
                  <td>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#e94560', padding: 0, fontSize: '0.9rem' }}
                      onClick={() => setViewPlan(plan)}
                    >
                      {plan.name}
                    </button>
                  </td>
                  <td>
                    <strong>₹{Number(plan.price).toLocaleString('en-IN')}</strong>
                    <span style={{ color: '#a0aec0', fontSize: '0.8rem' }}>/{plan.durationMonths > 1 ? `${plan.durationMonths}mo` : 'mo'}</span>
                  </td>
                  <td>{plan.durationMonths} month{plan.durationMonths > 1 ? 's' : ''}</td>
                  <td style={{ maxWidth: 220 }}><FeaturePills features={plan.features} /></td>
                  <td>
                    <span className={`badge ${plan.active ? 'badge-active' : 'badge-cancelled'}`}>
                      {plan.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
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

      {/* View Plan Detail Modal */}
      {viewPlan && (
        <div className="modal-overlay" onClick={() => setViewPlan(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ marginBottom: '0.25rem' }}>{viewPlan.name}</h2>
                <span className={`badge ${viewPlan.active ? 'badge-active' : 'badge-cancelled'}`}>
                  {viewPlan.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <button onClick={() => setViewPlan(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#a0aec0' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1, background: '#fff5f5', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#e94560' }}>
                  ₹{Number(viewPlan.price).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#718096' }}>per {viewPlan.durationMonths > 1 ? `${viewPlan.durationMonths} months` : 'month'}</div>
              </div>
              <div style={{ flex: 1, background: '#f0fff4', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#48bb78' }}>{viewPlan.durationMonths}</div>
                <div style={{ fontSize: '0.75rem', color: '#718096' }}>month{viewPlan.durationMonths > 1 ? 's' : ''} duration</div>
              </div>
            </div>

            {viewPlan.description && (
              <p style={{ fontSize: '0.875rem', color: '#4a5568', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                {viewPlan.description}
              </p>
            )}

            {viewPlan.features && (
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.6rem' }}>✅ Included Features</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {viewPlan.features.split(',').map(f => f.trim()).filter(Boolean).map(f => (
                    <span key={f} style={{
                      background: '#f0fff4', color: '#276749', padding: '0.3rem 0.75rem',
                      borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                    }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => { openEdit(viewPlan); setViewPlan(null); }}>Edit Plan</button>
              <button className="btn btn-danger" onClick={() => handleDelete(viewPlan.id, viewPlan.name)}>Delete</button>
              <button className="btn btn-secondary" onClick={() => setViewPlan(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Plan Name</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Premium" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Plan description..." />
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
                <input name="features" value={form.features} onChange={handleChange} placeholder="Gym Access, Pool, Classes" />
                {form.features && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {form.features.split(',').map(f => f.trim()).filter(Boolean).map(f => (
                      <span key={f} style={{ background: '#f0fff4', color: '#276749', padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600 }}>
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" name="active" id="active" checked={form.active} onChange={handleChange} style={{ width: 'auto' }} />
                <label htmlFor="active" style={{ marginBottom: 0 }}>Active (visible to members)</label>
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

export default ManagePlans;
