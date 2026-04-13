import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  IconButton,
  TextField,
  Divider,
  useTheme,
  alpha,
  Skeleton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  DirectionsCar as CarIcon,
  CalendarToday as CalendarIcon,
  Verified as VerifiedIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { driverService } from '../../services/driverService';
import { motion } from 'framer-motion';
import { showSuccess, showError, showLoading } from '../../utils/toast';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const DriverProfile = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    vehicleNumber: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await driverService.getProfile();
      setProfile(response.data);
      setFormData({
        name: response.data.user?.name || '',
        phoneNumber: response.data.user?.phoneNumber || '',
        address: response.data.user?.address || '',
        vehicleNumber: response.data.vehicleNumber || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      showError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Reset form when canceling
      setFormData({
        name: profile?.user?.name || '',
        phoneNumber: profile?.user?.phoneNumber || '',
        address: profile?.user?.address || '',
        vehicleNumber: profile?.vehicleNumber || ''
      });
    }
    setEditMode(!editMode);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const toastId = showLoading('Saving profile...');
    
    try {
      await driverService.updateProfile(formData);
      showSuccess('Profile updated successfully!');
      setEditMode(false);
      fetchProfile(); // Refresh profile data
    } catch (error) {
      showError('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Driver Profile
          </Typography>
          <Tooltip title={editMode ? "Cancel Edit" : "Edit Profile"}>
            <IconButton
              onClick={handleEditToggle}
              sx={{
                bgcolor: editMode ? alpha('#EF4444', 0.1) : alpha('#4F46E5', 0.1),
                color: editMode ? '#EF4444' : '#4F46E5',
                '&:hover': {
                  bgcolor: editMode ? alpha('#EF4444', 0.2) : alpha('#4F46E5', 0.2)
                }
              }}
            >
              {editMode ? <CancelIcon /> : <EditIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column - Profile Info */}
          <Grid item xs={12} md={4}>
            <motion.div variants={fadeInUp}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: alpha(theme.palette.background.paper, 0.95),
                  border: `1px solid ${alpha('#4F46E5', 0.1)}`
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    background: `linear-gradient(135deg, ${alpha('#4F46E5', 0.1)} 0%, ${alpha('#7C3AED', 0.05)} 100%)`
                  }}
                >
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      margin: '0 auto 16px',
                      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                      border: `4px solid ${alpha('#fff', 0.2)}`,
                      boxShadow: `0 8px 20px ${alpha('#4F46E5', 0.3)}`
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 60, color: 'white' }} />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {profile?.user?.name || 'Driver Name'}
                  </Typography>
                  <Chip
                    icon={<VerifiedIcon />}
                    label={profile?.user?.role || 'Driver'}
                    size="small"
                    sx={{
                      bgcolor: alpha('#4F46E5', 0.1),
                      color: '#4F46E5',
                      fontWeight: 600
                    }}
                  />
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      icon={<CarIcon />}
                      label={profile?.vehicleNumber || 'Not Assigned'}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: alpha('#4F46E5', 0.3) }}
                    />
                  </Box>
                </Box>

                <CardContent>
                  <Divider sx={{ my: 2 }}>
                    <Chip label="Details" size="small" />
                  </Divider>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BadgeIcon sx={{ color: '#4F46E5', fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Employee ID
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {profile?.employeeId || 'EMP001'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon sx={{ color: '#4F46E5', fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Joined Date
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'Jan 2024'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CarIcon sx={{ color: '#4F46E5', fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Vehicle Type
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {profile?.vehicleType || 'Truck'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon sx={{ color: '#4F46E5', fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Assigned Zone
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {profile?.assignedZone || 'Zone A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Right Column - Editable Information */}
          <Grid item xs={12} md={8}>
            <motion.div variants={fadeInUp}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: alpha(theme.palette.background.paper, 0.95),
                  border: `1px solid ${alpha('#4F46E5', 0.1)}`
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ color: '#4F46E5' }} />
                  Personal Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!editMode}
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={profile?.user?.email || ''}
                      disabled
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: 2, bgcolor: alpha(theme.palette.action.disabledBackground, 0.5) }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      disabled={!editMode}
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Vehicle Number"
                      name="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={handleChange}
                      disabled={!editMode}
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!editMode}
                      multiline
                      rows={3}
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                </Grid>

                {editMode && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={handleEditToggle}
                      sx={{
                        borderRadius: 2,
                        borderColor: alpha('#EF4444', 0.5),
                        color: '#EF4444',
                        '&:hover': {
                          borderColor: '#EF4444',
                          backgroundColor: alpha('#EF4444', 0.05)
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                      sx={{
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)'
                        }
                      }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                )}
              </Card>
            </motion.div>

            {/* QR Code Section */}
            <motion.div variants={fadeInUp}>
              <Card
                elevation={0}
                sx={{
                  mt: 3,
                  p: 3,
                  borderRadius: 4,
                  background: alpha(theme.palette.background.paper, 0.95),
                  border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                  <QrCodeIcon sx={{ color: '#4F46E5' }} />
                  Your Digital ID
                </Typography>
                <Box
                  sx={{
                    width: 150,
                    height: 150,
                    margin: '0 auto',
                    bgcolor: alpha('#4F46E5', 0.05),
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${alpha('#4F46E5', 0.2)}`
                  }}
                >
                  <QrCodeIcon sx={{ fontSize: 80, color: alpha('#4F46E5', 0.5) }} />
                </Box>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                  Scan to verify driver identity
                </Typography>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default DriverProfile;