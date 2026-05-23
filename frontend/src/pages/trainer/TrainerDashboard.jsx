import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { getSessionsByTrainer } from '../../api/sessionApi';
import { getPlansByTrainer } from '../../api/workoutApi';

const MOTTOS = [
  '"Train insane or remain the same." 🔥',
  '"No excuses, just results." 💪',
  '"Your athletes are only as good as you push them." 🏆',
  '"Champions are made in the gym." 🥇',
  '"Discipline is the bridge between goals and accomplishment." ⚡',
];

function TrainerDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [motto]                 = useState(() => MOTTOS[Math.floor(Math.random() * MOTTOS.length)]);
  const [isPresent, setIsPresent] = useState(() => {
    return localStorage.getItem(`trainer_present_${user?.userId}`) === 'true';
  });

  useEffect(() => {
    if (!user?.userId) return;
    Promise.all([getSessionsByTrainer(user.userId), getPlansByTrainer(user.userId)])
      .then(([sessRes, workRes]) => { setSessions(sessRes.data); setWorkouts(workRes.data); })
      .finally(() => setLoading(false));
  }, [user]);

  const togglePresence = () => {
    const next = !isPresent;
    setIsPresent(next);
    localStorage.setItem(`trainer_present_${user?.userId}`, String(next));
  };

  const upcoming  = sessions.filter(s => s.status === 'SCHEDULED');
  const completed = sessions.filter(s => s.status === 'COMPLETED');
  const cancelled = sessions.filter(s => s.status === 'CANCELLED');
  const uniqueMembers = [...new Set(sessions.map(s => s.memberId))].length;
  const plansAssigned = workouts.length;
  const membersWithPlans = [...new Set(workouts.map(w => w.memberId))].length;
  const completionRate = sessions.length > 0 ? Math.round((completed.length / sessions.length) * 100) : 0;

  const Avatar = ({ name, color = '#4299e1' }) => (
    <div style={{
      width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${color}, ${color}bb)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontSize: '0.7rem', fontWeight: 800,
      boxShadow: `0 2px 8px ${color}40`,
    }}>
      {name?.charAt(0)}
    </div>
  );

  const statusBadge = (s) => {
    const map = { SCHEDULED: 'badge-scheduled', COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled' };
    return <span className={`badge ${map[s] || ''}`}>{s}</span>;
  };

  return (
    <Layout title={`Welcome, ${user?.firstName}! 🏋️`}>
      {loading ? (
        <div className="loading"><div className="loading-spinner" />Loading your dashboard...</div>
      ) : (
        <>
          {/* Motivational Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #071510 0%, #0d2b1f 60%, #0a4a30 100%)',
            borderRadius: 'var(--radius-xl)', padding: '1.75rem 2rem',
            marginBottom: '2rem', position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '1rem',
            boxShadow: '0 8px 32px rgba(7,21,16,0.3)',
            animation: 'fadeInUp 0.5s ease',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 50%, rgba(16,185,129,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>Today's Motto</p>
              <p style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700, fontStyle: 'italic' }}>{motto}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Gym Presence</p>
                <p style={{ color: isPresent ? '#6ee7b7' : '#fca5a5', fontWeight: 800, fontSize: '0.9rem' }}>
                  {isPresent ? '🟢 ACTIVE ON FLOOR' : '🔴 NOT ON FLOOR'}
                </p>
              </div>
              <button onClick={togglePresence} style={{
                background: isPresent ? 'rgba(239,68,68,0.15)' : 'linear-gradient(135deg, var(--primary), var(--accent))',
                border: isPresent ? '1.5px solid rgba(239,68,68,0.4)' : 'none',
                color: isPresent ? '#fca5a5' : 'white',
                padding: '0.6rem 1.4rem', borderRadius: '30px',
                fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                transition: 'var(--transition)', fontFamily: 'inherit',
                boxShadow: isPresent ? 'none' : '0 4px 14px rgba(16,185,129,0.4)',
              }}>
                {isPresent ? '🚪 Clock Out' : '💪 Clock In'}
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="stats-grid">
            {[
              { icon: '🗓️', label: 'Upcoming Sessions', value: upcoming.length,   color: '#9f7aea', delay: 1 },
              { icon: '✅', label: 'Completed',          value: completed.length,  color: '#48bb78', delay: 2 },
              { icon: '❌', label: 'Cancelled',          value: cancelled.length,  color: '#a0aec0', delay: 3 },
              { icon: '👥', label: 'Members Trained',    value: uniqueMembers,     color: '#4299e1', delay: 4 },
              { icon: '📊', label: 'Completion Rate',    value: `${completionRate}%`, color: '#f6ad55', delay: 5 },
            ].map(c => (
              <div key={c.label} className={`stat-card animate-fade-up delay-${c.delay}`}>
                <span className="stat-icon">{c.icon}</span>
                <span className="stat-value" style={{ color: c.color, fontSize: typeof c.value === 'string' ? '1.8rem' : '2.2rem' }}>{c.value}</span>
                <span className="stat-label">{c.label}</span>
              </div>
            ))}

            {/* Plans Assigned — highlighted summary for this trainer */}
            <Link
              to="/trainer/workouts"
              className={`stat-card animate-fade-up delay-6`}
              style={{
                textDecoration: 'none',
                border: '2px solid rgba(233,69,96,0.35)',
                background: 'linear-gradient(145deg, rgba(233,69,96,0.06) 0%, rgba(233,69,96,0.02) 100%)',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(233,69,96,0.18)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span className="stat-icon">📋</span>
              <span className="stat-value" style={{ color: '#e94560', fontSize: '2.4rem' }}>{plansAssigned}</span>
              <span className="stat-label">Plans Assigned</span>
              <span style={{
                display: 'block',
                marginTop: '0.35rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#e94560',
                opacity: 0.85,
              }}>
                {membersWithPlans} member{membersWithPlans !== 1 ? 's' : ''} · Manage →
              </span>
            </Link>
          </div>

          {/* Completion Progress Bar */}
          {sessions.length > 0 && (
            <div className="table-container animate-fade-up" style={{ padding: '1.75rem 2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 800, color: 'var(--dark-bg)', fontSize: '1rem' }}>📊 Session Completion Rate</h3>
                <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.1rem' }}>{completionRate}%</span>
              </div>
              <div style={{ height: 12, background: '#e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${completionRate}%`,
                  background: 'linear-gradient(90deg, var(--primary), var(--lime))',
                  borderRadius: 8, transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)',
                  boxShadow: '0 2px 8px rgba(16,185,129,0.4)',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <span>{completed.length} completed</span>
                <span>{sessions.length} total</span>
              </div>
            </div>
          )}

          {/* Upcoming Sessions */}
          <div className="table-container animate-fade-up" style={{ marginBottom: '1.5rem' }}>
            <div className="table-header">
              <h2>📅 Upcoming Sessions ({upcoming.length})</h2>
              <Link to="/trainer/sessions" className="btn btn-secondary btn-sm">View All →</Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🗓️</span>
                <h3>No upcoming sessions</h3>
                <p><Link to="/trainer/sessions" style={{ color: 'var(--accent)', fontWeight: 700 }}>Schedule one →</Link></p>
              </div>
            ) : (
              <table>
                <thead><tr><th>Title</th><th>Member</th><th>Date & Time</th><th>Duration</th><th>Status</th></tr></thead>
                <tbody>
                  {upcoming.slice(0, 5).map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.title}</strong></td>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Avatar name={s.memberName} color="#48bb78" />{s.memberName}</div></td>
                      <td>{new Date(s.sessionDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td>{s.durationMinutes ? `${s.durationMinutes} min` : '—'}</td>
                      <td>{statusBadge(s.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Workout Plans Summary */}
          <div className="table-container animate-fade-up">
            <div className="table-header">
              <h2>📋 Plans Assigned ({plansAssigned})</h2>
              <Link to="/trainer/workouts" className="btn btn-secondary btn-sm">Manage Plans →</Link>
            </div>
            {workouts.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📋</span>
                <h3>No workout plans yet</h3>
                <p><Link to="/trainer/workouts" style={{ color: 'var(--accent)', fontWeight: 700 }}>Create one →</Link></p>
              </div>
            ) : (
              <div style={{ padding: '1rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {workouts.slice(0, 6).map(w => (
                  <div key={w.id} style={{
                    padding: '1.25rem', background: 'rgba(16,185,129,0.04)',
                    border: '1px solid rgba(16,185,129,0.12)', borderRadius: 'var(--radius-md)',
                    transition: 'var(--transition)',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                      <Avatar name={w.memberName} color="#48bb78" />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--dark-bg)' }}>{w.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>for {w.memberName}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {w.goal && <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700 }}>🎯 {w.goal}</span>}
                      {w.weekDuration && <span style={{ fontSize: '0.75rem', color: '#4299e1', fontWeight: 700 }}>⏱️ {w.weekDuration}w</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}

export default TrainerDashboard;
