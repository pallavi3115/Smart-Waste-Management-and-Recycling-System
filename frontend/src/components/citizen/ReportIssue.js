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
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  LinearProgress,
  Divider,
  alpha,
  StepConnector,
  stepConnectorClasses
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
  RestartAlt as RestartAltIcon,
  CloudUpload as CloudUploadIcon,
  Warning as WarningIcon,
  Speed as SpeedIcon,
  EmojiEvents as RewardIcon,
  Info as InfoIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { aiService } from '../../services/aiService';
import { useGeolocation } from '../../hooks/useGeolocation';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, showError, showLoading, dismissToast, showPromiseToast } from '../../utils/toast';
import CountUp from 'react-countup';

const steps = ['Capture', 'Category', 'Details', 'Submit'];

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// Custom Step Icon Component - Fixed without TypeScript
const CustomStepIconRoot = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 40,
  height: 40,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  '&.active': {
    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    boxShadow: '0 4px 10px 0 rgba(79, 70, 229, 0.25)',
  },
  '&.completed': {
    background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  },
}));

function CustomStepIcon(props) {
  const { active, completed, className, icon } = props;
  const icons = {
    1: <PhotoCamera sx={{ fontSize: 20 }} />,
    2: <CategoryIcon sx={{ fontSize: 20 }} />,
    3: <DescriptionIcon sx={{ fontSize: 20 }} />,
    4: <SendIcon sx={{ fontSize: 20 }} />,
  };

  let customClass = '';
  if (active) customClass = 'active';
  if (completed) customClass = 'completed';

  return (
    <CustomStepIconRoot className={`${className} ${customClass}`}>
      {completed ? <CheckCircle sx={{ fontSize: 20 }} /> : icons[icon]}
    </CustomStepIconRoot>
  );
}

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 20,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#e0e0e0',
    borderTopWidth: 2,
    borderRadius: 1,
  },
}));

