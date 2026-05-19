import { useFetch } from '../../hooks/useFetch';
import { paymentService } from '../../services/paymentService';
import LoadingSpinner from '../../components/LoadingSpinner';

// PaymentDTO fields: id, memberId, memberName, membershipId, planName,
//                   amount, status, paymentMethod, transactionId, paymentDate
const statusBadge = {
  COMPLETED: 'badge-active',
  PENDING:   'badge-pending',
  FAILED:    'badge-failed',
  REFUNDED:  'badge-inactive',
};

export default function AdminPayments() {
  const { data: payments, loading } = useFetch(paymentService.getAllPayments);
  const { data: revenue }           = useFetch(paymentService.getRevenue);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Payment Management</h1>
        <p className="page-subtitle">All transactions in the system</p>
      </div>

      {/* Revenue summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-dark border-coral-500/30">
          <p className="text-xs text-fitpro-muted uppercase tracking-wider font-semibold">Total Revenue</p>
          <p className="text-4xl font-extrabold text-coral-500 mt-1">
            ${Number(revenue?.totalRevenue || 0).toFixed(2)}
          </p>
        </div>
        <div className="card-dark border-green-500/30">
          <p className="text-xs text-fitpro-muted uppercase tracking-wider font-semibold">Total Payments</p>
          <p className="text-4xl font-extrabold text-green-400 mt-1">
            {revenue?.totalPayments || 0}
          </p>
        </div>
      </div>

      {/* Payments table */}
      <div className="card-dark p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Member</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments?.map(p => (
                <tr key={p.id}>
                  <td className="text-fitpro-muted text-xs font-mono">
                    {p.transactionId ? p.transactionId.slice(0, 14) + '...' : '—'}
                  </td>
                  {/* memberName comes directly from PaymentDTO */}
                  <td className="font-medium text-white">{p.memberName || '—'}</td>
                  {/* planName comes directly from PaymentDTO */}
                  <td className="text-fitpro-muted">{p.planName || '—'}</td>
                  <td className="font-bold text-green-400">${p.amount}</td>
                  <td className="text-fitpro-muted">{p.paymentMethod || '—'}</td>
                  <td className="text-fitpro-muted">
                    {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <span className={statusBadge[p.status] || 'badge-inactive'}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!payments?.length && (
            <p className="text-center text-fitpro-muted py-10">No payments found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
