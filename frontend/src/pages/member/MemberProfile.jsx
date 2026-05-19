import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { userService } from '../../services/userService';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

// UserDTO fields: id, firstName, lastName, email, role, phone, address, createdAt

export default function MemberProfile() {
  const { data: profile, loading, refetch } = useFetch(userService.getMe);
  const [editing, setEditing]               = useState(false);
  const [form, setForm]                     = useState({});
  const [saving, setSaving]                 = useState(false);

  const handleEdit = () => {
    setForm({
      firstName: profile.firstName,
      lastName:  profile.lastName,
      // UserDTO uses "phone" not "phoneNumber"
      phone:     profile.phone    || '',
      address:   profile.address  || '',
    });
    setEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // PUT /api/users/profile — UpdateProfileRequest: firstName, lastName, phone, address
      await userService.updateMe(form);
      toast.success('Profile updated!');
      setEditing(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your personal information</p>
      </div>

      <div className="card-dark">
        {/* Avatar header */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-navy-500">
          <div className="w-16 h-16 rounded-2xl bg-coral-500 flex items-center justify-center text-white text-2xl font-bold shadow-coral flex-shrink-0">
            {profile?.firstName?.[0]}{profile?.lastName?.[0]}
          </div>
          <div>
            <p className="text-xl font-bold text-white">
              {profile?.firstName} {profile?.lastName}
            </p>
            {/* role is a plain string e.g. "MEMBER" */}
            <p className="text-sm text-fitpro-muted mt-0.5">{profile?.role}</p>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-dark">First Name</label>
                <input type="text" value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  className="input-dark" required />
              </div>
              <div>
                <label className="label-dark">Last Name</label>
                <input type="text" value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  className="input-dark" required />
              </div>
            </div>
            <div>
              <label className="label-dark">Phone Number</label>
              <input type="tel" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="input-dark" placeholder="+1 234 567 8900" />
            </div>
            <div>
              <label className="label-dark">Address</label>
              <input type="text" value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="input-dark" placeholder="123 Fitness Street" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-coral">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-outline">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-1">
            {[
              { label: 'Email Address', value: profile?.email,   icon: '📧' },
              { label: 'Phone Number',  value: profile?.phone    || 'Not set', icon: '📱' },
              { label: 'Address',       value: profile?.address  || 'Not set', icon: '📍' },
              { label: 'Member Since',  value: profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })
                  : '—',
                icon: '📅' },
            ].map(({ label, value, icon }) => (
              <div key={label}
                className="flex items-center justify-between py-3.5 border-b border-navy-500/50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-base">{icon}</span>
                  <span className="text-fitpro-muted text-sm">{label}</span>
                </div>
                <span className="font-medium text-white text-sm">{value}</span>
              </div>
            ))}
            <div className="pt-4">
              <button onClick={handleEdit} className="btn-coral">Edit Profile</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
