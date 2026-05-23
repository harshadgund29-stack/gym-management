import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Landing.css';

const TEAM = [
  { name: 'Rajesh Kumar',  role: 'ADMIN',   email: 'rajesh@fitpro.com', password: 'password123', initials: 'RK', avatarClass: 'avatar-admin',   roleClass: 'team-role-admin',   roleLabel: 'Admin'   },
  { name: 'Arjun Sharma',  role: 'TRAINER', email: 'arjun@fitpro.com',  password: 'password123', initials: 'AS', avatarClass: 'avatar-trainer', roleClass: 'team-role-trainer', roleLabel: 'Trainer' },
  { name: 'Priya Patel',   role: 'TRAINER', email: 'priya@fitpro.com',  password: 'password123', initials: 'PP', avatarClass: 'avatar-trainer', roleClass: 'team-role-trainer', roleLabel: 'Trainer' },
  { name: 'Ananya Singh',  role: 'MEMBER',  email: 'ananya@fitpro.com', password: 'password123', initials: 'AS', avatarClass: 'avatar-member',  roleClass: 'team-role-member',  roleLabel: 'Member'  },
  { name: 'Vikram Mehta',  role: 'MEMBER',  email: 'vikram@fitpro.com', password: 'password123', initials: 'VM', avatarClass: 'avatar-member',  roleClass: 'team-role-member',  roleLabel: 'Member'  },
  { name: 'Kavya Reddy',   role: 'MEMBER',  email: 'kavya@fitpro.com',  password: 'password123', initials: 'KR', avatarClass: 'avatar-member',  roleClass: 'team-role-member',  roleLabel: 'Member'  },
  { name: 'Rohan Gupta',   role: 'MEMBER',  email: 'rohan@fitpro.com',  password: 'password123', initials: 'RG', avatarClass: 'avatar-member',  roleClass: 'team-role-member',  roleLabel: 'Member'  },
];

const FEATURES = [
  { icon: '📊', title: 'Admin Dashboard',    desc: 'Real-time stats on members, revenue, sessions and plans with a 6-month revenue chart.' },
  { icon: '👥', title: 'Member Management',  desc: 'Add, view and manage all gym members with full profile details and search.' },
  { icon: '🏋️', title: 'Trainer Profiles',   desc: 'Assign trainers to members, track sessions and create personalised workout plans.' },
  { icon: '💳', title: 'Membership Plans',   desc: 'Create flexible plans — Basic, Premium, VIP — with custom pricing and features.' },
  { icon: '💰', title: 'Payment Tracking',   desc: 'Record and monitor all payments with method, status, filters and transaction IDs.' },
  { icon: '📋', title: 'Workout Plans',      desc: 'Trainers build detailed workout plans with goals, exercises and weekly schedules.' },
  { icon: '🗓️', title: 'Training Sessions',  desc: 'Schedule, track and complete one-on-one training sessions with notes.' },
  { icon: '🔐', title: 'Role-Based Access',  desc: 'Separate dashboards for Admin, Trainer and Member — JWT secured by design.' },
];

const PLANS = [
  { name: 'Basic',   price: '₹2,499',  period: '/month', duration: '1 Month',   features: ['Gym Floor Access', 'Locker Room', 'Basic Equipment'],                        popular: false },
  { name: 'Premium', price: '₹4,999',  period: '/month', duration: '1 Month',   features: ['All Classes', 'Swimming Pool', 'Sauna', 'Locker Room'],                      popular: true  },
  { name: 'VIP',     price: '₹8,499',  period: '/month', duration: '1 Month',   features: ['Personal Trainer', 'Nutrition Plan', 'Priority Booking', 'All Premium'],     popular: false },
  { name: 'Annual',  price: '₹41,999', period: '/year',  duration: '12 Months', features: ['All Premium Features', 'Free Guest Passes', 'Merchandise Discount'],         popular: false },
];

