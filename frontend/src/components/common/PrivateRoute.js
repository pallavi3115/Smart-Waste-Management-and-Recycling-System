import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { Box, Typography, Button, Paper, useTheme, alpha } from '@mui/material';
import { Warning as WarningIcon, Home as HomeIcon, Login as LoginIcon } from '@mui/icons-material';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const theme = useTheme();

  console.log('🔒 PrivateRoute - Auth state:', { loading, isAuthenticated, user });

  if (loading) {
    return <LoadingSpinner message="Verifying access..." />;
  }

  // Not authenticated - redirect to login with return URL
  if (!isAuthenticated) {
    console.log('🔒 Not authenticated, redirecting to login');
    const returnUrl = encodeURIComponent(window.location.pathname);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} />;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    console.log('🔒 Role not allowed, redirecting to appropriate dashboard');
    
    // Redirect to appropriate dashboard based on role
    let redirectPath = '/';
    if (user?.role === 'Admin') redirectPath = '/admin/dashboard';
    else if (user?.role === 'Driver') redirectPath = '/driver/dashboard';
    else if (user?.role === 'Citizen') redirectPath = '/citizen/dashboard';
    
    // Show access denied message briefly before redirect (optional)
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 3,
          background: `linear-gradient(135deg, ${alpha('#4F46E5', 0.05)} 0%, ${alpha('#7C3AED', 0.02)} 100%)`,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            maxWidth: 450,
            textAlign: 'center',
            borderRadius: 4,
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha('#EF4444', 0.2)}`,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              margin: '0 auto 20px',
              background: alpha('#EF4444', 0.1),
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WarningIcon sx={{ fontSize: 48, color: '#EF4444' }} />
          </Box>
          
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#EF4444' }}>
            Access Denied
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You don't have permission to access this page.
            {user?.role && ` Your role (${user.role}) does not have the required access level.`}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={() => window.location.href = redirectPath}
              sx={{
                borderRadius: 2,
                borderColor: alpha('#4F46E5', 0.5),
                color: '#4F46E5',
                '&:hover': {
                  borderColor: '#4F46E5',
                  backgroundColor: alpha('#4F46E5', 0.05)
                }
              }}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={() => window.location.href = '/login'}
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)'
                }
              }}
            >
              Login as Different User
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  console.log('🔒 Access granted, rendering children');
  return children;
};

// Helper hook to get role-based redirect path
export const getRoleRedirectPath = (role) => {
  switch (role) {
    case 'Admin':
      return '/admin/dashboard';
    case 'Driver':
      return '/driver/dashboard';
    case 'Citizen':
      return '/citizen/dashboard';
    default:
      return '/';
  }
};

// Component for role-based route redirection
export const RoleBasedRedirect = () => {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return <LoadingSpinner message="Redirecting..." />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  const redirectPath = getRoleRedirectPath(user?.role);
  return <Navigate to={redirectPath} />;
};

export default PrivateRoute;