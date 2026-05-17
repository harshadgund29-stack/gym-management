import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getAllMembers, deleteUser } from '../../api/userApi';

function ManageMembers() {
  const [members, setMembers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [viewMember, setViewMember] = useState(null);

  const fetchMembers = () => {
    setLoading(true);
    getAllMembers()
      .then(res => setMembers(res.data))
      .catch(() => setError('Failed to load members.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete member "${name}"? This cannot be undone.`)) return;
    try {
      await deleteUser(id);
      setMembers(prev => prev.filter(m => m.id !== id));
      if (viewMember?.id === id) setViewMember(null);
    } catch {
      setError('Failed to delete member.');
    }
  };

  const filtered = members.filter(m =>
    `${m.firstName} ${m.lastName} ${m.email} ${m.phone || ''} ${m.address || ''}`
      .toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Manage Members">
      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeftColor: '#48bb78' }}>
          <span className="stat-icon">👥</span>
          <span className="stat-value" style={{ color: '#48bb78' }}>{members.length}</span>
          <span className="stat-label">Total Members</span>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#4299e1' }}>
          <span className="stat-icon">🔍</span>
          <span className="stat-value" style={{ color: '#4299e1' }}>{filtered.length}</span>
          <span className="stat-label">Showing</span>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>All Members ({filtered.length}{search ? ` of ${members.length}` : ''})</h2>
          <input
            type="text"
            placeholder="🔍 Search name, email, phone, address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '0.5rem 0.875rem', border: '1px solid #e2e8f0',
              borderRadius: '8px', fontSize: '0.875rem', width: '280px', outline: 'none',
            }}
          />
        </div>

        {loading ? (
          <div className="loading">Loading members...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>{search ? 'No members match your search.' : 'No members found.'}</p>
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
              {filtered.map((m, idx) => (
                <tr key={m.id}>
                  <td style={{ color: '#a0aec0', fontSize: '0.8rem' }}>{idx + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #48bb78, #276749)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.75rem', fontWeight: 700,
                      }}>
                        {m.firstName?.charAt(0)}{m.lastName?.charAt(0)}
                      </div>
                      <strong>{m.firstName} {m.lastName}</strong>
                    </div>
                  </td>
                  <td>{m.email}</td>
                  <td>{m.phone || '—'}</td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.address || '—'}
                  </td>
                  <td>{new Date(m.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setViewMember(m)}>View</button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(m.id, `${m.firstName} ${m.lastName}`)}
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View Member Modal */}
      {viewMember && (
        <div className="modal-overlay" onClick={() => setViewMember(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', margin: '0 auto 0.75rem',
                background: 'linear-gradient(135deg, #48bb78, #276749)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 700, color: 'white',
              }}>
                {viewMember.firstName?.charAt(0)}{viewMember.lastName?.charAt(0)}
              </div>
              <h2 style={{ marginBottom: '0.25rem' }}>{viewMember.firstName} {viewMember.lastName}</h2>
              <span className="badge badge-member">MEMBER</span>
            </div>

            {[
              { label: '📧 Email',   value: viewMember.email },
              { label: '📱 Phone',   value: viewMember.phone   || '—' },
              { label: '🏠 Address', value: viewMember.address || '—' },
              { label: '📅 Joined',  value: new Date(viewMember.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) },
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
                onClick={() => handleDelete(viewMember.id, `${viewMember.firstName} ${viewMember.lastName}`)}
              >Delete Member</button>
              <button className="btn btn-secondary" onClick={() => setViewMember(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default ManageMembers;
