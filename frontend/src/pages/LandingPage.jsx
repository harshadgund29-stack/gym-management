import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { planService } from '../services/planService';
import ThemeToggle from '../components/ThemeToggle';
import Card from '../components/Card';

// ── Data ──────────────────────────────────────────────────────

const features = [
  {
    icon: '👥',
    title: 'Member Management',
    description: 'Register, track, and manage all gym members with detailed profiles and full membership history.',
  },
  {
    icon: '🏋️',
    title: 'Trainer Dashboard',
    description: 'Trainers can manage sessions, assign personalised workout plans, and track member progress.',
  },
  {
    icon: '💳',
    title: 'Online Payments',
    description: 'Secure payments via PayPal. Automatic receipts and complete payment history at a glance.',
  },
  {
    icon: '📧',
    title: 'Email Automation',
    description: 'OTP verification, payment receipts, and renewal reminders — all sent automatically via Gmail.',
  },
  {
    icon: '✅',
    title: 'Attendance Tracking',
    description: 'One-click check-in and check-out. View attendance history and generate daily reports instantly.',
  },
  {
    icon: '📊',
    title: 'Analytics & Reports',
    description: 'Revenue charts, member growth, attendance trends — export to CSV anytime with one click.',
  },
  {
    icon: '🔐',
    title: 'JWT Security',
    description: 'Role-based access control for Admin, Trainer, and Member with industry-standard JWT tokens.',
  },
  {
    icon: '📋',
    title: 'Membership Plans',
    description: 'Create flexible plans with custom durations and pricing. Activate or deactivate anytime.',
  },
];

const roles = [
  {
    icon: '👑',
    title: 'Admin',
    description: 'Full system control — manage members, trainers, plans, payments, and view analytics.',
    accentColor: 'from-coral-500/30 to-coral-600/20',
  },
  {
    icon: '🏋️',
    title: 'Trainer',
    description: 'Manage assigned members, create workout plans, schedule sessions, and track attendance.',
    accentColor: 'from-blue-500/30 to-blue-600/20',
  },
  {
    icon: '💪',
    title: 'Member',
    description: 'Browse plans, make payments, check in daily, and track your personal fitness journey.',
    accentColor: 'from-green-500/30 to-green-600/20',
  },
];

const steps = [
  {
    step: '01',
    icon: '📝',
    title: 'Register & Verify',
    description: 'Create your account and verify your email with a secure OTP code sent instantly.',
  },
  {
    step: '02',
    icon: '💳',
    title: 'Choose a Plan',
    description: 'Browse membership plans and pay securely via PayPal. Receipt sent to your email.',
  },
  {
    step: '03',
    icon: '🚀',
    title: 'Start Training',
    description: 'Check in daily, track attendance, and manage your fitness journey from your dashboard.',
  },
];

const defaultPlans = [
  { id: 1, name: 'Basic Monthly',  description: 'Cardio + weights area access',          price: '29.99',  durationMonths: 1  },
  { id: 2, name: 'Pro Quarterly',  description: 'All equipment + group classes',          price: '79.99',  durationMonths: 3  },
  { id: 3, name: 'Elite Annual',   description: 'All access + locker + PT sessions',      price: '299.99', durationMonths: 12 },
];

