import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  MenuItem,
  InputAdornment,
  IconButton,
  CircularProgress,
  Fade,
  useTheme,
  alpha,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Visibility,
  VisibilityOff,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Recycling as RecyclingIcon,
  EmojiEvents as EmojiEventsIcon,
  Badge as BadgeIcon,
  DirectionsCar as CarIcon,
  LocationCity as CityIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { showSuccess, showError, showLoading, dismissToast } from '../../utils/toast';

const steps = ['Account Details', 'Personal Info', 'Driver Info', 'Review'];

const Register = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Citizen',
    address: '',
    contact_no: '',
    // Driver specific fields
    employeeId: '',
    licenseNumber: '',
    vehicleType: 'Truck',
    vehicleNumber: '',
    assignedZone: '',
    shift: 'Morning'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      if (!formData.name) newErrors.name = 'Full name is required';
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
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (step === 1) {
      if (formData.contact_no && !/^[0-9]{10}$/.test(formData.contact_no)) {
        newErrors.contact_no = 'Please enter a valid 10-digit phone number';
      }
    }

    if (step === 2 && formData.role === 'Driver') {
      if (!formData.employeeId) newErrors.employeeId = 'Employee ID is required';
      if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
      if (!formData.vehicleNumber) newErrors.vehicleNumber = 'Vehicle number is required';
      if (!formData.assignedZone) newErrors.assignedZone = 'Assigned zone is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;
    
    setLoading(true);
    const toastId = showLoading('Creating your account...');

    try {
      const { confirmPassword, ...userData } = formData;
      const response = await register(userData);
      dismissToast(toastId);
      
      if (response.success) {
        showSuccess('Account created successfully! 🎉 Welcome aboard!');
        setTimeout(() => {
          navigate(response.redirect);
        }, 1500);
      } else {
        showError(response.message || 'Registration failed');
      }
    } catch (err) {
      dismissToast(toastId);
      showError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
              error={!!errors.name}
              helperText={errors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color={errors.name ? 'error' : 'action'} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
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
              helperText={errors.password || "Minimum 6 characters"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color={errors.password ? 'error' : 'action'} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color={errors.confirmPassword ? 'error' : 'action'} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TextField
              fullWidth
              label="Phone Number (Optional)"
              name="contact_no"
              value={formData.contact_no}
              onChange={handleChange}
              margin="normal"
              error={!!errors.contact_no}
              helperText={errors.contact_no || "10-digit mobile number"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />

            <TextField
              fullWidth
              label="Address (Optional)"
              name="address"
              value={formData.address}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
              placeholder="Street, City, State, ZIP Code"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeIcon color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />

            <TextField
              fullWidth
              select
              label="Register as"
              name="role"
              value={formData.role}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            >
              <MenuItem value="Citizen">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" />
                  <span>Citizen - Report issues and earn rewards</span>
                </Box>
              </MenuItem>
              <MenuItem value="Driver">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CarIcon fontSize="small" />
                  <span>Driver - Manage waste collection</span>
                </Box>
              </MenuItem>
            </TextField>

            {/* Role Benefits */}
            <Box sx={{ mt: 3, p: 2, bgcolor: alpha('#4F46E5', 0.05), borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ color: '#4F46E5', fontWeight: 600 }}>
                {formData.role === 'Citizen' ? '🎯 Citizen Benefits:' : '🚛 Driver Benefits:'}
              </Typography>
              {formData.role === 'Citizen' ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip icon={<CheckCircleIcon />} label="Report Issues" size="small" />
                  <Chip icon={<EmojiEventsIcon />} label="Earn Rewards" size="small" />
                  <Chip icon={<RecyclingIcon />} label="Track Progress" size="small" />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip icon={<CheckCircleIcon />} label="Route Management" size="small" />
                  <Chip icon={<EmojiEventsIcon />} label="Performance Bonus" size="small" />
                  <Chip icon={<CarIcon />} label="Vehicle Assignment" size="small" />
                  <Chip icon={<TimeIcon />} label="Shift Tracking" size="small" />
                </Box>
              )}
            </Box>
          </motion.div>
        );

      case 2:
        if (formData.role === 'Driver') {
          return (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: '#4F46E5', mb: 2 }}>
                Driver Information
              </Typography>
              
              <TextField
                fullWidth
                label="Employee ID"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                margin="normal"
                required
                error={!!errors.employeeId}
                helperText={errors.employeeId}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />

              <TextField
                fullWidth
                label="Driving License Number"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                margin="normal"
                required
                error={!!errors.licenseNumber}
                helperText={errors.licenseNumber}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />

              <TextField
                fullWidth
                select
                label="Vehicle Type"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                margin="normal"
              >
                <MenuItem value="Truck">Truck</MenuItem>
                <MenuItem value="Compactor">Compactor</MenuItem>
                <MenuItem value="Dumper">Dumper</MenuItem>
                <MenuItem value="Loader">Loader</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Vehicle Number"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                margin="normal"
                required
                error={!!errors.vehicleNumber}
                helperText={errors.vehicleNumber}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CarIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />

              <TextField
                fullWidth
                label="Assigned Zone"
                name="assignedZone"
                value={formData.assignedZone}
                onChange={handleChange}
                margin="normal"
                required
                error={!!errors.assignedZone}
                helperText={errors.assignedZone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CityIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />

              <TextField
                fullWidth
                select
                label="Shift"
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                margin="normal"
              >
                <MenuItem value="Morning">Morning (9:00 AM - 5:00 PM)</MenuItem>
                <MenuItem value="Evening">Evening (2:00 PM - 10:00 PM)</MenuItem>
                <MenuItem value="Night">Night (10:00 PM - 6:00 AM)</MenuItem>
              </TextField>
            </motion.div>
          );
        } else {
          // Citizen doesn't have step 2, so show review directly
          setActiveStep(3);
          return null;
        }

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 60, color: '#10B981', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Review Your Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please review your details before submitting
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: alpha('#4F46E5', 0.03),
                borderRadius: 3,
                border: `1px solid ${alpha('#4F46E5', 0.1)}`
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{formData.name || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{formData.email || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{formData.contact_no || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Role</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{formData.role}</Typography>
                </Grid>
                {formData.role === 'Driver' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Employee ID</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{formData.employeeId || '—'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">License Number</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{formData.licenseNumber || '—'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Vehicle Type</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{formData.vehicleType}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Vehicle Number</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{formData.vehicleNumber || '—'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Assigned Zone</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{formData.assignedZone || '—'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Shift</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{formData.shift}</Typography>
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Address</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{formData.address || '—'}</Typography>
                </Grid>
              </Grid>
            </Paper>

            <Box sx={{ mt: 3, p: 2, bgcolor: alpha('#10B981', 0.1), borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: '#10B981', textAlign: 'center' }}>
                ✨ By creating an account, you agree to our Terms of Service and Privacy Policy
              </Typography>
            </Box>
          </motion.div>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md">
      <Fade in timeout={1000}>
        <Box sx={{ mt: 4, mb: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={3}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: 4,
                background: theme.palette.mode === 'light'
                  ? alpha(theme.palette.background.paper, 0.95)
                  : alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha('#4F46E5', 0.1)}`,
              }}
            >
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: alpha('#4F46E5', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <RecyclingIcon sx={{ fontSize: 32, color: '#4F46E5' }} />
                </Box>
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
                  Create Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Join Smart Waste Management System and make a difference
                </Typography>
              </Box>

              {/* Stepper */}
              <Stepper
                activeStep={activeStep}
                alternativeLabel
                sx={{
                  mb: 4,
                  '& .MuiStepLabel-root .Mui-completed': {
                    color: '#10B981',
                  },
                  '& .MuiStepLabel-root .Mui-active': {
                    color: '#4F46E5',
                  },
                }}
              >
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Error Alert */}
              {Object.keys(errors).length > 0 && activeStep < 3 && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  Please fix the errors before continuing
                </Alert>
              )}

              {/* Step Content */}
              <Box sx={{ minHeight: 400 }}>
                {getStepContent(activeStep)}
              </Box>

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  startIcon={<ArrowBackIcon />}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    borderColor: alpha('#4F46E5', 0.5),
                    '&:hover': {
                      borderColor: '#4F46E5',
                      backgroundColor: alpha('#4F46E5', 0.05)
                    }
                  }}
                >
                  Back
                </Button>

                {activeStep === (formData.role === 'Driver' ? steps.length - 1 : 2) ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    endIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
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
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForwardIcon />}
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
                    Next
                  </Button>
                )}
              </Box>

              <Divider sx={{ my: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Already have an account?
                </Typography>
              </Divider>

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    borderColor: alpha('#4F46E5', 0.5),
                    '&:hover': {
                      borderColor: '#4F46E5',
                      backgroundColor: alpha('#4F46E5', 0.05)
                    }
                  }}
                >
                  Sign In
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Box>
      </Fade>
    </Container>
  );
};

export default Register;