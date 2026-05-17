import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getDashboardStats } from '../../api/dashboardApi';

function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getDashboardStats()
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load dashboard statistics.'))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { icon: '👥', label: 'Total Members',    value: stats.totalMembers,   color: '#e94560' },
    { icon: '🏋️', label: 'Total Trainers',   value: stats.totalTrainers,  color: '#4299e1' },
    { icon: '✅', label: 'Active Members',   value: stats.activeMembers,  color: '#48bb78' },
    { icon: '📋', label: 'Membership Plans', value: stats.totalPlans,     color: '#ed8936' },
    {
      icon: '💰', label: 'Total Revenue',
      value: `₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      color: '#9f7aea',
    },
    { icon: '💳', label: 'Payments (Month)', value: stats.paymentsThisMonth, color: '#38b2ac' },
    { icon: '🗓️', label: 'Total Sessions',   value: stats.totalSessions,  color: '#f6ad55' },
  ] : [];

  // Revenue bar chart
  const chartData  = stats?.monthlyRevenue || [];
  const maxRevenue = chartData.length
    ? Math.max(...chartData.map(d => Number(d.revenue) || 0), 1)
    : 1;

  return (
    <Layout title="Admin Dashboard">
      {loading && <div className="loading">Loading statistics...</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {stats && (
        <>
          {/* KPI Cards */}
          <div className="stats-grid">
            {cards.map(card => (
              <div key={card.label} className="stat-card" style={{ borderLeftColor: card.color }}>
                <span className="stat-icon">{card.icon}</span>
                <span className="stat-value" style={{ color: card.color, fontSize: typeof card.value === 'string' && card.value.length > 8 ? '1.3rem' : '2rem' }}>
                  {card.value}
                </span>
                <span className="stat-label">{card.label}</span>
              </div>
            ))}
          </div>

          {/* Revenue Bar Chart */}
          {chartData.length > 0 && (
            <div className="table-container" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1a1a2e' }}>
                📈 Monthly Revenue — Last 6 Months
              </h2>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '200px', padding: '0 0.5rem' }}>
                {chartData.map(d => {
                  const rev = Number(d.revenue) || 0;
                  const pct = (rev / maxRevenue) * 100;
                  return (
                    <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.68rem', color: '#718096', fontWeight: 600, textAlign: 'center' }}>
                        {rev > 0 ? `₹${rev.toLocaleString('en-IN', { notation: 'compact', maximumFractionDigits: 1 })}` : '—'}
                      </span>
                      <div
                        title={`₹${rev.toLocaleString('en-IN')}`}
                        style={{
                          width: '100%',
                          height: `${Math.max(pct, rev > 0 ? 4 : 1)}%`,
                          background: rev > 0
                            ? 'linear-gradient(180deg, #e94560 0%, #c73652 100%)'
                            : '#f0f2f5',
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.6s ease',
                          minHeight: '4px',
                          cursor: rev > 0 ? 'pointer' : 'default',
                        }}
                      />
                      <span style={{ fontSize: '0.68rem', color: '#a0aec0', textAlign: 'center', lineHeight: 1.2 }}>
                        {d.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="table-container" style={{ padding: '1.5rem' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>⚡ Quick Actions</h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a href="/admin/members"      className="btn btn-primary">👥 Members</a>
              <a href="/admin/trainers"     className="btn btn-secondary">🏋️ Trainers</a>
              <a href="/admin/memberships"  className="btn btn-secondary">📋 Memberships</a>
              <a href="/admin/plans"        className="btn btn-secondary">🏷️ Plans</a>
              <a href="/admin/payments"     className="btn btn-secondary">💰 Payments</a>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

export default AdminDashboard;
