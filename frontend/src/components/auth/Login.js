import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  Fade,
  useTheme
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { showSuccess, showError, showLoading, dismissToast } from '../../utils/toast';
import { motion } from 'framer-motion';

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    const toastId = showLoading('Logging in...');

    try {
      const response = await login(formData.email, formData.password);
      dismissToast(toastId);
      
      if (response.success) {
        showSuccess(`Welcome back, ${response.data.user.name}! 🎉`);
        console.log('✅ Login successful, user:', response.data.user);
        
        // Small delay to show success message before redirect
        setTimeout(() => {
          navigate(response.redirect);
        }, 500);
      } else {
        showError(response.message || 'Login failed');
        setLoading(false);
      }
    } catch (err) {
      dismissToast(toastId);
      showError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="sm">
      <Fade in timeout={1000}>
        <Box sx={{ mt: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4,
                borderRadius: 4,
                background: theme.palette.mode === 'light' 
                  ? 'rgba(255, 255, 255, 0.9)'
                  : 'rgba(30, 30, 30, 0.9)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${theme.palette.mode === 'light' 
                  ? 'rgba(255, 255, 255, 0.5)'
                  : 'rgba(255, 255, 255, 0.1)'}`,
              }}
            >
              {/* Logo/Icon */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    mb: 2,
                    boxShadow: `0 8px 16px ${theme.palette.primary.main}40`,
                  }}
                >
                  <LoginIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  Welcome Back!
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Login to access your dashboard
                </Typography>
              </Box>

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  required
                  autoFocus
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color={errors.email ? 'error' : 'action'} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  margin="normal"
                  required
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color={errors.password ? 'error' : 'action'} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                {/* Forgot Password Link */}
                <Box sx={{ textAlign: 'right', mb: 2 }}>
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    sx={{ 
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    mt: 2,
                    mb: 3,
                    borderRadius: 2,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Don't have an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/register"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        }
                      }}
                    >
                      Sign up here
                    </Link>
                  </Typography>

                  {/* Test Credentials Card */}
                  <Paper
                    variant="outlined"
                    sx={{
                      mt: 3,
                      p: 2,
                      bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      🔐 Test Credentials
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Admin
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          admin@test.com / 123456
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Citizen
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          citizen@test.com / 123456
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              </form>
            </Paper>
          </motion.div>
        </Box>
      </Fade>
    </Container>
  );
};

export default Login;