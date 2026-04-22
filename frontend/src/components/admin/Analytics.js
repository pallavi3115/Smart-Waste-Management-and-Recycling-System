// src/components/admin/Analytics.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  alpha,
  useTheme,
  Avatar,
  IconButton,
  Tooltip,
  Skeleton
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Recycling as RecyclingIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  Line
} from 'recharts';
import { toast } from 'react-hot-toast';

const Analytics = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    reportsTrend: [],
    wasteByType: [],
    collectionEfficiency: [],
    topIssues: [],
    monthlyComparison: [],
    performanceMetrics: []
  });

  useEffect(() => {
    loadMockData();
  }, [timeRange]);

  const loadMockData = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setData({
        reportsTrend: [
          { name: 'Mon', reports: 12, resolved: 8, pending: 4 },
          { name: 'Tue', reports: 8, resolved: 6, pending: 2 },
          { name: 'Wed', reports: 15, resolved: 10, pending: 5 },
          { name: 'Thu', reports: 10, resolved: 9, pending: 1 },
          { name: 'Fri', reports: 18, resolved: 14, pending: 4 },
          { name: 'Sat', reports: 6, resolved: 5, pending: 1 },
          { name: 'Sun', reports: 3, resolved: 3, pending: 0 }
        ],
        wasteByType: [
          { name: 'General Waste', value: 48, color: '#6366F1', icon: '🗑️' },
          { name: 'Recyclable', value: 28, color: '#10B981', icon: '♻️' },
          { name: 'E-Waste', value: 14, color: '#F59E0B', icon: '💻' },
          { name: 'Organic', value: 10, color: '#EF4444', icon: '🍎' }
        ],
        collectionEfficiency: [
          { month: 'Jan', efficiency: 72, target: 75 },
          { month: 'Feb', efficiency: 75, target: 75 },
          { month: 'Mar', efficiency: 78, target: 78 },
          { month: 'Apr', efficiency: 80, target: 80 },
          { month: 'May', efficiency: 82, target: 82 },
          { month: 'Jun', efficiency: 85, target: 85 }
        ],
        topIssues: [
          { issue: 'Overflowing Bins', count: 45 },
          { issue: 'Missed Collection', count: 32 },
          { issue: 'Illegal Dumping', count: 28 },
          { issue: 'Broken Bins', count: 18 },
          { issue: 'Other', count: 8 }
        ],
        monthlyComparison: [
          { name: 'Week 1', collection: 620, recycling: 410, waste: 210 },
          { name: 'Week 2', collection: 685, recycling: 445, waste: 240 },
          { name: 'Week 3', collection: 710, recycling: 468, waste: 242 },
          { name: 'Week 4', collection: 832, recycling: 524, waste: 308 }
        ],
        performanceMetrics: [
          { label: 'Resolution Rate', value: 87, target: 85, change: '+2%', status: 'good', color: '#10B981' },
          { label: 'Response Time', value: 2.5, target: 3, change: '-0.5h', status: 'good', color: '#6366F1', unit: 'hrs' },
          { label: 'Satisfaction', value: 94, target: 90, change: '+4%', status: 'good', color: '#F59E0B' },
          { label: 'CO₂ Saved', value: 12.5, target: 10, change: '+2.5k', status: 'good', color: '#10B981', unit: 'k kg' }
        ]
      });
      setLoading(false);
    }, 500);
  };

  const handleExport = () => {
    toast.success('Analytics report exported successfully');
  };

  const handleRefresh = () => {
    loadMockData();
    toast.success('Data refreshed');
  };

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const summaryStats = [
    { label: 'Total Reports', value: '87', change: '+12%', trend: 'up', color: '#6366F1', suffix: '' },
    { label: 'Resolution Rate', value: '87', change: '+5%', trend: 'up', color: '#10B981', suffix: '%' },
    { label: 'Avg Response', value: '2.5', change: '-0.3h', trend: 'down', color: '#F59E0B', suffix: 'hrs' },
    { label: 'Satisfaction', value: '94', change: '+2%', trend: 'up', color: '#EF4444', suffix: '%' }
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Analytics Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Comprehensive insights and performance metrics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)} 
              sx={{ borderRadius: 2, bgcolor: '#FFFFFF' }}
            >
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Export Report">
            <IconButton onClick={handleExport} sx={{ bgcolor: '#FFFFFF', borderRadius: 2, border: `1px solid ${alpha('#6366F1', 0.1)}` }}>
              <DownloadIcon sx={{ color: '#6366F1' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} sx={{ bgcolor: '#FFFFFF', borderRadius: 2, border: `1px solid ${alpha('#6366F1', 0.1)}` }}>
              <RefreshIcon sx={{ color: '#6366F1' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Summary Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {summaryStats.map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha(stat.color, 0.15)}`, background: alpha(stat.color, 0.02) }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                    {stat.label}
                  </Typography>
                  <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B', mt: 0.5 }}>
                    {stat.value}{stat.suffix}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    {stat.trend === 'up' ? 
                      <TrendingUpIcon sx={{ fontSize: 12, color: '#10B981' }} /> : 
                      <TrendingDownIcon sx={{ fontSize: 12, color: '#EF4444' }} />
                    }
                    <Typography sx={{ fontSize: '0.7rem', color: stat.trend === 'up' ? '#10B981' : '#EF4444', fontWeight: 500 }}>
                      {stat.change}
                    </Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8' }}>vs last period</Typography>
                  </Box>
                </Box>
                <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(stat.color, 0.1), color: stat.color }}>
                  {stat.label === 'Total Reports' ? <WarningIcon /> : 
                   stat.label === 'Resolution Rate' ? <CheckCircleIcon /> :
                   stat.label === 'Avg Response' ? <SpeedIcon /> : <RecyclingIcon />}
                </Avatar>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Reports Trend Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}`, background: '#FFFFFF' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>📈 Reports Trend</Typography>
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart data={data.reportsTrend}>
                <defs>
                  <linearGradient id="reportsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha('#6366F1', 0.08)} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                <Legend />
                <Area type="monotone" dataKey="reports" stroke="#6366F1" strokeWidth={2} fill="url(#reportsGrad)" name="Reports Submitted" />
                <Area type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} fill="url(#resolvedGrad)" name="Reports Resolved" />
                <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" name="Pending" />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Waste Composition Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}`, background: '#FFFFFF', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>🥧 Waste Composition</Typography>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.wasteByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.wasteByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} strokeWidth={2} stroke="#FFFFFF" />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap', mt: 2 }}>
              {data.wasteByType.map((item, i) => (
                <Chip
                  key={i}
                  icon={<span>{item.icon}</span>}
                  label={`${item.name}: ${item.value}%`}
                  size="small"
                  sx={{ bgcolor: alpha(item.color || COLORS[i], 0.1), color: item.color || COLORS[i], fontWeight: 500 }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Collection Efficiency & Top Issues */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}`, background: '#FFFFFF' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>📊 Collection Efficiency</Typography>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data.collectionEfficiency}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha('#6366F1', 0.08)} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                <Legend />
                <Bar dataKey="efficiency" fill="#6366F1" radius={[8, 8, 0, 0]} name="Efficiency %" />
                <Bar dataKey="target" fill="#10B981" radius={[8, 8, 0, 0]} name="Target %" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}`, background: '#FFFFFF', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>⚠️ Top Issues</Typography>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data.topIssues} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={alpha('#6366F1', 0.08)} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis dataKey="issue" type="category" width={120} tick={{ fontSize: 11, fill: '#64748B' }} />
                <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                <Bar dataKey="count" fill="#F59E0B" radius={[0, 8, 8, 0]} name="Number of Reports" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Monthly Comparison */}
      <Paper sx={{ p: 3, borderRadius: 4, mb: 4, border: `1px solid ${alpha('#6366F1', 0.1)}`, background: '#FFFFFF' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>📊 Monthly Performance Overview</Typography>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data.monthlyComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha('#6366F1', 0.08)} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
            <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
            <Legend />
            <Bar dataKey="collection" fill="#6366F1" radius={[8, 8, 0, 0]} name="Collection (tons)" />
            <Bar dataKey="recycling" fill="#10B981" radius={[8, 8, 0, 0]} name="Recycling (tons)" />
            <Bar dataKey="waste" fill="#EF4444" radius={[8, 8, 0, 0]} name="Waste (tons)" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Performance Metrics */}
      <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}`, background: '#FFFFFF' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>🎯 Performance Metrics</Typography>
        <Grid container spacing={2}>
          {data.performanceMetrics.map((metric, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Box sx={{ p: 2, bgcolor: alpha(metric.color, 0.05), borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: metric.color }}>
                  {metric.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B' }}>
                  {metric.value}{metric.unit || '%'}
                </Typography>
                <Typography variant="caption" sx={{ color: metric.status === 'good' ? '#10B981' : '#F59E0B' }}>
                  {metric.change} vs target
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">Target: {metric.target}{metric.unit || '%'}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Key Insights */}
      <Paper sx={{ p: 3, mt: 3, borderRadius: 4, background: `linear-gradient(135deg, ${alpha('#6366F1', 0.05)} 0%, ${alpha('#8B5CF6', 0.02)} 100%)`, border: `1px solid ${alpha('#6366F1', 0.1)}` }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>💡 Key Insights</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: alpha('#10B981', 0.1), color: '#10B981' }}>📈</Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Recycling Rate Up</Typography>
                <Typography variant="caption" color="text.secondary">28% increase in recycling this quarter</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: alpha('#F59E0B', 0.1), color: '#F59E0B' }}>⏱️</Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Response Time Improved</Typography>
                <Typography variant="caption" color="text.secondary">30 min faster response to reports</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: alpha('#6366F1', 0.1), color: '#6366F1' }}>🌍</Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>CO₂ Saved</Typography>
                <Typography variant="caption" color="text.secondary">12.5k kg CO₂ saved = 625 trees planted</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Analytics;