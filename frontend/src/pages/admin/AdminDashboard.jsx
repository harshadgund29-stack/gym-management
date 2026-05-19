import { useFetch } from '../../hooks/useFetch';
import { paymentService } from '../../services/paymentService';
import { attendanceService } from '../../services/attendanceService';
import { userService } from '../../services/userService';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="bg-navy-700 border border-navy-500 rounded-lg px-3 py-2 text-sm">
      <p className="text-fitpro-muted">{label}</p>
      <p className="text-coral-400 font-bold">${payload[0].value?.toFixed(2)}</p>
    </div>
  );
  return null;
};

export default function AdminDashboard() {
  const { data: revenue, loading: r } = useFetch(paymentService.getRevenue);
  const { data: members, loading: m } = useFetch(userService.getMembers);
  const { data: today, loading: a } = useFetch(attendanceService.getTodayAttendance);
  const { data: payments } = useFetch(paymentService.getAllPayments);

  if (r || m || a) return <LoadingSpinner />;

  // Build monthly revenue chart from payments list
  const monthlyData = {};
  (payments || [])
    .filter(p => p.status === 'COMPLETED')
    .forEach(p => {
      const month = new Date(p.paymentDate).toLocaleString('default', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + parseFloat(p.amount || 0);
    });
  const chartData = Object.entries(monthlyData).map(([month, rev]) => ({ month, revenue: rev }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Overview of your gym's performance</p>
      </div>

      {/* Stats — revenue fields match PaymentService.getRevenue() Map keys */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Members"
          value={members?.length || 0}
          icon="👥" color="blue" />
        <StatCard title="Total Revenue"
          value={`$${Number(revenue?.totalRevenue || 0).toFixed(2)}`}
          icon="💰" color="coral" />
        <StatCard title="Total Payments"
          value={revenue?.totalPayments || 0}
          icon="💳" color="green" />
        <StatCard title="Today's Check-ins"
          value={today?.length || 0}
          icon="✅" color="yellow" />
      </div>

      {/* Revenue bar chart */}
      {chartData.length > 0 && (
        <div className="card-dark">
          <h2 className="text-lg font-semibold text-white mb-6">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
              <XAxis dataKey="month" tick={{ fill: '#8892a4', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8892a4', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(232,68,90,0.05)' }} />
              <Bar dataKey="revenue" fill="#e8445a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Today's attendance — AttendanceDTO fields: userFirstName, userLastName */}
      <div className="card-dark">
        <h2 className="text-lg font-semibold text-white mb-4">
          Today's Check-ins
          <span className="ml-2 text-sm font-normal text-fitpro-muted">({today?.length || 0} members)</span>
        </h2>
        {!today?.length ? (
          <p className="text-fitpro-muted text-sm py-4 text-center">No check-ins today yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead><tr><th>Member</th><th>Check-in</th><th>Check-out</th></tr></thead>
              <tbody>
                {today.map(a => (
                  <tr key={a.id}>
                    <td className="font-medium">{a.userFirstName} {a.userLastName}</td>
                    <td className="text-fitpro-muted">{new Date(a.checkInTime).toLocaleTimeString()}</td>
                    <td className="text-fitpro-muted">
                      {a.checkOutTime
                        ? new Date(a.checkOutTime).toLocaleTimeString()
                        : <span className="badge-pending">Active</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
