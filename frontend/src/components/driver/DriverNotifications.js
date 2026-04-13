import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Avatar,
  Skeleton,
  Divider,
  Tooltip  // Added missing Tooltip import
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
  Refresh as RefreshIcon,
  NotificationsActive as NotificationsActiveIcon,
  Assignment as AssignmentIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { showSuccess } from '../../utils/toast';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const DriverNotifications = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Mock data - replace with actual API call
      const mockNotifications = [
        {
          id: '1',
          title: 'New Route Assigned',
          message: 'You have been assigned a new collection route for today.',
          type: 'route',
          priority: 'high',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30),
          icon: <AssignmentIcon />,
          color: '#4F46E5'
        },
        {
          id: '2',
          title: 'Route Completed',
          message: 'You successfully completed Route #R-2024-001.',
          type: 'success',
          priority: 'normal',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          icon: <CheckCircleIcon />,
          color: '#10B981'
        },
        {
          id: '3',
          title: 'Bonus Earned',
          message: 'Congratulations! You earned a ₹5000 performance bonus this month.',
          type: 'reward',
          priority: 'normal',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          icon: <TrophyIcon />,
          color: '#F59E0B'
        },
        {
          id: '4',
          title: 'Maintenance Alert',
          message: 'Your vehicle needs maintenance. Please visit the service center.',
          type: 'alert',
          priority: 'high',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
          icon: <WarningIcon />,
          color: '#EF4444'
        },
        {
          id: '5',
          title: 'Performance Update',
          message: 'Your customer rating has increased to 4.8 stars!',
          type: 'update',
          priority: 'normal',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
          icon: <TrendingUpIcon />,
          color: '#4F46E5'
        }
      ];

      setNotifications(mockNotifications);
      setStats({
        total: mockNotifications.length,
        unread: mockNotifications.filter(n => !n.read).length,
        read: mockNotifications.filter(n => n.read).length
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setStats(prev => ({
      ...prev,
      unread: prev.unread - 1,
      read: prev.read + 1
    }));
    showSuccess('Marked as read');
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setStats(prev => ({
      ...prev,
      unread: 0,
      read: prev.total
    }));
    showSuccess('All notifications marked as read');
  };

  const handleDelete = (id) => {
    const notificationToDelete = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    setStats(prev => ({
      ...prev,
      total: prev.total - 1,
      unread: prev.unread - (notificationToDelete?.read ? 0 : 1),
      read: prev.read - (notificationToDelete?.read ? 1 : 0)
    }));
    showSuccess('Notification deleted');
  };

  const getFilteredNotifications = () => {
    if (tabValue === 0) return notifications;
    if (tabValue === 1) return notifications.filter(n => !n.read);
    if (tabValue === 2) return notifications.filter(n => n.read);
    return notifications;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'normal': return '#F59E0B';
      default: return '#10B981';
    }
  };

  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Notifications
        </Typography>
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} key={item}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  const filteredNotifications = getFilteredNotifications();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationsActiveIcon sx={{ fontSize: 32, color: '#4F46E5' }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Notifications
            </Typography>
            <Chip
              label={`${stats.unread} unread`}
              size="small"
              sx={{
                bgcolor: alpha('#4F46E5', 0.1),
                color: '#4F46E5',
                fontWeight: 600
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {stats.unread > 0 && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<DoneAllIcon />}
                onClick={handleMarkAllAsRead}
                sx={{
                  borderRadius: 2,
                  borderColor: alpha('#4F46E5', 0.5),
                  '&:hover': {
                    borderColor: '#4F46E5',
                    backgroundColor: alpha('#4F46E5', 0.05)
                  }
                }}
              >
                Mark all as read
              </Button>
            )}
            <Tooltip title="Refresh">
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  bgcolor: alpha('#4F46E5', 0.05),
                  '&:hover': { bgcolor: alpha('#4F46E5', 0.1) }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card
              elevation={0}
              sx={{
                textAlign: 'center',
                p: 2,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha('#4F46E5', 0.05)} 0%, ${alpha('#4F46E5', 0.02)} 100%)`,
                border: `1px solid ${alpha('#4F46E5', 0.1)}`
              }}
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  margin: '0 auto 12px',
                  bgcolor: alpha('#4F46E5', 0.1),
                  color: '#4F46E5'
                }}
              >
                <NotificationsIcon />
              </Avatar>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#4F46E5' }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="textSecondary">Total</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              elevation={0}
              sx={{
                textAlign: 'center',
                p: 2,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha('#F59E0B', 0.05)} 0%, ${alpha('#F59E0B', 0.02)} 100%)`,
                border: `1px solid ${alpha('#F59E0B', 0.1)}`
              }}
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  margin: '0 auto 12px',
                  bgcolor: alpha('#F59E0B', 0.1),
                  color: '#F59E0B'
                }}
              >
                <NotificationsActiveIcon />
              </Avatar>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#F59E0B' }}>
                {stats.unread}
              </Typography>
              <Typography variant="body2" color="textSecondary">Unread</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              elevation={0}
              sx={{
                textAlign: 'center',
                p: 2,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha('#10B981', 0.05)} 0%, ${alpha('#10B981', 0.02)} 100%)`,
                border: `1px solid ${alpha('#10B981', 0.1)}`
              }}
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  margin: '0 auto 12px',
                  bgcolor: alpha('#10B981', 0.1),
                  color: '#10B981'
                }}
              >
                <CheckCircleIcon />
              </Avatar>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#10B981' }}>
                {stats.read}
              </Typography>
              <Typography variant="body2" color="textSecondary">Read</Typography>
            </Card>
          </Grid>
        </Grid>

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
                minHeight: 50,
                fontSize: '0.9rem',
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
            <Tab label="All" />
            <Tab label="Unread" />
            <Tab label="Read" />
          </Tabs>
        </Paper>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
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
              <NotificationsIcon sx={{ fontSize: 64, color: alpha('#4F46E5', 0.3), mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No notifications
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {tabValue === 1 ? "You don't have any unread notifications" :
                 tabValue === 2 ? "No read notifications yet" :
                 "You're all caught up!"}
              </Typography>
            </Paper>
          </motion.div>
        ) : (
          <AnimatePresence>
            <Grid container spacing={2}>
              {filteredNotifications.map((notification, index) => (
                <Grid item xs={12} key={notification.id}>
                  <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 3,
                        background: notification.read
                          ? alpha(theme.palette.background.paper, 0.95)
                          : alpha(notification.color, 0.05),
                        border: `1px solid ${alpha(notification.color, 0.15)}`,
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateX(4px)',
                          boxShadow: `0 4px 12px ${alpha(notification.color, 0.1)}`,
                          borderColor: alpha(notification.color, 0.3)
                        },
                        opacity: notification.read ? 0.85 : 1
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              bgcolor: alpha(notification.color, 0.1),
                              color: notification.color
                            }}
                          >
                            {notification.icon}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {notification.title}
                              </Typography>
                              {!notification.read && (
                                <Chip
                                  label="New"
                                  size="small"
                                  sx={{
                                    bgcolor: alpha('#EF4444', 0.1),
                                    color: '#EF4444',
                                    height: 20,
                                    fontSize: '0.7rem'
                                  }}
                                />
                              )}
                              {notification.priority === 'high' && (
                                <Chip
                                  label="High Priority"
                                  size="small"
                                  sx={{
                                    bgcolor: alpha('#EF4444', 0.1),
                                    color: '#EF4444',
                                    height: 20,
                                    fontSize: '0.7rem'
                                  }}
                                />
                              )}
                            </Box>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                              {notification.message}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                              <Typography variant="caption" color="textSecondary">
                                {getTimeAgo(notification.createdAt)}
                              </Typography>
                              <Chip
                                size="small"
                                label={notification.type}
                                sx={{
                                  bgcolor: alpha(notification.color, 0.1),
                                  color: notification.color,
                                  height: 20,
                                  fontSize: '0.7rem'
                                }}
                              />
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {!notification.read && (
                              <Tooltip title="Mark as read">
                                <IconButton
                                  size="small"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  sx={{ color: '#4F46E5' }}
                                >
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(notification.id)}
                                sx={{ color: '#EF4444' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </AnimatePresence>
        )}
      </motion.div>
    </Container>
  );
};

export default DriverNotifications;