import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import './ForgotPassword.css';

const STEPS = [
  { num: 1, label: 'Email' },
  { num: 2, label: 'Verify' },
  { num: 3, label: 'Reset' },
];

function ForgotPassword() {
  const [email, setEmail]               = useState('');
  const [otp, setOtp]                   = useState('');
  const [newPassword, setNewPassword]   = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep]                 = useState(1);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [loading, setLoading]           = useState(false);
  const [done, setDone]                 = useState(false);
  const [showPass, setShowPass]         = useState(false);
  const navigate = useNavigate();

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return setError('Please enter your registered email address.');
    clearMessages(); setLoading(true);
    try {
      await axios.post(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
      setSuccess('✅ Verification code sent! Check your Gmail inbox (and spam folder).');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) return setError('Please enter the complete 6-digit OTP.');
    clearMessages(); setLoading(true);
    try {
      const res = await axios.post(`/auth/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
      if (res.data.verified) {
        setSuccess('✅ OTP verified! Now set your new password.');
        setStep(3);
      } else {
        setError('Invalid or expired verification code. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return setError('Please enter a new password.');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    clearMessages(); setLoading(true);
    try {
      await axios.post('/auth/reset-password', {
        email: email.trim(), otp: otp.trim(), newPassword: newPassword.trim(),
      });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Please restart the flow.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fp-page">
      <div className="fp-card">
        <div className="fp-header">
          <span className="fp-logo">🔐</span>
          <h2>Password Recovery</h2>
          <p>Regain access to your FitPro account</p>
        </div>

        {/* Step Progress */}
        <div className="fp-steps">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className={`fp-step ${step === s.num ? 'active' : step > s.num ? 'done' : ''}`}>
                <div className="fp-step-circle">
                  {step > s.num ? '✓' : s.num}
                </div>
                <span className="fp-step-label">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`fp-step-line ${step > s.num ? 'done' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {error   && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {done ? (
          <div className="fp-success-state">
            <span className="fp-success-icon">🎉</span>
            <h3>Password Reset!</h3>
            <p>Your password has been updated successfully.<br />Redirecting to login in 3 seconds...</p>
          </div>
        ) : (
          <>
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="fp-form">
                <p className="fp-form-info">
                  Enter your registered email address and we'll send you a 6-digit verification code.
                </p>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" placeholder="Enter your registered email..."
                    value={email} onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                    required disabled={loading} autoFocus />
                </div>
                <button type="submit" className="fp-btn fp-btn-primary" disabled={loading}>
                  {loading ? <><span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Sending...</> : '⚡ Send Verification Code'}
                </button>
                <div className="fp-footer">
                  Remembered it? <Link to="/login">Back to Login</Link>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="fp-form">
                <p className="fp-form-info">
                  We sent a code to <strong>{email}</strong>. Enter the 6 digits below. Valid for 5 minutes.
                </p>
                <div className="form-group">
                  <label>6-Digit Verification Code</label>
                  <input type="text" placeholder="0 0 0 0 0 0"
                    maxLength="6" className="otp-input"
                    value={otp} onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); clearMessages(); }}
                    required disabled={loading} autoFocus />
                </div>
                <button type="submit" className="fp-btn fp-btn-primary" disabled={loading || otp.length < 6}>
                  {loading ? <><span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Verifying...</> : '✓ Verify Code'}
                </button>
                <button type="button" className="fp-btn fp-btn-secondary"
                  onClick={() => { setStep(1); clearMessages(); setOtp(''); }} disabled={loading}>
                  ← Change Email
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="fp-form">
                <p className="fp-form-info">
                  Choose a strong new password with at least 6 characters.
                </p>
                <div className="form-group">
                  <label>New Password</label>
                  <div className="input-wrapper">
                    <input type={showPass ? 'text' : 'password'}
                      placeholder="Min 6 characters..."
                      value={newPassword} onChange={(e) => { setNewPassword(e.target.value); clearMessages(); }}
                      required disabled={loading} autoFocus />
                    <button type="button" className="input-toggle"
                      onClick={() => setShowPass(p => !p)}>
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input type="password" placeholder="Re-enter new password..."
                    value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); clearMessages(); }}
                    required disabled={loading} />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <span className="field-error">Passwords do not match</span>
                  )}
                  {confirmPassword && newPassword === confirmPassword && confirmPassword.length >= 6 && (
                    <span className="field-success">✓ Passwords match</span>
                  )}
                </div>
                <button type="submit" className="fp-btn fp-btn-primary"
                  disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}>
                  {loading ? <><span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Resetting...</> : '🔒 Reset Password'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
