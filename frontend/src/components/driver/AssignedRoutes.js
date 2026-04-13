import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  LinearProgress,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Skeleton
} from '@mui/material';
// Removed: IconButton, CancelIcon, LocationIcon from imports
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalendarIcon,
  Speed as SpeedIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
// Removed: CancelIcon, LocationIcon
import { useNavigate } from 'react-router-dom';
import { driverService } from '../../services/driverService';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
// Removed: AnimatePresence (not used)

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

const AssignedRoutes = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Wrap fetchRoutes in useCallback to fix dependency warning
  const fetchRoutes = useCallback(async () => {
    try {
      let status = '';
      if (tabValue === 0) status = 'Assigned';
      if (tabValue === 1) status = 'In Progress';
      if (tabValue === 2) status = 'Completed';
      
      const response = await driverService.getRoutes({ status });
      setRoutes(response.data || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
      setRoutes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tabValue]); // Add tabValue as dependency

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes, tabValue]); // Add fetchRoutes to dependencies

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRoutes();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Assigned': return { bg: alpha('#F59E0B', 0.1), color: '#F59E0B', label: 'warning' };
      case 'Started': return { bg: alpha('#3B82F6', 0.1), color: '#3B82F6', label: 'info' };
      case 'In Progress': return { bg: alpha('#4F46E5', 0.1), color: '#4F46E5', label: 'primary' };
      case 'Completed': return { bg: alpha('#10B981', 0.1), color: '#10B981', label: 'success' };
      case 'Cancelled': return { bg: alpha('#EF4444', 0.1), color: '#EF4444', label: 'error' };
      default: return { bg: alpha('#6B7280', 0.1), color: '#6B7280', label: 'default' };
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#10B981';
    if (progress >= 40) return '#F59E0B';
    return '#4F46E5';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          My Routes
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} key={item}>
              <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          My Routes
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{
            borderRadius: 2,
            borderColor: alpha('#4F46E5', 0.5),
            '&:hover': {
              borderColor: '#4F46E5',
              backgroundColor: alpha('#4F46E5', 0.05)
            }
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Tabs */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          background: alpha(theme.palette.background.paper, 0.95),
          border: `1px solid ${alpha('#4F46E5', 0.1)}`,
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 60,
              fontSize: '1rem',
              fontWeight: 500,
              transition: 'all 0.3s',
              '&:hover': {
                backgroundColor: alpha('#4F46E5', 0.05)
              }
            },
            '& .Mui-selected': {
              color: '#4F46E5 !important'
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#4F46E5',
              height: 3
            }
          }}
        >
          <Tab label="Upcoming" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
          <Tab label="All" />
        </Tabs>
      </Paper>

      {routes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 4,
              background: alpha(theme.palette.background.paper, 0.95),
              border: `1px solid ${alpha('#4F46E5', 0.1)}`
            }}
          >
            <Box sx={{ mb: 2 }}>
              <ScheduleIcon sx={{ fontSize: 64, color: alpha('#4F46E5', 0.3) }} />
            </Box>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No routes found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {tabValue === 0 ? "You don't have any upcoming routes" :
               tabValue === 1 ? "No routes in progress" :
               tabValue === 2 ? "No completed routes yet" :
               "No routes assigned"}
            </Typography>
          </Paper>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={3}>
            {routes.map((route, index) => {
              const statusStyle = getStatusColor(route.status);
              const progressColor = getProgressColor(route.progress);
              
              return (
                <Grid item xs={12} key={route._id}>
                  <motion.div variants={fadeInUp}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: alpha(theme.palette.background.paper, 0.95),
                        border: `1px solid ${alpha(statusStyle.color, 0.2)}`,
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 20px 30px ${alpha(statusStyle.color, 0.15)}`,
                          borderColor: alpha(statusStyle.color, 0.4)
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                          <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                              Route #{route.routeId}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                              <Chip
                                size="small"
                                icon={<CalendarIcon />}
                                label={format(new Date(route.date), 'dd MMM yyyy')}
                                sx={{
                                  bgcolor: alpha('#4F46E5', 0.05),
                                  border: `1px solid ${alpha('#4F46E5', 0.1)}`
                                }}
                              />
                              <Chip
                                size="small"
                                icon={<ScheduleIcon />}
                                label={route.shift}
                                sx={{
                                  bgcolor: alpha('#4F46E5', 0.05),
                                  border: `1px solid ${alpha('#4F46E5', 0.1)}`
                                }}
                              />
                              <Chip
                                size="small"
                                label={route.status}
                                sx={{
                                  bgcolor: statusStyle.bg,
                                  color: statusStyle.color,
                                  fontWeight: 600
                                }}
                              />
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography
                              variant="h2"
                              sx={{
                                fontWeight: 800,
                                background: `linear-gradient(135deg, ${progressColor} 0%, ${progressColor}CC 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                lineHeight: 1
                              }}
                            >
                              {route.progress}%
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {route.completedStops || 0}/{route.stops?.length || 0} stops completed
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ mt: 2, mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" fontWeight={500}>Route Progress</Typography>
                            <Typography variant="body2" fontWeight={500}>{route.progress}%</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={route.progress}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: alpha(progressColor, 0.1),
                              '& .MuiLinearProgress-bar': {
                                background: `linear-gradient(90deg, ${progressColor} 0%, ${progressColor}CC 100%)`,
                                borderRadius: 5
                              }
                            }}
                          />
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              <Chip
                                size="small"
                                icon={<SpeedIcon />}
                                label={`${route.totalDistance || 0} km`}
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                icon={<ScheduleIcon />}
                                label={`${route.estimatedDuration} min`}
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                icon={<CheckCircleIcon />}
                                label={`${route.totalWaste || 0} kg collected`}
                                variant="outlined"
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Button
                              fullWidth
                              variant="contained"
                              endIcon={<ArrowForwardIcon />}
                              onClick={() => navigate(`/driver/routes/${route._id}`)}
                              sx={{
                                py: 1,
                                borderRadius: 2,
                                background: `linear-gradient(135deg, ${statusStyle.color} 0%, ${statusStyle.color}CC 100%)`,
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: `0 8px 20px ${alpha(statusStyle.color, 0.4)}`
                                }
                              }}
                            >
                              {route.status === 'Assigned' ? 'Start Route' : 
                               route.status === 'Completed' ? 'View Summary' : 'Continue Route'}
                            </Button>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </motion.div>
      )}
    </Container>
  );
};

export default AssignedRoutes;