import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { userService } from '../../services/userService';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

// UserDTO fields: id, firstName, lastName, email, role (enum string e.g. "ADMIN"),
//                phone, address, createdAt
// Note: UserDTO has no "status" field — the User entity doesn't have one either.

export default function AdminUsers() {
  const { data: users, loading, refetch } = useFetch(userService.getAllUsers);
  const [search, setSearch] = useState('');

  const filtered = (users || []).filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleRole = async (id, role) => {
    try {
      await userService.changeRole(id, role);
      toast.success('Role updated');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users?.length || 0} total users</p>
        </div>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-dark w-64"
        />
      </div>

      <div className="card-dark p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td className="font-medium text-white">{u.firstName} {u.lastName}</td>
                  <td className="text-fitpro-muted">{u.email}</td>
                  {/* UserDTO uses "phone" not "phoneNumber" */}
                  <td className="text-fitpro-muted">{u.phone || '—'}</td>
                  {/* role is a plain string e.g. "ADMIN", "MEMBER", "TRAINER" */}
                  <td>
                    <span className="badge-role">{u.role}</span>
                  </td>
                  <td className="text-fitpro-muted text-xs">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <select
                      defaultValue=""
                      onChange={e => { if (e.target.value) handleRole(u.id, e.target.value); }}
                      className="bg-navy-600 border border-navy-500 text-fitpro-muted text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-coral-500"
                    >
                      <option value="" disabled>Change Role</option>
                      <option value="ADMIN">Admin</option>
                      <option value="TRAINER">Trainer</option>
                      <option value="MEMBER">Member</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <p className="text-center text-fitpro-muted py-10">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
