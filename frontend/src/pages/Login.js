import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

/**
 * Login page — public, no auth required.
 * On success, stores the JWT and redirects to the role-based dashboard.
 *
 * Admin credentials: admin@gmail.com / 123456
 */
function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Trim whitespace to avoid hidden-space login failures
    const cleanPayload = {
      email:    formData.email.trim().toLowerCase(),
      password: formData.password.trim()
    };

    try {
      const response = await loginApi(cleanPayload);
      const { token, role, ...userData } = response.data;

      // Store user info and token in context + localStorage
      login({ ...userData, role }, token);

      // Redirect based on role
      const redirects = { ADMIN: '/admin', TRAINER: '/trainer', MEMBER: '/member' };
      navigate(redirects[role] || '/login');
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
          <span>💪</span>
          <h1>FitPro</h1>
          <p>Gym Management System</p>
        </div>

        <h2>Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
