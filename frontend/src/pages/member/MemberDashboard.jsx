import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { attendanceService } from '../../services/attendanceService';
import { paymentService } from '../../services/paymentService';
import { userService } from '../../services/userService';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

// PaymentDTO fields: id, memberId, memberName, membershipId, planName,
//                   amount, status, paymentMethod, transactionId, paymentDate
// AttendanceDTO fields: id, userId, userFirstName, userLastName, userEmail,
//                       checkInTime, checkOutTime, date

export default function MemberDashboard() {
  const { data: profile }                              = useFetch(userService.getMe);
  const { data: countData }                            = useFetch(attendanceService.getMyCount);
  const { data: payments }                             = useFetch(paymentService.getMyPayments);
  const { data: attendance, loading, refetch }         = useFetch(attendanceService.getMyAttendance);
  const [marking, setMarking]                          = useState(false);

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

  // Find active membership from payment history
  // PaymentDTO has no subscriptionEndDate — use planName + status as indicator
  const hasActivePlan = (payments || []).some(p => p.status === 'COMPLETED');
  const latestPayment = (payments || []).find(p => p.status === 'COMPLETED');

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Welcome back, {profile?.firstName}! 👋</h1>
          <p className="page-subtitle">Here's your fitness overview</p>
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Check-ins"
          value={countData?.count || 0}
          icon="✅" color="green"
        />
        <StatCard
          title="Active Plan"
          value={latestPayment ? latestPayment.planName : 'None'}
          icon="📋" color="coral"
          subtitle={latestPayment ? `Paid: $${latestPayment.amount}` : 'Buy a plan to get started'}
        />
        <StatCard
          title="Total Payments"
          value={(payments || []).length}
          icon="💳" color="blue"
        />
      </div>

      {/* Membership status banner */}
      {hasActivePlan ? (
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🎉</div>
          <div>
            <p className="font-semibold text-white">Active Membership: {latestPayment?.planName}</p>
            <p className="text-sm text-fitpro-muted">
              Paid on {latestPayment?.paymentDate
                ? new Date(latestPayment.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                : '—'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">⚠️</div>
          <div>
            <p className="font-semibold text-white">No Active Membership</p>
            <p className="text-sm text-fitpro-muted">
              <Link to="/member/plans" className="text-coral-500 hover:text-coral-400 underline">
                Browse plans
              </Link>{' '}to get started.
            </p>
          </div>
        </div>
      )}

      {/* Recent attendance — AttendanceDTO fields */}
      <div className="card-dark">
        <h2 className="text-base font-semibold text-white mb-4">Recent Attendance</h2>
        {!attendance?.length ? (
          <p className="text-fitpro-muted text-sm text-center py-6">
            No attendance records yet. Click "Check In" to record your first visit!
          </p>
        ) : (
          <div className="space-y-2">
            {attendance.slice(0, 7).map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 border border-navy-500 rounded-lg">
                <div>
                  <p className="font-medium text-white text-sm">
                    {a.date
                      ? new Date(a.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                      : '—'}
                  </p>
                  <p className="text-xs text-fitpro-muted">
                    In: {a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString() : '—'}
                    {a.checkOutTime && ` · Out: ${new Date(a.checkOutTime).toLocaleTimeString()}`}
                  </p>
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
