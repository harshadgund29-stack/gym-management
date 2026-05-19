import { useFetch } from '../../hooks/useFetch';
import { attendanceService } from '../../services/attendanceService';
import { userService } from '../../services/userService';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

// AttendanceDTO: id, userId, userFirstName, userLastName, checkInTime, checkOutTime, date
// UserDTO:       id, firstName, lastName, email, role, phone

export default function TrainerAttendance() {
  const { data: today, loading, refetch } = useFetch(attendanceService.getTodayAttendance);
  const { data: members }                 = useFetch(userService.getMembers);

  const handleMark = async (userId) => {
    try {
      await attendanceService.markForUser(userId);
      toast.success('Attendance marked!');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance.');
    }
  };

  if (loading) return <LoadingSpinner />;

  // Set of user IDs already checked in today (AttendanceDTO.userId)
  const checkedIn = new Set((today || []).map(a => a.userId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Attendance</h1>
        <p className="page-subtitle">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
          {' — '}
          <span className="text-coral-500 font-semibold">{today?.length || 0}</span> check-ins today
        </p>
      </div>

      <div className="card-dark">
        <h2 className="text-base font-semibold text-white mb-4">Mark Attendance</h2>
        <div className="space-y-2">
          {members?.map(m => (
            <div key={m.id}
              className="flex items-center justify-between p-3 border border-navy-500 rounded-lg hover:border-navy-400 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-coral-500/20 border border-coral-500/30 flex items-center justify-center text-coral-400 text-sm font-bold flex-shrink-0">
                  {m.firstName?.[0]}
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{m.firstName} {m.lastName}</p>
                  <p className="text-xs text-fitpro-muted">{m.email}</p>
                </div>
              </div>
              {checkedIn.has(m.id)
                ? <span className="badge-active">✓ Present</span>
                : (
                  <button onClick={() => handleMark(m.id)} className="btn-coral btn-sm text-xs">
                    Mark Present
                  </button>
                )
              }
            </div>
          ))}
          {!members?.length && (
            <p className="text-fitpro-muted text-sm text-center py-6">No members found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
