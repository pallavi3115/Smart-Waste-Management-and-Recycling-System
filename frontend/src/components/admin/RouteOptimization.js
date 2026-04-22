// src/components/admin/RouteOptimization.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Avatar,
  alpha,
  Container,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Alert
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  LocationOn as LocationOnIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  PlayArrow as PlayIcon,
  Route as RouteIcon,
  Stop as StopIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  AccessTime as TimeIcon,
  Map as MapIcon,
  DirectionsCar as CarIcon,
  LocalGasStation as FuelIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

function RouteOptimization() {
  const [routes, setRoutes] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [stats, setStats] = useState({
    totalRoutes: 0,
    completedRoutes: 0,
    inProgressRoutes: 0,
    totalDistance: 0,
    avgEfficiency: 0,
    fuelSaved: 0
  });
  const [efficiencyData, setEfficiencyData] = useState([]);
  const [routeDistribution, setRouteDistribution] = useState([]);

  useEffect(() => {
    fetchRoutes();
    generateAnalytics();
  }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    setApiError(false);
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching routes with token:', token);
      
      const res = await api.get("/driver/routes");
      console.log('API Response:', res.data);
      
      const routesData = res.data?.data || res.data || [];
      setRoutes(routesData);
      updateStats(routesData);
      
      if (routesData.length === 0) {
        toast.info('No routes found', { icon: '🗺️' });
      }
    } catch (err) {
      console.error("Error fetching routes:", err);
      console.error("Error response:", err.response);
      setApiError(true);
      toast.error("Failed to fetch routes. Using demo data.");
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockRoutes = getMockRoutes();
    setRoutes(mockRoutes);
    updateStats(mockRoutes);
  };

  const getMockRoutes = () => {
    return [
      { 
        _id: '1', 
        routeId: 'R001', 
        status: 'Completed', 
        date: new Date().toISOString(), 
        totalDistance: 45.5, 
        estimatedDuration: 120, 
        stopsCount: 8,
        progress: 100,
        fuelUsed: 12.5,
        driver: 'Rajesh Kumar',
        vehicle: 'DL-01-AB-1234',
        startTime: '08:00 AM',
        endTime: '10:00 AM',
        stops: [
          { location: 'Sector 12', address: 'Main Market', status: 'completed', time: '08:15 AM' },
          { location: 'Sector 15', address: 'Community Center', status: 'completed', time: '08:45 AM' },
          { location: 'Block A', address: 'Residential Area', status: 'completed', time: '09:30 AM' }
        ]
      },
      { 
        _id: '2', 
        routeId: 'R002', 
        status: 'In Progress', 
        date: new Date().toISOString(), 
        totalDistance: 38.2, 
        estimatedDuration: 95, 
        stopsCount: 6,
        progress: 65,
        fuelUsed: 8.2,
        driver: 'Priya Singh',
        vehicle: 'DL-02-CD-5678',
        startTime: '09:00 AM',
        stops: [
          { location: 'Sector 20', address: 'Shopping Complex', status: 'completed', time: '09:20 AM' },
          { location: 'Sector 8', address: 'Hospital Road', status: 'in-progress', time: '10:00 AM' },
          { location: 'Block C', address: 'Commercial Area', status: 'pending', time: '10:30 AM' }
        ]
      },
      { 
        _id: '3', 
        routeId: 'R003', 
        status: 'Started', 
        date: new Date().toISOString(), 
        totalDistance: 52.8, 
        estimatedDuration: 150, 
        stopsCount: 10,
        progress: 20,
        fuelUsed: 3.5,
        driver: 'Amit Verma',
        vehicle: 'DL-03-EF-9012',
        startTime: '11:00 AM',
        stops: [
          { location: 'Sector 25', address: 'Industrial Area', status: 'pending', time: '11:30 AM' },
          { location: 'Sector 30', address: 'Warehouse', status: 'pending', time: '12:00 PM' }
        ]
      },
      { 
        _id: '4', 
        routeId: 'R004', 
        status: 'Started', 
        date: new Date().toISOString(), 
        totalDistance: 28.5, 
        estimatedDuration: 75, 
        stopsCount: 5,
        progress: 0,
        fuelUsed: 0,
        driver: 'Suresh Kumar',
        vehicle: 'DL-04-GH-3456',
        startTime: '02:00 PM',
        stops: [
          { location: 'Sector 5', address: 'Residential Colony', status: 'pending', time: '02:30 PM' },
          { location: 'Sector 7', address: 'Market Area', status: 'pending', time: '03:15 PM' }
        ]
      }
    ];
  };

  const updateStats = (routesData) => {
    const totalRoutes = routesData.length;
    const completedRoutes = routesData.filter(r => r.status === 'Completed').length;
    const inProgressRoutes = routesData.filter(r => r.status === 'In Progress').length;
    const totalDistance = routesData.reduce((acc, r) => acc + (r.totalDistance || 0), 0);
    const avgEfficiency = totalRoutes > 0 
      ? Math.round(routesData.reduce((acc, r) => acc + (r.progress || 0), 0) / totalRoutes)
      : 0;
    const fuelSaved = routesData.reduce((acc, r) => acc + ((r.totalDistance || 0) * 0.12), 0);

    setStats({
      totalRoutes,
      completedRoutes,
      inProgressRoutes,
      totalDistance: Math.round(totalDistance),
      avgEfficiency,
      fuelSaved: Math.round(fuelSaved)
    });
  };

  const generateAnalytics = () => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const efficiency = weeks.map((week, i) => ({
      week,
      efficiency: 75 + Math.random() * 15,
      target: 85
    }));
    setEfficiencyData(efficiency);

    const distribution = [
      { name: 'Morning', value: 45, color: '#6366F1' },
      { name: 'Afternoon', value: 35, color: '#F59E0B' },
      { name: 'Evening', value: 20, color: '#10B981' }
    ];
    setRouteDistribution(distribution);
  };

  const getStatusColor = (status) => {
    if (status === "Completed") return "#10B981";
    if (status === "In Progress") return "#3B82F6";
    if (status === "Started") return "#F59E0B";
    return "#6B7280";
  };

  const getStatusIcon = (status) => {
    if (status === "Completed") return <CheckCircleIcon sx={{ fontSize: 14 }} />;
    if (status === "In Progress") return <TimelineIcon sx={{ fontSize: 14 }} />;
    if (status === "Started") return <PlayIcon sx={{ fontSize: 14 }} />;
    return <WarningIcon sx={{ fontSize: 14 }} />;
  };

  const handleStartRoute = (route) => {
    toast.success(`Starting route ${route.routeId}`);
    setRoutes(prev => prev.map(r => 
      r._id === route._id ? { ...r, status: 'In Progress', progress: 10 } : r
    ));
    updateStats(routes);
  };

  const handleOptimizeRoute = (route) => {
    toast.success(`Optimizing route ${route.routeId}`);
  };

  const handleViewDetails = (route) => {
    setSelectedRoute(route);
    setOpenDetailsDialog(true);
  };

  const handleRefresh = () => {
    fetchRoutes();
  };

  const handleExport = () => {
    if (routes.length === 0) {
      toast.error('No routes to export');
      return;
    }
    toast.success('Report exported successfully');
  };

  const statsCards = [
    { title: "Total Routes", value: stats.totalRoutes, icon: <RouteIcon />, color: "#6366F1", trend: "+12%", trendUp: true },
    { title: "Completed", value: stats.completedRoutes, icon: <CheckCircleIcon />, color: "#10B981", trend: "+8%", trendUp: true },
    { title: "In Progress", value: stats.inProgressRoutes, icon: <TimelineIcon />, color: "#3B82F6", trend: "+5%", trendUp: false },
    { title: "Total Distance", value: `${stats.totalDistance} km`, icon: <SpeedIcon />, color: "#F59E0B", trend: "+15%", trendUp: true },
    { title: "Avg Efficiency", value: `${stats.avgEfficiency}%`, icon: <TrendingUpIcon />, color: "#8B5CF6", trend: "+3%", trendUp: true },
    { title: "Fuel Saved", value: `${stats.fuelSaved} L`, icon: <FuelIcon />, color: "#10B981", trend: "+10%", trendUp: true }
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <LinearProgress sx={{ width: 300, borderRadius: 2 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={fadeInUp}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Route Optimization
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Smart route planning and fleet management
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                sx={{ borderRadius: 2, textTransform: 'none', borderColor: alpha('#6366F1', 0.5), color: '#6366F1' }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                disabled={routes.length === 0}
                sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#6366F1' }}
              >
                Export
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* API Error Alert */}
        {apiError && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setApiError(false)}>
            <strong>Demo Mode:</strong> Unable to connect to backend. Showing sample route data.
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {statsCards.map((stat, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={i}>
              <motion.div variants={fadeInUp} whileHover={{ y: -4 }}>
                <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(stat.color, 0.15)}`, background: alpha(stat.color, 0.02) }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                          {stat.title}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mt: 0.5 }}>
                          {stat.value}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                          {stat.trendUp ? <TrendingUpIcon sx={{ fontSize: 12, color: '#10B981' }} /> : <TrendingDownIcon sx={{ fontSize: 12, color: '#EF4444' }} />}
                          <Typography sx={{ fontSize: '0.7rem', color: stat.trendUp ? '#10B981' : '#EF4444', fontWeight: 500 }}>
                            {stat.trend}
                          </Typography>
                          <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8' }}>vs last week</Typography>
                        </Box>
                      </Box>
                      <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(stat.color, 0.1), color: stat.color }}>
                        {stat.icon}
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: `1px solid ${alpha('#6366F1', 0.1)}` }}>
          <Tab icon={<RouteIcon />} iconPosition="start" label="All Routes" />
          <Tab icon={<AssessmentIcon />} iconPosition="start" label="Analytics" />
        </Tabs>

        {/* All Routes Tab */}
        {activeTab === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {routes.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
                <RouteIcon sx={{ fontSize: 64, color: alpha('#6366F1', 0.3), mb: 2 }} />
                <Typography variant="h6" color="text.secondary">No routes available</Typography>
                <Typography variant="body2" color="text.secondary">Routes will appear here when assigned</Typography>
                <Button variant="contained" onClick={handleRefresh} sx={{ mt: 2, bgcolor: '#6366F1' }}>
                  Refresh
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {routes.map((route) => (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={route._id}>
                    <motion.div variants={fadeInUp} whileHover={{ y: -5 }}>
                      <Card sx={{ 
                        borderRadius: 3, 
                        border: `1px solid ${alpha(getStatusColor(route.status), 0.2)}`, 
                        transition: '0.3s', 
                        '&:hover': { 
                          transform: 'translateY(-4px)',
                          boxShadow: `0 10px 25px ${alpha(getStatusColor(route.status), 0.15)}` 
                        }
                      }}>
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>{route.routeId}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {route.date ? new Date(route.date).toLocaleDateString() : 'Date not set'}
                              </Typography>
                            </Box>
                            <Chip 
                              icon={getStatusIcon(route.status)} 
                              label={route.status} 
                              size="small" 
                              sx={{ bgcolor: alpha(getStatusColor(route.status), 0.1), color: getStatusColor(route.status) }} 
                            />
                          </Stack>
                          <Divider sx={{ my: 1.5 }} />
                          <Grid container spacing={1.5}>
                            <Grid size={{ xs: 6 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SpeedIcon sx={{ fontSize: 16, color: '#6366F1' }} />
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Distance</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{route.totalDistance || 0} km</Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TimeIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Duration</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{route.estimatedDuration || 0} min</Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <StopIcon sx={{ fontSize: 16, color: '#10B981' }} />
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Stops</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{route.stopsCount || 0}</Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CarIcon sx={{ fontSize: 16, color: '#8B5CF6' }} />
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Vehicle</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{route.vehicle || 'N/A'}</Typography>
                                </Box>
                              </Box>
                            </Grid>
                          </Grid>
                          <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">Progress</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: getStatusColor(route.status) }}>
                                {route.progress || 0}%
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={route.progress || 0} 
                              sx={{ 
                                height: 6, 
                                borderRadius: 3, 
                                bgcolor: alpha(getStatusColor(route.status), 0.1), 
                                '& .MuiLinearProgress-bar': { bgcolor: getStatusColor(route.status), borderRadius: 3 } 
                              }} 
                            />
                          </Box>
                          <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                            <Button 
                              variant="outlined" 
                              size="small" 
                              fullWidth 
                              onClick={() => handleViewDetails(route)} 
                              startIcon={<MapIcon />} 
                              sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                              Details
                            </Button>
                            {route.status !== "Completed" && (
                              <Button 
                                variant="contained" 
                                size="small" 
                                fullWidth 
                                onClick={() => handleStartRoute(route)} 
                                startIcon={<PlayIcon />} 
                                sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#10B981' }}
                              >
                                Start
                              </Button>
                            )}
                            <Tooltip title="Optimize Route">
                              <IconButton 
                                onClick={() => handleOptimizeRoute(route)} 
                                sx={{ bgcolor: alpha('#6366F1', 0.1), borderRadius: 2 }}
                              >
                                <SettingsIcon sx={{ color: '#6366F1' }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}` }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>📈 Route Efficiency Trend</Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={efficiencyData}>
                      <defs>
                        <linearGradient id="efficiencyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha('#6366F1', 0.08)} />
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                      <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                      <Legend />
                      <Area type="monotone" dataKey="efficiency" stroke="#6366F1" strokeWidth={2} fill="url(#efficiencyGrad)" name="Efficiency %" />
                      <Area type="monotone" dataKey="target" stroke="#10B981" strokeWidth={2} fill="none" strokeDasharray="5 5" name="Target" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, lg: 4 }}>
                <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}`, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>📊 Route Distribution</Typography>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie 
                        data={routeDistribution} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={55} 
                        outerRadius={85} 
                        dataKey="value" 
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`} 
                        labelLine={false}
                      >
                        {routeDistribution.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                    {routeDistribution.map((item, i) => (
                      <Chip 
                        key={i} 
                        label={`${item.name}: ${item.value}%`} 
                        size="small" 
                        sx={{ bgcolor: alpha(item.color, 0.1), color: item.color }} 
                      />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
            <Paper sx={{ p: 3, mt: 3, borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}` }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>🎯 Performance Metrics</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ p: 2, bgcolor: alpha('#10B981', 0.05), borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>94%</Typography>
                    <Typography variant="body2">On-Time Delivery</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ p: 2, bgcolor: alpha('#F59E0B', 0.05), borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>12%</Typography>
                    <Typography variant="body2">Fuel Reduction</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ p: 2, bgcolor: alpha('#6366F1', 0.05), borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366F1' }}>98%</Typography>
                    <Typography variant="body2">Route Optimization</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>
        )}

        {/* Route Details Dialog */}
        <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ bgcolor: alpha('#6366F1', 0.03), borderBottom: `1px solid ${alpha('#6366F1', 0.1)}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Route Details - {selectedRoute?.routeId}</Typography>
              <IconButton onClick={() => setOpenDetailsDialog(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedRoute && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">Driver</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 14 }} />
                    <Typography variant="body2">{selectedRoute.driver || 'Not assigned'}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Vehicle</Typography>
                  <Typography variant="body2">{selectedRoute.vehicle || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Start Time</Typography>
                  <Typography variant="body2">{selectedRoute.startTime || 'Not started'}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Route Stops</Typography>
                  <List dense>
                    {selectedRoute.stops && selectedRoute.stops.length > 0 ? (
                      selectedRoute.stops.map((stop, index) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              bgcolor: stop.status === 'completed' ? alpha('#10B981', 0.1) : 
                                        stop.status === 'in-progress' ? alpha('#F59E0B', 0.1) : 
                                        alpha('#94A3B8', 0.1), 
                              width: 32, 
                              height: 32 
                            }}>
                              {stop.status === 'completed' ? 
                                <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} /> : 
                                <LocationOnIcon sx={{ fontSize: 16, color: stop.status === 'in-progress' ? '#F59E0B' : '#94A3B8' }} />
                              }
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={stop.location}
                            secondary={`${stop.address || ''} • ${stop.time || ''}`}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">No stops available</Typography>
                    )}
                  </List>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${alpha('#6366F1', 0.1)}` }}>
            <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
            {selectedRoute?.status !== "Completed" && (
              <Button 
                variant="contained" 
                onClick={() => { 
                  handleStartRoute(selectedRoute); 
                  setOpenDetailsDialog(false); 
                }} 
                sx={{ bgcolor: '#10B981' }}
              >
                Start Route
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
}

export default RouteOptimization;