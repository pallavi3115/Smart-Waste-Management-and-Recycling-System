// src/components/admin/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  Container,
  Button,
  Tabs,
  Tab,
  Stack,
  Skeleton,
  Badge,
  Divider
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Recycling as RecyclingIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationOnIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Sensors as SensorsIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Notifications as NotificationsIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Bolt as BoltIcon,
  Thermostat as TempIcon,
  BatteryFull as BatteryIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
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
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import AdvancedAnalytics from './AdvancedAnalytics';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

let ws = null;

const AdminDashboard = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [bins, setBins] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [hoveredCard, setHoveredCard] = useState(null);
  
  // Stats
  const [stats, setStats] = useState({
    totalBins: 0,
    activeBins: 0,
    offlineBins: 0,
    fullBins: 0,
    avgFillLevel: 0,
    totalRecycled: 0,
    co2Saved: 0,
    alerts: 0,
    totalReports: 0,
    resolvedReports: 0
  });

  // Chart data
  const [fillTrendData, setFillTrendData] = useState([]);
  const [wasteComposition, setWasteComposition] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    fetchDashboardData();
    connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      ws = new WebSocket('ws://localhost:8080');
      
      ws.onopen = () => {
        console.log('✅ Admin Dashboard WebSocket connected');
        setSocketConnected(true);
        toast.success('Connected to IoT sensors', { icon: '🔌' });
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'bin_update') {
            // Update bin in real-time
            setBins(prev => prev.map(bin => 
              bin._id === data.data._id ? { ...bin, ...data.data } : bin
            ));
            
            // Add to recent activity
            setRecentActivity(prev => [
              {
                id: Date.now(),
                binId: data.data.binId,
                action: `Fill level changed to ${data.data.currentFillLevel}%`,
                status: data.data.status,
                time: new Date().toLocaleTimeString()
              },
              ...prev.slice(0, 9)
            ]);
            
            // Update stats
            setBins(prevBins => {
              updateStats(prevBins);
              return prevBins;
            });
          }
        } catch (err) {
          console.error('WebSocket message error:', err);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setSocketConnected(false);
        setTimeout(connectWebSocket, 5000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setSocketConnected(false);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch bins from API
      const binsRes = await api.get("/bins/all").catch(() => ({ data: { data: [] } }));
      const binsData = binsRes.data?.data || [];
      
      // Fetch centers from API
      const centersRes = await api.get("/recycling-centers/all").catch(() => ({ data: { data: [] } }));
      const centersData = centersRes.data?.data || [];
      
      setBins(binsData);
      setCenters(centersData);
      updateStats(binsData);
      generateChartData(binsData);
      generateRecentActivity(binsData);
      
      if (binsData.length === 0) {
        toast.info('No bins found. Add bins in Bin Management.', { icon: '🗑️' });
      } else {
        toast.success(`${binsData.length} bins loaded`);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (binsData) => {
    const fullBins = binsData.filter(b => (b.currentFillLevel || 0) >= 80).length;
    const activeBins = binsData.filter(b => (b.wifiStrength || 0) > 50).length;
    const offlineBins = binsData.filter(b => (b.wifiStrength || 0) <= 50).length;
    const avgFill = binsData.length > 0 
      ? Math.round(binsData.reduce((acc, b) => acc + (b.currentFillLevel || 0), 0) / binsData.length)
      : 0;
    const alerts = binsData.filter(b => b.alerts?.fire || b.alerts?.overflow).length;
    const totalReports = 24;
    const resolvedReports = 18;

    setStats({
      totalBins: binsData.length,
      activeBins,
      offlineBins,
      fullBins,
      avgFillLevel: avgFill,
      totalRecycled: 12500,
      co2Saved: 8920,
      alerts,
      totalReports,
      resolvedReports
    });
    setLastUpdate(new Date());
  };

  const generateChartData = (binsData) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const trend = days.map((day, i) => ({
      day,
      fillLevel: binsData.length > 0 
        ? Math.round(binsData.reduce((acc, b) => acc + (b.currentFillLevel || 0), 0) / binsData.length)
        : 45 + Math.random() * 40,
      collections: 35 + Math.random() * 35
    }));
    setFillTrendData(trend);

    const composition = [
      { name: 'General Waste', value: 48, color: '#6366F1', icon: '🗑️' },
      { name: 'Recyclable', value: 28, color: '#10B981', icon: '♻️' },
      { name: 'E-Waste', value: 14, color: '#F59E0B', icon: '💻' },
      { name: 'Organic', value: 10, color: '#EF4444', icon: '🍎' }
    ];
    setWasteComposition(composition);

    const weekly = [
      { name: 'Week 1', collections: 620, recycling: 410 },
      { name: 'Week 2', collections: 685, recycling: 445 },
      { name: 'Week 3', collections: 710, recycling: 468 },
      { name: 'Week 4', collections: 832, recycling: 524 }
    ];
    setWeeklyData(weekly);
  };

  const generateRecentActivity = (binsData) => {
    const activities = binsData.slice(0, 5).map(bin => ({
      id: bin._id,
      binId: bin.binId,
      action: `Fill level ${bin.currentFillLevel}%`,
      status: bin.status,
      time: new Date(bin.lastUpdated).toLocaleTimeString()
    }));
    setRecentActivity(activities);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Full': return '#EF4444';
      case 'Partial': return '#F59E0B';
      case 'Empty': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Full': return <WarningIcon sx={{ fontSize: 14 }} />;
      case 'Partial': return <SpeedIcon sx={{ fontSize: 14 }} />;
      case 'Empty': return <CheckCircleIcon sx={{ fontSize: 14 }} />;
      default: return null;
    }
  };

  const getWifiIcon = (strength) => {
    if (strength >= 70) return <WifiIcon sx={{ fontSize: 14, color: '#10B981' }} />;
    if (strength >= 40) return <WifiIcon sx={{ fontSize: 14, color: '#F59E0B' }} />;
    return <WifiOffIcon sx={{ fontSize: 14, color: '#EF4444' }} />;
  };

  const statCards = [
    { label: 'Total Bins', value: stats.totalBins, icon: <DeleteIcon />, color: '#6366F1', trend: '+12%', trendUp: true, description: 'Active smart bins' },
    { label: 'Active Bins', value: stats.activeBins, icon: <WifiIcon />, color: '#10B981', trend: '+8%', trendUp: true, description: 'Online & connected' },
    { label: 'Full Bins', value: stats.fullBins, icon: <WarningIcon />, color: '#EF4444', trend: '+3%', trendUp: false, description: 'Need immediate attention' },
    { label: 'Avg Fill', value: `${stats.avgFillLevel}%`, icon: <SpeedIcon />, color: '#F59E0B', trend: '-2%', trendUp: false, description: 'Average fill level' },
    { label: 'CO₂ Saved', value: `${stats.co2Saved} kg`, icon: <RecyclingIcon />, color: '#10B981', trend: '+15%', trendUp: true, description: 'Environmental impact' },
    { label: 'Active Alerts', value: stats.alerts, icon: <NotificationsIcon />, color: '#EF4444', trend: '+2%', trendUp: false, description: 'Critical alerts' }
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
        </Box>
        <Grid container spacing={2.5}>
          {[1,2,3,4,5,6].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        {/* Header Section */}
        <motion.div variants={fadeInUp}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4, 
            flexWrap: 'wrap', 
            gap: 2,
            p: 2.5,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha('#6366F1', 0.05)} 0%, ${alpha('#8B5CF6', 0.02)} 100%)`,
            border: `1px solid ${alpha('#6366F1', 0.1)}`
          }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                IoT Smart Dashboard
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  Real-time waste management system monitoring
                </Typography>
                <Chip 
                  label={socketConnected ? "Live" : "Offline"} 
                  size="small" 
                  sx={{ bgcolor: socketConnected ? '#10B981' : '#EF4444', color: 'white', height: 20, fontSize: '0.6rem' }}
                />
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={fetchDashboardData}
                sx={{ borderRadius: 2, textTransform: 'none', borderColor: alpha('#6366F1', 0.5), color: '#6366F1' }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<DownloadIcon />}
                sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#6366F1' }}
              >
                Export Report
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Stats Cards Row - 6 Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {statCards.map((card, i) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 4,
                    border: `1px solid ${alpha(card.color, 0.15)}`,
                    background: `linear-gradient(135deg, ${alpha(card.color, 0.04)} 0%, ${alpha(card.color, 0.01)} 100%)`,
                    transition: 'all 0.3s',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': { boxShadow: `0 20px 35px ${alpha(card.color, 0.15)}` }
                  }}
                >
                  <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.05 }}>
                    {card.icon}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: card.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {card.label}
                      </Typography>
                      <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B', mt: 0.5, lineHeight: 1.2 }}>
                        {card.value}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                        {card.trendUp ? 
                          <TrendingUpIcon sx={{ fontSize: 12, color: '#10B981' }} /> : 
                          <TrendingDownIcon sx={{ fontSize: 12, color: '#EF4444' }} />
                        }
                        <Typography sx={{ fontSize: '0.7rem', color: card.trendUp ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                          {card.trend}
                        </Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8' }}>vs last week</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.5, display: 'block' }}>
                        {card.description}
                      </Typography>
                    </Box>
                    <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(card.color, 0.12), color: card.color, boxShadow: `0 4px 12px ${alpha(card.color, 0.2)}` }}>
                      {card.icon}
                    </Avatar>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={card.trendUp ? 75 : 45} 
                    sx={{ mt: 2, height: 3, borderRadius: 2, bgcolor: alpha(card.color, 0.1), '& .MuiLinearProgress-bar': { bgcolor: card.color, borderRadius: 2 } }} 
                  />
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)} 
          sx={{ 
            mb: 3, 
            borderBottom: `1px solid ${alpha('#6366F1', 0.1)}`,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.9rem', px: 3 },
            '& .Mui-selected': { color: '#6366F1' },
            '& .MuiTabs-indicator': { backgroundColor: '#6366F1', height: 3 }
          }}
        >
          <Tab icon={<DashboardIcon />} iconPosition="start" label="Overview" />
          <Tab icon={<AnalyticsIcon />} iconPosition="start" label="Analytics" />
          <Tab icon={<AssessmentIcon />} iconPosition="start" label="Reports" />
        </Tabs>

        {/* Dashboard Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Grid container spacing={2.5}>
                {/* Charts Section - Left */}
                <Grid item xs={12} lg={8}>
                  <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}`, background: '#FFFFFF' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                        📈 Fill Level Trends
                      </Typography>
                      <Chip label="Last 7 Days" size="small" sx={{ bgcolor: alpha('#6366F1', 0.1), color: '#6366F1' }} />
                    </Box>
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={fillTrendData}>
                        <defs>
                          <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha('#6366F1', 0.08)} />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                        <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                        <Legend />
                        <Area type="monotone" dataKey="fillLevel" stroke="#6366F1" strokeWidth={2} fill="url(#fillGrad)" name="Fill Level %" />
                        <Area type="monotone" dataKey="collections" stroke="#10B981" strokeWidth={2} fill="none" name="Collections" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                {/* Waste Composition - Right */}
                <Grid item xs={12} lg={4}>
                  <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}`, background: '#FFFFFF', height: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 2 }}>
                      🥧 Waste Composition
                    </Typography>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={wasteComposition}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {wasteComposition.map((entry, i) => (<Cell key={i} fill={entry.color} strokeWidth={2} stroke="#FFFFFF" />))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap', mt: 1 }}>
                      {wasteComposition.map((item, i) => (
                        <Chip 
                          key={i} 
                          icon={<span>{item.icon}</span>}
                          label={`${item.name} ${item.value}%`} 
                          size="small" 
                          sx={{ bgcolor: alpha(item.color, 0.1), color: item.color }} 
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>

                {/* Weekly Performance */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}`, background: '#FFFFFF' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 2 }}>
                      📊 Weekly Performance Overview
                    </Typography>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha('#6366F1', 0.08)} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                        <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                        <Legend />
                        <Bar dataKey="collections" fill="#6366F1" radius={[8, 8, 0, 0]} name="Collections (tons)" />
                        <Bar dataKey="recycling" fill="#10B981" radius={[8, 8, 0, 0]} name="Recycling (tons)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                {/* IoT Smart Bins Table */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}`, background: '#FFFFFF' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                          🛰️ IoT Smart Bins Status
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Real-time data from connected sensors</Typography>
                      </Box>
                      <Button size="small" startIcon={<AddIcon />} sx={{ color: '#6366F1' }}>Add New Bin</Button>
                    </Box>
                    {bins.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <SensorsIcon sx={{ fontSize: 48, color: alpha('#6366F1', 0.3), mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">No bins found. Add bins in Bin Management.</Typography>
                      </Box>
                    ) : (
                      <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 800 }}>
                          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700 }}>Bin ID</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Fill Level</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Connectivity</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Battery</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Temp</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Alerts</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {bins.slice(0, 5).map((bin) => (
                              <TableRow key={bin._id} hover>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <SensorsIcon sx={{ fontSize: 14, color: '#6366F1' }} />
                                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{bin.binId}</Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <LocationOnIcon sx={{ fontSize: 12, color: '#64748B' }} />
                                    <Typography sx={{ fontSize: '0.75rem' }}>{bin.area}</Typography>
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ minWidth: 150 }}>
                                  <Typography variant="caption">{bin.currentFillLevel || 0}%</Typography>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={bin.currentFillLevel || 0} 
                                    sx={{ height: 6, borderRadius: 3, mt: 0.5, bgcolor: alpha(getStatusColor(bin.status), 0.1), '& .MuiLinearProgress-bar': { bgcolor: getStatusColor(bin.status), borderRadius: 3 } }} 
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    icon={getStatusIcon(bin.status)}
                                    label={bin.status || 'Empty'} 
                                    size="small" 
                                    sx={{ bgcolor: alpha(getStatusColor(bin.status), 0.12), color: getStatusColor(bin.status) }} 
                                  />
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {getWifiIcon(bin.wifiStrength)}
                                    <Typography sx={{ fontSize: '0.7rem' }}>{bin.wifiStrength || 85}%</Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    icon={<BatteryIcon sx={{ fontSize: 12 }} />}
                                    label={`${bin.batteryLevel || 100}%`}
                                    size="small"
                                    sx={{ bgcolor: (bin.batteryLevel || 100) < 20 ? alpha('#EF4444', 0.1) : alpha('#10B981', 0.1), color: (bin.batteryLevel || 100) < 20 ? '#EF4444' : '#10B981' }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    icon={<TempIcon sx={{ fontSize: 12 }} />}
                                    label={`${bin.temperature || 25}°C`}
                                    size="small"
                                    sx={{ bgcolor: alpha('#6366F1', 0.1), color: '#6366F1' }}
                                  />
                                </TableCell>
                                <TableCell>
                                  {bin.alerts?.fire && <Chip label="FIRE" size="small" sx={{ bgcolor: alpha('#EF4444', 0.12), color: '#EF4444' }} />}
                                  {bin.alerts?.overflow && <Chip label="OVERFLOW" size="small" sx={{ bgcolor: alpha('#F59E0B', 0.12), color: '#F59E0B' }} />}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Paper>
                </Grid>

                {/* Recycling Centers */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}`, background: '#FFFFFF' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 2.5 }}>
                      ♻️ Recycling Centers
                    </Typography>
                    <Grid container spacing={2.5}>
                      {centers.length === 0 ? (
                        <Grid item xs={12}>
                          <Box sx={{ textAlign: 'center', py: 3 }}>
                            <RecyclingIcon sx={{ fontSize: 40, color: alpha('#6366F1', 0.3), mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">No recycling centers found</Typography>
                          </Box>
                        </Grid>
                      ) : (
                        centers.map((center) => {
                          const percent = (center.current_load / center.capacity) * 100;
                          return (
                            <Grid item xs={12} md={4} key={center._id}>
                              <Card sx={{ borderRadius: 3, border: `1px solid ${alpha('#10B981', 0.1)}`, transition: '0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 25px ${alpha('#10B981', 0.15)}` } }}>
                                <CardContent>
                                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>{center.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">{center.location}</Typography>
                                  <Chip label={center.type} size="small" sx={{ mt: 1, bgcolor: alpha('#10B981', 0.1), color: '#10B981' }} />
                                  <Box sx={{ mt: 2 }}>
                                    <LinearProgress variant="determinate" value={percent} sx={{ height: 6, borderRadius: 3 }} />
                                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                                      {center.current_load}/{center.capacity} tons ({Math.round(percent)}%)
                                    </Typography>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          );
                        })
                      )}
                    </Grid>
                  </Paper>
                </Grid>

                {/* Recent Activity */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}`, background: '#FFFFFF' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 2.5 }}>
                      🕐 Recent Activity
                    </Typography>
                    {recentActivity.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>No recent activity</Typography>
                    ) : (
                      recentActivity.map((activity) => (
                        <Box key={activity.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${alpha('#6366F1', 0.05)}` }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Badge color={activity.status === 'Full' ? 'error' : activity.status === 'Partial' ? 'warning' : 'success'} variant="dot" />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{activity.binId}</Typography>
                            <Typography variant="caption" color="text.secondary">{activity.action}</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">{activity.time}</Typography>
                        </Box>
                      ))
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 1 && <AdvancedAnalytics />}

          {/* Reports Tab */}
          {activeTab === 2 && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}`, background: '#FFFFFF' }}>
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <AssessmentIcon sx={{ fontSize: 80, color: alpha('#6366F1', 0.2), mb: 2 }} />
                </motion.div>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#1E293B' }}>Generate Reports</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                  Download detailed reports about waste collection, recycling statistics, and system performance
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button variant="contained" startIcon={<DownloadIcon />} sx={{ bgcolor: '#6366F1', borderRadius: 2, textTransform: 'none', px: 3 }}>
                    Monthly Report
                  </Button>
                  <Button variant="outlined" startIcon={<CalendarIcon />} sx={{ borderColor: alpha('#6366F1', 0.3), color: '#6366F1', borderRadius: 2, textTransform: 'none' }}>
                    Custom Range
                  </Button>
                </Stack>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Container>
  );
};

export default AdminDashboard;