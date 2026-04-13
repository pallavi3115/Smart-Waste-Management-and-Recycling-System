import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  useTheme,
  alpha,
  Badge,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemButton
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Recycling as RecyclingIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';

const Header = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useCustomTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Route Assigned',
      message: 'You have a new collection route today',
      time: '5 minutes ago',
      read: false,
      icon: '🚛',
      link: '/driver/routes'
    },
    {
      id: 2,
      title: 'Bonus Earned!',
      message: 'You earned a ₹5000 bonus this month',
      time: '2 hours ago',
      read: false,
      icon: '💰',
      link: '/driver/earnings'
    },
    {
      id: 3,
      title: 'Route Completed',
      message: 'Route #R-2024-001 completed successfully',
      time: 'Yesterday',
      read: true,
      icon: '✅',
      link: '/driver/routes'
    }
  ]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenu = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notification.id ? { ...notif, read: true } : notif
      )
    );
    
    // Navigate to the notification link
    if (notification.link) {
      navigate(notification.link);
    }
    
    handleNotificationClose();
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleViewAllNotifications = () => {
    handleNotificationClose();
    navigate('/notifications');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const handleDashboard = () => {
    if (user?.role === 'Admin') {
      navigate('/admin');
    } else if (user?.role === 'Driver') {
      navigate('/driver');
    } else {
      navigate('/citizen');
    }
    handleClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleSettings = () => {
    navigate('/profile/edit');
    handleClose();
  };

  const handleHelp = () => {
    navigate('/help');
    handleClose();
  };

  const handleHome = () => {
    navigate('/');
  };

  const getAvatarColor = () => {
    return 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${alpha('#4F46E5', 0.1)}`,
        boxShadow: 'none'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        {/* Logo Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={handleHome}>
          <RecyclingIcon sx={{ color: '#4F46E5', fontSize: 32 }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            SmartWaste
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          <Button 
            color="inherit" 
            onClick={handleHome}
            sx={{ 
              color: theme.palette.text.primary,
              '&:hover': { backgroundColor: alpha('#4F46E5', 0.05) }
            }}
          >
            Home
          </Button>
          {user && (
            <Button 
              color="inherit" 
              onClick={handleDashboard}
              sx={{ 
                color: theme.palette.text.primary,
                '&:hover': { backgroundColor: alpha('#4F46E5', 0.05) }
              }}
            >
              Dashboard
            </Button>
          )}
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Toggle */}
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton 
              onClick={toggleTheme}
              sx={{ 
                color: theme.palette.text.primary,
                '&:hover': { backgroundColor: alpha('#4F46E5', 0.1) }
              }}
            >
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Notifications - Fixed Button */}
          {user && (
            <Tooltip title="Notifications">
              <IconButton 
                onClick={handleNotificationMenu}
                sx={{ 
                  color: theme.palette.text.primary,
                  '&:hover': { backgroundColor: alpha('#4F46E5', 0.1) }
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          {/* User Section */}
          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#4F46E5' }}>
                  {user?.role}
                </Typography>
              </Box>
              <Tooltip title="Account Menu">
                <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                  <Avatar 
                    sx={{ 
                      background: getAvatarColor(),
                      width: 40,
                      height: 40,
                      border: `2px solid ${alpha('#4F46E5', 0.2)}`,
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'scale(1.05)' }
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Button 
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)'
                }
              }}
            >
              Login
            </Button>
          )}
        </Box>

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 200,
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha('#4F46E5', 0.1)}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleProfile} sx={{ borderRadius: 2, m: 0.5 }}>
            <PersonIcon sx={{ mr: 1, color: '#4F46E5' }} /> Profile
          </MenuItem>
          <MenuItem onClick={handleDashboard} sx={{ borderRadius: 2, m: 0.5 }}>
            <DashboardIcon sx={{ mr: 1, color: '#4F46E5' }} /> Dashboard
          </MenuItem>
          <MenuItem onClick={handleSettings} sx={{ borderRadius: 2, m: 0.5 }}>
            <SettingsIcon sx={{ mr: 1, color: '#4F46E5' }} /> Settings
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={handleHelp} sx={{ borderRadius: 2, m: 0.5 }}>
            <HelpIcon sx={{ mr: 1, color: '#4F46E5' }} /> Help & Support
          </MenuItem>
          <MenuItem 
            onClick={handleLogout} 
            sx={{ 
              borderRadius: 2, 
              m: 0.5,
              color: '#EF4444',
              '&:hover': { backgroundColor: alpha('#EF4444', 0.1) }
            }}
          >
            <LogoutIcon sx={{ mr: 1 }} /> Logout
          </MenuItem>
        </Menu>

        {/* Notifications Menu - Fixed with proper navigation */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              width: 380,
              maxWidth: '90vw',
              maxHeight: 500,
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.98),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha('#4F46E5', 0.1)}`,
              overflow: 'hidden'
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* Header */}
          <Box sx={{ 
            p: 2, 
            borderBottom: `1px solid ${alpha('#4F46E5', 0.1)}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1E293B' }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button 
                size="small" 
                onClick={handleMarkAllAsRead}
                sx={{ color: '#4F46E5', textTransform: 'none' }}
              >
                Mark all as read
              </Button>
            )}
          </Box>

          {/* Notifications List */}
          <List sx={{ p: 0, maxHeight: 400, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <NotificationsIcon sx={{ fontSize: 48, color: alpha('#4F46E5', 0.3), mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No notifications
                </Typography>
              </Box>
            ) : (
              notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem 
                    disablePadding
                    sx={{
                      bgcolor: notification.read ? 'transparent' : alpha('#4F46E5', 0.05),
                      transition: 'background 0.2s',
                      '&:hover': { bgcolor: alpha('#4F46E5', 0.08) }
                    }}
                  >
                    <ListItemButton 
                      onClick={() => handleNotificationClick(notification)}
                      sx={{ py: 1.5, px: 2 }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: alpha('#4F46E5', 0.1) }}>
                          <Typography variant="h6">{notification.icon}</Typography>
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600, color: '#1E293B' }}>
                              {notification.title}
                            </Typography>
                            {!notification.read && (
                              <CircleIcon sx={{ fontSize: 8, color: '#4F46E5' }} />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                              {notification.time}
                            </Typography>
                          </>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  <Divider sx={{ borderColor: alpha('#4F46E5', 0.05) }} />
                </React.Fragment>
              ))
            )}
          </List>

          {/* Footer */}
          {notifications.length > 0 && (
            <Box sx={{ 
              p: 1.5, 
              textAlign: 'center', 
              borderTop: `1px solid ${alpha('#4F46E5', 0.1)}`,
              bgcolor: alpha(theme.palette.background.paper, 0.95)
            }}>
              <Button 
                size="small" 
                onClick={handleViewAllNotifications}
                sx={{ color: '#4F46E5', textTransform: 'none' }}
              >
                View All Notifications
              </Button>
            </Box>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;