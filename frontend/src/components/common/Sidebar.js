import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Box,
  Typography,
  Avatar,
  useTheme,
  Collapse,
  Tooltip,
  Badge,
  Chip  // Added missing Chip import
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Report as ReportIcon,
  Recycling as RecyclingIcon,
  EmojiEvents as EmojiEventsIcon,
  LocationOn as LocationOnIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Delete as DeleteIcon,
  BarChart as BarChartIcon,
  People as PeopleIcon,
  Route as RouteIcon,
  Assessment as AssessmentIcon,
  Inventory as InventoryIcon,
  Wc as WcIcon,
  ExpandLess,
  ExpandMore,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  Feedback as FeedbackIcon,
  Home as HomeIcon
  // Removed unused MenuIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
// Removed unused useTheme import

const drawerWidth = 280;
const collapsedDrawerWidth = 80;

const Sidebar = ({ open, toggleDrawer, mobileOpen, handleDrawerToggle }) => {
  const theme = useTheme();
  // Removed unused toggleTheme
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [expandedMenus, setExpandedMenus] = useState({});
  const [unreadCount] = useState(3); // Removed unused setUnreadCount

  // Close expanded menus when sidebar is collapsed
  useEffect(() => {
    if (!open) {
      setExpandedMenus({});
    }
  }, [open]);

  const handleMenuExpand = (menu) => {
    if (!open) return; // Don't expand when sidebar is collapsed
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const handleNavigation = (path) => {
  navigate(path);
  if (window.innerWidth < 600) {
    handleDrawerToggle();
  }
};

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if a route is active
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Get menu items based on user role
  const getMenuItems = () => {
    const mainItems = [
      { 
        text: 'Home', 
        icon: <HomeIcon />, 
        path: '/',
        showInCollapsed: true
      },
      { 
        text: 'Dashboard', 
        icon: <DashboardIcon />, 
        path: `/${user?.role?.toLowerCase()}`,
        showInCollapsed: true
      },
    ];

    const citizenItems = [
      { 
        text: 'Report Issue', 
        icon: <ReportIcon />, 
        path: '/citizen/report',
        badge: null
      },
      { 
        text: 'My Reports', 
        icon: <InfoIcon />, 
        path: '/citizen/my-reports',
        badge: null
      },
      { 
        text: 'Recycling Guide', 
        icon: <RecyclingIcon />, 
        path: '/citizen/recycling-guide' 
      },
      { 
        text: 'Rewards', 
        icon: <EmojiEventsIcon />, 
        path: '/citizen/rewards',
        badge: { count: 2, color: 'warning' } // New rewards available
      },
      { 
        text: 'Nearby Bins', 
        icon: <LocationOnIcon />, 
        path: '/citizen/nearby' 
      },
      { 
        text: 'Public Toilets', 
        icon: <WcIcon />, 
        path: '/citizen/toilets' 
      },
      { 
        text: 'Scan QR', 
        icon: <QrCodeScannerIcon />, 
        path: '/citizen/scan' 
      },
    ];

    const adminItems = [
      { 
        text: 'Bin Management', 
        icon: <DeleteIcon />, 
        path: '/admin/bins',
        badge: { count: 5, color: 'error' } // 5 bins need attention
      },
      { 
        text: 'Recycling Centers', 
        icon: <RecyclingIcon />, 
        path: '/admin/centers' 
      },
      { 
        text: 'Reports', 
        icon: <ReportIcon />, 
        path: '/admin/reports',
        badge: { count: 12, color: 'warning' } // 12 pending reports
      },
      { 
        text: 'Analytics', 
        icon: <BarChartIcon />, 
        path: '/admin/analytics' 
      },
      { 
        text: 'Route Optimization', 
        icon: <RouteIcon />, 
        path: '/admin/routes' 
      },
      { 
        text: 'Staff Management', 
        icon: <PeopleIcon />, 
        path: '/admin/staff' 
      },
      { 
        text: 'Audit Logs', 
        icon: <AssessmentIcon />, 
        path: '/admin/audit' 
      },
    ];

    const driverItems = [
      { 
        text: 'Assigned Routes', 
        icon: <RouteIcon />, 
        path: '/driver/routes',
        badge: { count: 3, color: 'info' } // 3 routes today
      },
      { 
        text: 'Collection Proof', 
        icon: <InventoryIcon />, 
        path: '/driver/collection' 
      },
      { 
        text: 'Attendance', 
        icon: <PeopleIcon />, 
        path: '/driver/attendance' 
      },
    ];

    const profileItems = [
      { 
        text: 'Profile', 
        icon: <PersonIcon />, 
        path: '/profile',
        showInCollapsed: true
      },
      { 
        text: 'Notifications', 
        icon: <NotificationsIcon />, 
        path: '/notifications',
        badge: { count: unreadCount, color: 'error' },
        showInCollapsed: true
      },
      { 
        text: 'Settings', 
        icon: <SettingsIcon />, 
        path: '/settings' 
      },
    ];

    const helpItems = [
      { text: 'Help & Support', icon: <HelpIcon />, path: '/help' },
      { text: 'Send Feedback', icon: <FeedbackIcon />, path: '/feedback' },
    ];

    // Combine items based on role
    let roleSpecificItems = [];
    switch (user?.role) {
      case 'Admin':
        roleSpecificItems = adminItems;
        break;
      case 'Driver':
        roleSpecificItems = driverItems;
        break;
      case 'Citizen':
      default:
        roleSpecificItems = citizenItems;
        break;
    }

    return {
      main: mainItems,
      role: roleSpecificItems,
      profile: profileItems,
      help: helpItems
    };
  };

  const menuItems = getMenuItems();

  // Render a single menu item
  const renderMenuItem = (item, index, showTooltip = false) => {
    const active = isActive(item.path);
    const content = (
      <ListItemButton
        key={index}
        onClick={() => handleNavigation(item.path)}
        selected={active}
        sx={{
          minHeight: 48,
          justifyContent: open ? 'initial' : 'center',
          px: 2.5,
          mx: 1,
          borderRadius: 1,
          mb: 0.5,
          '&.Mui-selected': {
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '& .MuiListItemIcon-root': {
              color: 'white',
            },
            '& .MuiBadge-badge': {
              backgroundColor: 'white',
              color: 'primary.main',
            },
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: open ? 2 : 'auto',
            justifyContent: 'center',
            color: active ? 'white' : 'inherit',
          }}
        >
          {item.badge ? (
            <Badge badgeContent={item.badge.count} color={item.badge.color}>
              {item.icon}
            </Badge>
          ) : (
            item.icon
          )}
        </ListItemIcon>
        {open && (
          <ListItemText 
            primary={item.text} 
            sx={{ 
              opacity: open ? 1 : 0,
              '& .MuiTypography-root': {
                fontWeight: active ? 600 : 400,
              }
            }} 
          />
        )}
      </ListItemButton>
    );

    if (showTooltip && !open) {
      return (
        <Tooltip title={item.text} placement="right" key={index}>
          {content}
        </Tooltip>
      );
    }

    return content;
  };

  // Render a section with optional expand/collapse
  const renderSection = (title, items, sectionKey) => {
    if (!items || items.length === 0) return null;

    const isExpanded = expandedMenus[sectionKey];

    return (
      <Box key={sectionKey} sx={{ mb: 2 }}>
        {open && (
          <ListItemButton onClick={() => handleMenuExpand(sectionKey)} sx={{ py: 0.5 }}>
            <ListItemText 
              primary={title} 
              primaryTypographyProps={{ 
                variant: 'caption', 
                color: 'textSecondary',
                sx: { fontWeight: 600, letterSpacing: 1 }
              }} 
            />
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        )}
        
        <Collapse in={open ? isExpanded : true} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {items.map((item, index) => 
              renderMenuItem(item, `${sectionKey}-${index}`, true)
            )}
          </List>
        </Collapse>
      </Box>
    );
  };

  return (
    <Drawer
      variant={window.innerWidth < 600 ? 'temporary' : 'permanent'}
      open={window.innerWidth < 600 ? mobileOpen : true}
      onClose={handleDrawerToggle}
      sx={{
        width: open ? drawerWidth : collapsedDrawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : collapsedDrawerWidth,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          overflowX: 'hidden',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {/* Sidebar Header with Logo and Toggle */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        p: open ? 2 : 1,
        minHeight: 64
      }}>
        {open ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <RecyclingIcon sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                SmartWaste
              </Typography>
            </Box>
            <IconButton onClick={toggleDrawer} size="small">
              <ChevronLeftIcon />
            </IconButton>
          </>
        ) : (
          <IconButton onClick={toggleDrawer} sx={{ mx: 'auto' }}>
            <ChevronRightIcon />
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* User Info - Only show when expanded */}
      {open && (
        <Box 
          sx={{ 
            p: 2, 
            textAlign: 'center',
            background: `linear-gradient(45deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}10)`,
            m: 1,
            borderRadius: 2
          }}
        >
          <Avatar
            sx={{
              width: 70,
              height: 70,
              margin: '0 auto 10px',
              bgcolor: 'primary.main',
              fontSize: '2rem',
              border: `3px solid ${theme.palette.primary.main}`,
              boxShadow: theme.shadows[3]
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{user?.name}</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
            {user?.role}
          </Typography>
          <Chip 
            label={user?.email} 
            size="small" 
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        </Box>
      )}

      {/* Collapsed User Avatar */}
      {!open && (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Tooltip title={user?.name} placement="right">
            <Avatar
              sx={{
                width: 45,
                height: 45,
                margin: '0 auto',
                bgcolor: 'primary.main',
                fontSize: '1.2rem',
                cursor: 'pointer',
                border: `2px solid ${theme.palette.primary.main}`,
              }}
              onClick={() => navigate('/profile')}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </Tooltip>
        </Box>
      )}

      <Divider />

      {/* Navigation Menu */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        overflowX: 'hidden',
        '&::-webkit-scrollbar': {
          width: '5px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.primary.light,
          borderRadius: '10px',
        },
      }}>
        {/* Main Items */}
        <List sx={{ pt: 1 }}>
          {menuItems.main.map((item, index) => 
            renderMenuItem(item, `main-${index}`, true)
          )}
        </List>

        <Divider sx={{ my: 1 }} />

        {/* Role-specific Items with Expand/Collapse */}
        {renderSection('QUICK ACTIONS', menuItems.role, 'role')}

        {/* Profile & Settings */}
        {renderSection('ACCOUNT', menuItems.profile, 'profile')}

        {/* Help & Support */}
        {renderSection('SUPPORT', menuItems.help, 'help')}
      </Box>

      <Divider />

      {/* Logout Button - Always visible */}
      <List sx={{ p: 1 }}>
        <Tooltip title="Logout" placement="right" disableHoverListener={open}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                borderRadius: 1,
                color: 'error.main',
                '&:hover': {
                  backgroundColor: 'error.light',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                  color: 'error.main',
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              {open && <ListItemText primary="Logout" />}
            </ListItemButton>
          </ListItem>
        </Tooltip>
      </List>

      {/* Version Info - Optional */}
      {open && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="textSecondary">
            v1.0.0
          </Typography>
        </Box>
      )}
    </Drawer>
  );
};

export default Sidebar;