const TECH = [
  { icon: '☕', label: 'Java 17' },
  { icon: '🍃', label: 'Spring Boot 3.2' },
  { icon: '🔐', label: 'Spring Security' },
  { icon: '🔑', label: 'JWT Auth' },
  { icon: '🗄️', label: 'MySQL' },
  { icon: '⚛️', label: 'React 18' },
  { icon: '🔀', label: 'React Router v6' },
  { icon: '📡', label: 'Axios' },
];

function Landing() {
  const [scrolled, setScrolled]     = useState(false);
  const [copiedEmail, setCopiedEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const handleQuickLogin = (person) => {
    navigate('/login', { state: { email: person.email, password: person.password } });
  };

  const copyEmail = (email) => {
    navigator.clipboard.writeText(email).then(() => {
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(''), 2000);
    });
  };

  return (
    <div>
      {/* ── Navbar ── */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="landing-nav-brand">
          <span className="brand-icon">💪</span>
          <span className="brand-name">FitPro</span>
        </div>
        <div className="landing-nav-links">
          <button className="landing-nav-link" onClick={() => scrollTo('features')}>Features</button>
          <button className="landing-nav-link" onClick={() => scrollTo('roles')}>How It Works</button>
          <button className="landing-nav-link" onClick={() => scrollTo('team')}>Team</button>
          <button className="landing-nav-link" onClick={() => scrollTo('pricing')}>Plans</button>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/register" style={{ color: '#a0aec0', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Register</Link>
          <Link to="/login" className="landing-nav-login">Login →</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-badge">🏆 Complete Gym Management Solution</div>
          <h1>Manage Your Gym<br /><span>Smarter &amp; Faster</span></h1>
          <p className="hero-subtitle">
            FitPro is a full-stack gym management system built with Spring Boot and React.
            Manage members, trainers, memberships, payments and workout plans — all from one platform.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn-hero-primary">🚀 Get Started</Link>
            <button className="btn-hero-outline" onClick={() => scrollTo('features')}>Explore Features ↓</button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><span className="hero-stat-value">3</span><span className="hero-stat-label">User Roles</span></div>
            <div className="hero-stat"><span className="hero-stat-value">8+</span><span className="hero-stat-label">Features</span></div>
            <div className="hero-stat"><span className="hero-stat-value">4</span><span className="hero-stat-label">Membership Plans</span></div>
            <div className="hero-stat"><span className="hero-stat-value">JWT</span><span className="hero-stat-label">Secured</span></div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section section-light" id="features">
        <div className="section-header">
          <div className="section-tag">Features</div>
          <h2 className="section-title">Everything You Need to Run a Gym</h2>
          <p className="section-subtitle">From member onboarding to payment tracking — FitPro covers the full lifecycle of gym management.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Roles ── */}
      <section className="section section-dark" id="roles">
        <div className="section-header">
          <div className="section-tag">How It Works</div>
          <h2 className="section-title">Three Roles, One Platform</h2>
          <p className="section-subtitle">Each user type gets a dedicated dashboard tailored to their responsibilities.</p>
        </div>
        <div className="roles-grid">
          <div className="role-card">
            <span className="role-icon">👑</span>
            <h3>Admin</h3>
            <span className="role-badge role-badge-admin">Administrator</span>
            <p>Full control over the entire gym. Manage members, trainers, plans and view financial reports.</p>
            <ul className="role-features">
              <li>Real-time dashboard with revenue chart</li>
              <li>Manage all members &amp; trainers</li>
              <li>Create &amp; edit membership plans</li>
              <li>Assign memberships to members</li>
              <li>Track all payments &amp; revenue</li>
            </ul>
          </div>
          <div className="role-card">
            <span className="role-icon">🏋️</span>
            <h3>Trainer</h3>
            <span className="role-badge role-badge-trainer">Fitness Trainer</span>
            <p>Manage your sessions and create personalised workout plans for each member you train.</p>
            <ul className="role-features">
              <li>View upcoming &amp; past sessions</li>
              <li>Schedule training sessions</li>
              <li>Create custom workout plans</li>
              <li>Track member progress with notes</li>
              <li>See all members you train</li>
            </ul>
          </div>
          <div className="role-card">
            <span className="role-icon">🏅</span>
            <h3>Member</h3>
            <span className="role-badge role-badge-member">Gym Member</span>
            <p>Stay on top of your fitness journey — view your plan, sessions, payments and profile.</p>
            <ul className="role-features">
              <li>Membership expiry countdown</li>
              <li>See upcoming sessions</li>
              <li>Access workout plans</li>
              <li>View payment history</li>
              <li>Update personal profile</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Team / Demo Accounts ── */}
      <section className="section section-white" id="team">
        <div className="section-header">
          <div className="section-tag">Demo Accounts</div>
          <h2 className="section-title">Meet the FitPro Team</h2>
          <p className="section-subtitle">
            Click <strong>"Login as"</strong> on any card to instantly log in with that account.
            All passwords are <code style={{ background: '#f0f2f5', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.9rem' }}>password123</code>
          </p>
        </div>
        <div className="team-grid">
          {TEAM.map(person => (
            <div className="team-card" key={person.email}>
              <div className={`team-avatar ${person.avatarClass}`}>{person.initials}</div>
              <h3>{person.name}</h3>
              <div className={`team-role ${person.roleClass}`}>{person.roleLabel}</div>
              <div
                className="team-email"
                title="Click to copy email"
                style={{ cursor: 'pointer' }}
                onClick={() => copyEmail(person.email)}
              >
                {copiedEmail === person.email ? '✅ Copied!' : person.email}
              </div>
              <button className="team-login-btn" onClick={() => handleQuickLogin(person)}>
                Login as {person.name.split(' ')[0]} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="section section-light" id="pricing">
        <div className="section-header">
          <div className="section-tag">Membership Plans</div>
          <h2 className="section-title">Simple, Transparent Pricing</h2>
          <p className="section-subtitle">Choose the plan that fits your fitness goals. All plans include full gym access.</p>
        </div>
        <div className="pricing-grid">
          {PLANS.map(plan => (
            <div className={`pricing-card ${plan.popular ? 'popular' : ''}`} key={plan.name}>
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <div className="pricing-name">{plan.name}</div>
              <div className="pricing-price">{plan.price}<span>{plan.period}</span></div>
              <div className="pricing-duration">{plan.duration}</div>
              <ul className="pricing-features">
                {plan.features.map(f => <li key={f}>{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="section section-dark">
        <div className="section-header">
          <div className="section-tag">Tech Stack</div>
          <h2 className="section-title">Built with Modern Technologies</h2>
          <p className="section-subtitle">A production-ready full-stack application using industry-standard tools.</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', maxWidth: '800px', margin: '0 auto' }}>
          {TECH.map(t => (
            <div key={t.label} style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', padding: '1rem 1.5rem',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600,
            }}>
              <span style={{ fontSize: '1.4rem' }}>{t.icon}</span>{t.label}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <h2>Ready to Explore FitPro?</h2>
        <p>Log in with any demo account and explore the full system — no setup required.</p>
        <Link to="/login" className="btn-cta-white">🚀 Go to Login</Link>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <span>💪</span>
          <span className="footer-brand-name">FitPro</span>
        </div>
        <p className="footer-tagline">Gym Management System — Spring Boot + React</p>
        <div className="footer-links">
          <button className="landing-nav-link" style={{ color: '#a0aec0', fontSize: '0.875rem' }} onClick={() => scrollTo('features')}>Features</button>
          <button className="landing-nav-link" style={{ color: '#a0aec0', fontSize: '0.875rem' }} onClick={() => scrollTo('team')}>Team</button>
          <button className="landing-nav-link" style={{ color: '#a0aec0', fontSize: '0.875rem' }} onClick={() => scrollTo('pricing')}>Pricing</button>
          <Link to="/login"    style={{ color: '#a0aec0', fontSize: '0.875rem', textDecoration: 'none' }}>Login</Link>
          <Link to="/register" style={{ color: '#a0aec0', fontSize: '0.875rem', textDecoration: 'none' }}>Register</Link>
        </div>
        <hr className="footer-divider" />
        <p className="footer-copy">© 2026 FitPro Gym Management System. Built for learning purposes.</p>
      </footer>
    </div>
  );
}

export default Landing;
