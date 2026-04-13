import React, { useState } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  useTheme, 
  Badge, 
  alpha, 
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { Outlet, useNavigate } from 'react-router-dom';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  console.log('📐 Layout rendering with user:', user);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const getAvatarColor = () => {
    if (user?.role === 'Admin') return '#EF4444';
    if (user?.role === 'Driver') return '#F59E0B';
    return '#10B981';
  };

  const getRoleBadge = () => {
    if (user?.role === 'Admin') return 'Admin';
    if (user?.role === 'Driver') return 'Driver';
    return 'Citizen';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          color: theme.palette.text.primary,
          boxShadow: 'none',
          borderBottom: `1px solid ${alpha('#4F46E5', 0.1)}`,
          width: { sm: `calc(100% - ${sidebarOpen ? 280 : 80}px)` },
          ml: { sm: `${sidebarOpen ? 280 : 80}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Mobile menu button */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            {/* Desktop sidebar toggle */}
            <IconButton
              color="inherit"
              aria-label="toggle sidebar"
              onClick={toggleSidebar}
              edge="start"
              sx={{ mr: 2, display: { xs: 'none', sm: 'flex' } }}
            >
              <MenuIcon />
            </IconButton>

            <Typography 
              variant="h6" 
              noWrap 
              component="div"
              sx={{
                fontWeight: 600,
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {user?.role || 'User'} Dashboard
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton color="inherit" size="large">
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Avatar with Menu */}
            <Tooltip title="Account">
              <IconButton 
                onClick={handleMenuOpen}
                sx={{ 
                  p: 0,
                  ml: 1
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: getAvatarColor(),
                    width: 40,
                    height: 40,
                    border: `2px solid ${alpha('#4F46E5', 0.2)}`,
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
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
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${alpha('#4F46E5', 0.1)}` }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user?.name}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {getRoleBadge()}
          </Typography>
        </Box>
        <MenuItem onClick={handleProfile} sx={{ borderRadius: 2, m: 0.5 }}>
          <PersonIcon sx={{ mr: 1, color: '#4F46E5', fontSize: 20 }} /> Profile
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ borderRadius: 2, m: 0.5 }}>
          <SettingsIcon sx={{ mr: 1, color: '#4F46E5', fontSize: 20 }} /> Settings
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleMenuClose} sx={{ borderRadius: 2, m: 0.5 }}>
          <HelpIcon sx={{ mr: 1, color: '#4F46E5', fontSize: 20 }} /> Help & Support
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
          <LogoutIcon sx={{ mr: 1, fontSize: 20 }} /> Logout
        </MenuItem>
      </Menu>

      {/* Sidebar */}
      <Sidebar 
        open={sidebarOpen} 
        toggleDrawer={toggleSidebar}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${sidebarOpen ? 280 : 80}px)` },
          ml: { sm: `${sidebarOpen ? 280 : 80}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          mt: '64px',
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;