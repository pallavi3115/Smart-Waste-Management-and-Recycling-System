import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { Paper, Typography, Grid, Box, useTheme } from '@mui/material';

const AdvancedAnalytics = ({ data }) => {
  const theme = useTheme();
  
  const wasteTrends = [
    { month: 'Jan', plastic: 65, paper: 45, glass: 30, metal: 20 },
    { month: 'Feb', plastic: 70, paper: 50, glass: 35, metal: 25 },
    { month: 'Mar', plastic: 85, paper: 55, glass: 40, metal: 30 },
    { month: 'Apr', plastic: 90, paper: 60, glass: 45, metal: 35 },
    { month: 'May', plastic: 95, paper: 65, glass: 50, metal: 40 },
    { month: 'Jun', plastic: 100, paper: 70, glass: 55, metal: 45 },
  ];

  const materialDistribution = [
    { name: 'Plastic', value: 45, color: '#2196f3' },
    { name: 'Paper', value: 30, color: '#4caf50' },
    { name: 'Glass', value: 15, color: '#ff9800' },
    { name: 'Metal', value: 8, color: '#f44336' },
    { name: 'E-Waste', value: 2, color: '#9c27b0' },
  ];

  const collectionEfficiency = [
    { day: 'Mon', scheduled: 45, completed: 42 },
    { day: 'Tue', scheduled: 52, completed: 50 },
    { day: 'Wed', scheduled: 48, completed: 47 },
    { day: 'Thu', scheduled: 55, completed: 53 },
    { day: 'Fri', scheduled: 50, completed: 49 },
    { day: 'Sat', scheduled: 40, completed: 38 },
    { day: 'Sun', scheduled: 30, completed: 28 },
  ];

  return (
    <Grid container spacing={3}>
      {/* Waste Collection Trends */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            📊 Waste Collection Trends
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={wasteTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
              <YAxis stroke={theme.palette.text.secondary} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="plastic" stackId="1" stroke="#2196f3" fill="#2196f3" fillOpacity={0.6} />
              <Area type="monotone" dataKey="paper" stackId="1" stroke="#4caf50" fill="#4caf50" fillOpacity={0.6} />
              <Area type="monotone" dataKey="glass" stackId="1" stroke="#ff9800" fill="#ff9800" fillOpacity={0.6} />
              <Area type="monotone" dataKey="metal" stackId="1" stroke="#f44336" fill="#f44336" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Material Distribution Pie Chart */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            🥧 Material Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={materialDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {materialDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Collection Efficiency Bar Chart */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            📅 Collection Efficiency
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={collectionEfficiency}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="day" stroke={theme.palette.text.secondary} />
              <YAxis stroke={theme.palette.text.secondary} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              />
              <Legend />
              <Bar dataKey="scheduled" fill={theme.palette.primary.main} />
              <Bar dataKey="completed" fill={theme.palette.success.main} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AdvancedAnalytics;