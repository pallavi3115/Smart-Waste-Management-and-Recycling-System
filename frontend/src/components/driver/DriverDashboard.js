import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Avatar,
  Chip,
  useTheme,
  alpha,
  Skeleton
} from '@mui/material';
// Removed: IconButton, Divider
import {
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  DirectionsCar as CarIcon,
  EmojiEvents as TrophyIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
// Removed: NotificationsIcon, LogoutIcon
import { useAuth } from '../../contexts/AuthContext';
import { driverService } from '../../services/driverService';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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

const DriverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard();
    // Real-time location tracking
    const interval = setInterval(() => {
      if (online && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          driverService.updateLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [online]);

  const fetchDashboard = async () => {
    try {
      const response = await driverService.getDashboard();
      setDashboardData(response.data);
      setOnline(response.data.driver?.isOnline || false);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleStatus = async () => {
    try {
      const response = await driverService.toggleStatus();
      setOnline(response.isOnline);
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  const { driver, todayRoute, weeklyStats, attendance, performance, earnings } = dashboardData || {};

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <AnimatePresence mode="wait">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Header Section */}
          <motion.div variants={fadeInUp}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha('#4F46E5', 0.1)} 0%, ${alpha('#7C3AED', 0.05)} 100%)`,
                border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Decorative background */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha('#4F46E5', 0.15)} 0%, transparent 70%)`,
                  zIndex: 0
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -30,
                  left: -30,
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha('#7C3AED', 0.1)} 0%, transparent 70%)`,
                  zIndex: 0
                }}
              />
              
              <Grid container spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid item>
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Avatar
                      sx={{
                        width: 85,
                        height: 85,
                        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                        fontSize: '2.5rem',
                        boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
                        border: `3px solid ${alpha('#fff', 0.2)}`
                      }}
                    >
                      {driver?.user?.name?.charAt(0).toUpperCase() || 'D'}
                    </Avatar>
                  </motion.div>
                </Grid>
                <Grid item xs>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    Welcome back, {driver?.user?.name?.split(' ')[0]}!
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip
                      icon={<CarIcon />}
                      label={`${driver?.vehicleType} - ${driver?.vehicleNumber}`}
                      variant="outlined"
                      sx={{ 
                        borderColor: alpha('#4F46E5', 0.3),
                        '&:hover': { borderColor: '#4F46E5', bgcolor: alpha('#4F46E5', 0.05) }
                      }}
                    />
                    <Chip
                      icon={<LocationIcon />}
                      label={`Zone: ${driver?.assignedZone}`}
                      variant="outlined"
                      sx={{ 
                        borderColor: alpha('#4F46E5', 0.3),
                        '&:hover': { borderColor: '#4F46E5', bgcolor: alpha('#4F46E5', 0.05) }
                      }}
                    />
                    <Chip
                      icon={<CalendarIcon />}
                      label={`Shift: ${driver?.shift}`}
                      variant="outlined"
                      sx={{ 
                        borderColor: alpha('#4F46E5', 0.3),
                        '&:hover': { borderColor: '#4F46E5', bgcolor: alpha('#4F46E5', 0.05) }
                      }}
                    />
                    <Chip
                      label={online ? '● Online' : '○ Offline'}
                      onClick={toggleStatus}
                      sx={{ 
                        cursor: 'pointer',
                        bgcolor: online ? alpha('#10B981', 0.1) : alpha('#6B7280', 0.1),
                        color: online ? '#10B981' : '#6B7280',
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: online ? alpha('#10B981', 0.2) : alpha('#6B7280', 0.2),
                        }
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<AssessmentIcon />}
                      onClick={() => navigate('/driver/performance')}
                      sx={{
                        borderRadius: 2,
                        borderColor: alpha('#4F46E5', 0.5),
                        '&:hover': {
                          borderColor: '#4F46E5',
                          backgroundColor: alpha('#4F46E5', 0.05),
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Performance
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<ScheduleIcon />}
                      onClick={() => navigate('/driver/routes')}
                      sx={{
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)'
                        }
                      }}
                    >
                      My Routes
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div variants={fadeInUp} whileHover={{ y: -5 }}>
                <Card
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${alpha('#10B981', 0.05)} 0%, ${alpha('#10B981', 0.02)} 100%)`,
                    border: `1px solid ${alpha('#10B981', 0.1)}`,
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: `0 10px 25px ${alpha('#10B981', 0.15)}`,
                      borderColor: alpha('#10B981', 0.3)
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        margin: '0 auto 12px',
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <MoneyIcon sx={{ fontSize: 28, color: 'white' }} />
                    </Avatar>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                      ₹{(earnings?.totalEarned || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">Total Earnings</Typography>
                    <Chip
                      label={`+${earnings?.bonus || 0} bonus`}
                      size="small"
                      sx={{ mt: 1, bgcolor: alpha('#10B981', 0.1), color: '#10B981' }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div variants={fadeInUp} whileHover={{ y: -5 }}>
                <Card
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${alpha('#3B82F6', 0.05)} 0%, ${alpha('#3B82F6', 0.02)} 100%)`,
                    border: `1px solid ${alpha('#3B82F6', 0.1)}`,
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: `0 10px 25px ${alpha('#3B82F6', 0.15)}`,
                      borderColor: alpha('#3B82F6', 0.3)
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        margin: '0 auto 12px',
                        background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      <ScheduleIcon sx={{ fontSize: 28, color: 'white' }} />
                    </Avatar>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                      {attendance?.presentDays || 0}/{attendance?.totalDays || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">Days Present</Typography>
                    <Chip
                      label={`${attendance?.lateDays || 0} late`}
                      size="small"
                      sx={{ mt: 1, bgcolor: alpha('#F59E0B', 0.1), color: '#F59E0B' }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div variants={fadeInUp} whileHover={{ y: -5 }}>
                <Card
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${alpha('#F59E0B', 0.05)} 0%, ${alpha('#F59E0B', 0.02)} 100%)`,
                    border: `1px solid ${alpha('#F59E0B', 0.1)}`,
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: `0 10px 25px ${alpha('#F59E0B', 0.15)}`,
                      borderColor: alpha('#F59E0B', 0.3)
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        margin: '0 auto 12px',
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                      }}
                    >
                      <TrendingUpIcon sx={{ fontSize: 28, color: 'white' }} />
                    </Avatar>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                      {performance?.totalCollections || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">Collections</Typography>
                    <Chip
                      label={`★ ${performance?.rating || 0}`}
                      size="small"
                      sx={{ mt: 1, bgcolor: alpha('#F59E0B', 0.1), color: '#F59E0B' }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div variants={fadeInUp} whileHover={{ y: -5 }}>
                <Card
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${alpha('#EF4444', 0.05)} 0%, ${alpha('#EF4444', 0.02)} 100%)`,
                    border: `1px solid ${alpha('#EF4444', 0.1)}`,
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: `0 10px 25px ${alpha('#EF4444', 0.15)}`,
                      borderColor: alpha('#EF4444', 0.3)
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        margin: '0 auto 12px',
                        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      <TrophyIcon sx={{ fontSize: 28, color: 'white' }} />
                    </Avatar>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                      {weeklyStats?.totalWaste || 0} kg
                    </Typography>
                    <Typography variant="body2" color="textSecondary">This Week</Typography>
                    <Chip
                      label={`${weeklyStats?.averagePerDay || 0} kg/day`}
                      size="small"
                      sx={{ mt: 1, bgcolor: alpha('#EF4444', 0.1), color: '#EF4444' }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          {/* Today's Route Section */}
          <motion.div variants={fadeInUp}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 4,
                background: alpha(theme.palette.background.paper, 0.95),
                border: `1px solid ${alpha('#4F46E5', 0.1)}`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Today's Route
                  {todayRoute && (
                    <Chip
                      label={todayRoute.status}
                      size="small"
                      sx={{ ml: 2, bgcolor: alpha('#4F46E5', 0.1), color: '#4F46E5' }}
                    />
                  )}
                </Typography>
                {todayRoute && todayRoute.status === 'Assigned' && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/driver/routes/${todayRoute.id}`)}
                      sx={{
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)'
                        }
                      }}
                    >
                      Start Route
                    </Button>
                  </motion.div>
                )}
              </Box>

              {todayRoute ? (
                <Box>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Route #{todayRoute.routeId} • {todayRoute.stopsCount} stops
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" fontWeight={500}>Progress</Typography>
                          <Typography variant="body2" fontWeight={500}>{todayRoute.progress}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={todayRoute.progress}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: alpha('#4F46E5', 0.1),
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
                              borderRadius: 5
                            }
                          }}
                        />
                      </Box>
                      <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Chip
                          size="small"
                          icon={<CheckCircleIcon />}
                          label={`Completed: ${todayRoute.completedStops}/${todayRoute.stopsCount}`}
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          icon={<TrophyIcon />}
                          label={`Waste: ${todayRoute.totalWaste} kg`}
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          icon={todayRoute.isOnSchedule ? <SpeedIcon /> : <ScheduleIcon />}
                          label={todayRoute.isOnSchedule ? 'On Schedule' : 'Delayed'}
                          sx={{
                            bgcolor: todayRoute.isOnSchedule ? alpha('#10B981', 0.1) : alpha('#EF4444', 0.1),
                            color: todayRoute.isOnSchedule ? '#10B981' : '#EF4444'
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate(`/driver/routes/${todayRoute.id}`)}
                        sx={{
                          borderRadius: 2,
                          borderColor: alpha('#4F46E5', 0.5),
                          '&:hover': {
                            borderColor: '#4F46E5',
                            backgroundColor: alpha('#4F46E5', 0.05)
                          }
                        }}
                      >
                        View Details
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="textSecondary">No route assigned for today</Typography>
                </Box>
              )}
            </Paper>
          </motion.div>

          {/* Quick Actions */}
          <Grid container spacing={3}>
            {[
              { icon: <ScheduleIcon />, title: 'My Routes', desc: 'View all assigned routes', path: '/driver/routes', color: '#4F46E5' },
              { icon: <CheckCircleIcon />, title: 'Attendance', desc: 'Check in/out and view history', path: '/driver/attendance', color: '#10B981' },
              { icon: <MoneyIcon />, title: 'Earnings', desc: 'Track your earnings and bonuses', path: '/driver/earnings', color: '#F59E0B' },
              { icon: <AssessmentIcon />, title: 'Performance', desc: 'View your performance metrics', path: '/driver/performance', color: '#EF4444' }
            ].map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    onClick={() => navigate(action.path)}
                    sx={{
                      cursor: 'pointer',
                      textAlign: 'center',
                      p: 2,
                      borderRadius: 4,
                      transition: 'all 0.3s',
                      background: `linear-gradient(135deg, ${alpha(action.color, 0.05)} 0%, ${alpha(action.color, 0.02)} 100%)`,
                      border: `1px solid ${alpha(action.color, 0.1)}`,
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: `0 15px 30px ${alpha(action.color, 0.15)}`,
                        borderColor: alpha(action.color, 0.3)
                      }
                    }}
                  >
                    <CardContent>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          margin: '0 auto 12px',
                          background: `linear-gradient(135deg, ${action.color} 0%, ${action.color}CC 100%)`,
                          boxShadow: `0 8px 16px ${alpha(action.color, 0.3)}`
                        }}
                      >
                        {React.cloneElement(action.icon, { sx: { fontSize: 30, color: 'white' } })}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {action.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </AnimatePresence>
    </Container>
  );
};

export default DriverDashboard;