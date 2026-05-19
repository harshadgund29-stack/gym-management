import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const navigate              = useNavigate();
  const location              = useLocation();
  // Email passed via router state from VerifyOtpPage (not query param)
  const email                 = location.state?.email || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');

  const [showPass,  setShowPass]    = useState(false);
  const [loading,   setLoading]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);

    try {
      await authService.resetPassword({ email, newPassword: password });
      toast.success('Password reset successful. Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      toast.error('Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  // No email in URL
  if (!email) return (

    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-6">
        <div className="card-dark text-center max-w-sm w-full">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-white mb-2">Invalid Reset Session</h2>
        <p className="text-fitpro-muted text-sm mb-6">
          Email is missing. Please request a new OTP.
        </p>
        <Link to="/forgot-password" className="btn-coral px-8 py-2.5 inline-block">
          Request OTP
        </Link>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        <Link to="/" className="flex items-center gap-2 mb-8">
          <span className="text-2xl">💪</span>
          <span className="text-xl font-bold text-white">
            Fit<span className="text-coral-500">Pro</span>
          </span>
        </Link>

        <div className="card-dark">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-coral-500/10 border border-coral-500/30 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              🔒
            </div>
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
            <p className="text-fitpro-muted text-sm mt-2">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-dark">New Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-dark pr-12"
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fitpro-muted hover:text-white text-sm transition-colors"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label className="label-dark">Confirm Password</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="input-dark"
                placeholder="Repeat your new password"
                required
              />
              {confirm && password !== confirm && (
                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (confirm.length > 0 && password !== confirm)}
              className="btn-coral w-full py-3"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Resetting...
                </span>
              ) : 'Reset Password →'}
            </button>
          </form>

          <p className="text-center text-fitpro-muted text-sm mt-5">
            <Link to="/login" className="text-coral-500 hover:text-coral-400 transition-colors">
              ← Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
