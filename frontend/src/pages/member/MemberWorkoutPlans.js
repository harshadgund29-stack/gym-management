import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { getPlansByMember } from '../../api/workoutApi';

function MemberWorkoutPlans() {
  const { user } = useAuth();
  const [plans, setPlans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!user?.userId) return;
    getPlansByMember(user.userId)
      .then(res => setPlans(res.data))
      .catch(() => setError('Failed to load workout plans.'))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <Layout title="My Workout Plans">
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && plans.length > 0 && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', marginBottom: '1.5rem' }}>
          <div className="stat-card" style={{ borderLeftColor: '#e94560' }}>
            <span className="stat-icon">📋</span>
            <span className="stat-value" style={{ color: '#e94560' }}>{plans.length}</span>
            <span className="stat-label">Workout Plans</span>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#48bb78' }}>
            <span className="stat-icon">🎯</span>
            <span className="stat-value" style={{ color: '#48bb78' }}>{plans.filter(p => p.goal).length}</span>
            <span className="stat-label">With Goals</span>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#4299e1' }}>
            <span className="stat-icon">⏱️</span>
            <span className="stat-value" style={{ color: '#4299e1' }}>
              {plans.reduce((sum, p) => sum + (p.weekDuration || 0), 0)}
            </span>
            <span className="stat-label">Total Weeks</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading workout plans...</div>
      ) : plans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏋️</div>
          <p>No workout plans assigned yet. Ask your trainer!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {plans.map(plan => (
            <div key={plan.id} className="table-container" style={{ padding: '1.5rem', cursor: 'pointer' }}
              onClick={() => setSelected(selected?.id === plan.id ? null : plan)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{plan.title}</h3>
                  <p style={{ color: '#718096', fontSize: '0.85rem' }}>by {plan.trainerName}</p>
                </div>
                <span style={{ fontSize: '1.5rem' }}>📋</span>
              </div>
              {plan.goal && (
                <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#4a5568' }}>
                  🎯 <strong>Goal:</strong> {plan.goal}
                </p>
              )}
              {plan.weekDuration && (
                <p style={{ fontSize: '0.875rem', color: '#4a5568' }}>
                  ⏱️ <strong>Duration:</strong> {plan.weekDuration} weeks
                </p>
              )}

              {/* Expanded exercises */}
              {selected?.id === plan.id && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
                  {plan.description && (
                    <p style={{ fontSize: '0.875rem', color: '#4a5568', marginBottom: '0.75rem', lineHeight: 1.6 }}>
                      {plan.description}
                    </p>
                  )}
                  {plan.exercises && (
                    <>
                      <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>📅 Exercise Schedule:</p>
                      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', color: '#4a5568', fontFamily: 'inherit', lineHeight: 1.7 }}>
                        {plan.exercises}
                      </pre>
                    </>
                  )}
                  {!plan.exercises && !plan.description && (
                    <p style={{ color: '#a0aec0', fontSize: '0.875rem' }}>No details added yet.</p>
                  )}
                </div>
              )}
              <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#a0aec0' }}>
                Click to {selected?.id === plan.id ? 'hide' : 'view'} exercises
              </p>
              <p style={{ fontSize: '0.72rem', color: '#cbd5e0', marginTop: '0.25rem' }}>
                📅 Added {new Date(plan.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default MemberWorkoutPlans;
