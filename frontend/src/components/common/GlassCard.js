import React from 'react';
import { Paper, useTheme, alpha } from '@mui/material';

const GlassCard = ({ 
  children, 
  sx = {}, 
  variant = 'default', // 'default', 'primary', 'secondary', 'success', 'warning', 'error'
  hover = true,
  animated = false,
  ...props 
}) => {
  const theme = useTheme();
  
  // Variant color mapping
  const variantColors = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    default: theme.palette.primary.main
  };
  
  const variantColor = variantColors[variant] || variantColors.default;
  
  // Base glass styles
  const glassStyles = {
    background: theme.palette.mode === 'light'
      ? 'rgba(255, 255, 255, 0.7)'
      : 'rgba(30, 30, 30, 0.7)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${theme.palette.mode === 'light'
      ? 'rgba(255, 255, 255, 0.5)'
      : 'rgba(255, 255, 255, 0.1)'}`,
    borderRadius: 3,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease-in-out',
    ...sx,
  };
  
  // Variant-specific styles
  if (variant !== 'default') {
    glassStyles.border = `1px solid ${alpha(variantColor, 0.3)}`;
    glassStyles.background = theme.palette.mode === 'light'
      ? `linear-gradient(135deg, ${alpha(variantColor, 0.1)} 0%, rgba(255, 255, 255, 0.7) 100%)`
      : `linear-gradient(135deg, ${alpha(variantColor, 0.15)} 0%, rgba(30, 30, 30, 0.7) 100%)`;
  }
  
  // Hover effects
  if (hover) {
    glassStyles['&:hover'] = {
      transform: 'translateY(-4px)',
      boxShadow: `0 12px 40px ${alpha(variantColor, 0.2)}`,
      border: `1px solid ${alpha(variantColor, 0.5)}`,
    };
  }
  
  // Animation
  if (animated) {
    glassStyles.animation = 'fadeInUp 0.5s ease-out';
    glassStyles['@keyframes fadeInUp'] = {
      '0%': {
        opacity: 0,
        transform: 'translateY(20px)'
      },
      '100%': {
        opacity: 1,
        transform: 'translateY(0)'
      }
    };
  }
  
  return (
    <Paper
      elevation={0}
      sx={glassStyles}
      {...props}
    >
      {children}
    </Paper>
  );
};

export default GlassCard;