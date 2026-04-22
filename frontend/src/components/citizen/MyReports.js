// src/components/citizen/MyReports.js - Fixed version (No @mui/lab)
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  Rating,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Skeleton,
  Pagination,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Replay as ReplayIcon,
  Cancel as CancelIcon,
  Feedback as FeedbackIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { reportService } from '../../services/reportService';
import { formatDistance, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { showSuccess, showError, showLoading } from '../../utils/toast';

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

const MyReports = () => {
  const theme = useTheme();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 5,
    comment: ''
  });
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 5;

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, tabValue, searchQuery]);

  const fetchReports = async () => {
    try {
      const response = await reportService.getMyReports();
      setReports(response.data || []);
      setFilteredReports(response.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      showError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    if (tabValue === 1) filtered = filtered.filter(r => r.status === 'PENDING');
    if (tabValue === 2) filtered = filtered.filter(r => r.status === 'IN_PROGRESS');
    if (tabValue === 3) filtered = filtered.filter(r => r.status === 'RESOLVED');

    if (searchQuery) {
      filtered = filtered.filter(r => 
        (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.category || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReports(filtered);
    setPage(1);
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchReports();
  };

  const handleExport = () => {
    showLoading('Exporting reports...');
    setTimeout(() => {
      showSuccess('Reports exported successfully!');
    }, 1500);
  };

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <PendingIcon sx={{ color: '#F59E0B' }} />;
      case 'ASSIGNED': return <AssignmentIcon sx={{ color: '#3B82F6' }} />;
      case 'IN_PROGRESS': return <ScheduleIcon sx={{ color: '#4F46E5' }} />;
      case 'RESOLVED': return <CheckCircleIcon sx={{ color: '#10B981' }} />;
      case 'REOPENED': return <ReplayIcon sx={{ color: '#EF4444' }} />;
      default: return <CancelIcon sx={{ color: '#EF4444' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#F59E0B';
      case 'ASSIGNED': return '#3B82F6';
      case 'IN_PROGRESS': return '#4F46E5';
      case 'RESOLVED': return '#10B981';
      case 'REOPENED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const handleFeedback = async () => {
    try {
      await reportService.submitFeedback(selectedReport._id, feedback);
      setFeedbackDialog(false);
      showSuccess('Thank you for your feedback!');
      fetchReports();
      setFeedback({ rating: 5, comment: '' });
    } catch (error) {
      showError('Failed to submit feedback');
    }
  };

  const calculateProgress = (report) => {
    if (report.status === 'RESOLVED') return 100;
    if (report.status === 'IN_PROGRESS') return 66;
    if (report.status === 'ASSIGNED') return 33;
    return 10;
  };

  const paginatedReports = filteredReports.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>My Reports</Typography>
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} key={item}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={fadeInUp}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                My Reports
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track and manage your complaints
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh">
                <IconButton onClick={handleRefresh} sx={{ bgcolor: alpha('#4F46E5', 0.05) }}>
                  <RefreshIcon sx={{ color: '#4F46E5' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Reports">
                <IconButton onClick={handleExport} sx={{ bgcolor: alpha('#4F46E5', 0.05) }}>
                  <DownloadIcon sx={{ color: '#4F46E5' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Filter">
                <IconButton onClick={handleFilterClick} sx={{ bgcolor: alpha('#4F46E5', 0.05) }}>
                  <FilterIcon sx={{ color: '#4F46E5' }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </motion.div>

        {/* Stats Summary */}
        <motion.div variants={fadeInUp}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, bgcolor: alpha('#F59E0B', 0.05), border: `1px solid ${alpha('#F59E0B', 0.1)}` }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>{reports.filter(r => r.status === 'PENDING').length}</Typography>
                <Typography variant="caption">Pending</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, bgcolor: alpha('#4F46E5', 0.05), border: `1px solid ${alpha('#4F46E5', 0.1)}` }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#4F46E5' }}>{reports.filter(r => r.status === 'IN_PROGRESS').length}</Typography>
                <Typography variant="caption">In Progress</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, bgcolor: alpha('#10B981', 0.05), border: `1px solid ${alpha('#10B981', 0.1)}` }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>{reports.filter(r => r.status === 'RESOLVED').length}</Typography>
                <Typography variant="caption">Resolved</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, bgcolor: alpha('#EF4444', 0.05), border: `1px solid ${alpha('#EF4444', 0.1)}` }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#EF4444' }}>{reports.filter(r => r.status === 'REOPENED').length}</Typography>
                <Typography variant="caption">Reopened</Typography>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>

        {/* Tabs and Search */}
        <motion.div variants={fadeInUp}>
          <Paper sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', border: `1px solid ${alpha('#4F46E5', 0.1)}` }}>
            <Tabs
              value={tabValue}
              onChange={(e, v) => setTabValue(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': { minHeight: 50, fontSize: '0.9rem', fontWeight: 500 },
                '& .Mui-selected': { color: '#4F46E5' },
                '& .MuiTabs-indicator': { backgroundColor: '#4F46E5' }
              }}
            >
              <Tab label="All" />
              <Tab label="Pending" />
              <Tab label="In Progress" />
              <Tab label="Resolved" />
            </Tabs>
          </Paper>
        </motion.div>

        {/* Filter Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleFilterClose}>
          <MenuItem onClick={handleFilterClose}>Last 7 days</MenuItem>
          <MenuItem onClick={handleFilterClose}>Last 30 days</MenuItem>
          <MenuItem onClick={handleFilterClose}>Last 90 days</MenuItem>
          <MenuItem onClick={handleFilterClose}>This year</MenuItem>
        </Menu>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <motion.div variants={fadeInUp}>
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
              <Typography variant="h6" color="text.secondary">No reports found</Typography>
              <Button variant="contained" onClick={() => window.location.href = '/citizen/report'} sx={{ mt: 2, borderRadius: 2 }}>
                Report an Issue
              </Button>
            </Paper>
          </motion.div>
        ) : (
          <AnimatePresence>
            <Grid container spacing={3}>
              {paginatedReports.map((report, index) => (
                <Grid item xs={12} key={report._id}>
                  <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: alpha(theme.palette.background.paper, 0.95),
                        border: `1px solid ${alpha(getStatusColor(report.status), 0.2)}`,
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 20px 30px ${alpha(getStatusColor(report.status), 0.15)}`
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={7}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Avatar sx={{ bgcolor: alpha(getStatusColor(report.status), 0.1), color: getStatusColor(report.status) }}>
                                {getStatusIcon(report.status)}
                              </Avatar>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>{report.title}</Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  <Chip label={report.category} size="small" sx={{ bgcolor: alpha('#4F46E5', 0.05) }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {report.createdAt ? formatDistance(new Date(report.createdAt), new Date(), { addSuffix: true }) : 'Recently'}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>

                            <Typography variant="body2" color="text.secondary" paragraph>
                              {report.description}
                            </Typography>

                            {report.media?.images && report.media.images.length > 0 && (
                              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                <img src={report.media.images[0].url} alt="Report" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                              </Box>
                            )}

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                              <Chip
                                icon={getStatusIcon(report.status)}
                                label={report.status}
                                sx={{ bgcolor: alpha(getStatusColor(report.status), 0.1), color: getStatusColor(report.status), fontWeight: 600 }}
                              />
                              {report.assignedTo && (
                                <Typography variant="caption">Assigned to: {report.assignedTo.name}</Typography>
                              )}
                            </Box>

                            <Box sx={{ width: '100%' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="caption">Progress</Typography>
                                <Typography variant="caption" fontWeight={600}>{calculateProgress(report)}%</Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={calculateProgress(report)}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: alpha(getStatusColor(report.status), 0.1),
                                  '& .MuiLinearProgress-bar': { bgcolor: getStatusColor(report.status), borderRadius: 3 }
                                }}
                              />
                            </Box>
                          </Grid>

                          <Grid item xs={12} md={5}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: alpha('#4F46E5', 0.02) }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Timeline</Typography>
                              
                              {/* Custom Timeline without @mui/lab */}
                              <List dense disablePadding>
                                {/* Reported Step */}
                                <ListItem disablePadding sx={{ mb: 2 }}>
                                  <ListItemIcon sx={{ minWidth: 40 }}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#4F46E5', 0.1) }}>
                                      <PendingIcon sx={{ fontSize: 18, color: '#4F46E5' }} />
                                    </Avatar>
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={<Typography variant="caption" fontWeight={500}>Reported</Typography>}
                                    secondary={report.createdAt ? format(new Date(report.createdAt), 'dd MMM yyyy') : 'Recently'}
                                    secondaryTypographyProps={{ variant: 'caption' }}
                                  />
                                </ListItem>

                                <Divider sx={{ my: 1 }} />

                                {/* Assigned Step */}
                                {report.status !== 'PENDING' && (
                                  <>
                                    <ListItem disablePadding sx={{ mb: 2 }}>
                                      <ListItemIcon sx={{ minWidth: 40 }}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#3B82F6', 0.1) }}>
                                          <AssignmentIcon sx={{ fontSize: 18, color: '#3B82F6' }} />
                                        </Avatar>
                                      </ListItemIcon>
                                      <ListItemText 
                                        primary={<Typography variant="caption" fontWeight={500}>Assigned</Typography>}
                                        secondary={report.assignedAt ? format(new Date(report.assignedAt), 'dd MMM yyyy') : 'N/A'}
                                        secondaryTypographyProps={{ variant: 'caption' }}
                                      />
                                    </ListItem>
                                    <Divider sx={{ my: 1 }} />
                                  </>
                                )}

                                {/* In Progress Step */}
                                {report.status === 'IN_PROGRESS' && (
                                  <>
                                    <ListItem disablePadding sx={{ mb: 2 }}>
                                      <ListItemIcon sx={{ minWidth: 40 }}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#4F46E5', 0.1) }}>
                                          <ScheduleIcon sx={{ fontSize: 18, color: '#4F46E5' }} />
                                        </Avatar>
                                      </ListItemIcon>
                                      <ListItemText 
                                        primary={<Typography variant="caption" fontWeight={500}>In Progress</Typography>}
                                        secondaryTypographyProps={{ variant: 'caption' }}
                                      />
                                    </ListItem>
                                    <Divider sx={{ my: 1 }} />
                                  </>
                                )}

                                {/* Resolved Step */}
                                {report.status === 'RESOLVED' && (
                                  <ListItem disablePadding sx={{ mb: 2 }}>
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                      <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#10B981', 0.1) }}>
                                        <CheckCircleIcon sx={{ fontSize: 18, color: '#10B981' }} />
                                      </Avatar>
                                    </ListItemIcon>
                                    <ListItemText 
                                      primary={<Typography variant="caption" fontWeight={500}>Resolved</Typography>}
                                      secondary={report.resolvedAt ? format(new Date(report.resolvedAt), 'dd MMM yyyy') : 'N/A'}
                                      secondaryTypographyProps={{ variant: 'caption' }}
                                    />
                                  </ListItem>
                                )}
                              </List>

                              {report.status === 'RESOLVED' && !report.citizenFeedback && (
                                <Button
                                  variant="outlined"
                                  startIcon={<FeedbackIcon />}
                                  fullWidth
                                  onClick={() => { setSelectedReport(report); setFeedbackDialog(true); }}
                                  sx={{ mt: 2, borderRadius: 2, borderColor: alpha('#4F46E5', 0.5), color: '#4F46E5' }}
                                >
                                  Rate Resolution
                                </Button>
                              )}

                              {report.citizenFeedback && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: alpha('#10B981', 0.05), borderRadius: 2 }}>
                                  <Typography variant="caption" fontWeight={500}>Your Feedback</Typography>
                                  <Rating value={report.citizenFeedback.rating} readOnly size="small" sx={{ mt: 1 }} />
                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                    {report.citizenFeedback.comment}
                                  </Typography>
                                </Box>
                              )}
                            </Paper>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {filteredReports.length > itemsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={Math.ceil(filteredReports.length / itemsPerPage)}
              page={page}
              onChange={(e, v) => setPage(v)}
              color="primary"
              sx={{ '& .Mui-selected': { bgcolor: '#4F46E5 !important', color: 'white' } }}
            />
          </Box>
        )}
      </motion.div>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Rate Resolution</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', my: 2 }}>
            <Typography variant="body1" gutterBottom>How satisfied are you with the resolution?</Typography>
            <Rating value={feedback.rating} onChange={(e, newValue) => setFeedback({ ...feedback, rating: newValue })} size="large" sx={{ mb: 2 }} />
            <TextField
              fullWidth
              label="Additional Comments"
              multiline
              rows={4}
              value={feedback.comment}
              onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setFeedbackDialog(false)} sx={{ color: '#64748B' }}>Cancel</Button>
          <Button onClick={handleFeedback} variant="contained" sx={{ bgcolor: '#4F46E5' }}>Submit Feedback</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyReports;