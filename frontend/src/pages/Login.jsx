import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [success, setSuccess]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // Pre-fill from Landing quick-login
  useEffect(() => {
    if (location.state?.email) {
      setFormData({ email: location.state.email, password: location.state.password || '' });
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const cleanPayload = {
      email:    formData.email.trim().toLowerCase(),
      password: formData.password.trim()
    };
    try {
      const response = await loginApi(cleanPayload);
      const { token, role, ...userData } = response.data;

      setSuccess(true);
      login({ ...userData, role }, token); // saves to 'gymToken' and 'gymUser' via AuthContext

      // ✅ Redirect based on role
      setTimeout(() => {
        if (role === "ADMIN") {
          navigate("/admin");
        } else if (role === "TRAINER") {
          navigate("/trainer");
        } else if (role === "MEMBER") {
          navigate("/member");
        } else {
          navigate("/login");
        }
      }, 600);
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.status === 400 && msg) {
        setError(msg);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">💪</span>
          <h1>FitPro</h1>
          <p>Gym Management System</p>
        </div>

        <h2>Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {error && (
          <div className="alert alert-error" role="alert">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="status">
            ✅ Login successful! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email" type="email" name="email"
              value={formData.email} onChange={handleChange}
              placeholder="you@example.com"
              required autoComplete="email"
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required autoComplete="current-password"
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPass(p => !p)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1.25rem', marginTop: '-0.5rem' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading || success}>
            {loading ? (
              <><span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in...</>
            ) : success ? '✅ Redirecting...' : '🚀 Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>

        <div className="demo-hint">
          <strong>🔑 Demo Admin:</strong> admin@gmail.com / 123456<br />
          Or use any demo account from the <Link to="/" style={{ color: 'var(--accent)', fontWeight: 700 }}>landing page</Link>.
        </div>
      </div>
    </div>
  );
}

export default Login;
