import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { getAdminSummary } from '../../api/dashboardApi';

function AdminSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    getAdminSummary()
      .then((res) => setSummary(res.data))
      .catch((e) => setError('Failed to load admin summary.'))
      .finally(() => setLoading(false));
  }, []);

  const cards = useMemo(() => {
    if (!summary) return [];
    return [
      { icon: '👥', label: 'Total Members', value: summary.totalMembers ?? 0, color: '#e94560', delay: 1 },
      { icon: '👨‍🏫', label: 'Total Trainers', value: summary.totalTrainers ?? 0, color: '#4299e1', delay: 2 },
    ];
  }, [summary]);

  return (
    <Layout title="Admin Summary">
      {loading && (
        <div className="loading">
          <div className="loading-spinner" />
          Loading admin summary...
        </div>
      )}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {!loading && !error && summary && (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            {cards.map((card) => (
              <div
                key={card.label}
                className={`stat-card animate-fade-up delay-${card.delay}`}
                style={{ '--card-color': card.color }}
              >
                <span className="stat-icon">{card.icon}</span>
                <span className="stat-value" style={{ color: card.color, fontSize: '2.2rem' }}>
                  {card.value}
                </span>
                <span className="stat-label">{card.label}</span>
              </div>
            ))}
          </div>

          {/* Trainer Presence */}
          <div className="table-container animate-fade-up" style={{ padding: '2rem', marginTop: '1.25rem' }}>
            <div className="table-header">
              <h2>🏋️ Trainer Presence</h2>
              <span className="badge badge-active">Today</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Trainer</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(summary.presentTrainers || []).map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 800 }}>
                        {t.name}
                      </td>
                      <td>
                        <span
                          className={`badge ${t.status === 'Present' ? 'badge-active' : 'badge-completed'}`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {(summary.presentTrainers || []).length === 0 && (
                    <tr>
                      <td colSpan={2}>
                        <div className="empty-state">
                          <span className="empty-icon">🧾</span>
                          <p>No trainers found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Member Purchases */}
          <div className="table-container animate-fade-up" style={{ padding: '2rem', marginTop: '1.25rem' }}>
            <div className="table-header">
              <h2>💳 Member Purchases</h2>
              <span className="badge badge-active">Membership → Plan</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Plan</th>
                    <th>Purchase Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(summary.memberPurchases || []).map((p, idx) => (
                    <tr key={`${p.memberId ?? p.memberName ?? idx}`}> 
                      <td style={{ fontWeight: 800 }}>{p.memberName}</td>
                      <td>{p.plan}</td>
                      <td>{p.purchaseDate ?? '—'}</td>
                    </tr>
                  ))}

                  {(summary.memberPurchases || []).length === 0 && (
                    <tr>
                      <td colSpan={3}>
                        <div className="empty-state">
                          <span className="empty-icon">📭</span>
                          <p>No purchases found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

export default AdminSummary;

