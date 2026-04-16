// Layout.js - Fixed version
import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header stays on top */}
      <Header onMenuClick={handleMenuClick} />
      
      {/* Sidebar slides over content */}
      <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />
      
      {/* Main content area with padding for header */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: '64px', // Height of AppBar
          p: { xs: 2, sm: 3 },
          backgroundColor: '#F8FAFC',
          minHeight: 'calc(100vh - 64px)',
          width: '100%',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;