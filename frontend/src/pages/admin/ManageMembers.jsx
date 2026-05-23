import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getAllMembers, deleteUser } from '../../api/userApi';

function ManageMembers() {
  const [members, setMembers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
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
    } catch { setError('Failed to delete member.'); }
  };

  const filtered = members.filter(m =>
    `${m.firstName} ${m.lastName} ${m.email} ${m.phone || ''} ${m.address || ''}`
      .toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Manage Members 👥">
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', marginBottom: '1.5rem' }}>
        {[
          { icon: '👥', label: 'Total Members', value: members.length,  color: '#48bb78', delay: 1 },
          { icon: '🔍', label: 'Showing',       value: filtered.length, color: '#4299e1', delay: 2 },
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
          <h2>All Members ({filtered.length}{search ? ` of ${members.length}` : ''})</h2>
          <input type="text" placeholder="🔍 Search name, email, phone..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: '0.5rem 0.875rem', border: '1.5px solid #c8ddd5', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', width: 280, fontFamily: 'inherit' }} />
        </div>

        {loading ? (
          <div className="loading"><div className="loading-spinner" />Loading members...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">👥</span>
            <h3>{search ? 'No members match your search.' : 'No members found.'}</h3>
          </div>
        ) : (
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((m, idx) => (
                <tr key={m.id}>
                  <td style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: 700 }}>{idx + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.78rem', fontWeight: 800, boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}>
                        {m.firstName?.charAt(0)}{m.lastName?.charAt(0)}
                      </div>
                      <strong>{m.firstName} {m.lastName}</strong>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{m.email}</td>
                  <td style={{ fontSize: '0.88rem' }}>{m.phone || '—'}</td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{m.address || '—'}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(m.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setViewMember(m)}>View</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id, `${m.firstName} ${m.lastName}`)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {viewMember && (
        <div className="modal-overlay" onClick={() => setViewMember(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: 76, height: 76, borderRadius: '50%', margin: '0 auto 0.75rem', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 900, color: 'white', boxShadow: '0 6px 20px rgba(16,185,129,0.35)' }}>
                {viewMember.firstName?.charAt(0)}{viewMember.lastName?.charAt(0)}
              </div>
              <h2 style={{ marginBottom: '0.3rem' }}>{viewMember.firstName} {viewMember.lastName}</h2>
              <span className="badge badge-member">MEMBER</span>
            </div>
            {[
              { label: '📧 Email',   value: viewMember.email },
              { label: '📱 Phone',   value: viewMember.phone   || '—' },
              { label: '🏠 Address', value: viewMember.address || '—' },
              { label: '📅 Joined',  value: new Date(viewMember.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.625rem 0', borderBottom: '1px solid rgba(16,185,129,0.08)', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flexShrink: 0 }}>{row.label}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--dark-bg)', textAlign: 'right', wordBreak: 'break-all', fontWeight: 600 }}>{row.value}</span>
              </div>
            ))}
            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-danger" onClick={() => handleDelete(viewMember.id, `${viewMember.firstName} ${viewMember.lastName}`)}>🗑 Delete</button>
              <button className="btn btn-secondary" onClick={() => setViewMember(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default ManageMembers;
