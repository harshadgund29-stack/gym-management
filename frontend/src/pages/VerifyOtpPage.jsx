import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const OTP_TTL_SECONDS = 5 * 60; // 5 minutes — must match backend

/**
 * VerifyOtpPage — step 2 of the forgot-password flow.
 *
 * - Reads email from React Router state (not query param).
 * - Shows a live 5-minute countdown matching the backend OTP expiry.
 * - Provides a "Resend OTP" button when the timer expires.
 * - On success: navigates to /reset-password with email in state.
 */
export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email    = location.state?.email || '';

  const [otp,       setOtp]       = useState('');
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [seconds,   setSeconds]   = useState(OTP_TTL_SECONDS);
  const expired = seconds <= 0;

  // ── Countdown timer ───────────────────────────────────────
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // ── Resend OTP ────────────────────────────────────────────
  const handleResend = useCallback(async () => {
    setResending(true);
    try {
      await authService.forgotPassword(email);
      setSeconds(OTP_TTL_SECONDS);
      setOtp('');
      toast.success('New OTP sent! Check your inbox.');
    } catch {
      toast.success('If that email is registered, a new OTP has been sent.');
      setSeconds(OTP_TTL_SECONDS);
    } finally {
      setResending(false);
    }
  }, [email]);

  // ── Guard: no email in state ──────────────────────────────
  if (!email) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-6">
        <div className="card-dark text-center max-w-sm w-full">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Session Expired</h2>
          <p className="text-fitpro-muted text-sm mb-6">
            Please start the password reset process again.
          </p>
          <Link to="/forgot-password" className="btn-coral px-8 py-2.5 inline-block">
            Request OTP
          </Link>
        </div>
      </div>
    );
  }

  // ── Submit OTP ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (expired) {
      toast.error('OTP has expired. Please request a new one.');
      return;
    }
    const otpNum = parseInt(otp, 10);
    if (isNaN(otpNum) || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP from your email.');
      return;
    }
    setLoading(true);
    try {
      await authService.verifyOtp({ email, otp: otpNum });
      toast.success('OTP verified! Set your new password.');
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
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
              📧
            </div>
            <h1 className="text-2xl font-bold text-white">Verify OTP</h1>
            <p className="text-fitpro-muted text-sm mt-2">
              Enter the 6-digit code sent to
            </p>
            <p className="text-white font-semibold text-sm mt-1">{email}</p>
          </div>

          {/* Countdown timer */}
          <div className={`text-center mb-5 py-2 rounded-xl border ${
            expired
              ? 'bg-red-500/10 border-red-500/30'
              : seconds <= 60
                ? 'bg-yellow-500/10 border-yellow-500/30'
                : 'bg-coral-500/10 border-coral-500/20'
          }`}>
            {expired ? (
              <p className="text-red-400 text-sm font-semibold">
                ⏰ OTP expired — request a new one below
              </p>
            ) : (
              <p className={`text-sm font-semibold ${seconds <= 60 ? 'text-yellow-400' : 'text-coral-400'}`}>
                ⏱ Expires in{' '}
                <span className="font-mono text-base">{formatTime(seconds)}</span>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-dark">6-Digit OTP</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-dark text-center text-2xl tracking-[0.5em] font-bold"
                placeholder="000000"
                required
                autoComplete="one-time-code"
                autoFocus
                disabled={expired}
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6 || expired}
              className="btn-coral w-full py-3"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : 'Verify OTP →'}
            </button>
          </form>

          {/* Resend section */}
          <div className="mt-5 text-center space-y-2">
            {expired ? (
              <button
                onClick={handleResend}
                disabled={resending}
                className="btn-coral w-full py-2.5"
              >
                {resending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : '🔄 Resend OTP'}
              </button>
            ) : (
              <p className="text-fitpro-muted text-sm">
                Didn't receive it?{' '}
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-coral-500 hover:text-coral-400 font-medium transition-colors disabled:opacity-50"
                >
                  {resending ? 'Sending...' : 'Resend OTP'}
                </button>
              </p>
            )}
            <p className="text-fitpro-muted text-sm">
              <Link to="/login" className="text-coral-500 hover:text-coral-400 transition-colors">
                ← Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
