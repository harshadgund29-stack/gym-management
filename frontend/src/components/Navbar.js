import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    // Dashboard is active only on exact match; others match prefix
    if (path.split('/').length === 2) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  // Define nav links per role
  const navLinks = {
    ADMIN: [
      { to: '/admin',             label: '📊 Dashboard' },
      { to: '/admin/members',     label: '👥 Members' },
      { to: '/admin/trainers',    label: '🏋️ Trainers' },
      { to: '/admin/memberships', label: '📋 Memberships' },
      { to: '/admin/plans',       label: '🏷️ Plans' },
      { to: '/admin/payments',    label: '💰 Payments' },
    ],
    TRAINER: [
      { to: '/trainer',           label: '📊 Dashboard' },
      { to: '/trainer/sessions',  label: '🗓️ Sessions' },
      { to: '/trainer/workouts',  label: '📋 Workout Plans' },
    ],
    MEMBER: [
      { to: '/member',           label: '📊 Dashboard' },
      { to: '/member/workouts',  label: '🏋️ Workout Plans' },
      { to: '/member/payments',  label: '💳 Payments' },
      { to: '/member/profile',   label: '👤 Profile' },
    ],
  };

  const links = navLinks[user?.role] || [];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">💪</span>
        <span className="brand-name">FitPro</span>
      </div>

      <div className="navbar-links">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="navbar-user">
        <span className="user-name">
          {user?.firstName} {user?.lastName}
        </span>
        <span className="user-role">{user?.role}</span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
