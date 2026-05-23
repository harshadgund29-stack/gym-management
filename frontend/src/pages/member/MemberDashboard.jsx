import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { getMembershipsByMember } from '../../api/membershipApi';
import { getSessionsByMember } from '../../api/sessionApi';
import { getPaymentsByMember } from '../../api/paymentApi';
import { getPlansByMember } from '../../api/workoutApi';
import axios from '../../api/axios';

const MOTTOS = [
  '"Train insane or remain the same." 🔥',
  '"No excuses, just results." 💪',
  '"Sweat is fat crying. Keep going!" 💦',
  '"The only bad workout is the one that didn\'t happen." 🏋️',
  '"Your body can stand almost anything. It\'s your mind you must convince." 🧠',
  '"Champions are made when nobody is watching." 🥇',
];

const BADGES = [
  { id: 'first_checkin',  icon: '🏅', label: 'First Step',    desc: 'Completed your first check-in',   threshold: 1,  type: 'visits' },
  { id: 'week_warrior',   icon: '🔥', label: 'Week Warrior',  desc: '7+ gym visits',                   threshold: 7,  type: 'visits' },
  { id: 'month_master',   icon: '💪', label: 'Month Master',  desc: '30+ gym visits',                  threshold: 30, type: 'visits' },
  { id: 'session_star',   icon: '⭐', label: 'Session Star',  desc: 'Completed 5+ training sessions',  threshold: 5,  type: 'sessions' },
  { id: 'plan_holder',    icon: '📋', label: 'Plan Holder',   desc: 'Has an active workout plan',      threshold: 1,  type: 'plans' },
  { id: 'loyal_member',   icon: '👑', label: 'Loyal Member',  desc: '100+ loyalty points earned',      threshold: 100, type: 'points' },
];

