import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function UnauthorizedPage() {
  const { user, isAdmin, isTrainer } = useAuth();
  const dash = isAdmin ? '/admin/dashboard' : isTrainer ? '/trainer/dashboard' : '/member/dashboard';
  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
      <div className="card-dark text-center max-w-sm">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-fitpro-muted text-sm mb-6">You don't have permission to view this page.</p>
        {user && <Link to={dash} className="btn-coral px-8 py-2.5">Go to Dashboard</Link>}
      </div>
    </div>
  );
}
