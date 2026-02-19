import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
  Chip,
  CircularProgress,
  useTheme,
  Fade,
  Grow,
  Zoom,
  MobileStepper,
  Avatar,
  Grid  // Add this missing import
} from '@mui/material';
import {
  PhotoCamera,
  CheckCircle,
  NavigateNext,
  NavigateBefore,
  LocationOn,
  LocationOff,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  Send as SendIcon,
  RestartAlt as RestartAltIcon
  // Remove CloudUploadIcon if not used, or uncomment if needed
  // CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { aiService } from '../../services/aiService';
import { useGeolocation } from '../../hooks/useGeolocation';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, showError, showLoading, dismissToast, showPromiseToast } from '../../utils/toast';

// ... rest of your code remains the same

const steps = ['Capture Photo', 'Select Category', 'Add Details', 'Submit'];

// Animation variants
const stepVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

const ReportIssue = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { location: userLocation, error: locationError, loading: locationLoading } = useGeolocation();
  const webcamRef = useRef(null);
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [locationTimeout, setLocationTimeout] = useState(false);
  const [formData, setFormData] = useState({
    image: null,
    imagePreview: null,
    category: '',
    aiSuggestion: null,
    title: '',
    description: '',
    isAnonymous: false
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [categories] = useState([
    { id: 'overflow', label: 'Overflowing Bin', icon: '🗑️', color: '#f44336' },
    { id: 'damaged', label: 'Bin Damaged', icon: '🔨', color: '#ff9800' },
    { id: 'missed', label: 'Missed Collection', icon: '🚛', color: '#2196f3' },
    { id: 'dumping', label: 'Illegal Dumping', icon: '🚫', color: '#9c27b0' },
    { id: 'fire', label: 'Fire Hazard', icon: '🔥', color: '#f44336' },
    { id: 'drain', label: 'Blocked Drain', icon: '💧', color: '#00bcd4' },
    { id: 'animal', label: 'Dead Animal', icon: '🐾', color: '#795548' },
    { id: 'toilet', label: 'Public Toilet Issue', icon: '🚻', color: '#4caf50' }
  ]);

  // Set a timeout for location loading
  useEffect(() => {
    if (locationLoading) {
      const timer = setTimeout(() => {
        setLocationTimeout(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [locationLoading]);

  // Step 1: Capture Photo
  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFormData({
      ...formData,
      image: imageSrc,
      imagePreview: imageSrc
    });
    
    // Auto-suggest category using AI
    suggestCategory(imageSrc);
    showSuccess('Photo captured successfully!');
  };

  const suggestCategory = async (image) => {
    const toastId = showLoading('AI is analyzing your image...');
    setLoading(true);
    
    try {
      const response = await aiService.suggestCategory(image);
      dismissToast(toastId);
      
      if (response.success) {
        setFormData({
          ...formData,
          aiSuggestion: response.data,
          category: response.data.category
        });
        
        showSuccess(`AI suggests: ${response.data.category} (${response.data.confidence}% confidence)`);
      }
    } catch (error) {
      dismissToast(toastId);
      showError('AI suggestion failed. Please select category manually.');
      console.error('AI suggestion failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Select Category
  const handleCategorySelect = (category) => {
    setFormData({
      ...formData,
      category
    });
    setFieldErrors({ ...fieldErrors, category: '' });
  };

  // Step 3: Add Details
  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }
  };

  // Validate step before proceeding
  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1 && !formData.category) {
      errors.category = 'Please select a category';
    }
    
    if (step === 2) {
      if (!formData.title.trim()) {
        errors.title = 'Title is required';
      } else if (formData.title.length < 5) {
        errors.title = 'Title must be at least 5 characters';
      }
      
      if (!formData.description.trim()) {
        errors.description = 'Description is required';
      } else if (formData.description.length < 10) {
        errors.description = 'Description must be at least 10 characters';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 4: Submit
  const handleSubmit = async () => {
    if (!validateStep(2)) {
      setActiveStep(2);
      showError('Please fix the errors before submitting');
      return;
    }

    const reportData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: userLocation ? {
        type: 'Point',
        coordinates: [userLocation.lng, userLocation.lat],
        address: 'User provided location'
      } : null,
      isAnonymous: formData.isAnonymous,
      media: formData.image ? { images: [{ url: formData.image, uploadedAt: new Date() }] } : undefined
    };
    
    const promise = reportService.createReport(reportData);
    
    showPromiseToast(promise, {
      loading: 'Submitting your report... 📤',
      success: (response) => {
        if (userLocation) {
          return `Report submitted successfully! You earned 10 points! 🎉`;
        } else {
          return `Report submitted successfully! (Location not available)`;
        }
      },
      error: (err) => err.response?.data?.message || 'Failed to submit report'
    });

    try {
      const response = await promise;
      if (response.success) {
        // Reset form
        setFormData({
          image: null,
          imagePreview: null,
          category: '',
          aiSuggestion: null,
          title: '',
          description: '',
          isAnonymous: false
        });
        setActiveStep(0);
        
        // Option to view reports or close
        setTimeout(() => {
          navigate('/citizen/my-reports');
        }, 2000);
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const resetForm = () => {
    setFormData({
      image: null,
      imagePreview: null,
      category: '',
      aiSuggestion: null,
      title: '',
      description: '',
      isAnonymous: false
    });
    setActiveStep(0);
    setFieldErrors({});
    showSuccess('Form reset successfully');
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <motion.div
            key="step1"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={stepVariants}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ textAlign: 'center' }}>
              {!formData.imagePreview ? (
                <Fade in timeout={500}>
                  <Box>
                    <Paper 
                      elevation={3} 
                      sx={{ 
                        p: 2, 
                        mb: 2,
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: `2px solid ${theme.palette.primary.main}20`
                      }}
                    >
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        width="100%"
                        videoConstraints={{
                          facingMode: 'environment'
                        }}
                      />
                    </Paper>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PhotoCamera />}
                      onClick={capturePhoto}
                      disabled={loading}
                      sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: 3,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Capture Photo'}
                    </Button>
                  </Box>
                </Fade>
              ) : (
                <Zoom in timeout={500}>
                  <Box>
                    <Paper 
                      elevation={3} 
                      sx={{ 
                        p: 2, 
                        mb: 2,
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}
                    >
                      <img 
                        src={formData.imagePreview} 
                        alt="Captured" 
                        style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }}
                      />
                    </Paper>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                      <Button
                        variant="outlined"
                        startIcon={<RestartAltIcon />}
                        onClick={() => setFormData({ ...formData, image: null, imagePreview: null })}
                        size="large"
                      >
                        Retake
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<CheckCircle />}
                        onClick={handleNext}
                        size="large"
                      >
                        Use This Photo
                      </Button>
                    </Box>
                  </Box>
                </Zoom>
              )}
            </Box>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="step2"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={stepVariants}
            transition={{ duration: 0.3 }}
          >
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon color="primary" />
                Select Issue Category
              </Typography>
              
              {formData.aiSuggestion && (
                <Grow in timeout={500}>
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      '& .MuiAlert-icon': { alignItems: 'center' }
                    }}
                    icon={<Avatar sx={{ bgcolor: 'info.main', width: 24, height: 24 }}>🤖</Avatar>}
                  >
                    <strong>AI suggests:</strong> {formData.aiSuggestion.category} 
                    <Chip 
                      label={`${formData.aiSuggestion.confidence}% confidence`} 
                      size="small" 
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  </Alert>
                </Grow>
              )}
              
              {fieldErrors.category && (
                <Alert severity="error" sx={{ mb: 2 }}>{fieldErrors.category}</Alert>
              )}
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {categories.map((cat) => (
                  <motion.div
                    key={cat.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Chip
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </Box>
                      }
                      onClick={() => handleCategorySelect(cat.label)}
                      color={formData.category === cat.label ? 'primary' : 'default'}
                      variant={formData.category === cat.label ? 'filled' : 'outlined'}
                      sx={{
                        p: 2,
                        fontSize: '1rem',
                        borderColor: formData.category === cat.label ? 'primary.main' : cat.color,
                        color: formData.category === cat.label ? 'white' : cat.color,
                        bgcolor: formData.category === cat.label ? `${cat.color} !important` : 'transparent',
                        '&:hover': {
                          bgcolor: formData.category === cat.label ? cat.color : `${cat.color}20`,
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </Box>
            </Box>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step3"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={stepVariants}
            transition={{ duration: 0.3 }}
          >
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon color="primary" />
                Add Details
              </Typography>
              
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleDetailsChange}
                margin="normal"
                required
                error={!!fieldErrors.title}
                helperText={fieldErrors.title}
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
              
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleDetailsChange}
                margin="normal"
                multiline
                rows={4}
                required
                error={!!fieldErrors.description}
                helperText={fieldErrors.description}
                placeholder="Please provide details about the issue... (minimum 10 characters)"
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                    color="primary"
                  />
                }
                label="Report anonymously"
                sx={{ mt: 1 }}
              />
              
              {/* Location status */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom color="textSecondary">
                  Location Status:
                </Typography>
                
                <AnimatePresence mode="wait">
                  {locationLoading && !locationTimeout && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <Alert 
                        severity="info" 
                        icon={<CircularProgress size={20} />}
                        sx={{ borderRadius: 2 }}
                      >
                        Getting your location... (This may take a few seconds)
                      </Alert>
                    </motion.div>
                  )}
                  
                  {locationLoading && locationTimeout && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <Alert 
                        severity="warning" 
                        icon={<LocationOff />}
                        sx={{ borderRadius: 2 }}
                      >
                        Location is taking longer than expected. You can continue without precise location.
                      </Alert>
                    </motion.div>
                  )}
                  
                  {locationError && !locationLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <Alert 
                        severity="warning" 
                        icon={<LocationOff />} 
                        sx={{ borderRadius: 2 }}
                      >
                        {locationError}
                        <br />
                        <small>Your report will still be submitted without precise location.</small>
                      </Alert>
                    </motion.div>
                  )}
                  
                  {userLocation && !locationLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <Alert 
                        severity="success" 
                        icon={<LocationOn />}
                        sx={{ borderRadius: 2 }}
                      >
                        ✓ Location captured: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            </Box>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step4"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={stepVariants}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Zoom in timeout={500}>
                <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              </Zoom>
              
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Review Your Report
              </Typography>
              
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  textAlign: 'left', 
                  bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900',
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Category
                    </Typography>
                    <Chip 
                      label={formData.category} 
                      color="primary"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Reporting as
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {formData.isAnonymous ? 'Anonymous' : 'Registered User'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Title
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {formData.title}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {formData.description}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Location
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {userLocation ? (
                        <>
                          <LocationOn color="success" />
                          <Typography variant="body2">
                            Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}
                          </Typography>
                        </>
                      ) : (
                        <>
                          <LocationOff color="warning" />
                          <Typography variant="body2" color="textSecondary">
                            Location not available
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
              
              {!userLocation && !locationLoading && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Your report will be submitted without precise location. You can add location details in the description.
                </Alert>
              )}
            </Box>
          </motion.div>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Fade in timeout={1000}>
        <Paper 
          elevation={3}
          sx={{ 
            p: 4,
            borderRadius: 4,
            background: theme.palette.mode === 'light' 
              ? 'rgba(255, 255, 255, 0.9)'
              : 'rgba(30, 30, 30, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Report an Issue
            </Typography>
            {activeStep > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<RestartAltIcon />}
                onClick={resetForm}
                size="small"
              >
                Reset
              </Button>
            )}
          </Box>
          
          <Typography variant="body2" color="textSecondary" sx={{ mb: 4, textAlign: 'center' }}>
            Follow the 4-step process to report your concern
          </Typography>

          <Stepper 
            activeStep={activeStep} 
            alternativeLabel
            sx={{ 
              mb: 4,
              '& .MuiStepLabel-root .Mui-completed': {
                color: 'success.main',
              }
            }}
          >
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ minHeight: 400 }}>
            <AnimatePresence mode="wait">
              {getStepContent(activeStep)}
            </AnimatePresence>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<NavigateBefore />}
              variant="outlined"
              size="large"
            >
              Back
            </Button>
            
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                  size="large"
                  sx={{
                    px: 4,
                    background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.primary.main} 90%)`,
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Report'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={
                    (activeStep === 0 && !formData.image) ||
                    (activeStep === 1 && !formData.category) ||
                    loading
                  }
                  endIcon={<NavigateNext />}
                  size="large"
                  sx={{ px: 4 }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>

          {/* Step indicator */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary">
              Step {activeStep + 1} of {steps.length}
            </Typography>
            <MobileStepper
              variant="progress"
              steps={steps.length}
              position="static"
              activeStep={activeStep}
              sx={{ 
                maxWidth: 400, 
                mx: 'auto', 
                mt: 1,
                bgcolor: 'transparent'
              }}
              nextButton={<Box />}
              backButton={<Box />}
            />
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
};

export default ReportIssue;