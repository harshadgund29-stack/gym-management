import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '',
    password: '', role: 'MEMBER', phone: '', address: ''
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [success, setSuccess] = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const pwStrength = () => {
    const p = formData.password;
    if (!p) return { width: '0%', color: '#e5e7eb', label: '' };
    if (p.length < 4) return { width: '25%', color: '#ef4444', label: 'Weak' };
    if (p.length < 6) return { width: '50%', color: '#f59e0b', label: 'Fair' };
    if (p.length < 10) return { width: '75%', color: '#10b981', label: 'Good' };
    return { width: '100%', color: '#22c55e', label: 'Strong' };
  };
  const strength = pwStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const response = await registerApi(formData);
      const { token, role, ...userData } = response.data;
      setSuccess(true);
      login({ ...userData, role }, token);
      setTimeout(() => {
        const redirects = { ADMIN: '/admin', TRAINER: '/trainer', MEMBER: '/member' };
        navigate(redirects[role] || '/login');
      }, 700);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-logo">
          <span className="auth-logo-icon">💪</span>
          <h1>FitPro</h1>
          <p>Create your account</p>
        </div>

        <h2>Join FitPro</h2>
        <p className="auth-subtitle">Start your fitness journey today</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ Account created! Redirecting...</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input name="firstName" value={formData.firstName} onChange={handleChange}
                placeholder="John" required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input name="lastName" value={formData.lastName} onChange={handleChange}
                placeholder="Doe" required />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="you@example.com" required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                name="password" value={formData.password} onChange={handleChange}
                placeholder="Min. 6 characters" required minLength={6}
              />
              <button type="button" className="input-toggle"
                onClick={() => setShowPass(p => !p)}
                aria-label={showPass ? 'Hide password' : 'Show password'}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {formData.password && (
              <div style={{ marginTop: '0.5rem' }}>
                <div className="password-strength">
                  <div className="password-strength-bar"
                    style={{ width: strength.width, background: strength.color }} />
                </div>
                <span className="field-hint" style={{ color: strength.color }}>
                  {strength.label} password
                </span>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="MEMBER">🏅 Member</option>
                <option value="TRAINER">🏋️ Trainer</option>
              </select>
            </div>
            <div className="form-group">
              <label>Phone (optional)</label>
              <input name="phone" value={formData.phone} onChange={handleChange}
                placeholder="555-0000" />
            </div>
          </div>

          <div className="form-group">
            <label>Address (optional)</label>
            <input name="address" value={formData.address} onChange={handleChange}
              placeholder="123 Main St" />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading || success}>
            {loading ? (
              <><span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account...</>
            ) : success ? '✅ Redirecting...' : '🎉 Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
