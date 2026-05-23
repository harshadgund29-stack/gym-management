import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getAllTrainers, deleteUser } from '../../api/userApi';

function ManageTrainers() {
  const [trainers, setTrainers]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [viewTrainer, setViewTrainer] = useState(null);

  useEffect(() => {
    getAllTrainers()
      .then(res => setTrainers(res.data))
      .catch(() => setError('Failed to load trainers.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete trainer "${name}"? This cannot be undone.`)) return;
    try {
      await deleteUser(id);
      setTrainers(prev => prev.filter(t => t.id !== id));
      if (viewTrainer?.id === id) setViewTrainer(null);
    } catch { setError('Failed to delete trainer.'); }
  };

  const filtered = trainers.filter(t =>
    `${t.firstName} ${t.lastName} ${t.email} ${t.phone || ''} ${t.address || ''}`
      .toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Manage Trainers 🏋️">
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', marginBottom: '1.5rem' }}>
        {[
          { icon: '🏋️', label: 'Total Trainers', value: trainers.length,  color: '#4299e1', delay: 1 },
          { icon: '🔍', label: 'Showing',         value: filtered.length,  color: '#9f7aea', delay: 2 },
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
          <h2>All Trainers ({filtered.length}{search ? ` of ${trainers.length}` : ''})</h2>
          <input type="text" placeholder="🔍 Search name, email or phone..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: '0.5rem 0.875rem', border: '1.5px solid #c8ddd5', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', width: 260, fontFamily: 'inherit' }} />
        </div>

        {loading ? (
          <div className="loading"><div className="loading-spinner" />Loading trainers...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🏋️</span>
            <h3>{search ? 'No trainers match your search.' : 'No trainers found.'}</h3>
          </div>
        ) : (
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((t, idx) => (
                <tr key={t.id}>
                  <td style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: 700 }}>{idx + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #4299e1, #2b6cb0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.78rem', fontWeight: 800, boxShadow: '0 2px 8px rgba(66,153,225,0.3)' }}>
                        {t.firstName?.charAt(0)}{t.lastName?.charAt(0)}
                      </div>
                      <strong>{t.firstName} {t.lastName}</strong>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{t.email}</td>
                  <td style={{ fontSize: '0.88rem' }}>{t.phone || '—'}</td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.address || '—'}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setViewTrainer(t)}>View</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id, `${t.firstName} ${t.lastName}`)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {viewTrainer && (
        <div className="modal-overlay" onClick={() => setViewTrainer(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: 76, height: 76, borderRadius: '50%', margin: '0 auto 0.75rem', background: 'linear-gradient(135deg, #4299e1, #2b6cb0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 900, color: 'white', boxShadow: '0 6px 20px rgba(66,153,225,0.35)' }}>
                {viewTrainer.firstName?.charAt(0)}{viewTrainer.lastName?.charAt(0)}
              </div>
              <h2 style={{ marginBottom: '0.3rem' }}>{viewTrainer.firstName} {viewTrainer.lastName}</h2>
              <span className="badge badge-trainer">TRAINER</span>
            </div>
            {[
              { label: '📧 Email',   value: viewTrainer.email },
              { label: '📱 Phone',   value: viewTrainer.phone   || '—' },
              { label: '🏠 Address', value: viewTrainer.address || '—' },
              { label: '📅 Joined',  value: new Date(viewTrainer.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.625rem 0', borderBottom: '1px solid rgba(16,185,129,0.08)', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flexShrink: 0 }}>{row.label}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--dark-bg)', textAlign: 'right', wordBreak: 'break-all', fontWeight: 600 }}>{row.value}</span>
              </div>
            ))}
            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-danger" onClick={() => handleDelete(viewTrainer.id, `${viewTrainer.firstName} ${viewTrainer.lastName}`)}>🗑 Delete</button>
              <button className="btn btn-secondary" onClick={() => setViewTrainer(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default ManageTrainers;
