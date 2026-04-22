// src/components/admin/RecyclingCenters.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  alpha,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Tabs,
  Tab,
  Stack,
  Skeleton,
  Rating,
  Divider,
  Fade,
  Zoom,
  Badge,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useTheme,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationOnIcon,
  Recycling as RecyclingIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
  DeleteSweep as DeleteSweepIcon,
  Map as MapIcon,
  Analytics as AnalyticsIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Store as StoreIcon,
  LocalShipping as LocalShippingIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  Print as PrintIcon,
  Share as ShareIcon
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

// Professional color palette
const colors = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  secondary: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  gray: '#64748B',
  dark: '#1E293B',
  light: '#F8FAFC',
  white: '#FFFFFF'
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const cardHover = {
  hover: { 
    y: -8, 
    transition: { duration: 0.2 },
    boxShadow: '0 20px 40px rgba(99, 102, 241, 0.15)'
  }
};

const RecyclingCenters = () => {
  const theme = useTheme();
  const [centers, setCenters] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCenter, setEditingCenter] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [capacityTrend, setCapacityTrend] = useState([]);
  const [materialDistribution, setMaterialDistribution] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
    capacity: "",
    address: "",
    phone: "",
    email: "",
    materials: [],
    operatingHours: "9:00 AM - 6:00 PM",
    contactPerson: "",
    rating: 0,
    description: ""
  });

  useEffect(() => {
    fetchCenters();
    generateAnalyticsData();
  }, []);

  useEffect(() => {
    filterCenters();
  }, [centers, searchTerm, filterMaterial, filterStatus]);

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const res = await api.get("/recycling/centers");
      const centersData = res.data.data || [];
      setCenters(centersData);
      setFilteredCenters(centersData);
      generateAnalyticsData(centersData);
      if (centersData.length === 0) {
        toast.success('✨ Welcome! Add your first recycling center to get started', { 
          icon: '♻️',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error fetching centers:', error);
      const mockData = getMockCenters();
      setCenters(mockData);
      setFilteredCenters(mockData);
      generateAnalyticsData(mockData);
      toast.error('Using demo data - Connect to backend for live data', { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const getMockCenters = () => {
    return [
      { 
        _id: '1', 
        name: 'Green Earth Recycling Hub', 
        address: 'Sector 12, Delhi NCR', 
        capacity: 5000, 
        current_load: 3250, 
        latitude: 28.6139, 
        longitude: 77.2090, 
        phone: '+91 98765 43210', 
        email: 'contact@greenearth.com', 
        materials: ['plastic', 'paper', 'glass'], 
        rating: { average: 4.8, count: 156 },
        isActive: true,
        operatingHours: '24/7',
        contactPerson: 'Rajesh Kumar',
        description: 'State-of-the-art recycling facility specializing in plastic and paper waste',
        established: '2019',
        totalProcessed: 12500,
        co2Saved: 8750,
        energySaved: 25000
      },
      { 
        _id: '2', 
        name: 'EcoTech Recycling Center', 
        address: 'Sector 15, Delhi NCR', 
        capacity: 3000, 
        current_load: 2450, 
        latitude: 28.5355, 
        longitude: 77.3910, 
        phone: '+91 98765 43211', 
        email: 'info@ecotech.com', 
        materials: ['ewaste', 'metal', 'batteries'], 
        rating: { average: 4.6, count: 89 },
        isActive: true,
        operatingHours: '8:00 AM - 8:00 PM',
        contactPerson: 'Priya Sharma',
        description: 'Leading e-waste recycling facility with advanced separation technology',
        established: '2020',
        totalProcessed: 8900,
        co2Saved: 6200,
        energySaved: 18000
      },
      { 
        _id: '3', 
        name: 'WasteWise Resource Center', 
        address: 'Sector 20, Delhi NCR', 
        capacity: 2500, 
        current_load: 1800, 
        latitude: 28.7041, 
        longitude: 77.1025, 
        phone: '+91 98765 43212', 
        email: 'support@wastewise.com', 
        materials: ['general', 'recyclable', 'organic'], 
        rating: { average: 4.7, count: 112 },
        isActive: true,
        operatingHours: '7:00 AM - 9:00 PM',
        contactPerson: 'Amit Verma',
        description: 'Comprehensive waste management and resource recovery center',
        established: '2018',
        totalProcessed: 15200,
        co2Saved: 10500,
        energySaved: 32000
      },
      { 
        _id: '4', 
        name: 'Blue Planet Recycling', 
        address: 'Sector 25, Delhi NCR', 
        capacity: 4500, 
        current_load: 4100, 
        latitude: 28.6500, 
        longitude: 77.2500, 
        phone: '+91 98765 43213', 
        email: 'hello@blueplanet.com', 
        materials: ['plastic', 'glass', 'metal', 'paper'], 
        rating: { average: 4.9, count: 203 },
        isActive: true,
        operatingHours: '24/7',
        contactPerson: 'Sneha Reddy',
        description: 'Zero-waste facility with 95% recycling efficiency',
        established: '2021',
        totalProcessed: 9800,
        co2Saved: 7200,
        energySaved: 21000
      }
    ];
  };

  const filterCenters = () => {
    let filtered = [...centers];
    
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterMaterial !== 'all') {
      filtered = filtered.filter(c => 
        c.materials?.some(m => m.toLowerCase() === filterMaterial.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      if (filterStatus === 'active') {
        filtered = filtered.filter(c => c.isActive !== false);
      } else if (filterStatus === 'critical') {
        filtered = filtered.filter(c => getFillPercentage(c) >= 85);
      } else if (filterStatus === 'warning') {
        filtered = filtered.filter(c => getFillPercentage(c) >= 70 && getFillPercentage(c) < 85);
      } else if (filterStatus === 'normal') {
        filtered = filtered.filter(c => getFillPercentage(c) < 70);
      }
    }
    
    setFilteredCenters(filtered);
  };

  const generateAnalyticsData = (centersData = centers) => {
    // Capacity trend for last 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const trend = months.map((month, i) => ({
      month,
      recycled: centersData.length > 0 
        ? Math.round(centersData.reduce((acc, c) => acc + (c.current_load || 0), 0) / centersData.length * (0.8 + i * 0.05))
        : 2000 + Math.random() * 1500,
      capacity: centersData.length > 0
        ? Math.round(centersData.reduce((acc, c) => acc + (c.capacity || 0), 0) / centersData.length)
        : 3500,
      efficiency: Math.min(98, 75 + i * 3)
    }));
    setCapacityTrend(trend);

    // Material distribution
    const materials = {};
    centersData.forEach(center => {
      (center.materials || []).forEach(mat => {
        materials[mat] = (materials[mat] || 0) + 1;
      });
    });
    const materialColors = {
      'plastic': '#6366F1',
      'paper': '#10B981',
      'glass': '#F59E0B',
      'metal': '#EF4444',
      'ewaste': '#8B5CF6',
      'general': '#EC4899',
      'recyclable': '#06B6D4',
      'organic': '#84CC16',
      'batteries': '#F97316',
      'textile': '#D946EF'
    };
    const distribution = Object.entries(materials).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: materialColors[name] || '#6366F1'
    }));
    setMaterialDistribution(distribution);

    // Performance radar data
    const radarData = [
      { subject: 'Collection Efficiency', A: 85, fullMark: 100 },
      { subject: 'Processing Speed', A: 78, fullMark: 100 },
      { subject: 'Waste Diversion', A: 92, fullMark: 100 },
      { subject: 'Energy Recovery', A: 68, fullMark: 100 },
      { subject: 'CO2 Reduction', A: 88, fullMark: 100 },
      { subject: 'Community Impact', A: 75, fullMark: 100 }
    ];
    setPerformanceData(radarData);

    // Monthly statistics
    const monthly = [
      { month: 'Jan', processed: 1200, revenue: 45000, cost: 32000 },
      { month: 'Feb', processed: 1350, revenue: 51000, cost: 34500 },
      { month: 'Mar', processed: 1480, revenue: 56000, cost: 36800 },
      { month: 'Apr', processed: 1620, revenue: 61000, cost: 39500 },
      { month: 'May', processed: 1750, revenue: 66000, cost: 42000 },
      { month: 'Jun', processed: 1890, revenue: 71000, cost: 44500 }
    ];
    setMonthlyStats(monthly);
  };

  const getFillPercentage = (center) => {
    if (!center.capacity) return 0;
    const currentLoad = center.current_load || 0;
    return (currentLoad / center.capacity) * 100;
  };

  const getStatusColor = (fillPercentage) => {
    if (fillPercentage >= 85) return colors.danger;
    if (fillPercentage >= 70) return colors.warning;
    return colors.secondary;
  };

  const getStatusLabel = (fillPercentage) => {
    if (fillPercentage >= 85) return 'Critical';
    if (fillPercentage >= 70) return 'High Load';
    if (fillPercentage >= 40) return 'Moderate';
    return 'Available';
  };

  const getStatusIcon = (fillPercentage) => {
    if (fillPercentage >= 85) return <WarningIcon sx={{ fontSize: 14 }} />;
    if (fillPercentage >= 70) return <TrendingUpIcon sx={{ fontSize: 14 }} />;
    return <CheckCircleIcon sx={{ fontSize: 14 }} />;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMaterialsChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, materials: typeof value === 'string' ? value.split(',').map(m => m.trim()) : value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.capacity || !form.address) {
      toast.error("Please fill all required fields ⚠️");
      return;
    }

    try {
      const centerData = {
        name: form.name,
        capacity: Number(form.capacity),
        latitude: Number(form.latitude) || 0,
        longitude: Number(form.longitude) || 0,
        address: form.address,
        phone: form.phone,
        email: form.email,
        materials: form.materials,
        operatingHours: form.operatingHours,
        contactPerson: form.contactPerson,
        description: form.description,
        current_load: 0,
        rating: { average: 0, count: 0 }
      };

      if (editingCenter) {
        await api.put(`/recycling/centers/${editingCenter._id}`, centerData);
        toast.success("Center updated successfully ✅");
      } else {
        await api.post("/recycling/centers", centerData);
        toast.success("Center added successfully ✅");
      }

      resetForm();
      setOpenDialog(false);
      fetchCenters();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving center ❌");
    }
  };

  const handleDelete = async (centerId) => {
    if (window.confirm("Are you sure you want to delete this recycling center? This action cannot be undone.")) {
      try {
        await api.delete(`/recycling/centers/${centerId}`);
        toast.success("Center deleted successfully");
        fetchCenters();
      } catch (error) {
        toast.error("Failed to delete center");
      }
    }
  };

  const handleEdit = (center) => {
    setEditingCenter(center);
    setForm({
      name: center.name,
      latitude: center.latitude || "",
      longitude: center.longitude || "",
      capacity: center.capacity,
      address: center.address,
      phone: center.phone || "",
      email: center.email || "",
      materials: center.materials || [],
      operatingHours: center.operatingHours || "9:00 AM - 6:00 PM",
      contactPerson: center.contactPerson || "",
      description: center.description || "",
      rating: center.rating?.average || 0
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setForm({
      name: "",
      latitude: "",
      longitude: "",
      capacity: "",
      address: "",
      phone: "",
      email: "",
      materials: [],
      operatingHours: "9:00 AM - 6:00 PM",
      contactPerson: "",
      rating: 0,
      description: ""
    });
    setEditingCenter(null);
  };

  const handleViewDetails = (center) => {
    setSelectedCenter(center);
    setOpenDetailDialog(true);
  };

  const exportData = async () => {
    setExportLoading(true);
    try {
      const exportData = filteredCenters.map(c => ({
        'Center Name': c.name,
        'Address': c.address,
        'Capacity (tons)': c.capacity,
        'Current Load (tons)': c.current_load || 0,
        'Utilization (%)': getFillPercentage(c).toFixed(1),
        'Status': getStatusLabel(getFillPercentage(c)),
        'Phone': c.phone,
        'Email': c.email,
        'Materials': c.materials?.join(', '),
        'Rating': c.rating?.average || 0
      }));
      
      // Create CSV
      const headers = Object.keys(exportData[0] || {});
      const csv = [
        headers.join(','),
        ...exportData.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recycling-centers-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  const calculateStats = () => {
    const totalCenters = filteredCenters.length;
    const fullCenters = filteredCenters.filter(c => getFillPercentage(c) >= 85).length;
    const activeCenters = filteredCenters.filter(c => c.isActive !== false).length;
    const avgFill = totalCenters
      ? Math.round(filteredCenters.reduce((a, c) => a + getFillPercentage(c), 0) / totalCenters)
      : 0;
    const totalCapacity = filteredCenters.reduce((a, c) => a + (c.capacity || 0), 0);
    const totalLoad = filteredCenters.reduce((a, c) => a + (c.current_load || 0), 0);
    const avgRating = totalCenters
      ? (filteredCenters.reduce((a, c) => a + (c.rating?.average || 0), 0) / totalCenters).toFixed(1)
      : 0;
    const totalProcessed = filteredCenters.reduce((a, c) => a + (c.totalProcessed || 0), 0);
    const totalCO2Saved = filteredCenters.reduce((a, c) => a + (c.co2Saved || 0), 0);

    return { totalCenters, fullCenters, activeCenters, avgFill, totalCapacity, totalLoad, avgRating, totalProcessed, totalCO2Saved };
  };

  const stats = calculateStats();

  const statCards = [
    { title: "Total Centers", value: stats.totalCenters, icon: <StoreIcon />, color: colors.primary, trend: "+12%", trendUp: true, subtitle: "Active facilities" },
    { title: "Processing Capacity", value: `${(stats.totalCapacity / 1000).toFixed(1)}k`, icon: <DeleteSweepIcon />, color: colors.purple, trend: "+8%", trendUp: true, subtitle: "Tons per month" },
    { title: "Current Load", value: `${(stats.totalLoad / 1000).toFixed(1)}k`, icon: <LocalShippingIcon />, color: colors.info, trend: "+15%", trendUp: true, subtitle: "Tons in processing" },
    { title: "Avg Utilization", value: `${stats.avgFill}%`, icon: <AssessmentIcon />, color: colors.warning, trend: "-3%", trendUp: false, subtitle: "Capacity usage" },
    { title: "Waste Processed", value: `${(stats.totalProcessed / 1000).toFixed(1)}k`, icon: <RecyclingIcon />, color: colors.secondary, trend: "+23%", trendUp: true, subtitle: "Tons this year" },
    { title: "CO₂ Saved", value: `${(stats.totalCO2Saved / 1000).toFixed(1)}k`, icon: <PeopleIcon />, color: colors.danger, trend: "+18%", trendUp: true, subtitle: "Tons of carbon" },
    { title: "Avg Rating", value: stats.avgRating, icon: <StarIcon />, color: colors.warning, trend: "+0.3", trendUp: true, subtitle: "Out of 5.0" },
    { title: "Full Centers", value: stats.fullCenters, icon: <WarningIcon />, color: colors.danger, trend: "+2", trendUp: false, subtitle: "Need immediate attention" }
  ];

  const uniqueMaterials = [...new Set(centers.flatMap(c => c.materials || []))];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
        </Box>
        <Grid container spacing={3}>
          {[1,2,3,4,5,6,7,8].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={400} sx={{ mt: 3, borderRadius: 3 }} />
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${alpha(colors.primary, 0.03)} 0%, ${alpha(colors.purple, 0.02)} 100%)`,
      pb: 6
    }}>
      <Container maxWidth="xl" sx={{ pt: 3 }}>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          {/* Hero Header */}
          <motion.div variants={fadeInUp}>
            <Paper elevation={0} sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 4,
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.purple} 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: 2 }}>
                      Waste Management System
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, mb: 1 }}>
                      Recycling Centers Management
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Manage and monitor all recycling facilities, track performance metrics, and optimize operations
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      startIcon={<DownloadIcon />}
                      onClick={exportData}
                      disabled={exportLoading}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        backdropFilter: 'blur(10px)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                      }}
                    >
                      {exportLoading ? 'Exporting...' : 'Export Data'}
                    </Button>
                    <Button 
                      variant="contained" 
                      startIcon={<AddIcon />}
                      onClick={() => setOpenDialog(true)}
                      sx={{ 
                        bgcolor: 'white', 
                        color: colors.primary,
                        '&:hover': { bgcolor: alpha('#fff', 0.95) }
                      }}
                    >
                      Add Center
                    </Button>
                  </Box>
                </Box>
              </Box>
              {/* Background decoration */}
              <Box sx={{ position: 'absolute', right: -50, top: -50, opacity: 0.1 }}>
                <RecyclingIcon sx={{ fontSize: 200 }} />
              </Box>
            </Paper>
          </motion.div>

          {/* Stats Grid */}
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {statCards.map((stat, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <motion.div variants={fadeInUp} whileHover="hover">
                  <Card component={motion.div} variants={cardHover} sx={{ borderRadius: 3, position: 'relative', overflow: 'visible' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: colors.gray, textTransform: 'uppercase', letterSpacing: 1 }}>
                            {stat.title}
                          </Typography>
                          <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: colors.dark, mt: 1 }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {stat.subtitle}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                            {stat.trendUp ? 
                              <TrendingUpIcon sx={{ fontSize: 14, color: colors.secondary }} /> : 
                              <TrendingDownIcon sx={{ fontSize: 14, color: colors.danger }} />
                            }
                            <Typography variant="caption" sx={{ color: stat.trendUp ? colors.secondary : colors.danger, fontWeight: 600 }}>
                              {stat.trend}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">vs last month</Typography>
                          </Box>
                        </Box>
                        <Avatar sx={{ 
                          width: 56, 
                          height: 56, 
                          bgcolor: alpha(stat.color, 0.1), 
                          color: stat.color,
                          boxShadow: `0 4px 14px ${alpha(stat.color, 0.3)}`
                        }}>
                          {stat.icon}
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Filters and Search */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search centers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: colors.gray, mr: 1, fontSize: 20 }} />,
                endAdornment: searchTerm && <IconButton size="small" onClick={() => setSearchTerm('')}><ClearIcon fontSize="small" /></IconButton>
              }}
              sx={{ minWidth: 250 }}
            />
            <TextField
              select
              size="small"
              label="Material Type"
              value={filterMaterial}
              onChange={(e) => setFilterMaterial(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Materials</MenuItem>
              {uniqueMaterials.map(mat => (
                <MenuItem key={mat} value={mat}>{mat.charAt(0).toUpperCase() + mat.slice(1)}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="normal">Normal (&lt;70%)</MenuItem>
              <MenuItem value="warning">Warning (70-85%)</MenuItem>
              <MenuItem value="critical">Critical (&gt;85%)</MenuItem>
            </TextField>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={fetchCenters}
              sx={{ ml: 'auto' }}
            >
              Refresh
            </Button>
          </Paper>

          {/* Tabs */}
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: `1px solid ${alpha(colors.primary, 0.1)}` }}>
            <Tab icon={<DashboardIcon />} iconPosition="start" label="All Centers" />
            <Tab icon={<TimelineIcon />} iconPosition="start" label="Analytics & Insights" />
            <Tab icon={<MapIcon />} iconPosition="start" label="Performance Metrics" />
            <Tab icon={<SettingsIcon />} iconPosition="start" label="Settings" />
          </Tabs>

          {/* Centers Table Tab */}
          {activeTab === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {filteredCenters.filter(c => getFillPercentage(c) >= 70).length > 0 && (
                <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: alpha(colors.warning, 0.05), border: `1px solid ${alpha(colors.warning, 0.2)}` }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: colors.warning }}>
                    <WarningIcon /> High Priority Alerts
                  </Typography>
                  <Grid container spacing={2}>
                    {filteredCenters.filter(c => getFillPercentage(c) >= 70).slice(0, 3).map(center => {
                      const fillPercent = getFillPercentage(center);
                      return (
                        <Grid item xs={12} md={4} key={center._id}>
                          <Card variant="outlined" sx={{ borderColor: alpha(getStatusColor(fillPercent), 0.3) }}>
                            <CardContent>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{center.name}</Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>{center.address}</Typography>
                              <LinearProgress variant="determinate" value={fillPercent} sx={{ height: 8, borderRadius: 4, my: 1, bgcolor: alpha(getStatusColor(fillPercent), 0.1), '& .MuiLinearProgress-bar': { bgcolor: getStatusColor(fillPercent) } }} />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="caption">{fillPercent.toFixed(0)}% utilized</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: getStatusColor(fillPercent) }}>{getStatusLabel(fillPercent)}</Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Paper>
              )}

              <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 600 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: colors.light }}>
                        <TableCell sx={{ fontWeight: 700 }}>Center Details</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Capacity</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Utilization</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Materials</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <AnimatePresence>
                        {filteredCenters.map((center, index) => {
                          const fillPercent = getFillPercentage(center);
                          return (
                            <motion.tr
                              key={center._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Avatar sx={{ bgcolor: alpha(colors.primary, 0.1), color: colors.primary }}>
                                    <RecyclingIcon />
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{center.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{center.phone}</Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Tooltip title={center.address}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <LocationOnIcon sx={{ fontSize: 14, color: colors.gray }} />
                                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {center.address.split(',')[0]}
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={500}>{center.capacity} tons</Typography>
                                <Typography variant="caption" color="text.secondary">Total capacity</Typography>
                              </TableCell>
                              <TableCell sx={{ minWidth: 180 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption" fontWeight={500}>{fillPercent.toFixed(0)}%</Typography>
                                  <Typography variant="caption" color="text.secondary">{center.current_load || 0}/{center.capacity} tons</Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={fillPercent} 
                                  sx={{ 
                                    height: 6, 
                                    borderRadius: 3,
                                    bgcolor: alpha(getStatusColor(fillPercent), 0.1),
                                    '& .MuiLinearProgress-bar': { 
                                      bgcolor: getStatusColor(fillPercent),
                                      borderRadius: 3
                                    }
                                  }} 
                                />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  icon={getStatusIcon(fillPercent)}
                                  label={getStatusLabel(fillPercent)} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: alpha(getStatusColor(fillPercent), 0.1), 
                                    color: getStatusColor(fillPercent),
                                    fontWeight: 500
                                  }} 
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {(center.materials || []).slice(0, 2).map((m, i) => (
                                    <Chip key={i} label={m} size="small" sx={{ bgcolor: alpha(colors.primary, 0.08), color: colors.primary, fontSize: '0.7rem' }} />
                                  ))}
                                  {(center.materials || []).length > 2 && (
                                    <Tooltip title={center.materials.slice(2).join(', ')}>
                                      <Chip label={`+${center.materials.length - 2}`} size="small" variant="outlined" />
                                    </Tooltip>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Rating value={center.rating?.average || 0} readOnly size="small" precision={0.5} />
                                  <Typography variant="caption" color="text.secondary">({center.rating?.count || 0})</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Tooltip title="View Details">
                                  <IconButton size="small" onClick={() => handleViewDetails(center)} sx={{ color: colors.info }}>
                                    <AnalyticsIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton size="small" onClick={() => handleEdit(center)} sx={{ color: colors.primary }}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" onClick={() => handleDelete(center._id)} sx={{ color: colors.danger }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                      {filteredCenters.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                            <RecyclingIcon sx={{ fontSize: 64, color: alpha(colors.primary, 0.2), mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">No recycling centers found</Typography>
                            <Typography variant="body2" color="text.secondary">Try adjusting your filters or add a new center</Typography>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)} sx={{ mt: 2, bgcolor: colors.primary }}>
                              Add Center
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>📈 Recycling Trends</Typography>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={capacityTrend}>
                        <defs>
                          <linearGradient id="recycledGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="capacityGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colors.secondary} stopOpacity={0.2}/>
                            <stop offset="95%" stopColor={colors.secondary} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(colors.gray, 0.1)} />
                        <XAxis dataKey="month" tick={{ fill: colors.gray }} />
                        <YAxis tick={{ fill: colors.gray }} />
                        <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Legend />
                        <Area type="monotone" dataKey="recycled" stroke={colors.primary} strokeWidth={2} fill="url(#recycledGrad)" name="Recycled (tons)" />
                        <Area type="monotone" dataKey="capacity" stroke={colors.secondary} strokeWidth={2} fill="url(#capacityGrad)" name="Capacity (tons)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} lg={4}>
                  <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>♻️ Material Distribution</Typography>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={materialDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {materialDistribution.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                      {materialDistribution.map((item, i) => (
                        <Chip key={i} label={`${item.name}: ${item.value}`} size="small" sx={{ bgcolor: alpha(item.color, 0.1), color: item.color }} />
                      ))}
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>📊 Monthly Performance</Typography>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={monthlyStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(colors.gray, 0.1)} />
                        <XAxis dataKey="month" tick={{ fill: colors.gray }} />
                        <YAxis yAxisId="left" tick={{ fill: colors.gray }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fill: colors.gray }} />
                        <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="processed" fill={colors.primary} name="Waste Processed (tons)" radius={[8,8,0,0]} />
                        <Bar yAxisId="right" dataKey="revenue" fill={colors.secondary} name="Revenue (₹)" radius={[8,8,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {/* Performance Metrics Tab */}
          {activeTab === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} lg={6}>
                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>🎯 Performance Radar</Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <RadarChart data={performanceData}>
                        <PolarGrid stroke={alpha(colors.gray, 0.2)} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: colors.gray, fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: colors.gray }} />
                        <Radar name="Performance" dataKey="A" stroke={colors.primary} fill={alpha(colors.primary, 0.3)} fillOpacity={0.6} />
                        <RechartsTooltip />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>🏆 Top Performing Centers</Typography>
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {filteredCenters.sort((a,b) => (b.rating?.average || 0) - (a.rating?.average || 0)).slice(0, 5).map((center, i) => (
                        <Box key={center._id} sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: alpha(colors.primary, 0.03) }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>#{i+1} {center.name}</Typography>
                              <Rating value={center.rating?.average || 0} readOnly size="small" precision={0.5} />
                            </Box>
                            <Chip label={`${center.rating?.average || 0} ★`} size="small" sx={{ bgcolor: colors.warning, color: 'white' }} />
                          </Box>
                          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">📊 {center.totalProcessed || 0} tons</Typography>
                            <Typography variant="caption" color="text.secondary">🌍 {center.co2Saved || 0} CO₂ saved</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                <SettingsIcon sx={{ fontSize: 80, color: alpha(colors.primary, 0.2), mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Center Configuration</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                  Configure notification thresholds, material categories, operating hours, and system preferences
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                  <Button variant="outlined" sx={{ borderColor: alpha(colors.primary, 0.3), color: colors.primary }}>Threshold Settings</Button>
                  <Button variant="outlined" sx={{ borderColor: alpha(colors.primary, 0.3), color: colors.primary }}>Material Categories</Button>
                  <Button variant="outlined" sx={{ borderColor: alpha(colors.primary, 0.3), color: colors.primary }}>Operating Hours</Button>
                  <Button variant="contained" sx={{ bgcolor: colors.primary }}>Save Preferences</Button>
                </Stack>
              </Paper>
            </motion.div>
          )}

          {/* Add/Edit Dialog */}
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ bgcolor: alpha(colors.primary, 0.03), borderBottom: `1px solid ${alpha(colors.primary, 0.1)}` }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{editingCenter ? 'Edit Center' : 'Add New Recycling Center'}</Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField label="Center Name *" name="name" value={form.name} onChange={handleChange} fullWidth required />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Address *" name="address" value={form.address} onChange={handleChange} fullWidth required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth type="email" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Capacity (tons) *" name="capacity" type="number" value={form.capacity} onChange={handleChange} fullWidth required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Materials (comma separated)" name="materials" value={form.materials.join(',')} onChange={handleMaterialsChange} fullWidth placeholder="plastic, paper, glass" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Latitude" name="latitude" type="number" value={form.latitude} onChange={handleChange} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Longitude" name="longitude" type="number" value={form.longitude} onChange={handleChange} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Operating Hours" name="operatingHours" value={form.operatingHours} onChange={handleChange} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Contact Person" name="contactPerson" value={form.contactPerson} onChange={handleChange} fullWidth />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth multiline rows={3} />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${alpha(colors.primary, 0.1)}`, gap: 1 }}>
              <Button onClick={() => setOpenDialog(false)} sx={{ color: colors.gray }}>Cancel</Button>
              <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: colors.primary, borderRadius: 2 }}>
                {editingCenter ? 'Update Center' : 'Add Center'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Detail View Dialog */}
          <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            {selectedCenter && (
              <>
                <DialogTitle sx={{ bgcolor: alpha(colors.primary, 0.03), borderBottom: `1px solid ${alpha(colors.primary, 0.1)}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(colors.primary, 0.1), color: colors.primary, width: 56, height: 56 }}>
                      <RecyclingIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedCenter.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{selectedCenter.address}</Typography>
                    </Box>
                  </Box>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, bgcolor: alpha(colors.primary, 0.03), borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">Capacity</Typography>
                        <Typography variant="h6" fontWeight={700}>{selectedCenter.capacity} tons</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, bgcolor: alpha(colors.secondary, 0.03), borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">Current Load</Typography>
                        <Typography variant="h6" fontWeight={700}>{selectedCenter.current_load || 0} tons</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, bgcolor: alpha(colors.warning, 0.03), borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">Utilization</Typography>
                        <Typography variant="h6" fontWeight={700}>{getFillPercentage(selectedCenter).toFixed(0)}%</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, bgcolor: alpha(colors.purple, 0.03), borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">Rating</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={selectedCenter.rating?.average || 0} readOnly precision={0.5} />
                          <Typography variant="body2">({selectedCenter.rating?.count || 0} reviews)</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Contact Information</Typography>
                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">{selectedCenter.phone || 'N/A'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2">{selectedCenter.email || 'N/A'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TimeIcon fontSize="small" color="action" />
                          <Typography variant="body2">{selectedCenter.operatingHours || 'N/A'}</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Materials Accepted</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {(selectedCenter.materials || []).map((m, i) => (
                          <Chip key={i} label={m} sx={{ bgcolor: alpha(colors.primary, 0.1), color: colors.primary }} />
                        ))}
                      </Box>
                    </Grid>
                    {selectedCenter.description && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Description</Typography>
                        <Typography variant="body2" color="text.secondary">{selectedCenter.description}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${alpha(colors.primary, 0.1)}` }}>
                  <Button onClick={() => setOpenDetailDialog(false)}>Close</Button>
                  <Button variant="contained" startIcon={<EditIcon />} onClick={() => { setOpenDetailDialog(false); handleEdit(selectedCenter); }} sx={{ bgcolor: colors.primary }}>
                    Edit Center
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        </motion.div>
      </Container>

      {/* Floating Action Button for Quick Add */}
      <Zoom in={!openDialog}>
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setOpenDialog(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            bgcolor: colors.primary,
            '&:hover': { bgcolor: colors.primaryDark },
            boxShadow: `0 4px 14px ${alpha(colors.primary, 0.4)}`
          }}
        >
          <AddIcon />
        </Fab>
      </Zoom>
    </Box>
  );
};

export default RecyclingCenters;