import React from 'react';
import { Box, Typography, Button, Paper, useTheme, alpha } from '@mui/material';
import { 
  Error as ErrorIcon, 
  Refresh as RefreshIcon, 
  Home as HomeIcon,
  ReportProblem as ReportProblemIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleGoBack = () => {
    window.history.back();
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      // This is a functional component that uses hooks, so we need to use the theme via sx directly
      const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
      
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            p: 3,
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 3, sm: 5 },
              maxWidth: 550,
              width: '100%',
              textAlign: 'center',
              borderRadius: 4,
              background: alpha('#fff', 0.95),
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            {/* Animated Error Icon */}
            <Box
              sx={{
                width: 100,
                height: 100,
                margin: '0 auto 24px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(1)',
                    boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)',
                  },
                  '70%': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 0 20px rgba(239, 68, 68, 0)',
                  },
                  '100%': {
                    transform: 'scale(1)',
                    boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)',
                  },
                },
              }}
            >
              <ErrorIcon sx={{ fontSize: 50, color: 'white' }} />
            </Box>

            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800, 
                mb: 1,
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Oops!
            </Typography>
            
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Something Went Wrong
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We're sorry for the inconvenience. An unexpected error has occurred.
              Please try refreshing the page or go back to the homepage.
            </Typography>

            {/* Error Details (Toggle) */}
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mb: 3 }}>
                <Button
                  size="small"
                  onClick={this.toggleDetails}
                  sx={{ mb: 1 }}
                >
                  {this.state.showDetails ? 'Hide Details' : 'Show Error Details'}
                </Button>
                {this.state.showDetails && (
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: '#1e1e1e',
                      color: '#d4d4d4',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      maxHeight: 200,
                      textAlign: 'left',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {this.state.error?.toString()}
                      {'\n\n'}
                      {this.state.errorInfo?.componentStack}
                    </Typography>
                  </Paper>
                )}
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={this.handleGoBack}
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
                Go Back
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={this.handleGoHome}
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
                Home Page
              </Button>
              
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleRefresh}
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)'
                  }
                }}
              >
                Refresh Page
              </Button>
            </Box>

            {/* Support Message */}
            <Box sx={{ mt: 4, pt: 2, borderTop: `1px solid ${alpha('#4F46E5', 0.1)}` }}>
              <Typography variant="caption" color="text.secondary">
                If the problem persists, please contact support at{' '}
                <span style={{ color: '#4F46E5' }}>support@smartwaste.com</span>
              </Typography>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;