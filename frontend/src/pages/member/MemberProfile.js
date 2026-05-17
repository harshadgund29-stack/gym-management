import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getProfile, updateProfile, changePassword } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';

function MemberProfile() {
  const { login, token } = useAuth();

  // Profile state
  const [profile, setProfile]   = useState(null);
  const [form, setForm]         = useState({ firstName: '', lastName: '', phone: '', address: '' });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [profileError, setProfileError]   = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password change state
  const [pwForm, setPwForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError]   = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    getProfile()
      .then(res => {
        setProfile(res.data);
        setForm({
          firstName: res.data.firstName,
          lastName:  res.data.lastName,
          phone:     res.data.phone    || '',
          address:   res.data.address  || '',
        });
      })
      .catch(() => setProfileError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Profile update ──
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const res = await updateProfile(form);
      setProfile(res.data);
      login({ ...res.data }, token);
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // ── Password change ──
  const handlePwChange = (e) => setPwForm({ ...pwForm, [e.target.name]: e.target.value });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    setPwSaving(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwSuccess('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password. Check your current password.');
    } finally {
      setPwSaving(false);
    }
  };

  const toggleShow = (field) => setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));

  if (loading) return <Layout title="My Profile"><div className="loading">Loading profile...</div></Layout>;

  return (
    <Layout title="My Profile">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', maxWidth: 900 }}>

        {/* ── Profile Card ── */}
        <div className="table-container" style={{ padding: '2rem' }}>
          {/* Avatar */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', margin: '0 auto 0.75rem',
              background: 'linear-gradient(135deg, #48bb78, #276749)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.75rem', fontWeight: 700, color: 'white',
            }}>
              {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
            </div>
            <p style={{ color: '#718096', fontSize: '0.85rem' }}>
              {profile?.email}&nbsp;·&nbsp;
              <span className={`badge badge-${profile?.role?.toLowerCase()}`}>{profile?.role}</span>
            </p>
            <p style={{ color: '#a0aec0', fontSize: '0.78rem', marginTop: '0.25rem' }}>
              Member since {new Date(profile?.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
            </p>
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#1a1a2e' }}>
            ✏️ Edit Profile
          </h3>

          {profileError   && <div className="alert alert-error">{profileError}</div>}
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
              <label>Email (cannot be changed)</label>
              <input value={profile?.email || ''} disabled style={{ background: '#f7fafc', color: '#a0aec0' }} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Change Password Card ── */}
        <div className="table-container" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1a1a2e' }}>
            🔐 Change Password
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '1.25rem' }}>
            Choose a strong password with at least 6 characters.
          </p>

          {pwError   && <div className="alert alert-error">{pwError}</div>}
          {pwSuccess && <div className="alert alert-success">{pwSuccess}</div>}

          <form onSubmit={handlePasswordSubmit}>
            {/* Current password */}
            <div className="form-group">
              <label>Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={pwForm.currentPassword}
                  onChange={handlePwChange}
                  required
                  placeholder="Your current password"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => toggleShow('current')}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#a0aec0',
                  }}
                >{showPasswords.current ? '🙈' : '👁️'}</button>
              </div>
            </div>

            {/* New password */}
            <div className="form-group">
              <label>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={pwForm.newPassword}
                  onChange={handlePwChange}
                  required
                  placeholder="Min. 6 characters"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => toggleShow('new')}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#a0aec0',
                  }}
                >{showPasswords.new ? '🙈' : '👁️'}</button>
              </div>
              {/* Strength indicator */}
              {pwForm.newPassword && (
                <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.25rem' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 4, borderRadius: 2,
                      background: pwForm.newPassword.length >= i * 3
                        ? (pwForm.newPassword.length >= 10 ? '#48bb78' : pwForm.newPassword.length >= 6 ? '#ed8936' : '#e94560')
                        : '#e2e8f0',
                      transition: 'background 0.2s',
                    }} />
                  ))}
                  <span style={{ fontSize: '0.7rem', color: '#718096', marginLeft: '0.25rem' }}>
                    {pwForm.newPassword.length < 6 ? 'Weak' : pwForm.newPassword.length < 10 ? 'Fair' : 'Strong'}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="form-group">
              <label>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={pwForm.confirmPassword}
                  onChange={handlePwChange}
                  required
                  placeholder="Repeat new password"
                  style={{
                    paddingRight: '2.5rem',
                    borderColor: pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword ? '#e94560' : undefined,
                  }}
                />
                <button
                  type="button"
                  onClick={() => toggleShow('confirm')}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#a0aec0',
                  }}
                >{showPasswords.confirm ? '🙈' : '👁️'}</button>
              </div>
              {pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword && (
                <p style={{ color: '#e94560', fontSize: '0.78rem', marginTop: '0.25rem' }}>Passwords do not match</p>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={pwSaving}>
                {pwSaving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </Layout>
  );
}

export default MemberProfile;
