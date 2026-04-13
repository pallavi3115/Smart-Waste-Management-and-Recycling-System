import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  useTheme,
  alpha,
  Avatar,
  MenuItem,
  Skeleton
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  CheckCircle,
  PhotoCamera,
  Warning,
  NavigateNext,
  NavigateBefore,
  Speed as SpeedIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { driverService } from '../../services/driverService';
import { motion } from 'framer-motion';
import { showSuccess, showError, showLoading } from '../../utils/toast';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const RouteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStop, setActiveStop] = useState(0);
  const [openCollectionDialog, setOpenCollectionDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [collectionData, setCollectionData] = useState({
    wasteCollected: '',
    wasteType: 'General',
    photos: { before: null, after: null },
    notes: ''
  });

  useEffect(() => {
    fetchRouteDetails();
  }, [id]);

  const fetchRouteDetails = async () => {
    try {
      const response = await driverService.getRouteDetails(id);
      setRoute(response.data);
      // Find first incomplete stop
      const firstIncomplete = response.data.stops.findIndex(s => s.status !== 'Completed');
      setActiveStop(firstIncomplete !== -1 ? firstIncomplete : 0);
    } catch (error) {
      console.error('Error fetching route:', error);
      showError('Failed to load route details');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteStop = async () => {
    const currentStop = route.stops[activeStop];
    
    setSubmitting(true);
    const toastId = showLoading('Completing stop...');
    
    try {
      await driverService.completeStop(route._id, currentStop._id, {
        wasteCollected: parseFloat(collectionData.wasteCollected),
        wasteType: collectionData.wasteType,
        photos: collectionData.photos,
        notes: collectionData.notes
      });
      
      showSuccess('Stop completed successfully! 🎉');
      setOpenCollectionDialog(false);
      fetchRouteDetails();
      setCollectionData({
        wasteCollected: '',
        wasteType: 'General',
        photos: { before: null, after: null },
        notes: ''
      });
    } catch (error) {
      showError('Failed to complete stop');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartRoute = async () => {
    const toastId = showLoading('Starting route...');
    try {
      await driverService.startRoute(id);
      showSuccess('Route started! 🚀');
      fetchRouteDetails();
    } catch (error) {
      showError('Failed to start route');
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#10B981';
    if (progress >= 40) return '#F59E0B';
    return '#4F46E5';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4, mb: 3 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
      </Container>
    );
  }

  if (!route) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Route not found</Alert>
        <Button onClick={() => navigate('/driver/routes')} sx={{ mt: 2 }}>
          Back to Routes
        </Button>
      </Container>
    );
  }

  const currentStop = route.stops[activeStop];
  const progressColor = getProgressColor(route.progress);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/driver/routes')}
          sx={{ mb: 3, color: '#4F46E5' }}
        >
          Back to Routes
        </Button>

        {/* Route Header Card */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha('#4F46E5', 0.1)} 0%, ${alpha('#7C3AED', 0.05)} 100%)`,
            border: `1px solid ${alpha('#4F46E5', 0.1)}`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha('#4F46E5', 0.15)} 0%, transparent 70%)`,
              zIndex: 0
            }}
          />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Route #{route.routeId}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {new Date(route.date).toLocaleDateString()} • {route.shift} Shift
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight={500}>Overall Progress</Typography>
                <Typography variant="body2" fontWeight={500} sx={{ color: progressColor }}>
                  {route.progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={route.progress}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: alpha(progressColor, 0.1),
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${progressColor} 0%, ${progressColor}CC 100%)`,
                    borderRadius: 5
                  }
                }}
              />
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                label={`Status: ${route.status}`}
                sx={{
                  bgcolor: route.status === 'Completed' ? alpha('#10B981', 0.1) : alpha('#4F46E5', 0.1),
                  color: route.status === 'Completed' ? '#10B981' : '#4F46E5',
                  fontWeight: 600
                }}
              />
              <Chip
                icon={<ScheduleIcon />}
                label={`Stops: ${route.stops.filter(s => s.status === 'Completed').length}/${route.stops.length}`}
                variant="outlined"
              />
              <Chip
                icon={<DeleteIcon />}
                label={`Waste: ${route.totalWaste} kg`}
                variant="outlined"
              />
              <Chip
                icon={route.isOnSchedule ? <SpeedIcon /> : <ScheduleIcon />}
                label={route.isOnSchedule ? 'On Schedule' : 'Delayed'}
                sx={{
                  bgcolor: route.isOnSchedule ? alpha('#10B981', 0.1) : alpha('#EF4444', 0.1),
                  color: route.isOnSchedule ? '#10B981' : '#EF4444'
                }}
              />
            </Box>

            {route.status === 'Assigned' && (
              <Button
                variant="contained"
                onClick={handleStartRoute}
                sx={{
                  mt: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)'
                  }
                }}
              >
                Start Route
              </Button>
            )}
          </Box>
        </Paper>

        {/* Stops Section */}
        {route.status !== 'Assigned' && route.status !== 'Completed' && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              background: alpha(theme.palette.background.paper, 0.95),
              border: `1px solid ${alpha('#4F46E5', 0.1)}`
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Current Stop {activeStop + 1} of {route.stops.length}
            </Typography>
            
            <Stepper
              activeStep={activeStop}
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
              {route.stops.map((stop, idx) => (
                <Step key={idx} completed={stop.status === 'Completed'}>
                  <StepLabel>Stop {idx + 1}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {currentStop && (
              <Card
                elevation={0}
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  background: alpha('#4F46E5', 0.03),
                  border: `1px solid ${alpha('#4F46E5', 0.1)}`
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#4F46E5' }}>
                      <LocationOn />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">Bin #{currentStop.bin?.binId}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {currentStop.binDetails?.location?.address || 'Address not available'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<LocationOn />}
                      label="View on Map"
                      variant="outlined"
                    />
                    <Chip
                      label={`Fill Level: ${currentStop.binDetails?.expectedFillLevel}%`}
                      sx={{
                        bgcolor: currentStop.binDetails?.expectedFillLevel > 80 ? alpha('#EF4444', 0.1) : alpha('#10B981', 0.1),
                        color: currentStop.binDetails?.expectedFillLevel > 80 ? '#EF4444' : '#10B981'
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                disabled={activeStop === 0}
                onClick={() => setActiveStop(activeStop - 1)}
                startIcon={<NavigateBefore />}
                sx={{ borderRadius: 2 }}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                onClick={() => setOpenCollectionDialog(true)}
                disabled={currentStop?.status === 'Completed'}
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)'
                  }
                }}
              >
                Complete Stop
              </Button>
              <Button
                disabled={activeStop === route.stops.length - 1}
                onClick={() => setActiveStop(activeStop + 1)}
                endIcon={<NavigateNext />}
                sx={{ borderRadius: 2 }}
              >
                Next
              </Button>
            </Box>
          </Paper>
        )}

        {/* Completed Route Message */}
        {route.status === 'Completed' && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              textAlign: 'center',
              background: alpha('#10B981', 0.05),
              border: `1px solid ${alpha('#10B981', 0.2)}`
            }}
          >
            <CheckCircle sx={{ fontSize: 64, color: '#10B981', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#10B981', mb: 1 }}>
              Route Completed!
            </Typography>
            <Typography variant="body2" color="textSecondary">
              You have successfully completed this route.
            </Typography>
          </Paper>
        )}
      </motion.div>

      {/* Collection Dialog */}
      <Dialog
        open={openCollectionDialog}
        onClose={() => setOpenCollectionDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Complete Stop</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Waste Type"
            value={collectionData.wasteType}
            onChange={(e) => setCollectionData({ ...collectionData, wasteType: e.target.value })}
            margin="normal"
            sx={{ mb: 2 }}
          >
            <MenuItem value="General">General Waste</MenuItem>
            <MenuItem value="Recyclable">Recyclable</MenuItem>
            <MenuItem value="Organic">Organic</MenuItem>
            <MenuItem value="Hazardous">Hazardous</MenuItem>
          </TextField>
          
          <TextField
            fullWidth
            label="Waste Collected (kg)"
            type="number"
            value={collectionData.wasteCollected}
            onChange={(e) => setCollectionData({ ...collectionData, wasteCollected: e.target.value })}
            margin="normal"
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Notes (Optional)"
            multiline
            rows={3}
            value={collectionData.notes}
            onChange={(e) => setCollectionData({ ...collectionData, notes: e.target.value })}
            margin="normal"
            placeholder="Any issues or observations..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpenCollectionDialog(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCompleteStop}
            variant="contained"
            disabled={submitting || !collectionData.wasteCollected}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)'
              }
            }}
          >
            {submitting ? 'Completing...' : 'Confirm Collection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RouteDetails;