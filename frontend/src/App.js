import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageMembers from './pages/admin/ManageMembers';
import ManageTrainers from './pages/admin/ManageTrainers';
import ManageMemberships from './pages/admin/ManageMemberships';
import ManagePlans from './pages/admin/ManagePlans';
import ManagePayments from './pages/admin/ManagePayments';

// Trainer pages
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import TrainerSessions from './pages/trainer/TrainerSessions';
import TrainerWorkoutPlans from './pages/trainer/TrainerWorkoutPlans';

// Member pages
import MemberDashboard from './pages/member/MemberDashboard';
import MemberProfile from './pages/member/MemberProfile';
import MemberWorkoutPlans from './pages/member/MemberWorkoutPlans';
import MemberPayments from './pages/member/MemberPayments';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>

          {/* ── Public routes ── */}
          <Route path="/"         element={<Landing />} />   {/* Landing page at root */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Admin routes — ADMIN role only ── */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route index               element={<AdminDashboard />} />
            <Route path="members"      element={<ManageMembers />} />
            <Route path="trainers"     element={<ManageTrainers />} />
            <Route path="memberships"  element={<ManageMemberships />} />
            <Route path="plans"        element={<ManagePlans />} />
            <Route path="payments"     element={<ManagePayments />} />
          </Route>

          {/* ── Trainer routes — TRAINER role only ── */}
          <Route path="/trainer" element={<ProtectedRoute allowedRoles={['TRAINER']} />}>
            <Route index           element={<TrainerDashboard />} />
            <Route path="sessions" element={<TrainerSessions />} />
            <Route path="workouts" element={<TrainerWorkoutPlans />} />
          </Route>

          {/* ── Member routes — MEMBER role only ── */}
          <Route path="/member" element={<ProtectedRoute allowedRoles={['MEMBER']} />}>
            <Route index           element={<MemberDashboard />} />
            <Route path="profile"  element={<MemberProfile />} />
            <Route path="workouts" element={<MemberWorkoutPlans />} />
            <Route path="payments" element={<MemberPayments />} />
          </Route>

          {/* ── Catch-all: unknown URLs go to landing ── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
