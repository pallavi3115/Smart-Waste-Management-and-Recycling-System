import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Avatar,
  Divider,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
  Refresh as RefreshIcon,
  Circle as CircleIcon,
  DeleteSweep as DeleteSweepIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Route Assigned',
      message: 'You have been assigned a new collection route for today.',
      time: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      type: 'route',
      icon: '🚛',
      link: '/driver/routes'
    },
    {
      id: 2,
      title: 'Bonus Earned!',
      message: 'Congratulations! You earned a ₹5000 performance bonus.',
      time: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      type: 'reward',
      icon: '💰',
      link: '/driver/earnings'
    },
    {
      id: 3,
      title: 'Route Completed',
      message: 'Route #R-2024-001 completed successfully.',
      time: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
      type: 'success',
      icon: '✅',
      link: '/driver/routes'
    },
    {
      id: 4,
      title: 'Maintenance Alert',
      message: 'Your vehicle needs maintenance. Please schedule a service.',
      time: new Date(Date.now() - 1000 * 60 * 60 * 48),
      read: true,
      type: 'alert',
      icon: '⚠️',
      link: '/driver/profile'
    },
    {
      id: 5,
      title: 'New Recycling Center Added',
      message: 'A new recycling center has opened in your area.',
      time: new Date(Date.now() - 1000 * 60 * 60 * 72),
      read: true,
      type: 'info',
      icon: '♻️',
      link: '/citizen/nearby'
    }
  ]);

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleDeleteAll = () => {
    setNotifications([]);
  };

  const handleRefresh = () => {
    // Refresh notifications logic
    console.log('Refreshing notifications...');
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getFilteredNotifications = () => {
    if (tabValue === 0) return notifications;
    if (tabValue === 1) return notifications.filter(n => !n.read);
    if (tabValue === 2) return notifications.filter(n => n.read);
    return notifications;
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = getFilteredNotifications();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationsIcon sx={{ fontSize: 32, color: '#4F46E5' }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} unread`}
                size="small"
                sx={{ bgcolor: alpha('#4F46E5', 0.1), color: '#4F46E5' }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Mark all as read">
              <IconButton
                onClick={handleMarkAllAsRead}
                sx={{ color: '#4F46E5' }}
              >
                <DoneAllIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete all">
              <IconButton
                onClick={handleDeleteAll}
                sx={{ color: '#EF4444' }}
              >
                <DeleteSweepIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
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
            sx={{
              '& .MuiTab-root': {
                minHeight: 50,
                fontSize: '0.9rem',
                fontWeight: 500,
                '&.Mui-selected': { color: '#4F46E5' }
              },
              '& .MuiTabs-indicator': { backgroundColor: '#4F46E5' }
            }}
          >
            <Tab label="All" />
            <Tab label="Unread" />
            <Tab label="Read" />
          </Tabs>
        </Paper>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
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
            <Typography variant="h6" color="textSecondary">
              No notifications
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {tabValue === 1 ? "You don't have any unread notifications" :
               tabValue === 2 ? "No read notifications yet" :
               "You're all caught up!"}
            </Typography>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              background: alpha(theme.palette.background.paper, 0.95),
              border: `1px solid ${alpha('#4F46E5', 0.1)}`,
              overflow: 'hidden'
            }}
          >
            <List sx={{ p: 0 }}>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    disablePadding
                    sx={{
                      bgcolor: notification.read ? 'transparent' : alpha('#4F46E5', 0.05),
                      transition: 'background 0.2s',
                      '&:hover': { bgcolor: alpha('#4F46E5', 0.08) }
                    }}
                  >
                    <ListItemButton onClick={() => handleNotificationClick(notification)} sx={{ py: 2, px: 3 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: alpha('#4F46E5', 0.1) }}>
                          <Typography variant="h5">{notification.icon}</Typography>
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body1" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                              {notification.title}
                            </Typography>
                            {!notification.read && (
                              <CircleIcon sx={{ fontSize: 10, color: '#4F46E5' }} />
                            )}
                            <Chip
                              label={notification.type}
                              size="small"
                              sx={{
                                bgcolor: alpha('#4F46E5', 0.1),
                                color: '#4F46E5',
                                height: 20,
                                fontSize: '0.7rem'
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDistanceToNow(new Date(notification.time), { addSuffix: true })}
                            </Typography>
                          </>
                        }
                      />
                      <Box>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notification.id);
                            }}
                            sx={{ color: '#EF4444' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                  {index < filteredNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </motion.div>
    </Container>
  );
};

export default NotificationsPage;