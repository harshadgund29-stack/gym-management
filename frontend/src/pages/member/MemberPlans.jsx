import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { planService } from '../../services/planService';
import PaymentForm from '../../components/PaymentForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

// MembershipPlanDTO fields: id, name, description, price, durationMonths, features, active

export default function MemberPlans() {
  const { data: plans, loading } = useFetch(planService.getActivePlans); // GET /api/plans/active
  const [selected, setSelected]  = useState(null);

  if (loading) return <LoadingSpinner />;

  if (selected) return (
    <div className="space-y-6 max-w-md">
      <button
        onClick={() => setSelected(null)}
        className="text-coral-500 hover:text-coral-400 text-sm flex items-center gap-1 transition-colors"
      >
        ← Back to Plans
      </button>
      <div className="card-dark">
        <h1 className="page-title mb-1">Complete Payment</h1>
        <p className="page-subtitle mb-6">Secure payment via PayPal</p>
        <PaymentForm
          planId={selected.id}
          planName={selected.name}
          amount={selected.price}
          onSuccess={() => {
            setSelected(null);
            toast.success('Membership activated! Check your email for confirmation.');
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Membership Plans</h1>
        <p className="page-subtitle">Choose the plan that fits your goals</p>
      </div>

      {!plans?.length ? (
        <div className="card-dark text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-fitpro-muted">No active plans available right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div
              key={plan.id}
              className={`card-dark flex flex-col relative ${
                i === 1 ? 'border-coral-500/60 shadow-glow pt-9' : ''
              }`}
            >
              {i === 1 && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-coral-500 text-white text-xs font-bold px-6 py-2 rounded-full shadow-lg inline-block whitespace-nowrap">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-fitpro-muted text-sm mt-1 mb-4">{plan.description}</p>

                <div className="mb-5">
                  <span className="text-3xl font-extrabold text-white">${plan.price}</span>
                  <span className="text-fitpro-muted text-sm">
                    {' '}/ {plan.durationMonths} month{plan.durationMonths > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Features from MembershipPlanDTO.features (comma-separated string) */}
                <ul className="space-y-2 text-sm text-fitpro-muted">
                  {plan.features
                    ? plan.features.split(',').map(f => (
                        <li key={f} className="flex items-center gap-2">
                          <span className="text-coral-500">✓</span>
                          {f.trim()}
                        </li>
                      ))
                    : (
                      <>
                        <li className="flex items-center gap-2"><span className="text-coral-500">✓</span> Full gym access</li>
                        <li className="flex items-center gap-2"><span className="text-coral-500">✓</span> Attendance tracking</li>
                        {plan.durationMonths >= 3  && <li className="flex items-center gap-2"><span className="text-coral-500">✓</span> Group classes</li>}
                        {plan.durationMonths >= 12 && <li className="flex items-center gap-2"><span className="text-coral-500">✓</span> Personal locker</li>}
                      </>
                    )
                  }
                </ul>
              </div>

              <button
                onClick={() => setSelected(plan)}
                className={`mt-6 w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                  i === 1 ? 'btn-coral' : 'btn-outline'
                }`}
              >
                Choose Plan — Pay with PayPal
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
