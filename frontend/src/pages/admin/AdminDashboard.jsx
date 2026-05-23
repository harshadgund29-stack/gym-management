import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getDashboardStats } from '../../api/dashboardApi';
import { getAllTrainers } from '../../api/userApi';
import axios from '../../api/axios';

function AdminDashboard() {
  const [stats, setStats]       = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getAllTrainers(),
      axios.get('/attendance/today').catch(() => ({ data: [] })),
    ])
      .then(([statsRes, trainersRes, attRes]) => {
        setStats(statsRes.data);
        setTrainers(trainersRes.data);
        setTodayAttendance(attRes.data);
      })
      .catch(() => setError('Failed to load dashboard statistics.'))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { icon: '👥', label: 'Total Members',    value: stats.totalMembers,   color: '#e94560', delay: 1 },
    { icon: '🏋️', label: 'Total Trainers',   value: stats.totalTrainers,  color: '#4299e1', delay: 2 },
    { icon: '✅', label: 'Active Members',   value: stats.activeMembers,  color: '#48bb78', delay: 3 },
    { icon: '📋', label: 'Membership Plans', value: stats.totalPlans,     color: '#ed8936', delay: 4 },
    {
      icon: '💰', label: 'Total Revenue',
      value: `₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`,
      color: '#9f7aea', delay: 5,
    },
    { icon: '💳', label: 'Payments (Month)', value: stats.paymentsThisMonth, color: '#38b2ac', delay: 6 },
    { icon: '🗓️', label: 'Total Sessions',   value: stats.totalSessions,  color: '#f6ad55', delay: 7 },
  ] : [];

  const chartData  = stats?.monthlyRevenue || [];
  const maxRevenue = chartData.length
    ? Math.max(...chartData.map(d => Number(d.revenue) || 0), 1)
    : 1;

  const quickActions = [
    { to: '/admin/members',     icon: '👥', label: 'Members',     color: '#e94560' },
    { to: '/admin/trainers',    icon: '🏋️', label: 'Trainers',    color: '#4299e1' },
    { to: '/admin/memberships', icon: '📋', label: 'Memberships', color: '#48bb78' },
    { to: '/admin/plans',       icon: '🏷️', label: 'Plans',       color: '#ed8936' },
    { to: '/admin/attendance',  icon: '📅', label: 'Attendance',  color: '#9f7aea' },
    { to: '/admin/payments',    icon: '💰', label: 'Payments',    color: '#38b2ac' },
  ];

  return (
    <Layout title="Admin Dashboard">
      {loading && (
        <div className="loading">
          <div className="loading-spinner" />
          Loading statistics...
        </div>
      )}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {stats && (
        <>
          {/* KPI Cards */}
          <div className="stats-grid">
            {cards.map((card, i) => (
              <div
                key={card.label}
                className={`stat-card animate-fade-up delay-${card.delay}`}
                style={{ '--card-color': card.color }}
              >
                <span className="stat-icon">{card.icon}</span>
                <span className="stat-value" style={{
                  color: card.color,
                  fontSize: typeof card.value === 'string' && card.value.length > 8 ? '1.4rem' : '2.2rem'
                }}>
                  {card.value}
                </span>
                <span className="stat-label">{card.label}</span>
              </div>
            ))}
          </div>

          {/* Revenue Bar Chart */}
          {chartData.length > 0 && (
            <div className="table-container animate-fade-up" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <div className="table-header">
                <h2>📈 Monthly Revenue — Last 6 Months</h2>
                <span className="badge badge-active">Live Data</span>
              </div>
              <div style={{ padding: '1.5rem 1rem 0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '220px' }}>
                  {chartData.map((d, i) => {
                    const rev = Number(d.revenue) || 0;
                    const pct = (rev / maxRevenue) * 100;
                    return (
                      <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', height: '100%', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '0.7rem', color: '#718096', fontWeight: 700, textAlign: 'center' }}>
                          {rev > 0 ? `₹${rev.toLocaleString('en-IN', { notation: 'compact', maximumFractionDigits: 1 })}` : '—'}
                        </span>
                        <div
                          title={`₹${rev.toLocaleString('en-IN')}`}
                          data-tooltip={`₹${rev.toLocaleString('en-IN')}`}
                          style={{
                            width: '100%',
                            height: `${Math.max(pct, rev > 0 ? 5 : 1)}%`,
                            background: rev > 0
                              ? `linear-gradient(180deg, var(--primary) 0%, var(--accent) 100%)`
                              : '#f0f2f5',
                            borderRadius: '8px 8px 0 0',
                            transition: 'height 0.8s cubic-bezier(0.34,1.56,0.64,1)',
                            transitionDelay: `${i * 0.1}s`,
                            minHeight: '4px',
                            cursor: rev > 0 ? 'pointer' : 'default',
                            boxShadow: rev > 0 ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
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
            </div>
          )}

          {/* Quick Actions */}
          <div className="table-container animate-fade-up" style={{ padding: '2rem' }}>
            <div className="table-header">
              <h2>⚡ Quick Actions</h2>
            </div>
            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              {quickActions.map(action => (
                <Link
                  key={action.to}
                  to={action.to}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
                    padding: '1.5rem 1rem',
                    background: `${action.color}10`,
                    border: `1.5px solid ${action.color}25`,
                    borderRadius: 'var(--radius-lg)',
                    textDecoration: 'none', color: action.color,
                    fontWeight: 800, fontSize: '0.88rem',
                    transition: 'var(--transition)',
                    position: 'relative', overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${action.color}20`;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 8px 20px ${action.color}30`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = `${action.color}10`;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{ fontSize: '1.8rem' }}>{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Trainer Presence Panel */}
          <div className="table-container animate-fade-up" style={{ marginBottom: '1.5rem' }}>
            <div className="table-header">
              <h2>🏋️ Trainer Presence Monitor</h2>
              <span className="badge badge-active">Real-time</span>
            </div>
            {trainers.length === 0 ? (
              <div className="empty-state"><span className="empty-icon">🏋️</span><p>No trainers registered yet.</p></div>
            ) : (
              <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {trainers.map(t => {
                  const isPresent = localStorage.getItem(`trainer_present_${t.id}`) === 'true';
                  return (
                    <div key={t.id} style={{
                      padding: '1.25rem', borderRadius: 'var(--radius-lg)',
                      background: isPresent ? 'rgba(16,185,129,0.06)' : '#f9fafb',
                      border: `1.5px solid ${isPresent ? 'rgba(16,185,129,0.25)' : '#e5e7eb'}`,
                      display: 'flex', alignItems: 'center', gap: '0.85rem',
                      transition: 'var(--transition)',
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                        background: isPresent ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'linear-gradient(135deg, #9ca3af, #6b7280)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 800, fontSize: '0.9rem',
                        boxShadow: isPresent ? '0 4px 12px rgba(16,185,129,0.35)' : 'none',
                      }}>
                        {t.firstName?.charAt(0)}{t.lastName?.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--dark-bg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.firstName} {t.lastName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: isPresent ? '#22c55e' : '#9ca3af', animation: isPresent ? 'glowPulse 2s ease-in-out infinite' : 'none' }} />
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isPresent ? '#16a34a' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {isPresent ? 'On Floor' : 'Away'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Today's Attendance Summary */}
          <div className="table-container animate-fade-up" style={{ marginBottom: '1.5rem' }}>
            <div className="table-header">
              <h2>📅 Today's Attendance</h2>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {todayAttendance.filter(a => a.status === 'CHECKED_IN').length} active / {todayAttendance.length} total
                </span>
                <Link to="/admin/attendance" className="btn btn-secondary btn-sm">Full View →</Link>
              </div>
            </div>
            {todayAttendance.length === 0 ? (
              <div className="empty-state"><span className="empty-icon">📅</span><p>No check-ins today yet.</p></div>
            ) : (
              <table>
                <thead><tr><th>Member</th><th>Check In</th><th>Check Out</th><th>Status</th></tr></thead>
                <tbody>
                  {todayAttendance.slice(0, 8).map(a => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                            {a.userName?.charAt(0)}
                          </div>
                          <strong>{a.userName}</strong>
                        </div>
                      </td>
                      <td>{a.checkIn ? new Date(a.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td>
                        <span className={`badge ${a.status === 'CHECKED_IN' ? 'badge-active' : 'badge-completed'}`}>
                          {a.status === 'CHECKED_IN' ? '🟢 On Floor' : '✅ Done'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>


        </>
      )}
    </Layout>
  );
}

export default AdminDashboard;
