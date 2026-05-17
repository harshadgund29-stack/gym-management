import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getAllTrainers, deleteUser } from '../../api/userApi';

function ManageTrainers() {
  const [trainers, setTrainers]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
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
    } catch {
      setError('Failed to delete trainer.');
    }
  };

  const filtered = trainers.filter(t =>
    `${t.firstName} ${t.lastName} ${t.email} ${t.phone || ''} ${t.address || ''}`
      .toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Manage Trainers">
      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeftColor: '#4299e1' }}>
          <span className="stat-icon">🏋️</span>
          <span className="stat-value" style={{ color: '#4299e1' }}>{trainers.length}</span>
          <span className="stat-label">Total Trainers</span>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#9f7aea' }}>
          <span className="stat-icon">🔍</span>
          <span className="stat-value" style={{ color: '#9f7aea' }}>{filtered.length}</span>
          <span className="stat-label">Showing</span>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>All Trainers ({filtered.length}{search ? ` of ${trainers.length}` : ''})</h2>
          <input
            type="text"
            placeholder="🔍 Search name, email or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '0.5rem 0.875rem', border: '1px solid #e2e8f0',
              borderRadius: '8px', fontSize: '0.875rem', width: '260px', outline: 'none',
            }}
          />
        </div>

        {loading ? (
          <div className="loading">Loading trainers...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏋️</div>
            <p>{search ? 'No trainers match your search.' : 'No trainers found.'}</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Email</th>
                <th>Phone</th><th>Address</th><th>Joined</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, idx) => (
                <tr key={t.id}>
                  <td style={{ color: '#a0aec0', fontSize: '0.8rem' }}>{idx + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #4299e1, #2b6cb0)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.75rem', fontWeight: 700,
                      }}>
                        {t.firstName?.charAt(0)}{t.lastName?.charAt(0)}
                      </div>
                      <strong>{t.firstName} {t.lastName}</strong>
                    </div>
                  </td>
                  <td>{t.email}</td>
                  <td>{t.phone || '—'}</td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.address || '—'}
                  </td>
                  <td>{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setViewTrainer(t)}>View</button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(t.id, `${t.firstName} ${t.lastName}`)}
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View Trainer Modal */}
      {viewTrainer && (
        <div className="modal-overlay" onClick={() => setViewTrainer(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', margin: '0 auto 0.75rem',
                background: 'linear-gradient(135deg, #4299e1, #2b6cb0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 700, color: 'white',
              }}>
                {viewTrainer.firstName?.charAt(0)}{viewTrainer.lastName?.charAt(0)}
              </div>
              <h2 style={{ marginBottom: '0.25rem' }}>{viewTrainer.firstName} {viewTrainer.lastName}</h2>
              <span className="badge badge-trainer">TRAINER</span>
            </div>

            {[
              { label: '📧 Email',   value: viewTrainer.email },
              { label: '📱 Phone',   value: viewTrainer.phone   || '—' },
              { label: '🏠 Address', value: viewTrainer.address || '—' },
              { label: '📅 Joined',  value: new Date(viewTrainer.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) },
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                padding: '0.625rem 0', borderBottom: '1px solid #f0f2f5', gap: '1rem',
              }}>
                <span style={{ fontSize: '0.85rem', color: '#718096', flexShrink: 0 }}>{row.label}</span>
                <span style={{ fontSize: '0.875rem', color: '#2d3748', textAlign: 'right', wordBreak: 'break-all' }}>{row.value}</span>
              </div>
            ))}

            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(viewTrainer.id, `${viewTrainer.firstName} ${viewTrainer.lastName}`)}
              >Delete Trainer</button>
              <button className="btn btn-secondary" onClick={() => setViewTrainer(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default ManageTrainers;
