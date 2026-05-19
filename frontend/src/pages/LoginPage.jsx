import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const getDashboard = (role) => {
    if (role === 'ROLE_ADMIN')   return '/admin/dashboard';
    if (role === 'ROLE_TRAINER') return '/trainer/dashboard';
    return '/member/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const email = (form.email || '').trim();
      const password = form.password ?? '';

      const user = await login(email, password);
      navigate(from || getDashboard(user.role), { replace: true });
    } catch (err) {
      console.error('[LoginPage] Login failed:', err);

      const data = err?.response?.data;
      const message =
        data?.message ||
        data?.error ||
        (Array.isArray(data?.errors) ? data.errors.join('\n') : null) ||
        (typeof data === 'string' ? data : null);

      toast.error(message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-white/[0.04] backdrop-blur-xl p-12 relative overflow-hidden border-r border-white/10">
        <div className="absolute inset-0 bg-hero-gradient opacity-80" />
        <div className="relative">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">💪</span>
            <span className="text-xl font-bold text-white">Fit<span className="text-coral-500">Pro</span></span>
          </Link>
        </div>
        <div className="relative">
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Manage Your Gym<br />
            <span className="text-coral-500">Smarter & Faster</span>
          </h2>
          <p className="text-fitpro-muted leading-relaxed">
            Complete gym management with member tracking, PayPal payments, and automated email notifications.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {[['3', 'User Roles'], ['8+', 'Features'], ['JWT', 'Secured'], ['PayPal', 'Payments']].map(([v, l]) => (
              <div key={l} className="glass-sm rounded-xl p-4">
                <p className="text-2xl font-bold text-coral-500">{v}</p>
                <p className="text-xs text-fitpro-muted uppercase tracking-wider mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-fitpro-muted">© 2024 FitPro</div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">💪</span>
            <span className="text-xl font-bold text-white">Fit<span className="text-coral-500">Pro</span></span>
          </Link>

          <h1 className="text-3xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-fitpro-muted mb-8">Sign in to your FitPro account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-dark">Email address</label>
              <input type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-dark" placeholder="you@example.com" required autoComplete="email" />
            </div>
            <div>
              <label className="label-dark">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-dark pr-12" placeholder="••••••••" required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fitpro-muted hover:text-white text-sm">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-coral-500 hover:text-coral-400 transition-colors">
                Forgot password?
              </Link>
            </div>
            <button type="submit" disabled={loading} className="btn-coral w-full py-3 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-fitpro-muted text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-coral-500 hover:text-coral-400 font-medium transition-colors">
              Create one free
            </Link>
          </p>

          {/* Demo credentials — click to fill */}
          <div className="mt-8 p-4 glass rounded-xl">
            <p className="text-xs font-semibold text-fitpro-muted uppercase tracking-wider mb-3">
              Demo Credentials <span className="normal-case font-normal">(click to fill)</span>
            </p>
            <div className="space-y-2">
              {[
                { label: 'Admin',   email: 'admin@gmail.com',    password: '123456'     },
                { label: 'Trainer', email: 'trainer@fitpro.com', password: 'trainer123' },
                { label: 'Member',  email: 'member@fitpro.com',  password: 'member123'  },
              ].map(({ label, email, password }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setForm({ email, password })}
                  className="w-full flex justify-between items-center px-3 py-2 rounded-lg
                             hover:bg-white/10 transition-colors text-left group"
                >
                  <span className="text-xs text-fitpro-muted group-hover:text-white transition-colors">{label}</span>
                  <span className="text-xs text-coral-400 font-mono">{email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
