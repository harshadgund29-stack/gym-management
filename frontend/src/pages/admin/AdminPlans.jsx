import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { planService } from '../../services/planService';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

// MembershipPlanDTO fields: id, name, description, price, durationMonths, features, active

const emptyForm = { name: '', description: '', durationMonths: 1, price: '', features: '' };

export default function AdminPlans() {
  const { data: plans, loading, refetch } = useFetch(planService.getAllPlans); // GET /api/plans
  const [showForm, setShowForm]           = useState(false);
  const [editId,   setEditId]             = useState(null);
  const [form,     setForm]               = useState(emptyForm);
  const [saving,   setSaving]             = useState(false);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit   = (p) => {
    setEditId(p.id);
    setForm({
      name:           p.name,
      description:    p.description || '',
      durationMonths: p.durationMonths,
      price:          p.price,
      features:       p.features || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await planService.updatePlan(editId, form);
        toast.success('Plan updated!');
      } else {
        await planService.createPlan(form);
        toast.success('Plan created!');
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save plan.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this plan? This cannot be undone.')) return;
    try {
      await planService.deactivatePlan(id);
      toast.success('Plan deleted.');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete plan.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Membership Plans</h1>
          <p className="page-subtitle">Manage your gym's membership offerings</p>
        </div>
        <button onClick={openCreate} className="btn-coral">+ New Plan</button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="card-dark border-coral-500/40">
          <h2 className="text-lg font-semibold text-white mb-5">
            {editId ? 'Edit Plan' : 'Create New Plan'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Plan Name</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-dark" placeholder="e.g. Basic Monthly" required
              />
            </div>
            <div>
              <label className="label-dark">Price ($)</label>
              <input
                type="number" step="0.01" min="0.01"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="input-dark" placeholder="29.99" required
              />
            </div>
            <div>
              <label className="label-dark">Duration (months)</label>
              <input
                type="number" min="1"
                value={form.durationMonths}
                onChange={e => setForm({ ...form, durationMonths: e.target.value })}
                className="input-dark" required
              />
            </div>
            <div>
              <label className="label-dark">Features <span className="text-fitpro-muted">(comma-separated)</span></label>
              <input
                value={form.features}
                onChange={e => setForm({ ...form, features: e.target.value })}
                className="input-dark" placeholder="Gym Access, Pool, Classes"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label-dark">Description</label>
              <input
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="input-dark" placeholder="Brief description of the plan"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-coral">
                {saving ? 'Saving...' : editId ? 'Update Plan' : 'Create Plan'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans?.map((plan, i) => (
          <div
            key={plan.id}
            className={`card-dark flex flex-col ${!plan.active ? 'opacity-50' : ''} ${i === 1 ? 'border-coral-500/40' : ''}`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-white">{plan.name}</h3>
              <span className={plan.active ? 'badge-active' : 'badge-inactive'}>
                {plan.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-fitpro-muted text-sm mb-4 flex-1">{plan.description}</p>
            <div className="mb-4">
              <span className="text-3xl font-extrabold text-white">${plan.price}</span>
              <span className="text-fitpro-muted text-sm"> / {plan.durationMonths} mo</span>
            </div>
            {plan.features && (
              <p className="text-xs text-fitpro-muted mb-4">{plan.features}</p>
            )}
            <div className="flex gap-2 mt-auto">
              <button onClick={() => openEdit(plan)} className="btn-outline btn-sm flex-1">
                Edit
              </button>
              <button onClick={() => handleDelete(plan.id)} className="btn-danger btn-sm flex-1">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {!plans?.length && (
        <div className="card-dark text-center py-12">
          <p className="text-fitpro-muted">No plans yet. Create your first plan above.</p>
        </div>
      )}
    </div>
  );
}
