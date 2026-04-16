import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Paper,
  Avatar,
  Chip,
  LinearProgress,
  useTheme,
  alpha,
  Skeleton,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Report,
  Recycling,
  EmojiEvents,
  LocationOn,
  TrendingUp,
  CheckCircle,
  Schedule,
  NotificationsActive,
  QrCodeScanner,
  ArrowForward,
  Star,
  Warning,
  Info
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { formatDistance } from 'date-fns';
import CountUp from 'react-countup';

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

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    pendingReports: 0,
    pointsEarned: 0,
    recyclingSaved: 0,
    badgesEarned: 0,
    currentStreak: 0
  });
  const [recentReports, setRecentReports] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Simulate API call - replace with actual API
    setTimeout(() => {
      setStats({
        totalReports: 24,
        resolvedReports: 18,
        pendingReports: 6,
        pointsEarned: 1250,
        recyclingSaved: 45,
        badgesEarned: 3,
        currentStreak: 5
      });
      setRecentReports([
        { id: 1, title: 'Overflowing Bin at Central Park', status: 'Resolved', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { id: 2, title: 'Bin Damaged near Metro Station', status: 'In Progress', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { id: 3, title: 'Missed Collection in Sector 12', status: 'Pending', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
      ]);
      setNotifications([
        { id: 1, title: 'Bin Collected', message: 'Your reported bin has been serviced', time: '2 hours ago', read: false },
        { id: 2, title: 'Reward Earned', message: 'You earned 50 points for recycling', time: '1 day ago', read: true }
      ]);
      setLoading(false);
    }, 1500);
  };

  const quickActions = [
    { title: 'Report Issue', icon: <Report />, color: '#4F46E5', path: '/citizen/report', description: 'Report waste issues instantly' },
    { title: 'Recycling Guide', icon: <Recycling />, color: '#10B981', path: '/citizen/recycling-guide', description: 'Learn to recycle properly' },
    { title: 'My Rewards', icon: <EmojiEvents />, color: '#F59E0B', path: '/citizen/rewards', description: 'View your points & badges' },
    { title: 'Nearby Bins', icon: <LocationOn />, color: '#3B82F6', path: '/citizen/nearby', description: 'Find bins near you' },
    { title: 'Scan QR', icon: <QrCodeScanner />, color: '#8B5CF6', path: '/citizen/scan', description: 'Scan bin QR codes' },
    { title: 'My Reports', icon: <Schedule />, color: '#EF4444', path: '/citizen/my-reports', description: 'Track your reports' }
  ];

  const statsCards = [
    { title: 'Total Reports', value: stats.totalReports, icon: <Report />, color: '#4F46E5', suffix: '' },
    { title: 'Resolved', value: stats.resolvedReports, icon: <CheckCircle />, color: '#10B981', suffix: '' },
    { title: 'Points Earned', value: stats.pointsEarned, icon: <Star />, color: '#F59E0B', suffix: '' },
    { title: 'CO₂ Saved', value: stats.recyclingSaved, icon: <TrendingUp />, color: '#3B82F6', suffix: 'kg' }
  ];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} />
          </Grid>
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
        {/* Welcome Header */}
        <motion.div variants={fadeInUp}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha('#4F46E5', 0.08)} 0%, ${alpha('#7C3AED', 0.03)} 100%)`,
              border: `1px solid ${alpha('#4F46E5', 0.1)}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha('#4F46E5', 0.1)} 0%, transparent 70%)`,
                zIndex: 0
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, position: 'relative', zIndex: 1 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  Welcome back, {user?.name?.split(' ')[0]}! 👋
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Track your waste management activities and earn rewards for keeping your community clean.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Chip
                    icon={<Star />}
                    label={`${stats.currentStreak} day streak`}
                    sx={{ bgcolor: alpha('#F59E0B', 0.1), color: '#F59E0B' }}
                  />
                  <Chip
                    icon={<EmojiEvents />}
                    label={`Level ${Math.floor(stats.pointsEarned / 500) + 1} Citizen`}
                    sx={{ bgcolor: alpha('#4F46E5', 0.1), color: '#4F46E5' }}
                  />
                </Box>
              </Box>
              <Box>
                <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                  <IconButton sx={{ bgcolor: alpha('#4F46E5', 0.05) }}>
                    <NotificationsActive />
                  </IconButton>
                </Badge>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={fadeInUp}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statsCards.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${alpha(stat.color, 0.05)} 0%, ${alpha(stat.color, 0.02)} 100%)`,
                    border: `1px solid ${alpha(stat.color, 0.1)}`,
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {stat.title}
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: stat.color }}>
                          <CountUp end={stat.value} duration={2} separator="," />
                          {stat.suffix}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: alpha(stat.color, 0.1), color: stat.color }}>
                        {stat.icon}
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeInUp}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card
                    onClick={() => navigate(action.path)}
                    sx={{
                      cursor: 'pointer',
                      p: 2,
                      borderRadius: 3,
                      transition: 'all 0.3s',
                      background: alpha(action.color, 0.03),
                      border: `1px solid ${alpha(action.color, 0.1)}`,
                      '&:hover': {
                        boxShadow: `0 8px 25px ${alpha(action.color, 0.15)}`,
                        borderColor: alpha(action.color, 0.3)
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Avatar sx={{ bgcolor: alpha(action.color, 0.1), color: action.color }}>
                          {action.icon}
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {action.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <ArrowForward sx={{ color: action.color, fontSize: 20 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Recent Activity & Notifications */}
        <Grid container spacing={3}>
          {/* Recent Reports */}
          <Grid item xs={12} md={6}>
            <motion.div variants={fadeInUp}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: alpha(theme.palette.background.paper, 0.95),
                  border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                  height: '100%'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule sx={{ color: '#4F46E5' }} />
                  Recent Reports
                </Typography>
                {recentReports.map((report) => (
                  <Box
                    key={report.id}
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: alpha('#4F46E5', 0.02),
                      transition: 'all 0.3s',
                      '&:hover': { bgcolor: alpha('#4F46E5', 0.05) }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{report.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistance(report.date, new Date(), { addSuffix: true })}
                        </Typography>
                      </Box>
                      <Chip
                        label={report.status}
                        size="small"
                        sx={{
                          bgcolor: report.status === 'Resolved' ? alpha('#10B981', 0.1) : 
                                   report.status === 'In Progress' ? alpha('#F59E0B', 0.1) : alpha('#EF4444', 0.1),
                          color: report.status === 'Resolved' ? '#10B981' : 
                                 report.status === 'In Progress' ? '#F59E0B' : '#EF4444'
                        }}
                      />
                    </Box>
                  </Box>
                ))}
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/citizen/my-reports')}
                  sx={{ mt: 1, borderRadius: 2, borderColor: alpha('#4F46E5', 0.5), color: '#4F46E5' }}
                >
                  View All Reports
                </Button>
              </Paper>
            </motion.div>
          </Grid>

          {/* Notifications */}
          <Grid item xs={12} md={6}>
            <motion.div variants={fadeInUp}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: alpha(theme.palette.background.paper, 0.95),
                  border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                  height: '100%'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsActive sx={{ color: '#4F46E5' }} />
                  Notifications
                </Typography>
                {notifications.map((notification) => (
                  <Box
                    key={notification.id}
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: notification.read ? 'transparent' : alpha('#4F46E5', 0.05),
                      transition: 'all 0.3s',
                      '&:hover': { bgcolor: alpha('#4F46E5', 0.08) }
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar sx={{ bgcolor: alpha('#4F46E5', 0.1), width: 40, height: 40 }}>
                        {notification.title.includes('Bin') ? <Warning sx={{ color: '#F59E0B' }} /> : <EmojiEvents sx={{ color: '#10B981' }} />}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                          {notification.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          {notification.time}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/notifications')}
                  sx={{ mt: 1, borderRadius: 2, borderColor: alpha('#4F46E5', 0.5), color: '#4F46E5' }}
                >
                  View All Notifications
                </Button>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Tip of the Day */}
        <motion.div variants={fadeInUp}>
          <Paper
            elevation={0}
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha('#10B981', 0.05)} 0%, ${alpha('#059669', 0.02)} 100%)`,
              border: `1px solid ${alpha('#10B981', 0.1)}`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Avatar sx={{ bgcolor: alpha('#10B981', 0.1), color: '#10B981' }}>
                <Info />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#10B981' }}>
                  💡 Tip of the Day
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Did you know? Recycling one ton of paper saves 17 trees, 7,000 gallons of water, and 4,100 kWh of electricity!
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/citizen/recycling-guide')}
                sx={{ borderRadius: 2, borderColor: alpha('#10B981', 0.5), color: '#10B981' }}
              >
                Learn More
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default CitizenDashboard;