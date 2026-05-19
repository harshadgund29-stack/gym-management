import { useFetch } from '../../hooks/useFetch';
import { paymentService } from '../../services/paymentService';
import { userService } from '../../services/userService';
import { attendanceService } from '../../services/attendanceService';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const COLORS = ['#e8445a', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const ChartTooltip = ({ active, payload }) => {
  if (active && payload?.length) return (
    <div className="bg-navy-700 border border-navy-500 rounded-lg px-3 py-2 text-sm">
      <p className="text-white font-medium">{payload[0].name}</p>
      <p className="text-coral-400">{payload[0].value}</p>
    </div>
  );
  return null;
};

export default function AdminReports() {
  const { data: payments,   loading } = useFetch(paymentService.getAllPayments);
  const { data: members }             = useFetch(userService.getMembers);
  const { data: attendance }          = useFetch(attendanceService.getAllAttendance);

  if (loading) return <LoadingSpinner />;

  // Plan distribution pie — PaymentDTO.planName
  const planCounts = {};
  (payments || []).filter(p => p.status === 'COMPLETED').forEach(p => {
    const n = p.planName || 'Unknown';
    planCounts[n] = (planCounts[n] || 0) + 1;
  });
  const pieData = Object.entries(planCounts).map(([name, value]) => ({ name, value }));

  // Monthly attendance line — AttendanceDTO.date
  const attByMonth = {};
  (attendance || []).forEach(a => {
    if (!a.date) return;
    const m = new Date(a.date).toLocaleString('default', { month: 'short', year: '2-digit' });
    attByMonth[m] = (attByMonth[m] || 0) + 1;
  });
  const attData = Object.entries(attByMonth).map(([month, count]) => ({ month, count }));

  const totalRevenue = (payments || [])
    .filter(p => p.status === 'COMPLETED')
    .reduce((s, p) => s + parseFloat(p.amount || 0), 0);

  const exportCSV = () => {
    const rows = [['Transaction ID', 'Member', 'Plan', 'Amount', 'Date', 'Status']];
    (payments || []).forEach(p => rows.push([
      p.transactionId || '',
      p.memberName || '',
      p.planName || '',
      p.amount || '',
      p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '',
      p.status || '',
    ]));
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'payments_report.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Insights into your gym's performance</p>
        </div>
        <button onClick={exportCSV} className="btn-outline">📥 Export CSV</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Members',       value: members?.length || 0,                                                    color: 'text-blue-400'  },
          { label: 'Successful Payments', value: (payments || []).filter(p => p.status === 'COMPLETED').length,            color: 'text-green-400' },
          { label: 'Total Check-ins',     value: attendance?.length || 0,                                                  color: 'text-yellow-400'},
          { label: 'Total Revenue',       value: `$${totalRevenue.toFixed(2)}`,                                            color: 'text-coral-500' },
        ].map(s => (
          <div key={s.label} className="card-dark text-center">
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-fitpro-muted mt-1 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-dark">
          <h2 className="text-base font-semibold text-white mb-4">Plan Distribution</h2>
          {pieData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ color: '#8892a4', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-fitpro-muted text-sm text-center py-10">No payment data yet.</p>}
        </div>

        <div className="card-dark">
          <h2 className="text-base font-semibold text-white mb-4">Monthly Attendance</h2>
          {attData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={attData} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
                <XAxis dataKey="month" tick={{ fill: '#8892a4', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8892a4', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="count" stroke="#e8445a" strokeWidth={2} dot={{ fill: '#e8445a', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-fitpro-muted text-sm text-center py-10">No attendance data yet.</p>}
        </div>
      </div>
    </div>
  );
}
