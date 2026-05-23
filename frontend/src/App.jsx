import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Landing        from './pages/Landing';
import Login          from './pages/Login';
import Register       from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Payment pages — NOT wrapped in ProtectedRoute
// Checkout guards itself; PaymentStatus must be reachable after Razorpay callback
import Checkout      from './components/Checkout.jsx';
import PaymentStatus from './pages/PaymentStatus';

// Admin pages
import AdminDashboard    from './pages/admin/AdminDashboard';
import AdminSummary      from './pages/admin/AdminSummary';

import ManageMembers     from './pages/admin/ManageMembers';


import ManageTrainers    from './pages/admin/ManageTrainers';
import ManageMemberships from './pages/admin/ManageMemberships';
import ManagePlans       from './pages/admin/ManagePlans';
import ManageAttendance  from './pages/admin/ManageAttendance';
import ManagePayments    from './pages/admin/ManagePayments';

// Trainer pages
import TrainerDashboard   from './pages/trainer/TrainerDashboard';
import TrainerSessions    from './pages/trainer/TrainerSessions';
import TrainerWorkoutPlans from './pages/trainer/TrainerWorkoutPlans';

// Member pages
import MemberDashboard   from './pages/member/MemberDashboard';
import MemberPlans       from './pages/member/MemberPlans';
import MemberPayments    from './pages/member/MemberPayments';
import MemberProfile     from './pages/member/MemberProfile';
import MemberWorkoutPlans from './pages/member/MemberWorkoutPlans';
import MemberAttendance  from './pages/member/MemberAttendance';
import MemberPaymentStatus from './pages/member/PaymentStatus';

// ── Shorthand wrappers ──────────────────────────────────────────────────────
const Admin   = ({ children }) => <ProtectedRoute allowedRoles={['ADMIN']}>{children}</ProtectedRoute>;
const Trainer = ({ children }) => <ProtectedRoute allowedRoles={['TRAINER']}>{children}</ProtectedRoute>;
const Member  = ({ children }) => <ProtectedRoute allowedRoles={['MEMBER']}>{children}</ProtectedRoute>;

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>

          {/* ── Public ── */}
          <Route path="/"                element={<Landing />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ── Payment (public — Checkout guards itself) ── */}
          <Route path="/checkout"       element={<Checkout />} />
          <Route path="/payment-status" element={<PaymentStatus />} />

          {/* ── Admin routes ── */}
          {/* Support both /admin and /admin-dashboard as the dashboard entry */}
          <Route path="/admin"             element={<Admin><AdminDashboard /></Admin>} />
          <Route path="/admin-dashboard"   element={<Admin><AdminDashboard /></Admin>} />
          <Route path="/admin/summary"    element={<Admin><AdminSummary /></Admin>} />

          <Route path="/admin/members"     element={<Admin><ManageMembers /></Admin>} />
          <Route path="/admin/trainers"    element={<Admin><ManageTrainers /></Admin>} />
          <Route path="/admin/memberships" element={<Admin><ManageMemberships /></Admin>} />
          <Route path="/admin/plans"       element={<Admin><ManagePlans /></Admin>} />
          <Route path="/admin/attendance"  element={<Admin><ManageAttendance /></Admin>} />
          <Route path="/admin/payments"    element={<Admin><ManagePayments /></Admin>} />


          {/* ── Trainer routes ── */}
          <Route path="/trainer"              element={<Trainer><TrainerDashboard /></Trainer>} />
          <Route path="/trainer-dashboard"    element={<Trainer><TrainerDashboard /></Trainer>} />
          <Route path="/trainer/sessions"     element={<Trainer><TrainerSessions /></Trainer>} />
          <Route path="/trainer/workouts"     element={<Trainer><TrainerWorkoutPlans /></Trainer>} />
          <Route path="/trainer/attendance"   element={<Trainer><ManageAttendance /></Trainer>} />

          {/* ── Member routes ── */}
          <Route path="/member"              element={<Member><MemberDashboard /></Member>} />
          <Route path="/member-dashboard"    element={<Member><MemberDashboard /></Member>} />
          <Route path="/member/plans"        element={<Member><MemberPlans /></Member>} />
          <Route path="/member/payments"     element={<Member><MemberPayments /></Member>} />
          <Route path="/member/profile"      element={<Member><MemberProfile /></Member>} />
          <Route path="/member/workouts"     element={<Member><MemberWorkoutPlans /></Member>} />
          <Route path="/member/attendance"   element={<Member><MemberAttendance /></Member>} />
          {/* Member-specific payment status (Cashfree redirect flow) */}
          <Route path="/member/payment-status" element={<Member><MemberPaymentStatus /></Member>} />

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
