import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  console.log('🔒 PrivateRoute - Auth state:', { loading, isAuthenticated, user });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    console.log('🔒 Not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    console.log('🔒 Role not allowed, redirecting to home');
    return <Navigate to="/" />;
  }

  console.log('🔒 Access granted, rendering children');
  return children;
};

export default PrivateRoute;