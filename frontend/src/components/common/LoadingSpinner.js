import React from 'react';
import { Box, CircularProgress, Typography, useTheme, alpha } from '@mui/material';
import { Recycling as RecyclingIcon } from '@mui/icons-material';
import { keyframes } from '@emotion/react';

const pulse = keyframes`
  0% {
    opacity: 0.6;
    transform: scale(0.95);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0.6;
    transform: scale(0.95);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const LoadingSpinner = ({ 
  message = 'Loading...', 
  fullScreen = false,
  variant = 'default', // 'default', 'primary', 'success', 'warning'
  size = 'large'
}) => {
  const theme = useTheme();
  
  const getSpinnerSize = () => {
    switch (size) {
      case 'small': return 40;
      case 'large': return 60;
      default: return 50;
    }
  };
  
  const getColor = () => {
    switch (variant) {
      case 'primary': return '#4F46E5';
      case 'success': return '#10B981';
      case 'warning': return '#F59E0B';
      default: return theme.palette.primary.main;
    }
  };
  
  const spinnerSize = getSpinnerSize();
  const color = getColor();
  
  const spinnerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullScreen ? '100vh' : '400px',
        gap: 3,
        p: 3,
        background: fullScreen ? alpha(theme.palette.background.default, 0.95) : 'transparent',
        backdropFilter: fullScreen ? 'blur(10px)' : 'none',
        animation: `${pulse} 2s ease-in-out infinite`,
      }}
    >
      {/* Animated Icon */}
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress 
          size={spinnerSize + 20} 
          thickness={3} 
          sx={{ 
            color: alpha(color, 0.1),
            position: 'absolute',
          }} 
        />
        <CircularProgress 
          size={spinnerSize} 
          thickness={4} 
          sx={{ 
            color: color,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }} 
        />
        <RecyclingIcon 
          sx={{ 
            position: 'absolute',
            fontSize: spinnerSize - 20,
            color: color,
            animation: `${spin} 2s linear infinite`,
            opacity: 0.8
          }} 
        />
      </Box>
      
      {/* Loading Message */}
      <Typography 
        variant="h6" 
        sx={{ 
          color: color,
          fontWeight: 500,
          textAlign: 'center',
          animation: `${pulse} 2s ease-in-out infinite`,
        }}
      >
        {message}
      </Typography>
      
      {/* Loading Dots */}
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        {[0, 1, 2].map((dot) => (
          <Box
            key={dot}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: color,
              animation: `${pulse} 1.5s ease-in-out infinite`,
              animationDelay: `${dot * 0.3}s`,
            }}
          />
        ))}
      </Box>
      
      {/* Tip Message (Optional) */}
      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ 
          mt: 3,
          maxWidth: 300,
          textAlign: 'center',
          opacity: 0.7
        }}
      >
        💡 Tip: While you wait, did you know? Recycling one ton of paper saves 17 trees!
      </Typography>
    </Box>
  );
  
  if (fullScreen) {
    return spinnerContent;
  }
  
  return spinnerContent;
};

export default LoadingSpinner;