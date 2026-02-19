import React from 'react';
import { Paper, useTheme } from '@mui/material';

const GlassCard = ({ children, sx = {}, ...props }) => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={0}
      sx={{
        background: theme.palette.mode === 'light'
          ? 'rgba(255, 255, 255, 0.7)'
          : 'rgba(30, 30, 30, 0.7)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${theme.palette.mode === 'light'
          ? 'rgba(255, 255, 255, 0.5)'
          : 'rgba(255, 255, 255, 0.1)'}`,
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
};

export default GlassCard;