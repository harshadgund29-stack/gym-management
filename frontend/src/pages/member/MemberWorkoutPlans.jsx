import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { getPlansByMember } from '../../api/workoutApi';

const GOAL_ICONS = { 'weight loss': '🔥', 'muscle gain': '💪', 'cardio': '🏃', 'strength': '🏋️', 'flexibility': '🧘', 'endurance': '⚡' };
const getGoalIcon = (goal) => {
  if (!goal) return '🎯';
  const lower = goal.toLowerCase();
  for (const [key, icon] of Object.entries(GOAL_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '🎯';
};

function MemberWorkoutPlans() {
  const { user } = useAuth();
  const [plans, setPlans]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [selected, setSelected] = useState(null);
  const [progress, setProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('workout_progress') || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    if (!user?.userId) return;
    getPlansByMember(user.userId)
      .then(res => setPlans(res.data))
      .catch(() => setError('Failed to load workout plans.'))
      .finally(() => setLoading(false));
  }, [user]);

  const setWeekProgress = (planId, week, done) => {
    const key = `${planId}_w${week}`;
    const next = { ...progress, [key]: done };
    setProgress(next);
    localStorage.setItem('workout_progress', JSON.stringify(next));
  };

  const getPlanProgress = (plan) => {
    if (!plan.weekDuration) return 0;
    let done = 0;
    for (let w = 1; w <= plan.weekDuration; w++) {
      if (progress[`${plan.id}_w${w}`]) done++;
    }
    return Math.round((done / plan.weekDuration) * 100);
  };

  const totalWeeks = plans.reduce((s, p) => s + (p.weekDuration || 0), 0);
  const completedWeeks = plans.reduce((s, p) => {
    if (!p.weekDuration) return s;
    let done = 0;
    for (let w = 1; w <= p.weekDuration; w++) { if (progress[`${p.id}_w${w}`]) done++; }
    return s + done;
  }, 0);

  return (
    <Layout title="My Workout Plans 🏋️">
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {!loading && plans.length > 0 && (
        <>
          {/* Stats */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', marginBottom: '1.5rem' }}>
            {[
              { icon: '📋', label: 'Workout Plans',  value: plans.length,                                  color: '#e94560' },
              { icon: '🎯', label: 'With Goals',     value: plans.filter(p => p.goal).length,              color: '#48bb78' },
              { icon: '⏱️', label: 'Total Weeks',    value: totalWeeks,                                    color: '#4299e1' },
              { icon: '✅', label: 'Weeks Done',     value: completedWeeks,                                color: '#9f7aea' },
            ].map((c, i) => (
              <div key={c.label} className={`stat-card animate-fade-up delay-${i+1}`}>
                <span className="stat-icon">{c.icon}</span>
                <span className="stat-value" style={{ color: c.color }}>{c.value}</span>
                <span className="stat-label">{c.label}</span>
              </div>
            ))}
          </div>

          {/* Overall Progress */}
          {totalWeeks > 0 && (
            <div className="table-container animate-fade-up" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--dark-bg)' }}>📊 Overall Training Progress</h3>
                <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.1rem' }}>
                  {Math.round((completedWeeks / totalWeeks) * 100)}%
                </span>
              </div>
              <div style={{ height: 14, background: '#e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.round((completedWeeks / totalWeeks) * 100)}%`,
                  background: 'linear-gradient(90deg, var(--primary), var(--lime))',
                  borderRadius: 10, transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)',
                  boxShadow: '0 2px 8px rgba(16,185,129,0.4)',
                }} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>
                {completedWeeks} of {totalWeeks} weeks completed — keep pushing! 💪
              </p>
            </div>
          )}
        </>
      )}

      {loading ? (
        <div className="loading"><div className="loading-spinner" />Loading workout plans...</div>
      ) : plans.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🏋️</span>
          <h3>No workout plans yet</h3>
          <p>Your trainer will assign a personalised plan for you soon!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {plans.map((plan, idx) => {
            const pct = getPlanProgress(plan);
            const goalIcon = getGoalIcon(plan.goal);
            const isOpen = selected?.id === plan.id;
            return (
              <div key={plan.id} className="table-container animate-fade-up" style={{
                padding: '1.75rem', cursor: 'pointer',
                animationDelay: `${idx * 0.08}s`,
                border: isOpen ? '1.5px solid rgba(16,185,129,0.35)' : '1px solid rgba(255,255,255,0.65)',
                transition: 'var(--transition)',
              }}
                onClick={() => setSelected(isOpen ? null : plan)}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--dark-bg)', marginBottom: '0.25rem' }}>{plan.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>by {plan.trainerName}</p>
                  </div>
                  <span style={{ fontSize: '2rem', animation: 'float 5s ease-in-out infinite' }}>{goalIcon}</span>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {plan.goal && (
                    <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-dark)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(16,185,129,0.2)' }}>
                      🎯 {plan.goal}
                    </span>
                  )}
                  {plan.weekDuration && (
                    <span style={{ background: 'rgba(66,153,225,0.1)', color: '#2b6cb0', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(66,153,225,0.2)' }}>
                      ⏱️ {plan.weekDuration} weeks
                    </span>
                  )}
                  <span style={{ background: '#f9fafb', color: '#9ca3af', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.72rem', border: '1px solid #e5e7eb' }}>
                    📅 {new Date(plan.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </span>
                </div>

                {/* Progress bar */}
                {plan.weekDuration > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Progress</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: pct === 100 ? '#16a34a' : 'var(--primary)' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 8, background: '#e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: pct === 100 ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 'linear-gradient(90deg, var(--primary), var(--lime))',
                        borderRadius: 8, transition: 'width 0.8s ease',
                      }} />
                    </div>
                  </div>
                )}

                {/* Expand hint */}
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.5rem' }}>
                  {isOpen ? '▲ Click to collapse' : '▼ Click to view exercises & track progress'}
                </p>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{ marginTop: '1.25rem', animation: 'fadeInUp 0.3s ease' }} onClick={e => e.stopPropagation()}>
                    {plan.description && (
                      <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.04)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid rgba(16,185,129,0.1)' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.65 }}>{plan.description}</p>
                      </div>
                    )}

                    {plan.exercises && (
                      <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid #e5e7eb' }}>
                        <p style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.6rem', color: 'var(--dark-bg)' }}>📅 Exercise Schedule</p>
                        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.82rem', color: '#374151', fontFamily: 'inherit', lineHeight: 1.75 }}>
                          {plan.exercises}
                        </pre>
                      </div>
                    )}

                    {/* Week tracker */}
                    {plan.weekDuration > 0 && (
                      <div>
                        <p style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--dark-bg)' }}>✅ Week Tracker</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {Array.from({ length: plan.weekDuration }, (_, i) => i + 1).map(w => {
                            const done = !!progress[`${plan.id}_w${w}`];
                            return (
                              <button key={w} onClick={() => setWeekProgress(plan.id, w, !done)} style={{
                                width: 44, height: 44, borderRadius: 'var(--radius-sm)',
                                background: done ? 'linear-gradient(135deg, var(--primary), var(--accent))' : '#f0f2f5',
                                border: done ? 'none' : '1.5px solid #e5e7eb',
                                color: done ? 'white' : '#9ca3af',
                                fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer',
                                transition: 'var(--transition)',
                                boxShadow: done ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
                                fontFamily: 'inherit',
                              }}>
                                {done ? '✓' : `W${w}`}
                              </button>
                            );
                          })}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Click a week to mark it complete</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}

export default MemberWorkoutPlans;
