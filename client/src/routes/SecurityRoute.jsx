import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';

function SecurityRoute() {
  const { loading, isAuthenticated, hasRole } = useAuthContext();

  if (loading) {
    return <LoadingSpinner fullPage text="Verifying guard session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(['security', 'society_manager', 'super_admin'])) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-theme">
        <ErrorState
          title="Gate Access Denied"
          message="This panel is restricted to duty security guards and portal managers."
          onRetry={() => window.location.href = '/'}
        />
      </div>
    );
  }

  return <Outlet />;
}

export default SecurityRoute;
