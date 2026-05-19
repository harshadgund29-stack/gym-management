import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import ScrollAnimationProvider from './components/ScrollAnimationProvider';

// ── Public pages ──────────────────────────────────────────────
import LandingPage        from './pages/LandingPage';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage  from './pages/ResetPasswordPage';
import VerifyOtpPage      from './pages/VerifyOtpPage';
import UnauthorizedPage   from './pages/UnauthorizedPage';

// ── Admin pages ───────────────────────────────────────────────
import AdminDashboard  from './pages/admin/AdminDashboard';
import AdminUsers      from './pages/admin/AdminUsers';
import AdminPlans      from './pages/admin/AdminPlans';
import AdminPayments   from './pages/admin/AdminPayments';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminReports    from './pages/admin/AdminReports';

// ── Member pages ──────────────────────────────────────────────
import MemberDashboard  from './pages/member/MemberDashboard';
import MemberPlans      from './pages/member/MemberPlans';
import MemberPayments   from './pages/member/MemberPayments';
import MemberAttendance from './pages/member/MemberAttendance';
import MemberProfile    from './pages/member/MemberProfile';

// ── Trainer pages ─────────────────────────────────────────────
import TrainerDashboard  from './pages/trainer/TrainerDashboard';
import TrainerMembers    from './pages/trainer/TrainerMembers';
import TrainerAttendance from './pages/trainer/TrainerAttendance';

export default function App() {
  return (
    <AuthProvider>
      <ScrollAnimationProvider>
      <Router>
        <Routes>

          {/* ── Public ──────────────────────────────────────── */}
          <Route path="/"                element={<LandingPage />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />
          <Route path="/verify-otp"      element={<VerifyOtpPage />} />

          <Route path="/unauthorized"    element={<UnauthorizedPage />} />

          {/* ── Admin ───────────────────────────────────────── */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index             element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"  element={<AdminDashboard />} />
            <Route path="users"      element={<AdminUsers />} />
            <Route path="plans"      element={<AdminPlans />} />
            <Route path="payments"   element={<AdminPayments />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="reports"    element={<AdminReports />} />
          </Route>

          {/* ── Trainer ─────────────────────────────────────── */}
          <Route path="/trainer" element={
            <ProtectedRoute allowedRoles={['ROLE_TRAINER', 'ROLE_ADMIN']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index             element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"  element={<TrainerDashboard />} />
            <Route path="members"    element={<TrainerMembers />} />
            <Route path="attendance" element={<TrainerAttendance />} />
          </Route>

          {/* ── Member ──────────────────────────────────────── */}
          <Route path="/member" element={
            <ProtectedRoute allowedRoles={['ROLE_MEMBER', 'ROLE_ADMIN']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index             element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"  element={<MemberDashboard />} />
            <Route path="plans"      element={<MemberPlans />} />
            <Route path="payments"   element={<MemberPayments />} />
            <Route path="attendance" element={<MemberAttendance />} />
            <Route path="profile"    element={<MemberProfile />} />
          </Route>

          {/* ── Catch-all ───────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
      </ScrollAnimationProvider>

      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#161d2e',
            color: '#e2e8f0',
            border: '1px solid #1e2a3a',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#e8445a', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  );
}
