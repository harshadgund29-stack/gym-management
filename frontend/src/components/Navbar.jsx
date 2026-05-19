import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout, isAdmin, isTrainer } = useAuth();
  const navigate = useNavigate();

  const getDashboard = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isTrainer) return '/trainer/dashboard';
    return '/member/dashboard';
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-primary/95 backdrop-blur-xl border-b border-coral-500/25 shadow-card">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-300 flex-shrink-0"
        >
          <span className="text-2xl animate-bounce-subtle">💪</span>
          <span className="text-lg font-bold text-white hidden sm:block">Fit<span className="text-coral-500">Pro</span></span>
        </Link>

        {/* Nav Items */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {user ? (
            <>
              <Link 
                to={getDashboard()} 
                className="btn-ghost text-sm hidden sm:block"
              >
                Dashboard
              </Link>
              <ThemeToggle />
              <button 
                onClick={handleLogout} 
                className="btn-outline text-sm py-2 px-4 rounded-lg"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">
                Login
              </Link>
              <ThemeToggle />
              <Link to="/register" className="btn-coral text-sm py-2 px-4 rounded-lg">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
