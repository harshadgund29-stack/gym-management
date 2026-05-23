import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { getFloorSummary } from '../../api/floorApi';
import { manualCheckOut } from '../../api/attendanceApi';
import './ManageAttendance.css';

function ManageAttendance() {
  const [floorSummary, setFloorSummary] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getFloorSummary();
      setFloorSummary(res.data);
    } catch {
      setError('Could not retrieve gym floor records.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (memberId) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await manualCheckOut(memberId);
      setSuccess('✅ Member successfully checked out!');
      const res = await getFloorSummary();
      setFloorSummary(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check out member.');
    } finally {
      setActionLoading(false);
    }
  };

  const todayLogs = floorSummary?.roster || [];

  const handleExportCSV = () => {
    if (todayLogs.length === 0) return setError('No logs available to export.');
    const headers = ['Log ID', 'Member Name', 'Check In', 'Check Out', 'Status', 'Marked By'];
    const rows = todayLogs.map(l => [
      l.id, l.userName,
      l.checkIn  ? new Date(l.checkIn).toLocaleString()  : '',
      l.checkOut ? new Date(l.checkOut).toLocaleString() : '',
      l.status,
      l.markedByName || 'Self',
    ]);
    const csv = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csv);
    a.download = `fitpro_attendance_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const fmt = (dt) => dt ? new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

  const filtered = todayLogs.filter(l => {
    const matchSearch = l.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <Layout title="Attendance & Floor Management 📅">
      {error   && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Floor metrics */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', marginBottom: '2rem' }}>
        {[
          { icon: '📋', label: 'Total Check-Ins Today', value: floorSummary?.totalCheckInsToday ?? '—', color: '#4299e1', delay: 1 },
          { icon: '🟢', label: 'Active On Floor',       value: floorSummary?.activeOnFloor ?? '—',      color: '#48bb78', delay: 2 },
          { icon: '✅', label: 'Completed Sessions',    value: floorSummary?.completedSessions ?? '—',  color: '#9f7aea', delay: 3 },
          { icon: '👥', label: 'Total Members',         value: floorSummary?.totalMembers ?? '—',       color: '#ed8936', delay: 4 },
        ].map(c => (
          <div key={c.label} className={`stat-card animate-fade-up delay-${c.delay}`}>
            <span className="stat-icon">{c.icon}</span>
            <span className="stat-value" style={{ color: c.color }}>{c.value}</span>
            <span className="stat-label">{c.label}</span>
          </div>
        ))}
      </div>

      {/* Today's roster — manual check-in removed; members self check-in */}
      <div className="table-container animate-fade-up">
        <div className="table-header">
          <h2>📋 Today's Check-In Roster ({filtered.length})</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', border: '1.5px solid #c8ddd5', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontFamily: 'inherit' }}
            >
              <option value="ALL">All Status</option>
              <option value="CHECKED_IN">On Floor</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <input
              type="text"
              placeholder="🔍 Search member..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '0.5rem 0.875rem', border: '1.5px solid #c8ddd5', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', width: '200px', fontFamily: 'inherit' }}
            />
            <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
              📥 Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="loading-spinner" />Loading floor records...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📅</span>
            <h3>No check-ins yet today</h3>
            <p>Members will appear here when they check in from their dashboard.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Member</th><th>Check In</th><th>Check Out</th><th>Status</th><th>Marked By</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                        background: log.status === 'CHECKED_IN'
                          ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                          : 'linear-gradient(135deg, #9ca3af, #6b7280)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.7rem', fontWeight: 800,
                      }}>
                        {log.userName?.charAt(0)}
                      </div>
                      <strong>{log.userName}</strong>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#16a34a' }}>{fmt(log.checkIn)}</td>
                  <td style={{ fontFamily: 'monospace', color: '#6b7280' }}>{fmt(log.checkOut)}</td>
                  <td>
                    <span className={`badge ${log.status === 'CHECKED_IN' ? 'badge-active' : 'badge-completed'}`}>
                      {log.status === 'CHECKED_IN' ? '🟢 On Floor' : '✅ Done'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {log.markedByName || 'Self'}
                  </td>
                  <td>
                    {log.status === 'CHECKED_IN' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCheckOut(log.userId)}
                        disabled={actionLoading}
                      >
                        Check Out
                      </button>
                    )}
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

export default ManageAttendance;
