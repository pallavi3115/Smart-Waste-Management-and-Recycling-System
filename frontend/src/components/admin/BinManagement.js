// src/components/admin/BinManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  MenuItem,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  Tabs,
  Tab,
  Stack,
  Skeleton
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationOnIcon,
  Sensors as SensorsIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  DeleteSweep as DeleteSweepIcon,
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Speed as SpeedIcon,
  BatteryFull as BatteryIcon,
  Thermostat as TempIcon
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
  Cell
} from 'recharts';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

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

let ws = null;

const BinManagement = () => {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBin, setEditingBin] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [fillTrendData, setFillTrendData] = useState([]);
  const [typeDistribution, setTypeDistribution] = useState([]);
  const [form, setForm] = useState({
    binId: "",
    capacity: 1000,
    type: "General",
    latitude: "",
    longitude: "",
    area: ""
  });

  useEffect(() => {
    fetchBins();
    connectWebSocket();
    return () => {
      if (ws) ws.close();
    };
  }, []);

  useEffect(() => {
    if (bins.length > 0) {
      generateChartData();
    }
  }, [bins]);

  const connectWebSocket = () => {
    try {
      ws = new WebSocket('ws://localhost:8080');
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setSocketConnected(true);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'bin_update') {
            setBins(prev => prev.map(bin => 
              bin._id === data.data._id ? { ...bin, ...data.data } : bin
            ));
            toast.success(`${data.data.binId} updated to ${data.data.status}`, { icon: '🔄' });
          }
        } catch (err) {
          console.error('WebSocket error:', err);
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

  const fetchBins = async () => {
    setLoading(true);
    try {
      const res = await api.get("/bins/all");
      const binsData = res.data.data || [];
      setBins(binsData);
      if (binsData.length === 0) {
        toast.error('No bins found. Please add bins first.', { icon: '🗑️' });
      } else {
        toast.success(`${binsData.length} bins loaded`);
      }
    } catch (error) {
      console.error('Error fetching bins:', error);
      toast.error('Failed to fetch bins. Make sure backend is running.');
      setBins([]);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const trend = days.map((day, i) => ({
      day,
      fillLevel: bins.length > 0 
        ? Math.round(bins.reduce((acc, b) => acc + (b.currentFillLevel || 0), 0) / bins.length)
        : 0,
      collections: 40 + Math.random() * 30
    }));
    setFillTrendData(trend);

    const types = {};
    bins.forEach(bin => {
      types[bin.type] = (types[bin.type] || 0) + 1;
    });
    const typeColors = {
      'General': '#6366F1',
      'Recyclable': '#10B981',
      'Organic': '#F59E0B',
      'E-Waste': '#EF4444',
      'Hazardous': '#8B5CF6'
    };
    const distribution = Object.entries(types).map(([name, value]) => ({
      name,
      value,
      color: typeColors[name] || '#6366F1'
    }));
    setTypeDistribution(distribution);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.binId || !form.area) {
      toast.error("Please fill required fields ⚠️");
      return;
    }

    try {
      const binData = {
        binId: form.binId,
        capacity: Number(form.capacity),
        type: form.type,
        area: form.area,
        location: {
          type: "Point",
          coordinates: [
            parseFloat(form.longitude || 77.2090),
            parseFloat(form.latitude || 28.6139)
          ]
        }
      };

      if (editingBin) {
        await api.put(`/bins/${editingBin._id}`, binData);
        toast.success("Bin updated successfully ✅");
      } else {
        await api.post("/bins/register", binData);
        toast.success("Bin added successfully ✅");
      }

      setForm({ binId: "", capacity: 1000, type: "General", latitude: "", longitude: "", area: "" });
      setEditingBin(null);
      setOpenDialog(false);
      fetchBins();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error ❌");
    }
  };

  const handleDelete = async (binId) => {
    if (window.confirm("Are you sure you want to delete this bin?")) {
      try {
        await api.delete(`/bins/${binId}`);
        toast.success("Bin deleted successfully");
        fetchBins();
      } catch (error) {
        toast.error("Failed to delete bin");
      }
    }
  };

  const handleEdit = (bin) => {
    setEditingBin(bin);
    setForm({
      binId: bin.binId,
      capacity: bin.capacity || 1000,
      type: bin.type,
      latitude: bin.location?.coordinates?.[1] || "",
      longitude: bin.location?.coordinates?.[0] || "",
      area: bin.area
    });
    setOpenDialog(true);
  };

  const getFillColor = (level) => {
    if (level >= 80) return "#EF4444";
    if (level >= 50) return "#F59E0B";
    return "#10B981";
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

  const totalBins = bins.length;
  const fullBins = bins.filter(b => b.status === "Full").length;
  const activeBins = bins.filter(b => (b.batteryLevel || 100) > 20).length;
  const avgFill = totalBins ? Math.round(bins.reduce((a, b) => a + (b.currentFillLevel || 0), 0) / totalBins) : 0;
  const alerts = bins.filter(b => b.alerts?.fire || b.alerts?.overflow).length;

  const stats = [
    { title: "Total Bins", value: totalBins, icon: <DeleteSweepIcon />, color: "#6366F1", change: totalBins > 0 ? "+12%" : "0%", trendUp: true },
    { title: "Full Bins", value: fullBins, icon: <WarningIcon />, color: "#EF4444", change: "+3%", trendUp: false },
    { title: "Active Bins", value: activeBins, icon: <WifiIcon />, color: "#10B981", change: "+8%", trendUp: true },
    { title: "Avg Fill", value: `${avgFill}%`, icon: <SensorsIcon />, color: "#F59E0B", change: "-2%", trendUp: false },
    { title: "Active Alerts", value: alerts, icon: <WarningIcon />, color: "#EF4444", change: "+2%", trendUp: false }
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
        </Box>
        <Grid container spacing={2.5}>
          {[1,2,3,4,5].map((i) => (
            <Grid item xs={12} sm={6} md={2.4} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
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
                Smart Bin Management
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  Real-time IoT bin monitoring
                </Typography>
                <Chip 
                  label={socketConnected ? "Live" : "Offline"} 
                  size="small" 
                  sx={{ bgcolor: socketConnected ? '#10B981' : '#EF4444', color: 'white', height: 20, fontSize: '0.6rem' }}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={fetchBins}
                sx={{ borderRadius: 2, textTransform: 'none', borderColor: alpha('#6366F1', 0.5), color: '#6366F1' }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#6366F1' }}
              >
                Add New Bin
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Stats Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {stats.map((stat, i) => (
            <Grid item xs={12} sm={6} md={2.4} key={i}>
              <motion.div variants={fadeInUp} whileHover={{ y: -4 }}>
                <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(stat.color, 0.15)}`, background: alpha(stat.color, 0.02) }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                          {stat.title}
                        </Typography>
                        <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B', mt: 0.5 }}>
                          {stat.value}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                          {stat.trendUp ? <TrendingUpIcon sx={{ fontSize: 12, color: '#10B981' }} /> : <TrendingDownIcon sx={{ fontSize: 12, color: '#EF4444' }} />}
                          <Typography sx={{ fontSize: '0.7rem', color: stat.trendUp ? '#10B981' : '#EF4444', fontWeight: 500 }}>
                            {stat.change}
                          </Typography>
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
          <Tab icon={<DashboardIcon />} iconPosition="start" label="All Bins" />
          <Tab icon={<TimelineIcon />} iconPosition="start" label="Analytics" />
        </Tabs>

        {/* All Bins Tab */}
        {activeTab === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* No Bins Message */}
            {bins.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
                <DeleteSweepIcon sx={{ fontSize: 64, color: alpha('#6366F1', 0.2), mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>No Bins Found</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Click "Add New Bin" to create your first smart bin
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)} sx={{ bgcolor: '#6366F1' }}>
                  Add Your First Bin
                </Button>
              </Paper>
            ) : (
              <>
                {/* Critical Bins Alert */}
                {bins.filter(b => b.currentFillLevel > 80 || b.alerts?.fire).length > 0 && (
                  <Paper sx={{ p: 3, mb: 4, borderRadius: 4, border: `1px solid ${alpha('#EF4444', 0.1)}`, background: alpha('#EF4444', 0.02) }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon sx={{ color: '#EF4444' }} />
                      Critical Bins Alert
                    </Typography>
                    {bins.filter(b => b.currentFillLevel > 80 || b.alerts?.fire).map(bin => (
                      <Box key={bin._id} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{bin.area}</Typography>
                          <Typography variant="caption" sx={{ color: getFillColor(bin.currentFillLevel), fontWeight: 600 }}>
                            {bin.currentFillLevel}%
                          </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={bin.currentFillLevel || 0} sx={{ height: 8, borderRadius: 4 }} />
                        {bin.alerts?.fire && <Chip label="🔥 FIRE ALERT" size="small" sx={{ mt: 1, bgcolor: '#EF4444', color: 'white' }} />}
                      </Box>
                    ))}
                  </Paper>
                )}

                {/* Bins Table */}
                <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}`, overflow: 'hidden' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>📋 All Smart Bins ({bins.length})</Typography>
                  <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 800 }}>
                      <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Bin ID</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Area</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Fill Level</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Battery</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Connectivity</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Temp</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Alerts</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bins.map((bin) => (
                          <TableRow key={bin._id} hover>
                            <TableCell><SensorsIcon sx={{ fontSize: 14, color: '#6366F1', mr: 1 }} />{bin.binId}</TableCell>
                            <TableCell><Chip label={bin.type} size="small" sx={{ bgcolor: alpha('#6366F1', 0.1), color: '#6366F1' }} /></TableCell>
                            <TableCell><LocationOnIcon sx={{ fontSize: 12, color: '#64748B', mr: 0.5 }} />{bin.area}</TableCell>
                            <TableCell sx={{ minWidth: 150 }}>
                              <Typography variant="caption">{bin.currentFillLevel || 0}%</Typography>
                              <LinearProgress variant="determinate" value={bin.currentFillLevel || 0} sx={{ height: 6, borderRadius: 3, mt: 0.5 }} />
                            </TableCell>
                            <TableCell><Chip icon={getStatusIcon(bin.status)} label={bin.status || 'Empty'} size="small" /></TableCell>
                            <TableCell><Chip icon={<BatteryIcon sx={{ fontSize: 12 }} />} label={`${bin.batteryLevel || 100}%`} size="small" /></TableCell>
                            <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{getWifiIcon(bin.wifiStrength)}<Typography variant="caption">{bin.wifiStrength || 85}%</Typography></Box></TableCell>
                            <TableCell><Chip icon={<TempIcon sx={{ fontSize: 12 }} />} label={`${bin.temperature || 25}°C`} size="small" /></TableCell>
                            <TableCell>
                              {bin.alerts?.fire && <Chip label="FIRE" size="small" sx={{ bgcolor: alpha('#EF4444', 0.1), color: '#EF4444' }} />}
                              {bin.alerts?.overflow && <Chip label="OVERFLOW" size="small" sx={{ bgcolor: alpha('#F59E0B', 0.1), color: '#F59E0B' }} />}
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEdit(bin)}><EditIcon sx={{ fontSize: 16, color: '#6366F1' }} /></IconButton></Tooltip>
                              <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(bin._id)}><DeleteIcon sx={{ fontSize: 16, color: '#EF4444' }} /></IconButton></Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </>
            )}
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 1 && bins.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} lg={8}>
                <Paper sx={{ p: 3, borderRadius: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>📈 Fill Level Trends</Typography>
                  <ResponsiveContainer width="100%" height={350}>
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
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="fillLevel" stroke="#6366F1" strokeWidth={2} fill="url(#fillGrad)" name="Avg Fill Level %" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>🥧 Bin Type Distribution</Typography>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={typeDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                        {typeDistribution.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                    {typeDistribution.map((item, i) => (<Chip key={i} label={`${item.name}: ${item.value}`} size="small" sx={{ bgcolor: alpha(item.color, 0.1), color: item.color }} />))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingBin ? 'Edit Bin' : 'Add New Bin'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}><TextField label="Bin ID" name="binId" value={form.binId} onChange={handleChange} fullWidth /></Grid>
              <Grid item xs={12}><TextField label="Area/Location" name="area" value={form.area} onChange={handleChange} fullWidth /></Grid>
              <Grid item xs={12}>
                <TextField select label="Bin Type" name="type" value={form.type} onChange={handleChange} fullWidth>
                  {["General", "Recyclable", "Organic", "Hazardous", "E-Waste"].map(t => (<MenuItem key={t} value={t}>{t}</MenuItem>))}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: '#6366F1' }}>{editingBin ? 'Update' : 'Add'}</Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default BinManagement;