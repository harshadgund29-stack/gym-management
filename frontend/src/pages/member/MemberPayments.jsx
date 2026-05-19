import { Link } from 'react-router-dom';
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

export default function MemberPayments() {
  const { data: payments, loading } = useFetch(paymentService.getMyPayments);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Payment History</h1>
        <p className="page-subtitle">All your transactions</p>
      </div>

      {!payments?.length ? (
        <div className="card-dark text-center py-16">
          <div className="text-5xl mb-4">💳</div>
          <p className="text-fitpro-muted mb-4">No payments yet.</p>
          <Link to="/member/plans" className="btn-coral px-8 py-2.5">Browse Plans</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map(p => (
            <div key={p.id} className="card-dark hover:border-navy-400 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {/* planName from PaymentDTO */}
                  <p className="font-semibold text-white">{p.planName || 'Membership Plan'}</p>
                  {p.transactionId && (
                    <p className="text-xs text-fitpro-muted mt-0.5 font-mono truncate">{p.transactionId}</p>
                  )}
                  <p className="text-sm text-fitpro-muted mt-1">
                    Paid on{' '}
                    {p.paymentDate
                      ? new Date(p.paymentDate).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })
                      : '—'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-extrabold text-green-400">${p.amount}</p>
                  <span className={`mt-1 inline-block ${statusBadge[p.status] || 'badge-inactive'}`}>
                    {p.status}
                  </span>
                  {p.paymentMethod && (
                    <p className="text-xs text-fitpro-muted mt-1">{p.paymentMethod}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
