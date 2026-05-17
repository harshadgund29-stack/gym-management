import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { getSessionsByTrainer } from '../../api/sessionApi';
import { getPlansByTrainer } from '../../api/workoutApi';

function TrainerDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user?.userId) return;
    Promise.all([
      getSessionsByTrainer(user.userId),
      getPlansByTrainer(user.userId),
    ])
      .then(([sessRes, workRes]) => {
        setSessions(sessRes.data);
        setWorkouts(workRes.data);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const upcoming   = sessions.filter(s => s.status === 'SCHEDULED');
  const completed  = sessions.filter(s => s.status === 'COMPLETED');
  const cancelled  = sessions.filter(s => s.status === 'CANCELLED');
  const uniqueMembers = [...new Set(sessions.map(s => s.memberId))].length;

  const statusBadge = (status) => {
    const map = { SCHEDULED: 'badge-scheduled', COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled' };
    return <span className={`badge ${map[status] || ''}`}>{status}</span>;
  };

  const Avatar = ({ name, color = '#4299e1' }) => (
    <div style={{
      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${color}, ${color}cc)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontSize: '0.65rem', fontWeight: 700,
    }}>
      {name?.charAt(0)}
    </div>
  );

  return (
    <Layout title={`Welcome back, ${user?.firstName}! 👋`}>
      {loading ? (
        <div className="loading">Loading your dashboard...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="stats-grid">
            <div className="stat-card" style={{ borderLeftColor: '#9f7aea' }}>
              <span className="stat-icon">🗓️</span>
              <span className="stat-value" style={{ color: '#9f7aea' }}>{upcoming.length}</span>
              <span className="stat-label">Upcoming Sessions</span>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#48bb78' }}>
              <span className="stat-icon">✅</span>
              <span className="stat-value" style={{ color: '#48bb78' }}>{completed.length}</span>
              <span className="stat-label">Completed Sessions</span>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#a0aec0' }}>
              <span className="stat-icon">❌</span>
              <span className="stat-value" style={{ color: '#a0aec0' }}>{cancelled.length}</span>
              <span className="stat-label">Cancelled</span>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#e94560' }}>
              <span className="stat-icon">📋</span>
              <span className="stat-value" style={{ color: '#e94560' }}>{workouts.length}</span>
              <span className="stat-label">Workout Plans</span>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#4299e1' }}>
              <span className="stat-icon">👥</span>
              <span className="stat-value" style={{ color: '#4299e1' }}>{uniqueMembers}</span>
              <span className="stat-label">Members Trained</span>
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="table-container" style={{ marginBottom: '1.5rem' }}>
            <div className="table-header">
              <h2>📅 Upcoming Sessions ({upcoming.length})</h2>
              <a href="/trainer/sessions" className="btn btn-secondary btn-sm">View All →</a>
            </div>
            {upcoming.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🗓️</div>
                <p>No upcoming sessions. <a href="/trainer/sessions" style={{ color: '#e94560' }}>Schedule one →</a></p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr><th>Title</th><th>Member</th><th>Date & Time</th><th>Duration</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {upcoming.slice(0, 5).map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.title}</strong></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Avatar name={s.memberName} color="#48bb78" />
                          {s.memberName}
                        </div>
                      </td>
                      <td>{new Date(s.sessionDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td>{s.durationMinutes ? `${s.durationMinutes} min` : '—'}</td>
                      <td>{statusBadge(s.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Recent Completed Sessions with Notes */}
          {completed.length > 0 && (
            <div className="table-container" style={{ marginBottom: '1.5rem' }}>
              <div className="table-header">
                <h2>✅ Recent Completed Sessions</h2>
              </div>
              <table>
                <thead>
                  <tr><th>Title</th><th>Member</th><th>Date</th><th>Duration</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {completed.slice(0, 4).map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.title}</strong></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Avatar name={s.memberName} color="#48bb78" />
                          {s.memberName}
                        </div>
                      </td>
                      <td>{new Date(s.sessionDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                      <td>{s.durationMinutes ? `${s.durationMinutes} min` : '—'}</td>
                      <td style={{ maxWidth: 220, color: '#718096', fontSize: '0.85rem' }}>
                        {s.notes || <span style={{ color: '#cbd5e0' }}>No notes</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Workout Plans Summary */}
          <div className="table-container">
            <div className="table-header">
              <h2>📋 My Workout Plans ({workouts.length})</h2>
              <a href="/trainer/workouts" className="btn btn-secondary btn-sm">Manage Plans →</a>
            </div>
            {workouts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>No workout plans yet. <a href="/trainer/workouts" style={{ color: '#e94560' }}>Create one →</a></p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr><th>Plan Title</th><th>Member</th><th>Goal</th><th>Duration</th><th>Created</th></tr>
                </thead>
                <tbody>
                  {workouts.slice(0, 5).map(w => (
                    <tr key={w.id}>
                      <td><strong>{w.title}</strong></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Avatar name={w.memberName} color="#48bb78" />
                          {w.memberName}
                        </div>
                      </td>
                      <td style={{ color: '#718096', fontSize: '0.875rem' }}>{w.goal || '—'}</td>
                      <td>{w.weekDuration ? `${w.weekDuration} weeks` : '—'}</td>
                      <td>{new Date(w.createdAt).toLocaleDateString('en-IN')}</td>
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

export default TrainerDashboard;
