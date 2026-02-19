import React from 'react';
import { Paper, Box, Typography, Avatar, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import CountUp from 'react-countup';

const StatsCard = ({ title, value, icon, color, trend, trendValue, subtitle }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`,
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${color}20`,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
            {title}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700, color: color, mb: 0.5 }}>
            <CountUp end={value} duration={2} separator="," />
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: color,
            width: 56,
            height: 56,
            boxShadow: `0 8px 16px ${color}40`,
          }}
        >
          {icon}
        </Avatar>
      </Box>
      
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          {trend > 0 ? (
            <TrendingUp sx={{ color: theme.palette.success.main, fontSize: 20, mr: 0.5 }} />
          ) : (
            <TrendingDown sx={{ color: theme.palette.error.main, fontSize: 20, mr: 0.5 }} />
          )}
          <Typography
            variant="body2"
            sx={{
              color: trend > 0 ? theme.palette.success.main : theme.palette.error.main,
              fontWeight: 600,
            }}
          >
            {Math.abs(trend)}% from last month
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default StatsCard;