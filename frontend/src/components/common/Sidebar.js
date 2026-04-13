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
  Chip,
  alpha
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
  Home as HomeIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;
const collapsedDrawerWidth = 80;

const Sidebar = ({ open, toggleDrawer, mobileOpen, handleDrawerToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [expandedMenus, setExpandedMenus] = useState({});
  const [unreadCount] = useState(3);

  useEffect(() => {
    if (!open) {
      setExpandedMenus({});
    }
  }, [open]);

  const handleMenuExpand = (menu) => {
    if (!open) return;
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

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getMenuItems = () => {
    const mainItems = [
      { text: 'Home', icon: <HomeIcon />, path: '/', showInCollapsed: true },
      { text: 'Dashboard', icon: <DashboardIcon />, path: `/${user?.role?.toLowerCase()}`, showInCollapsed: true },
    ];

    const citizenItems = [
      { text: 'Report Issue', icon: <ReportIcon />, path: '/citizen/report' },
      { text: 'My Reports', icon: <InfoIcon />, path: '/citizen/my-reports' },
      { text: 'Recycling Guide', icon: <RecyclingIcon />, path: '/citizen/recycling-guide' },
      { text: 'Rewards', icon: <EmojiEventsIcon />, path: '/citizen/rewards', badge: { count: 2, color: 'warning' } },
      { text: 'Nearby Bins', icon: <LocationOnIcon />, path: '/citizen/nearby' },
      { text: 'Public Toilets', icon: <WcIcon />, path: '/citizen/toilets' },
      { text: 'Scan QR', icon: <QrCodeScannerIcon />, path: '/citizen/scan' },
    ];

    const adminItems = [
      { text: 'Bin Management', icon: <DeleteIcon />, path: '/admin/bins', badge: { count: 5, color: 'error' } },
      { text: 'Recycling Centers', icon: <RecyclingIcon />, path: '/admin/centers' },
      { text: 'Reports', icon: <ReportIcon />, path: '/admin/reports', badge: { count: 12, color: 'warning' } },
      { text: 'Analytics', icon: <BarChartIcon />, path: '/admin/analytics' },
      { text: 'Route Optimization', icon: <RouteIcon />, path: '/admin/routes' },
      { text: 'Staff Management', icon: <PeopleIcon />, path: '/admin/staff' },
      { text: 'Audit Logs', icon: <AssessmentIcon />, path: '/admin/audit' },
    ];

    const driverItems = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/driver' },
      { text: 'My Routes', icon: <RouteIcon />, path: '/driver/routes', badge: { count: 3, color: 'info' } },
      { text: 'Collection Proof', icon: <InventoryIcon />, path: '/driver/collection' },
      { text: 'Attendance', icon: <PeopleIcon />, path: '/driver/attendance' },
      { text: 'Earnings', icon: <AttachMoneyIcon />, path: '/driver/earnings' },
      { text: 'Performance', icon: <AssessmentIcon />, path: '/driver/performance' },
    ];

    const commonItems = [
      { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications', badge: { count: unreadCount, color: 'error' }, showInCollapsed: true },
      { text: 'Settings', icon: <SettingsIcon />, path: '/settings', showInCollapsed: true },
      { text: 'Help & Support', icon: <HelpIcon />, path: '/help', showInCollapsed: true },
      { text: 'Profile', icon: <PersonIcon />, path: '/profile', showInCollapsed: true },
      { text: 'Send Feedback', icon: <FeedbackIcon />, path: '/feedback', showInCollapsed: true },
    ];

    let roleSpecificItems = [];
    switch (user?.role) {
      case 'Admin':
        roleSpecificItems = adminItems;
        break;
      case 'Driver':
        roleSpecificItems = driverItems;
        break;
      default:
        roleSpecificItems = citizenItems;
        break;
    }

    return { 
      main: mainItems, 
      role: roleSpecificItems, 
      common: commonItems 
    };
  };

  const menuItems = getMenuItems();

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
          borderRadius: 2,
          mb: 0.5,
          transition: 'all 0.2s',
          '&.Mui-selected': {
            backgroundColor: alpha('#4F46E5', 0.12),
            color: '#4F46E5',
            '&:hover': {
              backgroundColor: alpha('#4F46E5', 0.18),
            },
            '& .MuiListItemIcon-root': {
              color: '#4F46E5',
            },
          },
          '&:hover': {
            backgroundColor: alpha('#4F46E5', 0.06),
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: open ? 2 : 'auto',
            justifyContent: 'center',
            color: active ? '#4F46E5' : '#64748B',
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
              '& .MuiTypography-root': {
                fontWeight: active ? 600 : 400,
                color: active ? '#4F46E5' : '#334155',
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

  const renderSection = (title, items, sectionKey) => {
    if (!items || items.length === 0) return null;
    const isExpanded = expandedMenus[sectionKey];

    return (
      <Box key={sectionKey} sx={{ mb: 2 }}>
        {open && (
          <ListItemButton onClick={() => handleMenuExpand(sectionKey)} sx={{ py: 0.5, px: 2 }}>
            <ListItemText 
              primary={title} 
              primaryTypographyProps={{ 
                variant: 'caption', 
                sx: { fontWeight: 600, letterSpacing: 1, color: '#94A3B8' }
              }} 
            />
            {isExpanded ? <ExpandLess sx={{ fontSize: 18, color: '#94A3B8' }} /> : <ExpandMore sx={{ fontSize: 18, color: '#94A3B8' }} />}
          </ListItemButton>
        )}
        <Collapse in={open ? isExpanded : true} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {items.map((item, index) => renderMenuItem(item, `${sectionKey}-${index}`, true))}
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
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          overflowX: 'hidden',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {/* Sidebar Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        p: open ? 2 : 1.5,
        minHeight: 64,
        borderBottom: '1px solid #E2E8F0'
      }}>
        {open ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <RecyclingIcon sx={{ color: '#4F46E5', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>
                SmartWaste
              </Typography>
            </Box>
            <IconButton onClick={toggleDrawer} size="small" sx={{ color: '#94A3B8' }}>
              <ChevronLeftIcon />
            </IconButton>
          </>
        ) : (
          <IconButton onClick={toggleDrawer} sx={{ mx: 'auto', color: '#94A3B8' }}>
            <ChevronRightIcon />
          </IconButton>
        )}
      </Box>

      {/* User Info */}
      {open && (
        <Box 
          sx={{ 
            p: 2.5, 
            textAlign: 'center',
            borderBottom: '1px solid #E2E8F0',
            mb: 1
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              margin: '0 auto 12px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              fontSize: '2rem',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>{user?.name}</Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mt: 0.5 }}>
            {user?.role}
          </Typography>
          <Chip 
            label={user?.email} 
            size="small" 
            sx={{ 
              mt: 1.5,
              bgcolor: '#F1F5F9',
              color: '#475569',
              fontSize: '0.7rem',
              borderRadius: '12px'
            }}
          />
        </Box>
      )}

      {/* Collapsed User Avatar */}
      {!open && (
        <Box sx={{ textAlign: 'center', py: 2, borderBottom: '1px solid #E2E8F0', mb: 1 }}>
          <Tooltip title={user?.name} placement="right">
            <Avatar
              sx={{
                width: 45,
                height: 45,
                margin: '0 auto',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                fontSize: '1.2rem',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.05)' },
              }}
              onClick={() => navigate('/profile')}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </Tooltip>
        </Box>
      )}

      {/* Navigation Menu */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        overflowX: 'hidden',
        px: 1,
        py: 1,
        '&::-webkit-scrollbar': { width: '5px' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: '#CBD5E1', borderRadius: '10px' },
      }}>
        <List sx={{ pt: 1 }}>
          {menuItems.main.map((item, index) => renderMenuItem(item, `main-${index}`, true))}
        </List>

        <Divider sx={{ my: 1, borderColor: '#E2E8F0' }} />

        {renderSection('QUICK ACTIONS', menuItems.role, 'role')}
        
        <Divider sx={{ my: 1, borderColor: '#E2E8F0' }} />
        
        {renderSection('GENERAL', menuItems.common, 'common')}
      </Box>

      <Divider sx={{ borderColor: '#E2E8F0' }} />

      {/* Logout Button */}
      <List sx={{ p: 1 }}>
        <Tooltip title="Logout" placement="right" disableHoverListener={open}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                mx: 1,
                borderRadius: 2,
                color: '#EF4444',
                '&:hover': {
                  backgroundColor: '#FEF2F2',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                  color: '#EF4444',
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              {open && <ListItemText primary="Logout" sx={{ '& .MuiTypography-root': { color: '#EF4444' } }} />}
            </ListItemButton>
          </ListItem>
        </Tooltip>
      </List>

      {/* Version Info */}
      {open && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            v1.0.0
          </Typography>
        </Box>
      )}
    </Drawer>
  );
};

export default Sidebar;