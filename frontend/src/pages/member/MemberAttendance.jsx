import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { attendanceService } from '../../services/attendanceService';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

// AttendanceDTO fields: id, userId, userFirstName, userLastName, userEmail,
//                       checkInTime, checkOutTime, date

export default function MemberAttendance() {
  const { data: attendance, loading, refetch } = useFetch(attendanceService.getMyAttendance);
  const { data: countData }                    = useFetch(attendanceService.getMyCount);
  const [marking, setMarking]                  = useState(false);

  const handleCheckIn = async () => {
    setMarking(true);
    try {
      await attendanceService.markAttendance();
      toast.success('Attendance marked!');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance.');
    } finally { setMarking(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Attendance</h1>
          <p className="page-subtitle">
            Total check-ins:{' '}
            <span className="text-coral-500 font-bold">{countData?.count || 0}</span>
          </p>
        </div>
        <button onClick={handleCheckIn} disabled={marking} className="btn-coral">
          {marking ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Marking...
            </span>
          ) : '✅ Check In / Out'}
        </button>
      </div>

      {!attendance?.length ? (
        <div className="card-dark text-center py-16">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-fitpro-muted">No attendance records yet.</p>
          <p className="text-fitpro-muted text-sm mt-1">Click "Check In" to record your first visit!</p>
        </div>
      ) : (
        <div className="card-dark p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map(a => {
                  const ci  = a.checkInTime  ? new Date(a.checkInTime)  : null;
                  const co  = a.checkOutTime ? new Date(a.checkOutTime) : null;
                  const dur = ci && co
                    ? `${Math.round((co - ci) / 60000)} min`
                    : '—';
                  return (
                    <tr key={a.id}>
                      <td className="font-medium text-white">
                        {a.date
                          ? new Date(a.date).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="text-fitpro-muted">
                        {a.date
                          ? new Date(a.date).toLocaleDateString('en-US', { weekday: 'long' })
                          : '—'}
                      </td>
                      <td className="text-fitpro-muted">
                        {ci ? ci.toLocaleTimeString() : '—'}
                      </td>
                      <td>
                        {co
                          ? <span className="text-fitpro-muted">{co.toLocaleTimeString()}</span>
                          : <span className="badge-pending">Active</span>}
                      </td>
                      <td className="text-fitpro-muted">{dur}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
