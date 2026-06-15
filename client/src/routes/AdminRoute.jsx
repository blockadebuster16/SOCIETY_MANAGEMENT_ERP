import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';

function AdminRoute() {
  const { loading, isAuthenticated, hasRole } = useAuthContext();

  if (loading) {
    return <LoadingSpinner fullPage text="Verifying admin authority..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(['committee_member', 'society_manager', 'super_admin'])) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-theme">
        <ErrorState
          title="Access Denied"
          message="You do not have the required administrative permissions to access this section."
          onRetry={() => window.location.href = '/'}
        />
      </div>
    );
  }

  return <Outlet />;
}

export default AdminRoute;
