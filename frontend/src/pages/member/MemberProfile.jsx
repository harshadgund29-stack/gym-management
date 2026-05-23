import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getProfile, updateProfile, changePassword } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';

function MemberProfile() {
  const { login, token } = useAuth();
  const [profile, setProfile]   = useState(null);
  const [form, setForm]         = useState({ firstName: '', lastName: '', phone: '', address: '' });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [profileError, setProfileError]     = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [pwForm, setPwForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError]   = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [showPw, setShowPw]     = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    getProfile()
      .then(res => {
        setProfile(res.data);
        setForm({ firstName: res.data.firstName, lastName: res.data.lastName, phone: res.data.phone || '', address: res.data.address || '' });
      })
      .catch(() => setProfileError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setProfileError(''); setProfileSuccess('');
    try {
      const res = await updateProfile(form);
      setProfile(res.data);
      login({ ...res.data }, token);
      setProfileSuccess('✅ Profile updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally { setSaving(false); }
  };

  const handlePwChange = (e) => setPwForm({ ...pwForm, [e.target.name]: e.target.value });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (pwForm.newPassword !== pwForm.confirmPassword) return setPwError('New passwords do not match.');
    if (pwForm.newPassword.length < 6) return setPwError('Password must be at least 6 characters.');
    setPwSaving(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwSuccess('✅ Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password. Check your current password.');
    } finally { setPwSaving(false); }
  };

  const pwStrength = (p) => {
    if (!p) return { pct: 0, color: '#e5e7eb', label: '' };
    if (p.length < 4)  return { pct: 25, color: '#ef4444', label: 'Weak' };
    if (p.length < 6)  return { pct: 50, color: '#f59e0b', label: 'Fair' };
    if (p.length < 10) return { pct: 75, color: '#10b981', label: 'Good' };
    return { pct: 100, color: '#22c55e', label: 'Strong' };
  };
  const strength = pwStrength(pwForm.newPassword);

  if (loading) return (
    <Layout title="My Profile">
      <div className="loading"><div className="loading-spinner" />Loading profile...</div>
    </Layout>
  );

  return (
    <Layout title="My Profile 👤">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', maxWidth: 960 }}>

        {/* ── Profile Card ── */}
        <div className="table-container animate-fade-up" style={{ padding: '2rem' }}>
          {/* Avatar */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%', margin: '0 auto 1rem',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 900, color: 'white',
              boxShadow: '0 8px 28px rgba(16,185,129,0.35)',
              transition: 'var(--transition)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(16,185,129,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(16,185,129,0.35)'; }}
            >
              {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
            </div>
            <h3 style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--dark-bg)', marginBottom: '0.3rem' }}>
              {profile?.firstName} {profile?.lastName}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{profile?.email}</span>
              <span className={`badge badge-${profile?.role?.toLowerCase()}`}>{profile?.role}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.4rem' }}>
              Member since {new Date(profile?.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
            </p>
          </div>

          <div style={{ borderTop: '1px solid rgba(16,185,129,0.1)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--dark-bg)' }}>
              ✏️ Edit Profile
            </h3>

            {profileError   && <div className="alert alert-error">⚠️ {profileError}</div>}
            {profileSuccess && <div className="alert alert-success">{profileSuccess}</div>}

            <form onSubmit={handleProfileSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="123 Main St, City" />
              </div>
              <div className="form-group">
                <label>Email (read-only)</label>
                <input value={profile?.email || ''} disabled style={{ background: '#f9fafb', color: '#9ca3af', cursor: 'not-allowed' }} />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</> : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Change Password Card ── */}
        <div className="table-container animate-fade-up delay-2" style={{ padding: '2rem' }}>
          {/* Security icon */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 0.75rem',
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem', boxShadow: '0 6px 20px rgba(124,58,237,0.3)',
            }}>🔐</div>
            <h3 style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--dark-bg)', marginBottom: '0.25rem' }}>Change Password</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Keep your account secure with a strong password</p>
          </div>

          {pwError   && <div className="alert alert-error">⚠️ {pwError}</div>}
          {pwSuccess && <div className="alert alert-success">{pwSuccess}</div>}

          <form onSubmit={handlePasswordSubmit}>
            {/* Current password */}
            <div className="form-group">
              <label>Current Password</label>
              <div className="input-wrapper">
                <input
                  type={showPw.current ? 'text' : 'password'}
                  name="currentPassword" value={pwForm.currentPassword}
                  onChange={handlePwChange} required placeholder="Your current password"
                />
                <button type="button" className="input-toggle" onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}>
                  {showPw.current ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="form-group">
              <label>New Password</label>
              <div className="input-wrapper">
                <input
                  type={showPw.new ? 'text' : 'password'}
                  name="newPassword" value={pwForm.newPassword}
                  onChange={handlePwChange} required placeholder="Min. 6 characters"
                />
                <button type="button" className="input-toggle" onClick={() => setShowPw(p => ({ ...p, new: !p.new }))}>
                  {showPw.new ? '🙈' : '👁️'}
                </button>
              </div>
              {pwForm.newPassword && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ height: 5, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${strength.pct}%`, background: strength.color, borderRadius: 4, transition: 'width 0.4s ease, background 0.4s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: strength.color, fontWeight: 700 }}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="input-wrapper">
                <input
                  type={showPw.confirm ? 'text' : 'password'}
                  name="confirmPassword" value={pwForm.confirmPassword}
                  onChange={handlePwChange} required placeholder="Repeat new password"
                  style={{ borderColor: pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword ? '#ef4444' : undefined }}
                />
                <button type="button" className="input-toggle" onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}>
                  {showPw.confirm ? '🙈' : '👁️'}
                </button>
              </div>
              {pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword && (
                <span className="field-error">Passwords do not match</span>
              )}
              {pwForm.confirmPassword && pwForm.confirmPassword === pwForm.newPassword && pwForm.newPassword.length >= 6 && (
                <span className="field-success">✓ Passwords match</span>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={pwSaving}>
                {pwSaving ? <><span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Changing...</> : '🔒 Change Password'}
              </button>
            </div>
          </form>

          {/* Security tips */}
          <div style={{
            marginTop: '1.5rem', padding: '1rem 1.25rem',
            background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: 'var(--radius-md)',
          }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5b21b6', marginBottom: '0.5rem' }}>🛡️ Security Tips</p>
            <ul style={{ fontSize: '0.78rem', color: 'var(--text-muted)', paddingLeft: '1rem', lineHeight: 1.8 }}>
              <li>Use at least 8 characters</li>
              <li>Mix letters, numbers & symbols</li>
              <li>Never share your password</li>
              <li>Change it every 3 months</li>
            </ul>
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default MemberProfile;
