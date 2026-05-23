import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';
import './MemberAttendance.css';

const MOTTOS = [
  '"Suffer the pain of discipline or suffer the pain of regret!" ⚡',
  '"Excuses don\'t burn calories. Check-in and make it count!" 🏋️',
  '"Train insane or remain the same!" 🔥',
  '"The only bad workout is the one that didn\'t happen." 💪',
  '"Sweat is fat crying. Squeeze every drop!" 💦',
  '"Your body can stand almost anything. It\'s your mind you must convince." 🧠',
  '"Discipline is doing what needs to be done even if you don\'t want to." 👑',
];

function MemberAttendance() {
  const { user } = useAuth();
  const [stats, setStats]     = useState({ totalVisits: 0, loyaltyPoints: 0, isCheckedIn: false });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');
  const [quote, setQuote]     = useState(() => MOTTOS[Math.floor(Math.random() * MOTTOS.length)]);

  useEffect(() => {
    if (user?.userId) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true); setError('');
      const [statsRes, historyRes] = await Promise.all([
        axios.get(`/attendance/stats/member/${user.userId}`),
        axios.get(`/attendance/history/member/${user.userId}`),
      ]);
      setStats(statsRes.data);
      setHistory(historyRes.data);
    } catch { setError('Could not load your attendance records.'); }
    finally { setLoading(false); }
  };

  const handleCheckIn = async () => {
    setActionLoading(true); setError(''); setMessage('');
    try {
      await axios.post('/attendance/checkin');
      setMessage('✅ Checked in! Go smash your goals! 🏋️');
      setQuote(MOTTOS[Math.floor(Math.random() * MOTTOS.length)]);
      await fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Check-in failed.'); }
    finally { setActionLoading(false); }
  };

  const handleCheckOut = async () => {
    setActionLoading(true); setError(''); setMessage('');
    try {
      await axios.post('/attendance/checkout');
      setMessage('✅ Checked out! Rest up and rebuild. 🥤');
      setQuote(MOTTOS[Math.floor(Math.random() * MOTTOS.length)]);
      await fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Check-out failed.'); }
    finally { setActionLoading(false); }
  };

  const fmt = (dt, type) => {
    if (!dt) return '—';
    const d = new Date(dt);
    return type === 'date'
      ? d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
      : d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // Loyalty tier
  const tier = stats.loyaltyPoints >= 500 ? { label: 'Gold', color: '#f59e0b', icon: '👑' }
    : stats.loyaltyPoints >= 200 ? { label: 'Silver', color: '#9ca3af', icon: '🥈' }
    : stats.loyaltyPoints >= 50  ? { label: 'Bronze', color: '#cd7f32', icon: '🥉' }
    : { label: 'Starter', color: '#6b7280', icon: '🏅' };

  if (loading) return (
    <Layout title="My Attendance">
      <div className="loading"><div className="loading-spinner" />Loading attendance...</div>
    </Layout>
  );

  return (
    <Layout title="My Attendance 📅">
      {/* Motivational Banner */}
      <div className="attendance-hero">
        <div className="attendance-hero-text">
          <h2>Gym Floor Terminal</h2>
          <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.65)', marginTop: '0.3rem' }}>{quote}</p>
        </div>
        <div>
          {stats.isCheckedIn ? (
            <button className="checkout-action-btn" onClick={handleCheckOut} disabled={actionLoading}>
              {actionLoading ? <><span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Stamping...</> : '🚪 Check Out'}
            </button>
          ) : (
            <button className="checkin-action-btn" onClick={handleCheckIn} disabled={actionLoading}>
              {actionLoading ? <><span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Stamping...</> : '💪 Check In'}
            </button>
          )}
        </div>
      </div>

      {error   && <div className="alert alert-error">⚠️ {error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {/* Stats Row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', marginBottom: '1.5rem' }}>
        {[
          { icon: '🏃', label: 'Total Visits',    value: stats.totalVisits,    color: '#4299e1' },
          { icon: '⭐', label: 'Loyalty Points',  value: stats.loyaltyPoints,  color: '#f6ad55' },
          { icon: tier.icon, label: `${tier.label} Tier`, value: tier.label, color: tier.color, small: true },
          { icon: stats.isCheckedIn ? '🟢' : '🔴', label: 'Floor Status', value: stats.isCheckedIn ? 'Present' : 'Away', color: stats.isCheckedIn ? '#22c55e' : '#9ca3af', small: true },
        ].map((c, i) => (
          <div key={c.label} className={`stat-card animate-fade-up delay-${i+1}`}>
            <span className="stat-icon">{c.icon}</span>
            <span className="stat-value" style={{ color: c.color, fontSize: c.small ? '1.4rem' : '2.2rem' }}>{c.value}</span>
            <span className="stat-label">{c.label}</span>
          </div>
        ))}
      </div>

      {/* Loyalty Card */}
      <div className="loyalty-card">
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', opacity: 0.7, marginBottom: '0.3rem' }}>FitPro Loyalty Club</p>
          <div className="loyalty-points">{stats.loyaltyPoints} pts</div>
          <p style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.3rem' }}>Earn 10 points per check-in</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.3rem' }}>{tier.icon}</div>
          <div style={{ fontWeight: 800, fontSize: '1rem' }}>{tier.label} Member</div>
          {stats.loyaltyPoints < 500 && (
            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.2rem' }}>
              {500 - stats.loyaltyPoints} pts to Gold
            </div>
          )}
        </div>
      </div>

      {/* Attendance History */}
      <div className="table-container animate-fade-up">
        <div className="table-header">
          <h2>📋 Attendance History ({history.length})</h2>
        </div>
        {history.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📅</span>
            <h3>No check-ins yet</h3>
            <p>Start training today and build your streak!</p>
          </div>
        ) : (
          <table>
            <thead><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th></tr></thead>
            <tbody>
              {history.map(log => (
                <tr key={log.id}>
                  <td><strong>{fmt(log.checkIn, 'date')}</strong></td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#16a34a' }}>{fmt(log.checkIn, 'time')}</td>
                  <td style={{ fontFamily: 'monospace', color: '#6b7280' }}>{fmt(log.checkOut, 'time')}</td>
                  <td>
                    <span className={`badge ${log.status === 'COMPLETED' ? 'badge-completed' : 'badge-active'}`}>
                      {log.status === 'CHECKED_IN' ? '🟢 On Floor' : '✅ Done'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

export default MemberAttendance;
