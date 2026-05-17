import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — guards routes based on authentication and role.
 *
 * Usage in App.js:
 *   <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
 *     <Route path="dashboard" element={<AdminDashboard />} />
 *   </Route>
 *
 * - If not logged in → redirect to /login
 * - If logged in but wrong role → redirect to their own dashboard
 * - If correct role → render the child route (<Outlet />)
 */
function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to the correct dashboard for their role
    const roleRedirects = {
      ADMIN:   '/admin',
      TRAINER: '/trainer',
      MEMBER:  '/member',
    };
    return <Navigate to={roleRedirects[user?.role] || '/login'} replace />;
  }

  // Render the child route
  return <Outlet />;
}

export default ProtectedRoute;
