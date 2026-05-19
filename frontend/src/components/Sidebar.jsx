import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

const adminLinks = [
  { to: '/admin/dashboard',  label: 'Dashboard',   icon: '📊' },
  { to: '/admin/users',      label: 'Users',        icon: '👥' },
  { to: '/admin/plans',      label: 'Plans',        icon: '📋' },
  { to: '/admin/payments',   label: 'Payments',     icon: '💳' },
  { to: '/admin/attendance', label: 'Attendance',   icon: '✅' },
  { to: '/admin/reports',    label: 'Reports',      icon: '📈' },
];
const trainerLinks = [
  { to: '/trainer/dashboard',  label: 'Dashboard',  icon: '📊' },
  { to: '/trainer/members',    label: 'Members',    icon: '👥' },
  { to: '/trainer/attendance', label: 'Attendance', icon: '✅' },
];
const memberLinks = [
  { to: '/member/dashboard',  label: 'Dashboard',  icon: '📊' },
  { to: '/member/plans',      label: 'Plans',      icon: '📋' },
  { to: '/member/attendance', label: 'Attendance', icon: '✅' },
  { to: '/member/payments',   label: 'Payments',   icon: '💳' },
  { to: '/member/profile',    label: 'Profile',    icon: '👤' },
];

function LogOutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Sidebar() {
  const { user, logout, isAdmin, isTrainer } = useAuth();
  const navigate = useNavigate();
  const links = isAdmin ? adminLinks : isTrainer ? trainerLinks : memberLinks;
  const roleLabel = user?.role?.replace('ROLE_', '') || '';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-primary/95 backdrop-blur-xl border-r border-coral-500/25 flex flex-col shadow-glass-sm">
      {/* Logo & User Info */}
      <div className="p-6 border-b border-white/10 space-y-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-bounce-subtle">💪</span>
          <div>
            <span className="text-lg font-bold text-white">Fit</span>
            <span className="text-lg font-bold text-coral-500">Pro</span>
          </div>
        </div>

        {/* User Card */}
        <div className="glass-sm rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center text-navy-900 text-sm font-bold flex-shrink-0 shadow-lg">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-coral-400 font-medium uppercase tracking-wider">{roleLabel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-2">
        {links.map(link => (
          <NavLink 
            key={link.to} 
            to={link.to}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
              ${isActive 
                ? 'bg-secondary/25 border border-coral-500/35 text-white shadow-glass-sm' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 hover:-translate-y-0.5'
              }
            `}
          >
            <span className="text-base">{link.icon}</span>
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 border border-transparent transition-all duration-300 hover:shadow-lg active:scale-95"
        >
          <LogOutIcon />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
