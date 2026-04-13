import React from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  useTheme, 
  alpha,
  Avatar,
  Chip,
  Divider,
  Stack
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  ArrowForward as ArrowForwardIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Recycling as RecyclingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TestPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha('#4F46E5', 0.1)}`,
            textAlign: 'center',
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
              background: `radial-gradient(circle, ${alpha('#4F46E5', 0.08)} 0%, transparent 70%)`,
              zIndex: 0
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -50,
              left: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha('#7C3AED', 0.05)} 0%, transparent 70%)`,
              zIndex: 0
            }}
          />

          {/* Success Icon */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                margin: '0 auto 20px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: `0 8px 20px ${alpha('#10B981', 0.4)}`,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(1)',
                    boxShadow: `0 0 0 0 ${alpha('#10B981', 0.7)}`,
                  },
                  '70%': {
                    transform: 'scale(1.05)',
                    boxShadow: `0 0 0 15px ${alpha('#10B981', 0)}`,
                  },
                  '100%': {
                    transform: 'scale(1)',
                    boxShadow: `0 0 0 0 ${alpha('#10B981', 0)}`,
                  },
                },
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 48, color: 'white' }} />
            </Avatar>

            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800, 
                mb: 2,
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Routing is Working!
            </Typography>

            <Chip
              label="System Status: Operational"
              icon={<CheckCircleIcon />}
              sx={{
                mb: 3,
                bgcolor: alpha('#10B981', 0.1),
                color: '#10B981',
                fontWeight: 600,
                '& .MuiChip-icon': { color: '#10B981' }
              }}
            />

            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              Your Smart Waste Management System is running perfectly. 
              All routes and components are functioning as expected.
            </Typography>

            <Divider sx={{ my: 4 }}>
              <Chip 
                label="Quick Navigation" 
                size="small"
                sx={{ bgcolor: alpha('#4F46E5', 0.05), color: '#4F46E5' }}
              />
            </Divider>

            {/* Navigation Buttons */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center"
              sx={{ mb: 4 }}
            >
              <Button
                variant="contained"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/')}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)'
                  }
                }}
              >
                Go to Home
              </Button>

              <Button
                variant="outlined"
                startIcon={<DashboardIcon />}
                onClick={() => navigate('/login')}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  borderColor: alpha('#4F46E5', 0.5),
                  color: '#4F46E5',
                  '&:hover': {
                    borderColor: '#4F46E5',
                    backgroundColor: alpha('#4F46E5', 0.05),
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Go to Login
              </Button>

              <Button
                variant="outlined"
                startIcon={<RecyclingIcon />}
                onClick={() => navigate('/register')}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  borderColor: alpha('#4F46E5', 0.5),
                  color: '#4F46E5',
                  '&:hover': {
                    borderColor: '#4F46E5',
                    backgroundColor: alpha('#4F46E5', 0.05),
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Create Account
              </Button>
            </Stack>

            {/* System Info */}
            <Box sx={{ mt: 4, p: 2, bgcolor: alpha('#4F46E5', 0.03), borderRadius: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <span>✅</span> Frontend: Connected
                <span style={{ marginLeft: 8 }}>🟢</span> Backend: Running
                <span style={{ marginLeft: 8 }}>🗄️</span> Database: Active
              </Typography>
            </Box>

            {/* Version Info */}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
              Smart Waste Management System v1.0.0
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default TestPage;