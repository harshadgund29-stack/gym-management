import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { getMembershipsByMember } from '../../api/membershipApi';
import { getSessionsByMember } from '../../api/sessionApi';
import { getPaymentsByMember } from '../../api/paymentApi';
import { getPlansByMember } from '../../api/workoutApi';

function MemberDashboard() {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [sessions, setSessions]       = useState([]);
  const [payments, setPayments]       = useState([]);
  const [workouts, setWorkouts]       = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!user?.userId) return;
    Promise.all([
      getMembershipsByMember(user.userId),
      getSessionsByMember(user.userId),
      getPaymentsByMember(user.userId),
      getPlansByMember(user.userId),
    ])
      .then(([memRes, sessRes, payRes, workRes]) => {
        setMemberships(memRes.data);
        setSessions(sessRes.data);
        setPayments(payRes.data);
        setWorkouts(workRes.data);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const activeMembership  = memberships.find(m => m.status === 'ACTIVE');
  const upcomingSessions  = sessions.filter(s => s.status === 'SCHEDULED');
  const completedSessions = sessions.filter(s => s.status === 'COMPLETED');
  const totalPaid = payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  // Days until membership expires
  const daysLeft = activeMembership
    ? Math.max(0, Math.ceil((new Date(activeMembership.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  const expiryColor = daysLeft === null ? '#a0aec0'
    : daysLeft <= 7  ? '#e94560'
    : daysLeft <= 14 ? '#ed8936'
    : '#48bb78';

  return (
    <Layout title={`Welcome back, ${user?.firstName}! 🏅`}>
      {loading ? (
        <div className="loading">Loading your dashboard...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="stats-grid">
            <div className="stat-card" style={{ borderLeftColor: '#9f7aea' }}>
              <span className="stat-icon">🏅</span>
              <span className="stat-value" style={{ color: '#9f7aea', fontSize: '1.3rem' }}>
                {activeMembership ? activeMembership.planName : 'No Plan'}
              </span>
              <span className="stat-label">Current Plan</span>
            </div>

            <div className="stat-card" style={{ borderLeftColor: expiryColor }}>
              <span className="stat-icon">{daysLeft === null ? '❌' : daysLeft <= 7 ? '⚠️' : '📅'}</span>
              <span className="stat-value" style={{ color: expiryColor, fontSize: daysLeft !== null ? '2rem' : '1.1rem' }}>
                {daysLeft !== null ? `${daysLeft}d` : 'Inactive'}
              </span>
              <span className="stat-label">
                {daysLeft !== null
                  ? daysLeft <= 7 ? 'Days Left — Renew Soon!' : 'Days Until Expiry'
                  : 'No Active Membership'}
              </span>
            </div>

            <div className="stat-card" style={{ borderLeftColor: '#4299e1' }}>
              <span className="stat-icon">🗓️</span>
              <span className="stat-value" style={{ color: '#4299e1' }}>{upcomingSessions.length}</span>
              <span className="stat-label">Upcoming Sessions</span>
            </div>

            <div className="stat-card" style={{ borderLeftColor: '#48bb78' }}>
              <span className="stat-icon">✅</span>
              <span className="stat-value" style={{ color: '#48bb78' }}>{completedSessions.length}</span>
              <span className="stat-label">Sessions Completed</span>
            </div>

            <div className="stat-card" style={{ borderLeftColor: '#ed8936' }}>
              <span className="stat-icon">📋</span>
              <span className="stat-value" style={{ color: '#ed8936' }}>{workouts.length}</span>
              <span className="stat-label">Workout Plans</span>
            </div>

            <div className="stat-card" style={{ borderLeftColor: '#e94560' }}>
              <span className="stat-icon">💰</span>
              <span className="stat-value" style={{ color: '#e94560', fontSize: '1.4rem' }}>
                ₹{totalPaid.toLocaleString('en-IN')}
              </span>
              <span className="stat-label">Total Paid</span>
            </div>
          </div>

          {/* Membership Banner */}
          {activeMembership && (
            <div style={{
              background: `linear-gradient(135deg, ${expiryColor}15, ${expiryColor}08)`,
              border: `1px solid ${expiryColor}40`,
              borderRadius: '12px', padding: '1.25rem 1.5rem',
              marginBottom: '1.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
            }}>
              <div>
                <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '1rem' }}>
                  🏋️ {activeMembership.planName} Membership
                </div>
                <div style={{ color: '#718096', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  Valid: {new Date(activeMembership.startDate).toLocaleDateString('en-IN')} → {new Date(activeMembership.endDate).toLocaleDateString('en-IN')}
                </div>
              </div>
              <span className={`badge badge-${activeMembership.status.toLowerCase()}`}>
                {activeMembership.status}
              </span>
            </div>
          )}

          {/* Upcoming Sessions */}
          <div className="table-container" style={{ marginBottom: '1.5rem' }}>
            <div className="table-header">
              <h2>📅 Upcoming Sessions</h2>
            </div>
            {upcomingSessions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🗓️</div>
                <p>No upcoming sessions scheduled.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr><th>Session</th><th>Trainer</th><th>Date & Time</th><th>Duration</th></tr>
                </thead>
                <tbody>
                  {upcomingSessions.slice(0, 5).map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.title}</strong></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #4299e1, #2b6cb0)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '0.7rem', fontWeight: 700,
                          }}>
                            {s.trainerName?.charAt(0)}
                          </div>
                          {s.trainerName}
                        </div>
                      </td>
                      <td>{new Date(s.sessionDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td>{s.durationMinutes ? `${s.durationMinutes} min` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Workout Plans Preview */}
          {workouts.length > 0 && (
            <div className="table-container" style={{ marginBottom: '1.5rem' }}>
              <div className="table-header">
                <h2>📋 My Workout Plans</h2>
                <a href="/member/workouts" className="btn btn-secondary btn-sm">View All →</a>
              </div>
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {workouts.slice(0, 3).map(w => (
                  <div key={w.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.875rem 1rem', background: '#f7fafc', borderRadius: '8px',
                    border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.5rem',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.9rem' }}>{w.title}</div>
                      <div style={{ color: '#718096', fontSize: '0.8rem' }}>by {w.trainerName}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#718096' }}>
                      {w.goal && <span>🎯 {w.goal}</span>}
                      {w.weekDuration && <span>⏱️ {w.weekDuration} weeks</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Payments */}
          {payments.length > 0 && (
            <div className="table-container">
              <div className="table-header">
                <h2>💳 Recent Payments</h2>
                <a href="/member/payments" className="btn btn-secondary btn-sm">View All →</a>
              </div>
              <table>
                <thead>
                  <tr><th>Plan</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {payments.slice(0, 4).map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.planName}</strong></td>
                      <td><strong style={{ color: '#48bb78' }}>₹{Number(p.amount).toLocaleString('en-IN')}</strong></td>
                      <td>{p.paymentMethod || '—'}</td>
                      <td><span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span></td>
                      <td>{new Date(p.paymentDate).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}

export default MemberDashboard;
