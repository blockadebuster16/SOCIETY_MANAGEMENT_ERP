import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

function ProtectedRoute() {
  const { loading, isAuthenticated } = useAuthContext();

  if (loading) {
    return <LoadingSpinner fullPage text="Verifying session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
