import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';

function SuperAdminRoute() {
  const { loading, isAuthenticated, hasRole } = useAuthContext();

  if (loading) {
    return <LoadingSpinner fullPage text="Verifying root authority..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole('super_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-theme">
        <ErrorState
          title="Root Access Denied"
          message="This system control panel is strictly restricted to Super Administrators."
          onRetry={() => window.location.href = '/'}
        />
      </div>
    );
  }

  return <Outlet />;
}

export default SuperAdminRoute;