function MemberDashboard() {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [sessions, setSessions]       = useState([]);
  const [payments, setPayments]       = useState([]);
  const [workouts, setWorkouts]       = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({ totalVisits: 0, loyaltyPoints: 0, isCheckedIn: false });
  const [loading, setLoading]         = useState(true);
  const [motto]                       = useState(() => MOTTOS[Math.floor(Math.random() * MOTTOS.length)]);

  useEffect(() => {
    if (!user?.userId) return;
    Promise.all([
      getMembershipsByMember(user.userId),
      getSessionsByMember(user.userId),
      getPaymentsByMember(user.userId),
      getPlansByMember(user.userId),
      axios.get(`/attendance/stats/member/${user.userId}`).catch(() => ({ data: { totalVisits: 0, loyaltyPoints: 0, isCheckedIn: false } })),
    ]).then(([memRes, sessRes, payRes, workRes, attRes]) => {
      setMemberships(memRes.data);
      setSessions(sessRes.data);
      setPayments(payRes.data);
      setWorkouts(workRes.data);
      setAttendanceStats(attRes.data);
    }).finally(() => setLoading(false));
  }, [user]);

  const activeMembership  = memberships.find(m => m.status === 'ACTIVE');
  const upcomingSessions  = sessions.filter(s => s.status === 'SCHEDULED');
  const completedSessions = sessions.filter(s => s.status === 'COMPLETED');
  const totalPaid = payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0);
  const daysLeft = activeMembership
    ? Math.max(0, Math.ceil((new Date(activeMembership.endDate) - new Date()) / 86400000))
    : null;
  const expiryColor = daysLeft === null ? '#a0aec0' : daysLeft <= 7 ? '#e94560' : daysLeft <= 14 ? '#ed8936' : '#48bb78';

  // Compute earned badges
  const earnedBadges = BADGES.filter(b => {
    if (b.type === 'visits')   return attendanceStats.totalVisits >= b.threshold;
    if (b.type === 'sessions') return completedSessions.length >= b.threshold;
    if (b.type === 'plans')    return workouts.length >= b.threshold;
    if (b.type === 'points')   return attendanceStats.loyaltyPoints >= b.threshold;
    return false;
  });

  // Streak (simplified: consecutive days with check-ins — approximated from totalVisits)
  const streakDays = Math.min(attendanceStats.totalVisits, 7);

  return (
    <Layout title={`Welcome back, ${user?.firstName}! 🏅`}>
      {loading ? (
        <div className="loading"><div className="loading-spinner" />Loading your dashboard...</div>
      ) : (
        <>
          {/* Motivational Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #071510 0%, #0d2b1f 60%, #0a4a30 100%)',
            borderRadius: 'var(--radius-xl)', padding: '1.5rem 2rem',
            marginBottom: '2rem', position: 'relative', overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(7,21,16,0.25)', animation: 'fadeInUp 0.5s ease',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 50%, rgba(16,185,129,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem', position: 'relative' }}>Daily Motivation</p>
            <p style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, fontStyle: 'italic', position: 'relative' }}>{motto}</p>
          </div>

          {/* KPI Cards */}
          <div className="stats-grid">
            {[
              { icon: '🏅', label: 'Current Plan',       value: activeMembership?.planName || 'No Plan', color: '#9f7aea', delay: 1, small: true },
              { icon: daysLeft === null ? '❌' : daysLeft <= 7 ? '⚠️' : '📅', label: daysLeft !== null ? (daysLeft <= 7 ? 'Days Left — Renew!' : 'Days Until Expiry') : 'No Active Membership', value: daysLeft !== null ? `${daysLeft}d` : 'Inactive', color: expiryColor, delay: 2 },
              { icon: '🗓️', label: 'Upcoming Sessions',  value: upcomingSessions.length,   color: '#4299e1', delay: 3 },
              { icon: '✅', label: 'Sessions Completed', value: completedSessions.length,  color: '#48bb78', delay: 4 },
              { icon: '📋', label: 'Workout Plans',      value: workouts.length,           color: '#ed8936', delay: 5 },
              { icon: '💰', label: 'Total Paid',         value: `₹${totalPaid.toLocaleString('en-IN')}`, color: '#e94560', delay: 6, small: true },
              { icon: '🏃', label: 'Gym Visits',         value: attendanceStats.totalVisits, color: '#38b2ac', delay: 7 },
              { icon: '⭐', label: 'Loyalty Points',     value: attendanceStats.loyaltyPoints, color: '#f6ad55', delay: 8 },
            ].map(c => (
              <div key={c.label} className={`stat-card animate-fade-up delay-${Math.min(c.delay, 8)}`}>
                <span className="stat-icon">{c.icon}</span>
                <span className="stat-value" style={{ color: c.color, fontSize: c.small ? '1.3rem' : '2.2rem' }}>{c.value}</span>
                <span className="stat-label">{c.label}</span>
              </div>
            ))}
          </div>

          {/* Streak + Loyalty Progress */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Streak */}
            <div className="table-container animate-fade-up" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1rem', color: 'var(--dark-bg)' }}>🔥 Weekly Streak</h3>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {[1,2,3,4,5,6,7].map(d => (
                  <div key={d} style={{
                    flex: 1, height: 36, borderRadius: 8,
                    background: d <= streakDays ? 'linear-gradient(135deg, var(--primary), var(--lime))' : '#f0f2f5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 800,
                    color: d <= streakDays ? 'white' : '#cbd5e0',
                    boxShadow: d <= streakDays ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
                    transition: 'var(--transition)',
                  }}>
                    {d <= streakDays ? '🔥' : d}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {streakDays > 0 ? `${streakDays} day streak — keep it up!` : 'Start your streak today!'}
              </p>
            </div>

            {/* Loyalty Progress */}
            <div className="table-container animate-fade-up" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1rem', color: 'var(--dark-bg)' }}>⭐ Loyalty Progress</h3>
              {[
                { label: 'Bronze', threshold: 50,  color: '#cd7f32' },
                { label: 'Silver', threshold: 200, color: '#9ca3af' },
                { label: 'Gold',   threshold: 500, color: '#f59e0b' },
              ].map(tier => {
                const pct = Math.min(100, Math.round((attendanceStats.loyaltyPoints / tier.threshold) * 100));
                return (
                  <div key={tier.label} style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: tier.color }}>{tier.label}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{attendanceStats.loyaltyPoints}/{tier.threshold} pts</span>
                    </div>
                    <div style={{ height: 8, background: '#e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: tier.color, borderRadius: 8, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badges */}
          {earnedBadges.length > 0 && (
            <div className="table-container animate-fade-up" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--dark-bg)' }}>🏆 Your Achievements</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {earnedBadges.map(b => (
                  <div key={b.id} data-tooltip={b.desc} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                    padding: '1rem 1.25rem',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(132,204,22,0.06))',
                    border: '1.5px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-lg)',
                    minWidth: 90, animation: 'bounceIn 0.6s ease',
                    cursor: 'help',
                  }}>
                    <span style={{ fontSize: '2rem', animation: 'float 4s ease-in-out infinite' }}>{b.icon}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-dark)', textAlign: 'center' }}>{b.label}</span>
                  </div>
                ))}
                {BADGES.filter(b => !earnedBadges.includes(b)).slice(0, 3).map(b => (
                  <div key={b.id} data-tooltip={`Locked: ${b.desc}`} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                    padding: '1rem 1.25rem',
                    background: '#f9fafb', border: '1.5px dashed #e5e7eb',
                    borderRadius: 'var(--radius-lg)', minWidth: 90, opacity: 0.5, cursor: 'help',
                  }}>
                    <span style={{ fontSize: '2rem', filter: 'grayscale(1)' }}>{b.icon}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textAlign: 'center' }}>🔒 {b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Membership Banner */}
          {activeMembership && (
            <div style={{
              background: `linear-gradient(135deg, ${expiryColor}12, ${expiryColor}06)`,
              border: `1.5px solid ${expiryColor}35`, borderRadius: 'var(--radius-lg)',
              padding: '1.25rem 1.5rem', marginBottom: '1.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
              animation: 'fadeInUp 0.5s ease',
            }}>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--dark-bg)', fontSize: '1rem' }}>🏋️ {activeMembership.planName} Membership</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  Valid: {new Date(activeMembership.startDate).toLocaleDateString('en-IN')} → {new Date(activeMembership.endDate).toLocaleDateString('en-IN')}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className={`badge badge-${activeMembership.status.toLowerCase()}`}>{activeMembership.status}</span>
                {daysLeft !== null && daysLeft <= 14 && (
                  <Link to="/member/plans" className="btn btn-primary btn-sm">🔄 Renew Now</Link>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Sessions */}
          <div className="table-container animate-fade-up" style={{ marginBottom: '1.5rem' }}>
            <div className="table-header">
              <h2>📅 Upcoming Sessions</h2>
            </div>
            {upcomingSessions.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🗓️</span>
                <h3>No upcoming sessions</h3>
                <p>Your trainer will schedule sessions for you.</p>
              </div>
            ) : (
              <table>
                <thead><tr><th>Session</th><th>Trainer</th><th>Date & Time</th><th>Duration</th></tr></thead>
                <tbody>
                  {upcomingSessions.slice(0, 5).map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.title}</strong></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #4299e1, #2b6cb0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
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

          {/* Workout Plans */}
          {workouts.length > 0 && (
            <div className="table-container animate-fade-up" style={{ marginBottom: '1.5rem' }}>
              <div className="table-header">
                <h2>📋 My Workout Plans</h2>
                <Link to="/member/workouts" className="btn btn-secondary btn-sm">View All →</Link>
              </div>
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {workouts.slice(0, 3).map(w => (
                  <div key={w.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1rem 1.25rem', background: 'rgba(16,185,129,0.04)',
                    borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.1)',
                    flexWrap: 'wrap', gap: '0.5rem', transition: 'var(--transition)',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.04)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--dark-bg)', fontSize: '0.9rem' }}>{w.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>by {w.trainerName}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
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
            <div className="table-container animate-fade-up">
              <div className="table-header">
                <h2>💳 Recent Payments</h2>
                <Link to="/member/payments" className="btn btn-secondary btn-sm">View All →</Link>
              </div>
              <table>
                <thead><tr><th>Plan</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
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
