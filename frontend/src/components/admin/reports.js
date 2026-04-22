// src/components/admin/Reports.js - Updated with better image handling
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
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
  Container,
  Tabs,
  Tab,
  Stack,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Modal,
  Backdrop,
  Fade
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  BrokenImage as BrokenImageIcon
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

function Reports() {
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({});
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [selectedReport, setSelectedReport] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openImageViewer, setOpenImageViewer] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  // Helper function to get image URL from report
  const getImageUrl = (report) => {
    if (!report) return null;
    
    // Try different possible field names
    if (report.imageUrl) return report.imageUrl;
    if (report.image) return report.image;
    if (report.photo) return report.photo;
    if (report.picture) return report.picture;
    if (report.media && report.media.images && report.media.images[0]) {
      return report.media.images[0].url;
    }
    return null;
  };

  // Helper function to get location string from object
  const getLocationString = (location) => {
    if (!location) return 'No location';
    if (typeof location === 'string') return location;
    if (location.address) return location.address;
    if (location.coordinates) return `${location.coordinates[1]}, ${location.coordinates[0]}`;
    return 'Location provided';
  };

  // Fetch Summary
  const fetchSummary = async () => {
    try {
      const res = await api.get("/reports/summary");
      setSummary(res.data.data || {});
    } catch (err) {
      console.log("Summary error");
      setSummary({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
    }
  };

  // Fetch Reports
  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports");
      const reportsData = res.data.data || [];
      
      // Debug: Log image URLs
      reportsData.forEach(report => {
        const imgUrl = getImageUrl(report);
        console.log(`Report "${report.title}" has image:`, imgUrl);
      });
      
      setReports(reportsData);
      
      // Generate analytics from real data
      generateAnalytics(reportsData);
      
      if (reportsData.length === 0) {
        toast('No reports found', { icon: '📝' });
      }
    } catch (err) {
      console.log("Reports error", err);
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  // Generate analytics from reports data
  const generateAnalytics = (reportsData) => {
    // Generate trend data (last 7 days)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const trend = days.map(day => {
      const dayReports = reportsData.filter(r => {
        const date = new Date(r.createdAt);
        return date.toLocaleDateString('en-US', { weekday: 'short' }) === day;
      });
      return {
        day,
        reports: dayReports.length,
        resolved: dayReports.filter(r => r.status === 'RESOLVED').length
      };
    });
    setTrendData(trend);

    // Generate category distribution
    const categories = {};
    reportsData.forEach(r => {
      const cat = r.category || 'Other';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    const categoryColors = {
      'Overflow': '#EF4444',
      'Missed Collection': '#F59E0B',
      'Illegal Dumping': '#10B981',
      'Damaged Bin': '#6366F1',
      'Fire Hazard': '#8B5CF6',
      'Other': '#6B7280'
    };
    const categoryList = Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name] || '#6366F1'
    }));
    setCategoryData(categoryList);
  };

  useEffect(() => {
    fetchSummary();
    fetchReports();
  }, []);

  // Filter and Search
  const filteredReports = reports.filter((r) => {
    const matchStatus = filter === "ALL" || r.status === filter;
    const locationStr = getLocationString(r.location).toLowerCase();
    const matchSearch = (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
                        locationStr.includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Get Status Color
  const getStatusColor = (status) => {
    if (status === "PENDING") return "#f59e0b";
    if (status === "IN_PROGRESS") return "#3b82f6";
    if (status === "RESOLVED") return "#10b981";
    return "#ef4444";
  };

  const getStatusIcon = (status) => {
    if (status === "PENDING") return <PendingIcon sx={{ fontSize: 14 }} />;
    if (status === "IN_PROGRESS") return <TimelineIcon sx={{ fontSize: 14 }} />;
    if (status === "RESOLVED") return <CheckCircleIcon sx={{ fontSize: 14 }} />;
    return <WarningIcon sx={{ fontSize: 14 }} />;
  };

  // Update Status
  const updateStatus = async (id, status) => {
    try {
      await api.put(`/reports/${id}/status`, { status });
      toast.success(`Report marked as ${status}`);
      fetchReports();
      fetchSummary();
    } catch (err) {
      toast.error("Update failed ❌");
    }
  };

  // View Details
  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setOpenDetailsDialog(true);
  };

  // View Image
  const handleViewImage = (imageUrl) => {
    if (imageUrl) {
      setSelectedImage(imageUrl);
      setOpenImageViewer(true);
    } else {
      toast.error("No image available for this report");
    }
  };

  const handleExport = () => {
    if (reports.length === 0) {
      toast.error('No reports to export');
      return;
    }
    toast.success('Report exported successfully');
  };

  const stats = [
    { title: "Total Reports", value: summary.total || 0, icon: <AssessmentIcon />, color: "#6366F1", trend: "+12%", trendUp: true },
    { title: "Pending", value: summary.pending || 0, icon: <PendingIcon />, color: "#F59E0B", trend: "+5%", trendUp: false },
    { title: "In Progress", value: summary.inProgress || 0, icon: <TimelineIcon />, color: "#3B82F6", trend: "+8%", trendUp: true },
    { title: "Resolved", value: summary.resolved || 0, icon: <CheckCircleIcon />, color: "#10B981", trend: "+15%", trendUp: true }
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={fadeInUp}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Reports Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Manage and track citizen-reported issues
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={fetchReports}
                sx={{ borderRadius: 2, textTransform: 'none', borderColor: alpha('#6366F1', 0.5), color: '#6366F1' }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#6366F1' }}
              >
                Export
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Stats Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {stats.map((stat, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
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
          <Tab icon={<DashboardIcon />} iconPosition="start" label="All Reports" />
          <Tab icon={<TimelineIcon />} iconPosition="start" label="Analytics" />
        </Tabs>

        {/* All Reports Tab */}
        {activeTab === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 3, border: `1px solid ${alpha('#6366F1', 0.1)}`, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <TextField
                select
                label="Status Filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                size="small"
                sx={{ minWidth: 150 }}
                InputProps={{ startAdornment: <FilterListIcon sx={{ fontSize: 18, mr: 1, color: '#64748B' }} /> }}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="RESOLVED">Resolved</MenuItem>
              </TextField>

              <TextField
                label="Search by title or location"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ flex: 1, minWidth: 250 }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ fontSize: 18, color: '#64748B', mr: 1 }} />,
                  endAdornment: search && (
                    <IconButton size="small" onClick={() => setSearch('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )
                }}
              />

              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                Showing {filteredReports.length} of {reports.length} reports
              </Typography>
            </Paper>

            {/* Reports Table */}
            <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}`, overflow: 'hidden' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>📋 Citizen Reports</Typography>
              
              {loading ? (
                <LinearProgress sx={{ borderRadius: 2 }} />
              ) : filteredReports.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <AssessmentIcon sx={{ fontSize: 48, color: alpha('#6366F1', 0.3), mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">No reports found</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {reports.length === 0 ? 'No reports have been submitted by citizens yet.' : 'Try adjusting your filters'}
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 900 }}>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Image</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredReports.map((r) => {
                        const imageUrl = getImageUrl(r);
                        return (
                          <TableRow key={r._id} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>{r.title}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={r.category} size="small" sx={{ bgcolor: alpha('#6366F1', 0.1), color: '#6366F1' }} />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationOnIcon sx={{ fontSize: 12, color: '#64748B' }} />
                                <Typography variant="body2">{getLocationString(r.location)}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={getStatusIcon(r.status)}
                                label={r.status}
                                size="small"
                                sx={{ bgcolor: alpha(getStatusColor(r.status), 0.1), color: getStatusColor(r.status) }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={r.priority || 'MEDIUM'}
                                size="small"
                                sx={{ 
                                  bgcolor: r.priority === 'HIGH' ? alpha('#EF4444', 0.1) : r.priority === 'LOW' ? alpha('#10B981', 0.1) : alpha('#F59E0B', 0.1),
                                  color: r.priority === 'HIGH' ? '#EF4444' : r.priority === 'LOW' ? '#10B981' : '#F59E0B'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {imageUrl ? (
                                <Tooltip title="View Image">
                                  <IconButton size="small" onClick={() => handleViewImage(imageUrl)}>
                                    <ImageIcon sx={{ fontSize: 18, color: '#6366F1' }} />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="No Image Available">
                                  <Chip 
                                    label="No Image" 
                                    size="small" 
                                    sx={{ bgcolor: alpha('#6B7280', 0.1), color: '#6B7280' }} 
                                  />
                                </Tooltip>
                              )}
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5}>
                                <Tooltip title="View Details">
                                  <IconButton size="small" onClick={() => handleViewDetails(r)}>
                                    <ViewIcon sx={{ fontSize: 18, color: '#6366F1' }} />
                                  </IconButton>
                                </Tooltip>
                                {r.status === "PENDING" && (
                                  <Tooltip title="Start Progress">
                                    <IconButton size="small" onClick={() => updateStatus(r._id, "IN_PROGRESS")}>
                                      <TimelineIcon sx={{ fontSize: 18, color: '#3B82F6' }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {r.status !== "RESOLVED" && (
                                  <Tooltip title="Mark Resolved">
                                    <IconButton size="small" onClick={() => updateStatus(r._id, "RESOLVED")}>
                                      <CheckCircleIcon sx={{ fontSize: 18, color: '#10B981' }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 1 && reports.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} lg={8}>
                <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}` }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>📈 Reports Trend</Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={trendData}>
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
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                      <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                      <Legend />
                      <Area type="monotone" dataKey="reports" stroke="#6366F1" strokeWidth={2} fill="url(#reportsGrad)" name="Reports Submitted" />
                      <Area type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} fill="url(#resolvedGrad)" name="Reports Resolved" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}`, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>📊 Report Categories</Typography>
                  {categoryData.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">No category data available</Typography>
                    </Box>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                            {categoryData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                          </Pie>
                          <RechartsTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                        {categoryData.map((item, i) => (<Chip key={i} label={`${item.name}: ${item.value}`} size="small" sx={{ bgcolor: alpha(item.color, 0.1), color: item.color }} />))}
                      </Box>
                    </>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {/* Report Details Dialog */}
        <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ bgcolor: alpha('#6366F1', 0.03), borderBottom: `1px solid ${alpha('#6366F1', 0.1)}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
                Report Details
              </Typography>
              <IconButton
                aria-label="close"
                onClick={() => setOpenDetailsDialog(false)}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedReport && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedReport.title}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body2">{selectedReport.description || 'No description provided'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                  <Chip label={selectedReport.category} size="small" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip label={selectedReport.status} size="small" sx={{ bgcolor: alpha(getStatusColor(selectedReport.status), 0.1), color: getStatusColor(selectedReport.status) }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                  <Chip label={selectedReport.priority || 'MEDIUM'} size="small" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon sx={{ fontSize: 14 }} />
                    <Typography variant="body2">{getLocationString(selectedReport.location)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Reported By</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PersonIcon sx={{ fontSize: 14 }} />
                    <Typography variant="body2">{selectedReport.user?.name || selectedReport.userId || 'Anonymous'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ScheduleIcon sx={{ fontSize: 14 }} />
                    <Typography variant="body2">{new Date(selectedReport.createdAt).toLocaleString()}</Typography>
                  </Box>
                </Grid>
                {(() => {
                  const imageUrl = getImageUrl(selectedReport);
                  return imageUrl && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Image Evidence</Typography>
                      <Box 
                        sx={{ 
                          border: `1px solid ${alpha('#6366F1', 0.2)}`, 
                          borderRadius: 2, 
                          overflow: 'hidden',
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.8 }
                        }}
                        onClick={() => handleViewImage(imageUrl)}
                      >
                        <img 
                          src={imageUrl} 
                          alt="Report Evidence" 
                          style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div style="padding: 40px; text-align: center; color: #999;">Image failed to load</div>';
                          }}
                        />
                      </Box>
                    </Grid>
                  );
                })()}
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${alpha('#6366F1', 0.1)}`, gap: 1 }}>
            <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
            {selectedReport && selectedReport.status === "PENDING" && (
              <Button variant="contained" onClick={() => { updateStatus(selectedReport._id, "IN_PROGRESS"); setOpenDetailsDialog(false); }} sx={{ bgcolor: '#3B82F6' }}>
                Start Progress
              </Button>
            )}
            {selectedReport && selectedReport.status !== "RESOLVED" && (
              <Button variant="contained" onClick={() => { updateStatus(selectedReport._id, "RESOLVED"); setOpenDetailsDialog(false); }} sx={{ bgcolor: '#10B981' }}>
                Mark Resolved
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Image Viewer Modal */}
        <Modal
          open={openImageViewer}
          onClose={() => setOpenImageViewer(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500 }}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Fade in={openImageViewer}>
            <Box sx={{ 
              position: 'relative',
              maxWidth: '90vw', 
              maxHeight: '90vh',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              overflow: 'hidden'
            }}>
              <IconButton
                onClick={() => setOpenImageViewer(false)}
                sx={{ position: 'absolute', right: 8, top: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', zIndex: 1 }}
              >
                <CloseIcon />
              </IconButton>
              <img 
                src={selectedImage} 
                alt="Full Size" 
                style={{ width: '100%', height: 'auto', maxHeight: '90vh', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/500x300?text=Image+Not+Found';
                }}
              />
            </Box>
          </Fade>
        </Modal>
      </motion.div>
    </Container>
  );
}

export default Reports;