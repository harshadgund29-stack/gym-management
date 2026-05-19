import { useFetch } from '../../hooks/useFetch';
import { userService } from '../../services/userService';
import { attendanceService } from '../../services/attendanceService';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';

// AttendanceDTO fields: id, userId, userFirstName, userLastName, checkInTime, checkOutTime, date

export default function TrainerDashboard() {
  const { user }                          = useAuth();
  const { data: members, loading }        = useFetch(userService.getMembers);
  const { data: today }                   = useFetch(attendanceService.getTodayAttendance);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Welcome, {user?.firstName}! 🏋️</h1>
        <p className="page-subtitle">Monitor your members' activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Total Members"     value={members?.length || 0} icon="👥" color="blue"  />
        <StatCard title="Today's Check-ins" value={today?.length   || 0} icon="✅" color="green" />
      </div>

      <div className="card-dark">
        <h2 className="text-base font-semibold text-white mb-4">
          Today's Attendance
          <span className="ml-2 text-sm font-normal text-fitpro-muted">
            ({today?.length || 0} members)
          </span>
        </h2>
        {!today?.length ? (
          <p className="text-fitpro-muted text-sm text-center py-8">No check-ins today yet.</p>
        ) : (
          <div className="space-y-2">
            {today.map(a => (
              <div key={a.id}
                className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold">
                    {a.userFirstName?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">
                      {a.userFirstName} {a.userLastName}
                    </p>
                    <p className="text-xs text-fitpro-muted">
                      {a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString() : '—'}
                    </p>
                  </div>
                </div>
                <span className="badge-active">Present</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
