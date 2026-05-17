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

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await registerApi(formData);
      const { token, role, ...userData } = response.data;
      login({ ...userData, role }, token);
      const redirects = { ADMIN: '/admin', TRAINER: '/trainer', MEMBER: '/member' };
      navigate(redirects[role] || '/login');
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
          <span>💪</span>
          <h1>FitPro</h1>
        </div>

        <h2>Create Account</h2>
        <p className="auth-subtitle">Join our gym management system</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
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
            <input type="password" name="password" value={formData.password} onChange={handleChange}
              placeholder="Min. 6 characters" required minLength={6} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="MEMBER">Member</option>
                <option value="TRAINER">Trainer</option>
                {/* ADMIN role is not available for self-registration */}
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

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
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
