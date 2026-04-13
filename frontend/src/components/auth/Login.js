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
  useTheme,
  alpha,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Recycling as RecyclingIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { showSuccess, showError, showLoading, showInfo, dismissToast } from '../../utils/toast';
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
      newErrors.email = 'Please enter a valid email address';
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
        
        // Small delay to show success message before redirect
        setTimeout(() => {
          navigate(response.redirect);
        }, 500);
      } else {
        showError(response.message || 'Invalid email or password');
        setLoading(false);
      }
    } catch (err) {
      dismissToast(toastId);
      showError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSocialLogin = (provider) => {
    showInfo(`${provider} login coming soon!`);
  };

  return (
    <Container maxWidth="sm">
      <Fade in timeout={1000}>
        <Box sx={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          py: 4
        }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%' }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 3, sm: 4 },
                borderRadius: 4,
                background: theme.palette.mode === 'light' 
                  ? alpha(theme.palette.background.paper, 0.95)
                  : alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Decorative Background Elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha('#4F46E5', 0.1)} 0%, transparent 70%)`,
                  zIndex: 0
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -50,
                  left: -50,
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha('#7C3AED', 0.1)} 0%, transparent 70%)`,
                  zIndex: 0
                }}
              />

              {/* Logo/Icon */}
              <Box sx={{ textAlign: 'center', mb: 3, position: 'relative', zIndex: 1 }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      mb: 2,
                      boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
                    }}
                  >
                    <RecyclingIcon sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                </motion.div>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  Welcome Back!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Login to access your smart waste management dashboard
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
                    sx: { borderRadius: 2 }
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
                    sx: { borderRadius: 2 }
                  }}
                  sx={{ mb: 1 }}
                />

                {/* Forgot Password Link */}
                <Box sx={{ textAlign: 'right', mb: 3 }}>
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    sx={{ 
                      color: '#4F46E5',
                      textDecoration: 'none',
                      fontWeight: 500,
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
                    mb: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)',
                      background: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Sign In'
                  )}
                </Button>

                {/* Social Login Divider */}
                <Box sx={{ position: 'relative', mb: 3 }}>
                  <Divider>
                    <Chip
                      label="OR"
                      size="small"
                      sx={{
                        bgcolor: 'transparent',
                        color: 'text.secondary',
                        fontSize: '0.75rem'
                      }}
                    />
                  </Divider>
                </Box>

                {/* Social Login Buttons */}
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    onClick={() => handleSocialLogin('Google')}
                    sx={{
                      borderRadius: 2,
                      borderColor: alpha('#4F46E5', 0.3),
                      color: 'text.primary',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#4F46E5',
                        backgroundColor: alpha('#4F46E5', 0.05)
                      }
                    }}
                  >
                    Google
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FacebookIcon />}
                    onClick={() => handleSocialLogin('Facebook')}
                    sx={{
                      borderRadius: 2,
                      borderColor: alpha('#4F46E5', 0.3),
                      color: 'text.primary',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#4F46E5',
                        backgroundColor: alpha('#4F46E5', 0.05)
                      }
                    }}
                  >
                    Facebook
                  </Button>
                </Stack>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/register"
                      sx={{
                        fontWeight: 600,
                        color: '#4F46E5',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        }
                      }}
                    >
                      Create free account
                    </Link>
                  </Typography>
                </Box>
              </form>

              {/* Test Credentials Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    mt: 3,
                    p: 2.5,
                    bgcolor: alpha('#4F46E5', 0.03),
                    borderRadius: 3,
                    border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                    <Typography variant="subtitle2" sx={{ color: '#4F46E5', fontWeight: 600 }}>
                      Demo Credentials
                    </Typography>
                  </Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Admin Account
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          admin@test.com
                        </Typography>
                        <Chip
                          label="123456"
                          size="small"
                          sx={{
                            bgcolor: alpha('#4F46E5', 0.1),
                            color: '#4F46E5',
                            fontFamily: 'monospace',
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Citizen Account
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          citizen@test.com
                        </Typography>
                        <Chip
                          label="123456"
                          size="small"
                          sx={{
                            bgcolor: alpha('#4F46E5', 0.1),
                            color: '#4F46E5',
                            fontFamily: 'monospace',
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              </motion.div>
            </Paper>
          </motion.div>
        </Box>
      </Fade>
    </Container>
  );
};

export default Login;