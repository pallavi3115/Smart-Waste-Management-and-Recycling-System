// Sidebar.js - Role-based version (Sirf ye file change karo)
import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Avatar,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Report as ReportIcon,
  Recycling as RecyclingIcon,
  EmojiEvents as EmojiEventsIcon,
  LocationOn as LocationOnIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  Delete as DeleteIcon,
  BarChart as BarChartIcon,
  People as PeopleIcon,
  Route as RouteIcon,
  Assessment as AssessmentIcon,
  Inventory as InventoryIcon,
  Wc as WcIcon,
  QrCodeScanner as QrCodeScannerIcon,
  AttachMoney as AttachMoneyIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();

  // User ka role lo
  const userRole = user?.role || 'Citizen';

  // Role ke according menu items
  const getMenuItems = () => {
    // Common items for all
    const commonItems = [
      { text: 'Home', icon: <HomeIcon />, path: '/' },
      { text: 'Dashboard', icon: <DashboardIcon />, path: `/${userRole.toLowerCase()}` },
    ];

    // Citizen ke liye
    const citizenItems = [
      { text: 'Report Issue', icon: <ReportIcon />, path: '/citizen/report' },
      { text: 'My Reports', icon: <InfoIcon />, path: '/citizen/my-reports' },
      { text: 'Recycling Guide', icon: <RecyclingIcon />, path: '/citizen/recycling-guide' },
      { text: 'Rewards', icon: <EmojiEventsIcon />, path: '/citizen/rewards' },
      { text: 'Nearby Bins', icon: <LocationOnIcon />, path: '/citizen/nearby' },
      { text: 'Public Toilets', icon: <WcIcon />, path: '/citizen/toilets' },
      { text: 'Scan QR', icon: <QrCodeScannerIcon />, path: '/citizen/scan' },
    ];

    // Admin ke liye
    const adminItems = [
      { text: 'Bin Management', icon: <DeleteIcon />, path: '/admin/bins' },
      { text: 'Recycling Centers', icon: <RecyclingIcon />, path: '/admin/centers' },
      { text: 'All Reports', icon: <ReportIcon />, path: '/admin/reports' },
      { text: 'Analytics', icon: <BarChartIcon />, path: '/admin/analytics' },
      { text: 'Route Optimization', icon: <RouteIcon />, path: '/admin/routes' },
      { text: 'Staff Management', icon: <PeopleIcon />, path: '/admin/staff' },
      { text: 'Audit Logs', icon: <AssessmentIcon />, path: '/admin/audit' },
    ];

    // Driver ke liye
    const driverItems = [
      { text: 'My Routes', icon: <RouteIcon />, path: '/driver/routes' },
      { text: 'Attendance', icon: <PeopleIcon />, path: '/driver/attendance' },
      { text: 'Earnings', icon: <AttachMoneyIcon />, path: '/driver/earnings' },
      { text: 'Performance', icon: <AssessmentIcon />, path: '/driver/performance' },
    ];

    // Profile & Settings (sabke liye common)
    const profileItems = [
      { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
      { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
      { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
      { text: 'Help & Support', icon: <HelpIcon />, path: '/help' },
    ];

    // Role ke according select karo
    let roleSpecificItems = [];
    let sectionTitle = '';

    if (userRole === 'Admin') {
      roleSpecificItems = adminItems;
      sectionTitle = 'ADMIN CONTROLS';
    } else if (userRole === 'Driver') {
      roleSpecificItems = driverItems;
      sectionTitle = 'DRIVER TASKS';
    } else {
      roleSpecificItems = citizenItems;
      sectionTitle = 'QUICK ACTIONS';
    }

    return { commonItems, roleSpecificItems, profileItems, sectionTitle };
  };

  const { commonItems, roleSpecificItems, profileItems, sectionTitle } = getMenuItems();

  // Active path check
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/citizen') return location.pathname === '/citizen' || location.pathname === '/citizen/dashboard';
    if (path === '/admin') return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    if (path === '/driver') return location.pathname === '/driver' || location.pathname === '/driver/dashboard';
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  // Role ke according color
  const getRoleColor = () => {
    if (userRole === 'Admin') return '#EF4444';
    if (userRole === 'Driver') return '#F59E0B';
    return '#10B981';
  };

  // Menu items render karne ka function
  const renderMenuItems = (items) => {
    return items.map((item) => (
      <ListItem key={item.text} disablePadding>
        <ListItemButton
          onClick={() => handleNavigation(item.path)}
          selected={isActive(item.path)}
          sx={{
            mx: 1,
            borderRadius: 2,
            mb: 0.5,
            '&.Mui-selected': {
              backgroundColor: alpha('#4F46E5', 0.12),
              '& .MuiListItemIcon-root': { color: '#4F46E5' },
              '& .MuiTypography-root': { color: '#4F46E5', fontWeight: 600 },
            },
          }}
        >
          <ListItemIcon sx={{ color: isActive(item.path) ? '#4F46E5' : '#64748B', minWidth: 40 }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItemButton>
      </ListItem>
    ));
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          borderRight: `1px solid ${alpha('#4F46E5', 0.1)}`,
        },
      }}
    >
      {/* User Profile Section */}
      <Box sx={{ p: 2.5, textAlign: 'center', borderBottom: `1px solid ${alpha('#4F46E5', 0.1)}` }}>
        <Avatar
          sx={{
            width: 70,
            height: 70,
            margin: '0 auto 12px',
            background: `linear-gradient(135deg, ${getRoleColor()} 0%, ${alpha(getRoleColor(), 0.7)} 100%)`,
            fontSize: '1.8rem',
          }}
        >
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>
          {user?.name || 'User'}
        </Typography>
        <Chip 
          label={userRole} 
          size="small"
          sx={{ mt: 0.5, bgcolor: alpha(getRoleColor(), 0.1), color: getRoleColor() }}
        />
        <Typography variant="body2" sx={{ mt: 1, color: '#F59E0B', fontWeight: 600 }}>
          1250 pts
        </Typography>
      </Box>

      {/* Common Menu (Home & Dashboard) */}
      <List sx={{ py: 1 }}>
        {renderMenuItems(commonItems)}
      </List>

      <Divider sx={{ my: 1 }} />

      {/* Role Specific Menu */}
      <List sx={{ py: 1 }}>
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: 1 }}>
            {sectionTitle}
          </Typography>
        </Box>
        {renderMenuItems(roleSpecificItems)}
      </List>

      <Divider sx={{ my: 1 }} />

      {/* Profile & Settings Menu */}
      <List sx={{ py: 1 }}>
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: 1 }}>
            ACCOUNT
          </Typography>
        </Box>
        {renderMenuItems(profileItems)}
      </List>

      <Divider />

      {/* Logout Button */}
      <List sx={{ p: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              mx: 1,
              borderRadius: 2,
              color: '#EF4444',
              '&:hover': { backgroundColor: '#FEF2F2' },
            }}
          >
            <ListItemIcon sx={{ color: '#EF4444', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;