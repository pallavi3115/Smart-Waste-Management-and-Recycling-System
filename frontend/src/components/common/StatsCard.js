import React from 'react';
import { Paper, Box, Typography, Avatar, useTheme, alpha } from '@mui/material';
import { TrendingUp, TrendingDown, Info as InfoIcon } from '@mui/icons-material';
import CountUp from 'react-countup';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color = '#4F46E5', 
  trend, 
  trendValue, 
  subtitle,
  suffix = '',
  prefix = '',
  delay = 0,
  onClick 
}) => {
  const theme = useTheme();
  
  // Default colors if not provided
  const cardColor = color || (trend > 0 ? '#10B981' : trend < 0 ? '#EF4444' : '#4F46E5');
  
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 3,
        borderRadius: 4,
        cursor: onClick ? 'pointer' : 'default',
        background: `linear-gradient(135deg, ${alpha(cardColor, 0.08)} 0%, ${alpha(cardColor, 0.02)} 100%)`,
        border: `1px solid ${alpha(cardColor, 0.15)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: onClick ? 'translateY(-4px)' : 'none',
          boxShadow: `0 20px 30px ${alpha(cardColor, 0.15)}`,
          borderColor: alpha(cardColor, 0.3),
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 1, 
              fontWeight: 600,
              letterSpacing: '0.5px',
              color: alpha(theme.palette.text.primary, 0.7),
              textTransform: 'uppercase',
              fontSize: '0.75rem'
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              color: cardColor,
              mb: 0.5,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
              lineHeight: 1.2,
            }}
          >
            {prefix}
            <CountUp 
              end={value} 
              duration={2} 
              separator="," 
              delay={delay}
              enableScrollSpy
              scrollSpyOnce
            />
            {suffix}
          </Typography>
          {subtitle && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: alpha(theme.palette.text.primary, 0.6),
                display: 'block',
                mt: 0.5
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: alpha(cardColor, 0.15),
            color: cardColor,
            width: 56,
            height: 56,
            boxShadow: `0 8px 16px ${alpha(cardColor, 0.2)}`,
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        >
          {icon}
        </Avatar>
      </Box>
      
      {trend !== undefined && trend !== null && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, pt: 1 }}>
          {trend > 0 ? (
            <TrendingUp sx={{ color: '#10B981', fontSize: 18, mr: 0.75 }} />
          ) : trend < 0 ? (
            <TrendingDown sx={{ color: '#EF4444', fontSize: 18, mr: 0.75 }} />
          ) : null}
          <Typography
            variant="body2"
            sx={{
              color: trend > 0 ? '#10B981' : trend < 0 ? '#EF4444' : '#64748B',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          >
            {trend > 0 ? '+' : ''}{trend}% from last {trendValue || 'month'}
          </Typography>
        </Box>
      )}
      
      {/* Tooltip on hover - optional */}
      {onClick && (
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 12, 
            right: 12,
            opacity: 0,
            transition: 'opacity 0.3s',
            '.MuiPaper-root:hover &': { opacity: 1 }
          }}
        >
          <InfoIcon sx={{ fontSize: 16, color: alpha(cardColor, 0.5) }} />
        </Box>
      )}
    </Paper>
  );
};

// Predefined stats card variants for common use cases
export const SuccessStatsCard = (props) => (
  <StatsCard {...props} color="#10B981" />
);

export const WarningStatsCard = (props) => (
  <StatsCard {...props} color="#F59E0B" />
);

export const ErrorStatsCard = (props) => (
  <StatsCard {...props} color="#EF4444" />
);

export const InfoStatsCard = (props) => (
  <StatsCard {...props} color="#3B82F6" />
);

export const PrimaryStatsCard = (props) => (
  <StatsCard {...props} color="#4F46E5" />
);

export default StatsCard;