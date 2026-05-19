import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { userService } from '../../services/userService';
import LoadingSpinner from '../../components/LoadingSpinner';

// UserDTO fields: id, firstName, lastName, email, role, phone, address, createdAt

export default function TrainerMembers() {
  const { data: members, loading } = useFetch(userService.getMembers);
  const [search, setSearch]        = useState('');

  const filtered = (members || []).filter(m =>
    `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">{members?.length || 0} registered members</p>
        </div>
        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-dark w-64"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(m => (
          <div key={m.id} className="card-dark hover:border-navy-400 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-coral-500/20 border border-coral-500/30 flex items-center justify-center text-coral-400 font-bold text-sm flex-shrink-0">
                {m.firstName?.[0]}{m.lastName?.[0]}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">{m.firstName} {m.lastName}</p>
                <p className="text-xs text-fitpro-muted truncate">{m.email}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-navy-500/50 flex items-center justify-between">
              {/* UserDTO uses "phone" not "phoneNumber" */}
              <span className="text-xs text-fitpro-muted">{m.phone || 'No phone'}</span>
              <span className="badge-role">{m.role}</span>
            </div>
          </div>
        ))}
      </div>

      {!filtered.length && (
        <div className="card-dark text-center py-12">
          <p className="text-fitpro-muted">No members found.</p>
        </div>
      )}
    </div>
  );
}