// ── Plan feature list helper ──────────────────────────────────
function PlanFeatures({ durationMonths }) {
  const items = [
    { label: 'Full gym access',       show: true },
    { label: 'Attendance tracking',   show: true },
    { label: 'Group classes',         show: durationMonths >= 3 },
    { label: 'Personal locker',       show: durationMonths >= 12 },
    { label: '2 free PT sessions',    show: durationMonths >= 12 },
  ];
  return (
    <ul className="space-y-2 text-sm text-fitpro-muted mt-4">
      {items.map(({ label, show }) => (
        <li key={label} className={`flex items-center gap-2 ${show ? '' : 'opacity-30 line-through'}`}>
          <span className={show ? 'text-coral-500' : 'text-gray-600'}>
            {show ? '✓' : '✗'}
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}

// ── Section header helper ─────────────────────────────────────
function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="text-center mb-14">
      <span className="inline-block text-coral-500 text-xs font-bold uppercase tracking-[0.2em] mb-3 px-4 py-1.5 rounded-full bg-coral-500/10 border border-coral-500/20">
        {eyebrow}
      </span>
      <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-3 mb-4">{title}</h2>
      {subtitle && (
        <p className="text-fitpro-muted text-lg max-w-xl mx-auto leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function LandingPage() {
  const { data: plans } = useFetch(planService.getActivePlans);
  const displayPlans = (plans && plans.length > 0) ? plans.slice(0, 3) : defaultPlans;

  return (
    <div className="min-h-screen bg-hero-gradient text-white">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-xl border-b border-coral-500/25 shadow-glass-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-200">💪</span>
            <span className="text-xl font-bold text-white">
              Fit<span className="text-coral-500">Pro</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Features',    href: '#features'    },
              { label: 'How It Works',href: '#how-it-works'},
              { label: 'Roles',       href: '#roles'       },
              { label: 'Plans',       href: '#plans'       },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm text-fitpro-muted hover:text-white transition-colors duration-200 font-medium"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/register" className="text-sm text-fitpro-muted hover:text-white transition-colors font-medium hidden sm:block">
              Register
            </Link>
            <Link to="/login" className="btn-coral btn-sm">
              Login →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="pt-36 pb-28 px-6 text-center relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-coral-500/10 border border-coral-500/30 text-coral-400 text-xs font-bold px-5 py-2 rounded-full mb-8 uppercase tracking-widest">
            🏆 Complete Gym Management Solution
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-3">
            Manage Your Gym
          </h1>
          <h2 className="text-5xl md:text-7xl font-extrabold text-coral-500 leading-tight mb-8">
            Smarter &amp; Faster
          </h2>
          <p className="text-fitpro-muted text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            FitPro is a full-stack gym management system built with Spring Boot and React.
            Manage members, trainers, memberships, payments and workout plans — all from one platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-coral text-base px-10 py-3.5 rounded-xl">
              💪 Get Started Free
            </Link>
            <a href="#features" className="btn-outline text-base px-10 py-3.5 rounded-xl">
              Explore Features ↓
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-10 border-t border-white/10">
            {[
              { value: '3',   label: 'User Roles'       },
              { value: '8+',  label: 'Features'         },
              { value: '4',   label: 'Membership Plans' },
              { value: 'JWT', label: 'Secured'          },
            ].map(({ value, label }) => (
              <div key={label} className="text-center group">
                <p className="text-3xl md:text-4xl font-extrabold text-coral-500 group-hover:scale-110 transition-transform duration-200 inline-block">
                  {value}
                </p>
                <p className="text-xs text-fitpro-muted font-bold tracking-widest mt-1 uppercase">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Features"
            title="Everything You Need"
            subtitle="A complete solution for modern gym management — from member registration to payment processing."
          />

          {/* 4-column grid on desktop, 2 on tablet, 1 on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className="scroll-fade-in group" style={{ transitionDelay: `${i * 60}ms` }}>
                <Card
                  icon={f.icon}
                  title={f.title}
                  description={f.description}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-black/10">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            eyebrow="How It Works"
            title="Get Started in Minutes"
            subtitle="Three simple steps to transform your gym management."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="scroll-scale-in" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="relative rounded-2xl p-8 border border-secondary/30 bg-secondary/20 backdrop-blur-xl text-center hover:border-coral-500/40 hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
                  {/* Big step number watermark */}
                  <span className="absolute top-4 right-5 text-6xl font-black text-coral-500/10 select-none">
                    {s.step}
                  </span>
                  {/* Step badge */}
                  <div className="w-14 h-14 bg-coral-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5 shadow-coral">
                    {s.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{s.title}</h3>
                  <p className="text-fitpro-muted text-sm leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── User Roles ─────────────────────────────────────── */}
      <section id="roles" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            eyebrow="User Roles"
            title="Three Roles, One Platform"
            subtitle="Each role has a dedicated dashboard with tailored features and fine-grained access control."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((r, i) => (
              <div key={r.title} className="scroll-fade-in" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="rounded-2xl p-8 border border-secondary/30 bg-secondary/20 backdrop-blur-xl text-center hover:border-coral-500/40 hover:-translate-y-1 hover:shadow-glow transition-all duration-300 group">
                  {/* Role icon */}
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-5 shadow-glass bg-gradient-to-br ${r.accentColor} group-hover:scale-110 transition-transform duration-300`}
                  >
                    {r.icon}
                  </div>
                  <h3 className="text-2xl font-extrabold text-white mb-2">{r.title}</h3>
                  <p className="text-fitpro-muted text-sm leading-relaxed">{r.description}</p>

                  {/* Role badge */}
                  <div className="mt-5">
                    <span className="inline-block text-xs font-bold text-coral-400 bg-coral-500/10 border border-coral-500/20 px-4 py-1.5 rounded-full uppercase tracking-wider">
                      {r.title} Access
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plans ──────────────────────────────────────────── */}
      <section id="plans" className="py-24 px-6 bg-black/10">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            eyebrow="Plans"
            title="Membership Plans"
            subtitle="Choose the plan that fits your goals. Secure payment via PayPal. Cancel anytime."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {displayPlans.map((plan, i) => {
              const isPopular = i === 1;
              return (
                <div
                  key={plan.id}
                  className={`scroll-scale-in relative rounded-2xl p-8 border backdrop-blur-xl flex flex-col transition-all duration-300 hover:-translate-y-1
                    ${isPopular
                      ? 'border-coral-500/60 bg-secondary/30 shadow-glow mt-0 md:-mt-4'
                      : 'border-secondary/30 bg-secondary/20 hover:border-coral-500/40 hover:shadow-glow'
                    }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  {/* Most popular badge */}
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-coral-500 to-coral-600 text-white text-xs font-bold px-6 py-2 rounded-full shadow-coral whitespace-nowrap">
                        ⭐ MOST POPULAR
                      </span>
                    </div>
                  )}

                  {/* Plan name & description */}
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-fitpro-muted text-sm mb-5">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-2">
                    <span className="text-5xl font-extrabold text-white">${plan.price}</span>
                    <span className="text-fitpro-muted text-sm ml-1">
                      / {plan.durationMonths} {plan.durationMonths === 1 ? 'month' : 'months'}
                    </span>
                  </div>

                  {/* Per-month breakdown */}
                  {plan.durationMonths > 1 && (
                    <p className="text-coral-400 text-xs font-semibold mb-4">
                      ≈ ${(parseFloat(plan.price) / plan.durationMonths).toFixed(2)} / month
                    </p>
                  )}

                  {/* Feature list */}
                  <PlanFeatures durationMonths={plan.durationMonths} />

                  {/* CTA */}
                  <Link
                    to="/register"
                    className={`mt-8 w-full py-3 rounded-xl font-bold text-center text-sm transition-all duration-200 block
                      ${isPopular
                        ? 'bg-coral-500 hover:bg-coral-600 text-white shadow-coral hover:shadow-lg hover:-translate-y-0.5'
                        : 'border border-white/20 hover:border-coral-500 text-white hover:bg-coral-500/10'
                      }`}
                  >
                    Get Started →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          {/* Decorative glow */}
          <div className="absolute left-1/2 -translate-x-1/2 w-96 h-32 bg-coral-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5">
              Ready to Transform<br />Your Gym?
            </h2>
            <p className="text-fitpro-muted text-lg mb-10 leading-relaxed">
              Join FitPro today and manage your gym smarter, faster, and more efficiently.
              No setup fees. Cancel anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-coral text-base px-10 py-4 rounded-xl">
                💪 Start Free Today
              </Link>
              <Link to="/login" className="btn-outline text-base px-10 py-4 rounded-xl">
                Sign In →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💪</span>
            <span className="font-bold text-white text-lg">
              Fit<span className="text-coral-500">Pro</span>
            </span>
          </div>
          <p className="text-fitpro-muted text-sm text-center">
            © 2024 FitPro. Built with React · Spring Boot · MySQL · PayPal
          </p>
          <div className="flex items-center gap-6 text-sm text-fitpro-muted">
            <Link to="/login"    className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
