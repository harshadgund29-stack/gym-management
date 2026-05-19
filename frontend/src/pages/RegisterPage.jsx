import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

// This backend (com.gym) does NOT use OTP — registration returns a JWT directly.
export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', phone: '', address: '',
    role: 'MEMBER',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.register(form);
      // Backend returns JWT immediately — store and redirect
      localStorage.setItem('gymUser', JSON.stringify(data));
      toast.success(`Welcome, ${data.firstName}! Account created.`);
      navigate('/member/dashboard');
    } catch (err) {
      const errData = err.response?.data;
      if (errData && typeof errData === 'object' && !errData.message) {
        Object.values(errData).forEach(msg => toast.error(msg));
      } else {
        toast.error(errData?.message || 'Registration failed. Please try again.');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-fitpro-bg flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <span className="text-2xl">💪</span>
          <span className="text-xl font-bold text-white">Fit<span className="text-coral-500">Pro</span></span>
        </Link>

        <div className="card-dark">
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-fitpro-muted text-sm mb-6">Join FitPro and start your fitness journey</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-dark">First Name</label>
                <input type="text" value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  className="input-dark" placeholder="John" required />
              </div>
              <div>
                <label className="label-dark">Last Name</label>
                <input type="text" value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  className="input-dark" placeholder="Doe" required />
              </div>
            </div>

            <div>
              <label className="label-dark">Email Address</label>
              <input type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-dark" placeholder="you@example.com" required />
            </div>

            <div>
              <label className="label-dark">Password</label>
              <input type="password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="input-dark" placeholder="Minimum 6 characters" required minLength={6} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-dark">Phone <span className="text-fitpro-muted">(optional)</span></label>
                <input type="tel" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="input-dark" placeholder="555-0100" />
              </div>
              <div>
                <label className="label-dark">Register as</label>
                <select value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="input-dark">
                  <option value="MEMBER">Member</option>
                  <option value="TRAINER">Trainer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label-dark">Address <span className="text-fitpro-muted">(optional)</span></label>
              <input type="text" value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="input-dark" placeholder="123 Fitness Street" />
            </div>

            <button type="submit" disabled={loading} className="btn-coral w-full py-3 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-fitpro-muted text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-coral-500 hover:text-coral-400 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
