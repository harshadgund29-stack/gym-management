import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('OTP sent! Check your inbox.');
    } catch (err) {
      // Always show success to avoid email enumeration
      setSent(true);
      toast.success('If that email is registered, an OTP has been sent.');
    } finally {
      setLoading(false);
    }
  };

  const goToVerify = () => {
    // Pass email via router state — keeps it out of the URL bar and browser history
    navigate('/verify-otp', { state: { email } });
  };

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
              🔑
            </div>
            <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
            <p className="text-fitpro-muted text-sm mt-2">
              Enter your email and we’ll send you an OTP for password reset
            </p>

          </div>

          {sent ? (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                <p className="text-green-400 font-semibold text-lg">✅ Email Sent!</p>
                <p className="text-fitpro-muted text-sm mt-2">
                  Check your inbox at <span className="text-white font-medium">{email}</span>.
                  <br />The OTP expires in <strong className="text-white">5 minutes</strong>.

                </p>
              </div>
              <div className="space-y-4">
                <p className="text-center text-fitpro-muted text-sm">
                  Didn't receive it? Check your spam folder or{' '}
                  <button
                    onClick={() => setSent(false)}
                    className="text-coral-500 hover:text-coral-400 font-medium transition-colors"
                  >
                    try again
                  </button>
                </p>

                <Link
                  to="/verify-otp"
                  onClick={goToVerify}
                  className="btn-coral w-full py-3 block text-center"
                >
                  Verify OTP →
                </Link>

                <Link to="/login" className="btn-coral/70 w-full py-3 block text-center">
                  Back to Login
                </Link>
              </div>

            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label-dark">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-dark"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-coral w-full py-3"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  'Send OTP →'
                )}
              </button>
            </form>
          )}

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