const ReportIssue = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { location: userLocation, error: locationError, loading: locationLoading } = useGeolocation();
  const webcamRef = useRef(null);
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [locationTimeout, setLocationTimeout] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
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
  const [userStats, setUserStats] = useState({
    totalReports: 0,
    pointsEarned: 0,
    issuesResolved: 0
  });

  const categories = [
    { id: 'overflow', label: 'Overflowing Bin', icon: '🗑️', color: '#f44336', description: 'Bins that are overflowing and need immediate attention', points: 10 },
    { id: 'damaged', label: 'Bin Damaged', icon: '🔨', color: '#ff9800', description: 'Broken or damaged waste containers', points: 5 },
    { id: 'missed', label: 'Missed Collection', icon: '🚛', color: '#2196f3', description: 'Scheduled collection was missed', points: 15 },
    { id: 'dumping', label: 'Illegal Dumping', icon: '🚫', color: '#9c27b0', description: 'Unauthorized waste disposal', points: 20 },
    { id: 'fire', label: 'Fire Hazard', icon: '🔥', color: '#f44336', description: 'Fire risk from improper waste storage', points: 25 },
    { id: 'drain', label: 'Blocked Drain', icon: '💧', color: '#00bcd4', description: 'Drain blocked by waste materials', points: 10 },
    { id: 'animal', label: 'Dead Animal', icon: '🐾', color: '#795548', description: 'Dead animal requiring removal', points: 15 },
    { id: 'toilet', label: 'Toilet Issue', icon: '🚻', color: '#4caf50', description: 'Public toilet maintenance needed', points: 8 }
  ];

  // Simulate fetching user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await reportService.getUserStats();
        if (response.success) {
          setUserStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
        // Set demo stats
        setUserStats({
          totalReports: 12,
          pointsEarned: 245,
          issuesResolved: 8
        });
      }
    };
    fetchUserStats();
  }, []);

  useEffect(() => {
    if (locationLoading) {
      const timer = setTimeout(() => setLocationTimeout(true), 8000);
      return () => clearTimeout(timer);
    }
  }, [locationLoading]);

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFormData({
      ...formData,
      image: imageSrc,
      imagePreview: imageSrc
    });
    
    suggestCategory(imageSrc);
    showSuccess('📸 Photo captured successfully!');
  };

  const suggestCategory = async (image) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + 10, 90));
    }, 200);
    
    try {
      const response = await aiService.suggestCategory(image);
      clearInterval(interval);
      setAnalysisProgress(100);
      
      setTimeout(() => {
        if (response.success) {
          setFormData(prev => ({
            ...prev,
            aiSuggestion: response.data,
            category: response.data.category
          }));
          
          showSuccess(`🤖 AI Analysis Complete! Suggested: ${response.data.category} (${response.data.confidence}% confidence)`);
        }
        setIsAnalyzing(false);
      }, 500);
    } catch (error) {
      clearInterval(interval);
      setIsAnalyzing(false);
      showError('AI suggestion failed. Please select category manually.');
      console.error('AI suggestion failed:', error);
    }
  };

  const handleCategorySelect = (category) => {
    setFormData(prev => ({ ...prev, category }));
    setFieldErrors(prev => ({ ...prev, category: '' }));
  };

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

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
      } else if (formData.title.length > 100) {
        errors.title = 'Title must be less than 100 characters';
      }
      
      if (!formData.description.trim()) {
        errors.description = 'Description is required';
      } else if (formData.description.length < 10) {
        errors.description = 'Description must be at least 10 characters';
      } else if (formData.description.length > 500) {
        errors.description = 'Description must be less than 500 characters';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
        const pointsEarned = categories.find(c => c.label === formData.category)?.points || 10;
        setUserStats(prev => ({
          ...prev,
          totalReports: prev.totalReports + 1,
          pointsEarned: prev.pointsEarned + pointsEarned
        }));
        return `✅ Report submitted! You earned ${pointsEarned} points! 🎉`;
      },
      error: (err) => err.response?.data?.message || 'Failed to submit report'
    });

    try {
      const response = await promise;
      if (response.success) {
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
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
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
    showSuccess('🔄 Form reset successfully');
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <motion.div
            key="step1"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Box sx={{ textAlign: 'center' }}>
              {!formData.imagePreview ? (
                <Fade in timeout={500}>
                  <Box>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        mb: 3,
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        background: alpha(theme.palette.background.paper, 0.6)
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
                        style={{ borderRadius: 12 }}
                      />
                    </Paper>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      📸 Position the waste clearly in the camera frame
                    </Typography>
                    
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PhotoCamera />}
                      onClick={capturePhoto}
                      disabled={isAnalyzing}
                      sx={{
                        py: 1.5,
                        px: 6,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(79, 70, 229, 0.4)'
                        }
                      }}
                    >
                      Capture Photo
                    </Button>
                  </Box>
                </Fade>
              ) : (
                <Zoom in timeout={500}>
                  <Box>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        mb: 3,
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: `2px solid ${alpha('#10B981', 0.3)}`,
                        background: alpha('#10B981', 0.05)
                      }}
                    >
                      <img 
                        src={formData.imagePreview} 
                        alt="Captured" 
                        style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 8 }}
                      />
                    </Paper>
                    
                    {isAnalyzing && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="primary" gutterBottom>
                          🤖 AI Analyzing Image...
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={analysisProgress} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: alpha('#4F46E5', 0.1),
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(90deg, #4F46E5, #7C3AED)'
                            }
                          }}
                        />
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                      <Button
                        variant="outlined"
                        startIcon={<RestartAltIcon />}
                        onClick={() => setFormData(prev => ({ ...prev, image: null, imagePreview: null, aiSuggestion: null, category: '' }))}
                        size="large"
                      >
                        Retake
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<CheckCircle />}
                        onClick={handleNext}
                        size="large"
                        disabled={isAnalyzing}
                      >
                        Continue
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
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon sx={{ color: '#4F46E5' }} />
                Select Issue Category
              </Typography>
              
              {formData.aiSuggestion && (
                <Grow in timeout={500}>
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 3,
                      border: `1px solid ${alpha('#4F46E5', 0.2)}`,
                      background: alpha('#4F46E5', 0.05)
                    }}
                    icon={<Avatar sx={{ bgcolor: '#4F46E5', width: 28, height: 28 }}>🤖</Avatar>}
                  >
                    <Typography variant="subtitle2">AI Recommendation</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <strong>{formData.aiSuggestion.category}</strong>
                      <Chip 
                        label={`${formData.aiSuggestion.confidence}% confidence`} 
                        size="small" 
                        sx={{ bgcolor: '#4F46E5', color: 'white' }}
                      />
                    </Box>
                  </Alert>
                </Grow>
              )}
              
              {fieldErrors.category && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{fieldErrors.category}</Alert>
              )}
              
              <Grid container spacing={2}>
                {categories.map((cat) => (
                  <Grid item xs={12} sm={6} key={cat.id}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        elevation={0}
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 3,
                          border: `2px solid ${formData.category === cat.label ? cat.color : alpha(cat.color, 0.2)}`,
                          background: formData.category === cat.label ? alpha(cat.color, 0.1) : 'transparent',
                          transition: 'all 0.3s',
                          '&:hover': {
                            borderColor: cat.color,
                            boxShadow: `0 4px 12px ${alpha(cat.color, 0.2)}`
                          }
                        }}
                        onClick={() => handleCategorySelect(cat.label)}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography variant="h4">{cat.icon}</Typography>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {cat.label}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {cat.description}
                              </Typography>
                            </Box>
                            <Chip 
                              label={`${cat.points} pts`} 
                              size="small"
                              sx={{ 
                                bgcolor: alpha('#F59E0B', 0.1),
                                color: '#F59E0B',
                                fontWeight: 600
                              }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step3"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon sx={{ color: '#4F46E5' }} />
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
                helperText={fieldErrors.title || `${formData.title.length}/100 characters`}
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
                helperText={fieldErrors.description || `${formData.description.length}/500 characters`}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                    sx={{ color: '#4F46E5' }}
                  />
                }
                label="Report anonymously"
                sx={{ mt: 1 }}
              />
              
              <Divider sx={{ my: 3 }} />
              
              {/* Enhanced Location Status */}
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 20, color: '#4F46E5' }} />
                  Location Status
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
                        <Typography variant="body2">Getting your location...</Typography>
                        <Typography variant="caption" color="text.secondary">This helps authorities respond faster</Typography>
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
                        <Typography variant="body2">✓ Location captured successfully!</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                        </Typography>
                      </Alert>
                    </motion.div>
                  )}
                  
                  {(locationError || locationTimeout) && !userLocation && (
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
                        <Typography variant="body2">Location unavailable</Typography>
                        <Typography variant="caption">You can still submit. Please describe the location in details.</Typography>
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
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Box sx={{ textAlign: 'center' }}>
              <Zoom in timeout={500}>
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    margin: '0 auto 24px',
                    background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CheckCircle sx={{ fontSize: 50, color: 'white' }} />
                </Box>
              </Zoom>
              
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                Review Your Report
              </Typography>
              
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  textAlign: 'left', 
                  bgcolor: alpha(theme.palette.background.paper, 0.6),
                  borderRadius: 3,
                  border: `1px solid ${alpha('#4F46E5', 0.1)}`
                }}
              >
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ color: '#4F46E5', mb: 1 }}>
                      Category
                    </Typography>
                    <Chip 
                      label={formData.category}
                      sx={{ 
                        bgcolor: alpha(categories.find(c => c.label === formData.category)?.color || '#4F46E5', 0.1),
                        color: categories.find(c => c.label === formData.category)?.color || '#4F46E5',
                        fontWeight: 600
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ color: '#4F46E5', mb: 1 }}>
                      Points to Earn
                    </Typography>
                    <Chip 
                      label={`+${categories.find(c => c.label === formData.category)?.points || 10} points`}
                      sx={{ 
                        bgcolor: alpha('#F59E0B', 0.1),
                        color: '#F59E0B',
                        fontWeight: 600
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ color: '#4F46E5', mb: 1 }}>
                      Title
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {formData.title}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ color: '#4F46E5', mb: 1 }}>
                      Description
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {formData.description}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ color: '#4F46E5', mb: 1 }}>
                      Location
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {userLocation ? (
                        <>
                          <LocationOn sx={{ color: '#10B981' }} />
                          <Typography variant="body2">
                            Lat: {userLocation.lat.toFixed(6)}, Lng: {userLocation.lng.toFixed(6)}
                          </Typography>
                        </>
                      ) : (
                        <>
                          <LocationOff sx={{ color: '#F59E0B' }} />
                          <Typography variant="body2" color="text.secondary">
                            Location not captured - Please add in description
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ color: '#4F46E5', mb: 1 }}>
                      Reporting as
                    </Typography>
                    <Typography variant="body2">
                      {formData.isAnonymous ? 'Anonymous Citizen' : 'Registered User'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
              
              {!userLocation && !locationLoading && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  💡 Tip: Add location details in the description for faster response
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
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <Fade in timeout={800}>
        <Box>
          {/* Header with Stats */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Report an Issue
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Help keep your community clean and earn rewards
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Paper elevation={0} sx={{ p: 1.5, px: 2, borderRadius: 3, bgcolor: alpha('#4F46E5', 0.05), textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Total Reports</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#4F46E5' }}>
                    <CountUp end={userStats.totalReports} duration={2} />
                  </Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 1.5, px: 2, borderRadius: 3, bgcolor: alpha('#F59E0B', 0.05), textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Points Earned</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                    <CountUp end={userStats.pointsEarned} duration={2} />
                  </Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 1.5, px: 2, borderRadius: 3, bgcolor: alpha('#10B981', 0.05), textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Resolved</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#10B981' }}>
                    <CountUp end={userStats.issuesResolved} duration={2} />
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </motion.div>

          {/* Main Form Card */}
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, sm: 4 },
              borderRadius: 4,
              background: alpha(theme.palette.background.paper, 0.95),
              border: `1px solid ${alpha('#4F46E5', 0.1)}`
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Stepper 
                activeStep={activeStep} 
                alternativeLabel
                connector={<CustomConnector />}
                sx={{ 
                  flex: 1,
                  '& .MuiStepLabel-label': {
                    fontSize: { xs: '0.7rem', sm: '0.875rem' }
                  }
                }}
              >
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel StepIconComponent={CustomStepIcon}>
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
              
              {activeStep > 0 && (
                <Tooltip title="Reset Form">
                  <IconButton onClick={resetForm} sx={{ color: '#ef4444' }}>
                    <RestartAltIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <Box sx={{ minHeight: 500 }}>
              <AnimatePresence mode="wait">
                {getStepContent(activeStep)}
              </AnimatePresence>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<NavigateBefore />}
                variant="outlined"
                size="large"
                sx={{ borderRadius: 2 }}
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
                      px: 5,
                      py: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)'
                      }
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
                      isAnalyzing
                    }
                    endIcon={<NavigateNext />}
                    size="large"
                    sx={{
                      px: 5,
                      py: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>

            {/* Progress Indicator */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
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
                  bgcolor: 'transparent',
                  '& .MuiLinearProgress-root': {
                    height: 4,
                    borderRadius: 2,
                    bgcolor: alpha('#4F46E5', 0.1),
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #4F46E5, #7C3AED)'
                    }
                  }
                }}
                nextButton={<Box />}
                backButton={<Box />}
              />
            </Box>
          </Paper>

          {/* Tips Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Paper
              elevation={0}
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 3,
                bgcolor: alpha('#4F46E5', 0.03),
                border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon sx={{ color: '#4F46E5' }} />
                <Typography variant="body2" color="text.secondary">
                  💡 Pro Tip: Clear photos and detailed descriptions help resolve issues 50% faster!
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip icon={<RewardIcon />} label="Earn Points" size="small" />
                <Chip icon={<SpeedIcon />} label="Fast Response" size="small" />
              </Box>
            </Paper>
          </motion.div>
        </Box>
      </Fade>
    </Container>
  );
};

export default ReportIssue;