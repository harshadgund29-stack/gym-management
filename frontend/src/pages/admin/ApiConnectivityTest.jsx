import React, { useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import axios from '../../api/axios';

/* ─── Test definitions ─────────────────────────────────────── */
const TESTS = [
  {
    id: 'login_admin',
    group: '🔐 Auth',
    label: 'POST /auth/login (Admin)',
    description: 'Authenticate with admin credentials and receive JWT',
    run: () => axios.post('/auth/login', { email: 'admin@gmail.com', password: '123456' }),
    extract: r => ({ token: r.data.token?.slice(0, 30) + '…', role: r.data.role, userId: r.data.userId }),
  },
  {
    id: 'login_invalid',
    group: '🔐 Auth',
    label: 'POST /auth/login (Invalid — expect 401)',
    description: 'Verify 401 is returned for wrong credentials',
    expectError: 401,
    run: () => axios.post('/auth/login', { email: 'wrong@test.com', password: 'badpass' }),
    extract: () => ({ result: '401 Unauthorized — correct!' }),
  },
  {
    id: 'forgot_password',
    group: '🔐 Auth',
    label: 'POST /auth/forgot-password',
    description: 'Trigger OTP email for a registered user',
    run: () => axios.post('/auth/forgot-password?email=admin@gmail.com'),
    extract: r => ({ message: r.data.message }),
  },
  {
    id: 'verify_otp_invalid',
    group: '🔐 Auth',
    label: 'POST /auth/verify-otp (Invalid OTP)',
    description: 'Verify that an invalid OTP returns verified: false',
    run: () => axios.post('/auth/verify-otp?email=admin@gmail.com&otp=000000'),
    extract: r => ({ verified: r.data.verified, message: r.data.message }),
  },
  {
    id: 'reset_password_bad_otp',
    group: '🔐 Auth',
    label: 'POST /auth/reset-password (Bad OTP — expect 400)',
    description: 'Verify 400 is returned when OTP is invalid',
    expectError: 400,
    run: () => axios.post('/auth/reset-password', { email: 'admin@gmail.com', otp: '000000', newPassword: 'test123' }),
    extract: () => ({ result: '400 Bad Request — OTP rejected correctly' }),
  },
  {
    id: 'dashboard_stats',
    group: '📊 Dashboard',
    label: 'GET /dashboard/stats',
    description: 'Fetch admin KPI statistics',
    run: () => axios.get('/dashboard/stats'),
    extract: r => ({ totalMembers: r.data.totalMembers, totalTrainers: r.data.totalTrainers, totalRevenue: r.data.totalRevenue }),
  },
  {
    id: 'get_members',
    group: '👥 Users',
    label: 'GET /users/members',
    description: 'Retrieve all gym members',
    run: () => axios.get('/users/members'),
    extract: r => ({ count: r.data.length, first: r.data[0] ? `${r.data[0].firstName} ${r.data[0].lastName}` : 'none' }),
  },
  {
    id: 'get_trainers',
    group: '👥 Users',
    label: 'GET /users/trainers',
    description: 'Retrieve all trainers',
    run: () => axios.get('/users/trainers'),
    extract: r => ({ count: r.data.length, first: r.data[0] ? `${r.data[0].firstName} ${r.data[0].lastName}` : 'none' }),
  },
  {
    id: 'get_profile',
    group: '👥 Users',
    label: 'GET /users/profile',
    description: 'Fetch the currently authenticated user profile',
    run: () => axios.get('/users/profile'),
    extract: r => ({ name: `${r.data.firstName} ${r.data.lastName}`, role: r.data.role, email: r.data.email }),
  },
  {
    id: 'get_memberships',
    group: '📋 Memberships',
    label: 'GET /memberships',
    description: 'Retrieve all memberships',
    run: () => axios.get('/memberships'),
    extract: r => ({ count: r.data.length, active: r.data.filter(m => m.status === 'ACTIVE').length }),
  },
  {
    id: 'get_plans',
    group: '🏷️ Plans',
    label: 'GET /plans',
    description: 'Retrieve all membership plans',
    run: () => axios.get('/plans'),
    extract: r => ({ count: r.data.length, names: r.data.map(p => p.name).join(', ') }),
  },
  {
    id: 'get_active_plans',
    group: '🏷️ Plans',
    label: 'GET /plans/active',
    description: 'Retrieve only active plans (used by member purchase flow)',
    run: () => axios.get('/plans/active'),
    extract: r => ({ count: r.data.length }),
  },
  {
    id: 'get_payments',
    group: '💰 Payments',
    label: 'GET /payments',
    description: 'Retrieve all payment records',
    run: () => axios.get('/payments'),
    extract: r => ({
      count: r.data.length,
      completed: r.data.filter(p => p.status === 'COMPLETED').length,
      totalRevenue: `₹${r.data.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0).toLocaleString('en-IN')}`,
    }),
  },
  {
    id: 'get_sessions',
    group: '🗓️ Sessions',
    label: 'GET /sessions',
    description: 'Retrieve all training sessions',
    run: () => axios.get('/sessions'),
    extract: r => ({ count: r.data.length, scheduled: r.data.filter(s => s.status === 'SCHEDULED').length }),
  },
  {
    id: 'get_attendance_summary',
    group: '📅 Attendance',
    label: 'GET /attendance/summary',
    description: "Fetch gym floor metrics and today's roster",
    run: () => axios.get('/attendance/summary'),
    extract: r => ({
      totalCheckInsToday: r.data.totalCheckInsToday,
      activeOnFloor: r.data.activeOnFloor,
      completedSessions: r.data.completedSessions,
      rosterSize: r.data.roster?.length ?? 0,
    }),
  },
  {
    id: 'get_attendance_today',
    group: '📅 Attendance',
    label: "GET /attendance/today",
    description: "Fetch today's attendance roster",
    run: () => axios.get('/attendance/today'),
    extract: r => ({ count: r.data.length, active: r.data.filter(a => a.status === 'CHECKED_IN').length }),
  },
  {
    id: 'get_workout_plans',
    group: '🏋️ Workouts',
    label: 'GET /workout-plans (via member endpoint)',
    description: 'Retrieve workout plans — tests /workout-plans/member/1 as sample',
    run: () => axios.get('/workout-plans/member/1').catch(() => axios.get('/workout-plans/trainer/1')),
    extract: r => ({ count: r.data.length }),
  },
];

const GROUPS = [...new Set(TESTS.map(t => t.group))];

/* ─── Status helpers ─────────────────────────────────────────── */
const STATUS = { idle: '⬜', running: '⏳', pass: '✅', fail: '❌', warn: '⚠️' };
const statusColor = { idle: '#9ca3af', running: '#f59e0b', pass: '#16a34a', fail: '#dc2626', warn: '#d97706' };

export default function ApiConnectivityTest() {
  const [results, setResults]   = useState({});
  const [running, setRunning]   = useState(false);
  const [runningId, setRunningId] = useState(null);
  const [filter, setFilter]     = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);

  const runTest = useCallback(async (test) => {
    setRunningId(test.id);
    setResults(prev => ({ ...prev, [test.id]: { status: 'running', ms: null, data: null, error: null } }));
    const t0 = performance.now();
    try {
      const res = await test.run();
      const ms  = Math.round(performance.now() - t0);
      const data = test.extract ? test.extract(res) : { status: res.status };
      setResults(prev => ({ ...prev, [test.id]: { status: 'pass', ms, data, error: null } }));
    } catch (err) {
      const ms = Math.round(performance.now() - t0);
      const code = err.response?.status;
      if (test.expectError && code === test.expectError) {
        const data = test.extract ? test.extract(err.response) : { status: code };
        setResults(prev => ({ ...prev, [test.id]: { status: 'warn', ms, data, error: null } }));
      } else {
        setResults(prev => ({ ...prev, [test.id]: { status: 'fail', ms, data: null, error: err.response?.data?.message || err.message } }));
      }
    }
    setRunningId(null);
  }, []);

  const runAll = async () => {
    setRunning(true);
    for (const test of TESTS) {
      await runTest(test);
      await new Promise(r => setTimeout(r, 120));
    }
    setRunning(false);
  };

  const runGroup = async (group) => {
    setRunning(true);
    for (const test of TESTS.filter(t => t.group === group)) {
      await runTest(test);
      await new Promise(r => setTimeout(r, 100));
    }
    setRunning(false);
  };

  const clearAll = () => setResults({});

  const passed  = Object.values(results).filter(r => r.status === 'pass').length;
  const warned  = Object.values(results).filter(r => r.status === 'warn').length;
  const failed  = Object.values(results).filter(r => r.status === 'fail').length;
  const total   = Object.keys(results).length;
  const avgMs   = total > 0 ? Math.round(Object.values(results).filter(r => r.ms).reduce((s, r) => s + r.ms, 0) / total) : 0;

  const filteredTests = TESTS.filter(t => filter === 'ALL' || t.group === filter);

  return (
    <Layout title="🔌 API Connectivity Test">
      {/* Header Controls */}
      <div style={{
        background: 'linear-gradient(135deg, #071510 0%, #0d2b1f 100%)',
        borderRadius: 'var(--radius-xl)', padding: '2rem',
        marginBottom: '2rem', position: 'relative', overflow: 'hidden',
        animation: 'fadeInUp 0.5s ease',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 50%, rgba(16,185,129,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '1.3rem', marginBottom: '0.3rem' }}>Backend Connectivity Suite</h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem' }}>
              Tests all {TESTS.length} API endpoints — auth, users, memberships, payments, sessions, attendance, workouts
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={runAll} disabled={running} style={{ minWidth: 140 }}>
              {running ? <><span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Running...</> : '▶ Run All Tests'}
            </button>
            <button className="btn btn-secondary" onClick={clearAll} disabled={running}>🗑 Clear</button>
          </div>
        </div>

        {/* Summary bar */}
        {total > 0 && (
          <div style={{ position: 'relative', marginTop: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Passed',  value: passed,  color: '#22c55e' },
              { label: 'Warned',  value: warned,  color: '#f59e0b' },
              { label: 'Failed',  value: failed,  color: '#ef4444' },
              { label: 'Avg ms',  value: `${avgMs}ms`, color: '#60a5fa' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
              </div>
            ))}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 200 }}>
              <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${total > 0 ? ((passed + warned) / total) * 100 : 0}%`, background: 'linear-gradient(90deg, #22c55e, #84cc16)', borderRadius: 8, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Group Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {['ALL', ...GROUPS].map(g => (
          <button key={g} onClick={() => setFilter(g)} style={{
            padding: '0.4rem 1rem', borderRadius: '30px', border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.82rem', fontFamily: 'inherit',
            background: filter === g ? 'linear-gradient(135deg, var(--primary), var(--accent))' : '#f0f2f5',
            color: filter === g ? 'white' : 'var(--text-muted)',
            boxShadow: filter === g ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
            transition: 'var(--transition)',
          }}>
            {g}
          </button>
        ))}
      </div>

      {/* Test Cards by Group */}
      {GROUPS.filter(g => filter === 'ALL' || g === filter).map(group => (
        <div key={group} className="table-container animate-fade-up" style={{ marginBottom: '1.5rem' }}>
          <div className="table-header">
            <h2>{group}</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => runGroup(group)} disabled={running}>
              ▶ Run Group
            </button>
          </div>
          <div style={{ padding: '0.5rem 0' }}>
            {filteredTests.filter(t => t.group === group).map(test => {
              const r = results[test.id];
              const isExpanded = expandedId === test.id;
              const st = r?.status || 'idle';
              return (
                <div key={test.id} style={{
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid rgba(16,185,129,0.06)',
                  transition: 'var(--transition)',
                  background: isExpanded ? 'rgba(16,185,129,0.03)' : 'transparent',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {/* Status icon */}
                    <span style={{ fontSize: '1.2rem', flexShrink: 0, animation: st === 'running' ? 'spin 1s linear infinite' : 'none' }}>
                      {st === 'running' ? '⏳' : STATUS[st]}
                    </span>

                    {/* Label + description */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--dark-bg)', fontFamily: 'monospace' }}>{test.label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{test.description}</div>
                    </div>

                    {/* Timing */}
                    {r?.ms && (
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: r.ms < 300 ? '#16a34a' : r.ms < 800 ? '#d97706' : '#dc2626', background: '#f9fafb', padding: '0.2rem 0.6rem', borderRadius: '20px', border: '1px solid #e5e7eb' }}>
                        {r.ms}ms
                      </span>
                    )}

                    {/* Status badge */}
                    {r && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '30px', background: `${statusColor[st]}15`, color: statusColor[st], border: `1px solid ${statusColor[st]}30`, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {st === 'warn' ? 'EXPECTED ERR' : st.toUpperCase()}
                      </span>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => runTest(test)} disabled={running || runningId === test.id}>
                        {runningId === test.id ? '⏳' : '▶'}
                      </button>
                      {r && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setExpandedId(isExpanded ? null : test.id)}>
                          {isExpanded ? '▲' : '▼'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded result */}
                  {isExpanded && r && (
                    <div style={{ marginTop: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e5e7eb', animation: 'fadeInUp 0.2s ease' }}>
                      {r.error ? (
                        <div>
                          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.4rem' }}>❌ Error Response:</p>
                          <pre style={{ fontSize: '0.8rem', color: '#dc2626', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{r.error}</pre>
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#16a34a', marginBottom: '0.4rem' }}>✅ Response Data:</p>
                          <pre style={{ fontSize: '0.8rem', color: '#374151', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            {JSON.stringify(r.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Manual Test Panel */}
      <ManualTestPanel />
    </Layout>
  );
}

function ManualTestPanel() {
  const [method, setMethod]   = useState('POST');
  const [endpoint, setEndpoint] = useState('/auth/login');
  const [body, setBody]       = useState('{\n  "email": "admin@gmail.com",\n  "password": "123456"\n}');
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setResult(null);
    const t0 = performance.now();
    try {
      let res;
      const parsed = body.trim() ? JSON.parse(body) : undefined;
      if (method === 'GET')    res = await axios.get(endpoint);
      else if (method === 'POST')   res = await axios.post(endpoint, parsed);
      else if (method === 'PUT')    res = await axios.put(endpoint, parsed);
      else if (method === 'DELETE') res = await axios.delete(endpoint);
      const ms = Math.round(performance.now() - t0);
      setResult({ ok: true, status: res.status, ms, data: res.data });
    } catch (err) {
      const ms = Math.round(performance.now() - t0);
      setResult({ ok: false, status: err.response?.status, ms, data: err.response?.data, error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="table-container animate-fade-up" style={{ padding: '2rem' }}>
      <div className="table-header" style={{ marginBottom: '1.5rem' }}>
        <h2>🧪 Manual API Tester</h2>
        <span className="badge badge-scheduled">Custom Request</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '0.75rem', alignItems: 'end', marginBottom: '1rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Method</label>
          <select value={method} onChange={e => setMethod(e.target.value)}>
            <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Endpoint (relative to /api)</label>
          <input value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder="/auth/login" />
        </div>
        <button className="btn btn-primary" onClick={run} disabled={loading} style={{ height: 44 }}>
          {loading ? <><span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Sending</> : '🚀 Send'}
        </button>
      </div>
      {method !== 'GET' && method !== 'DELETE' && (
        <div className="form-group">
          <label>Request Body (JSON)</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={5} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
        </div>
      )}
      {result && (
        <div style={{
          padding: '1.25rem', borderRadius: 'var(--radius-md)',
          background: result.ok ? '#f0fdf4' : '#fef2f2',
          border: `1.5px solid ${result.ok ? '#86efac' : '#fca5a5'}`,
          animation: 'fadeInUp 0.3s ease',
        }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, color: result.ok ? '#16a34a' : '#dc2626', fontSize: '0.9rem' }}>
              {result.ok ? '✅' : '❌'} HTTP {result.status}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>{result.ms}ms</span>
          </div>
          <pre style={{ fontSize: '0.82rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#374151', maxHeight: 300, overflow: 'auto' }}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
