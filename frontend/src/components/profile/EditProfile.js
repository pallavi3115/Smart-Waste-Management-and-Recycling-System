import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as CameraIcon,
  LocationCity as CityIcon,
  Map as MapIcon,
  PinDrop as PinDropIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { motion } from 'framer-motion';
import { showSuccess, showError, showLoading, dismissToast } from '../../utils/toast';

const EditProfile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const toastId = showLoading('Updating profile...');

    try {
      const response = await userService.updateProfile(formData);
      if (response.success) {
        updateUser(response.data);
        dismissToast(toastId);
        showSuccess('Profile updated successfully! 🎉');
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }
    } catch (err) {
      dismissToast(toastId);
      setError(err.response?.data?.message || 'Failed to update profile');
      showError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarColor = () => {
    if (user?.role === 'Admin') return '#EF4444';
    if (user?.role === 'Driver') return '#F59E0B';
    return '#4F46E5';
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha('#4F46E5', 0.1)}`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative Background */}
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

          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4, position: 'relative', zIndex: 1 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                margin: '0 auto 16px',
                background: `linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)`,
                boxShadow: `0 8px 20px ${alpha('#4F46E5', 0.3)}`,
                border: `3px solid ${alpha('#fff', 0.2)}`
              }}
            >
              <PersonIcon sx={{ fontSize: 40, color: 'white' }} />
            </Avatar>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Edit Profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update your personal information and address
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Personal Information Section */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: '#4F46E5',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <PersonIcon fontSize="small" />
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2, borderColor: alpha('#4F46E5', 0.1) }} />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#4F46E5' }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: '#4F46E5' }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                  helperText="Enter a valid 10-digit mobile number"
                />
              </Grid>

              {/* Address Section */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: '#4F46E5',
                    mt: 2,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <HomeIcon fontSize="small" />
                  Address Information
                </Typography>
                <Divider sx={{ mb: 2, borderColor: alpha('#4F46E5', 0.1) }} />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MapIcon sx={{ color: '#4F46E5' }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                  placeholder="House number, street name"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CityIcon sx={{ color: '#4F46E5' }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MapIcon sx={{ color: '#4F46E5' }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PinDropIcon sx={{ color: '#4F46E5' }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'flex-end',
                    mt: 2,
                    pt: 2,
                    borderTop: `1px solid ${alpha('#4F46E5', 0.1)}`
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/profile')}
                    startIcon={<CancelIcon />}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      borderColor: alpha('#4F46E5', 0.5),
                      color: '#4F46E5',
                      '&:hover': {
                        borderColor: '#4F46E5',
                        backgroundColor: alpha('#4F46E5', 0.05)
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)'
                      }
                    }}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>

          {/* Info Note */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: alpha('#4F46E5', 0.03),
              borderRadius: 2,
              textAlign: 'center'
            }}
          >
            <Typography variant="caption" color="text.secondary">
              <strong>Note:</strong> Your email address cannot be changed. Contact support for email updates.
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default EditProfile;