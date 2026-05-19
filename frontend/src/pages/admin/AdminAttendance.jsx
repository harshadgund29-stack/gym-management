import { useFetch } from '../../hooks/useFetch';
import { attendanceService } from '../../services/attendanceService';
import { userService } from '../../services/userService';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

// AttendanceDTO fields: id, userId, userFirstName, userLastName, userEmail,
//                       checkInTime, checkOutTime, date

export default function AdminAttendance() {
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

  // Set of user IDs already checked in today
  const checkedIn = new Set((today || []).map(a => a.userId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Attendance Management</h1>
        <p className="page-subtitle">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Today's check-ins */}
        <div className="card-dark">
          <h2 className="text-base font-semibold text-white mb-4">
            Today's Check-ins <span className="text-coral-500">({today?.length || 0})</span>
          </h2>
          {!today?.length ? (
            <p className="text-fitpro-muted text-sm text-center py-6">No check-ins yet today.</p>
          ) : (
            <div className="space-y-2">
              {today.map(a => (
                <div key={a.id}
                  className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <div>
                    <p className="font-medium text-white text-sm">
                      {a.userFirstName} {a.userLastName}
                    </p>
                    <p className="text-xs text-fitpro-muted">
                      In: {new Date(a.checkInTime).toLocaleTimeString()}
                      {a.checkOutTime && ` · Out: ${new Date(a.checkOutTime).toLocaleTimeString()}`}
                    </p>
                  </div>
                  <span className="badge-active">Present</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mark attendance for members */}
        <div className="card-dark">
          <h2 className="text-base font-semibold text-white mb-4">Mark Attendance</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {/* UserDTO fields: id, firstName, lastName, email */}
            {members?.map(m => (
              <div key={m.id}
                className="flex items-center justify-between p-3 border border-navy-500 rounded-lg hover:border-navy-400 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-coral-500/20 border border-coral-500/30 flex items-center justify-center text-coral-400 text-xs font-bold">
                    {m.firstName?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{m.firstName} {m.lastName}</p>
                    <p className="text-xs text-fitpro-muted">{m.email}</p>
                  </div>
                </div>
                {checkedIn.has(m.id)
                  ? <span className="badge-active">✓ Present</span>
                  : <button onClick={() => handleMark(m.id)} className="btn-coral btn-sm text-xs">Mark</button>
                }
              </div>
            ))}
            {!members?.length && (
              <p className="text-fitpro-muted text-sm text-center py-4">No members found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
