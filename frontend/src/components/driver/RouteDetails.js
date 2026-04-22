import React, { useState, useEffect, useRef } from 'react';
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
  Skeleton,
  Tab,
  Tabs,
  Tooltip
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  CheckCircle,
  NavigateNext,
  NavigateBefore,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Map as MapIcon,
  List as ListIcon,
  MyLocation as MyLocationIcon,
  DoneAll as DoneAllIcon,
  LocalShipping as TruckIcon,
  Route as RouteIcon,
  Collections as CollectionIcon
} from '@mui/icons-material';
import { driverService } from '../../services/driverService';
import { motion } from 'framer-motion';
import { showSuccess, showError, showLoading } from '../../utils/toast';
import RouteMap from './RouteMap';
import CollectionProof from './CollectionProof';

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
  const [showCollectionProof, setShowCollectionProof] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [driverLocation, setDriverLocation] = useState(null);
  const locationIntervalRef = useRef(null);
  
  const [collectionData, setCollectionData] = useState({
    wasteCollected: '',
    wasteType: 'General',
    notes: ''
  });

  useEffect(() => {
    fetchRouteDetails();
    startLocationTracking();
    
    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, [id]);

  const startLocationTracking = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setDriverLocation(location);
          updateDriverLocation(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setDriverLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
      
      locationIntervalRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setDriverLocation(location);
            updateDriverLocation(location);
          },
          (error) => {
            console.error('Location tracking error:', error);
          }
        );
      }, 30000);
    }
  };

  const updateDriverLocation = async (location) => {
    try {
      await driverService.updateLocation(location);
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const fetchRouteDetails = async () => {
    try {
      setLoading(true);
      const response = await driverService.getRouteDetails(id);
      console.log('Route data received:', response.data);
      setRoute(response.data);
      
      const firstIncomplete = response.data.stops?.findIndex(s => 
        s.status !== 'Completed' && !s.completed
      );
      setActiveStop(firstIncomplete !== -1 ? firstIncomplete : 0);
    } catch (error) {
      console.error('Error fetching route:', error);
      showError('Failed to load route details');
    } finally {
      setLoading(false);
    }
  };

  const getStopId = (stop) => {
    if (!stop) return null;
    return stop.stopId || stop._id || stop.id;
  };

  // ✅ ADD THIS FUNCTION - Complete Stop Handler
  const handleCompleteStop = async () => {
    if (!route || !route.stops || route.stops.length === 0) {
      showError('No stops found for this route');
      return;
    }
    
    const currentStop = route.stops[activeStop];
    if (!currentStop) {
      showError('Current stop not found');
      return;
    }
    
    const stopId = getStopId(currentStop);
    
    if (!stopId) {
      showError('Invalid stop data. Stop ID is missing.');
      return;
    }
    
    if (!collectionData.wasteCollected || parseFloat(collectionData.wasteCollected) <= 0) {
      showError('Please enter waste collected amount');
      return;
    }
    
    setSubmitting(true);
    showLoading('Completing stop...');
    
    try {
      const routeId = route._id || route.routeId || id;
      
      const payload = {
        wasteCollected: parseFloat(collectionData.wasteCollected),
        wasteType: collectionData.wasteType,
        notes: collectionData.notes,
        completedAt: new Date().toISOString()
      };
      
      const response = await driverService.completeStop(routeId, stopId.toString(), payload);
      
      if (response.success) {
        showSuccess('Stop completed successfully! 🎉');
        setOpenCollectionDialog(false);
        
        setCollectionData({
          wasteCollected: '',
          wasteType: 'General',
          notes: ''
        });
        
        await fetchRouteDetails();
        
        const remainingStops = route?.stops?.filter(s => 
          s.status !== 'Completed' && !s.completed
        ).length || 0;
        
        if (remainingStops > 0 && activeStop + 1 < (route?.stops?.length || 0)) {
          setActiveStop(activeStop + 1);
        }
      } else {
        showError(response.message || 'Failed to complete stop');
      }
    } catch (error) {
      console.error('Error completing stop:', error);
      showError(error.response?.data?.message || 'Failed to complete stop');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCollectionProofComplete = async (data) => {
    showSuccess('Collection proof submitted! 🎉');
    setShowCollectionProof(false);
    await fetchRouteDetails();
    
    const remainingStops = route?.stops?.filter(s => 
      s.status !== 'Completed' && !s.completed
    ).length || 0;
    
    if (remainingStops > 0 && activeStop + 1 < (route?.stops?.length || 0)) {
      setActiveStop(activeStop + 1);
    }
  };

  const handleStartRoute = async () => {
    if (!route) return;
    
    showLoading('Starting route...');
    try {
      const routeId = route._id || route.routeId || id;
      await driverService.startRoute(routeId);
      showSuccess('Route started! 🚀');
      await fetchRouteDetails();
    } catch (error) {
      console.error('Error starting route:', error);
      showError(error.response?.data?.message || 'Failed to start route');
    }
  };

  const handleStopFocus = (stopId) => {
    const stopIndex = route?.stops?.findIndex(s => s.stopId === stopId || s._id === stopId);
    if (stopIndex !== -1) {
      setActiveStop(stopIndex);
      setActiveTab(1);
    }
  };

  const centerOnCurrentLocation = () => {
    if (driverLocation) {
      window.dispatchEvent(new CustomEvent('centerOnLocation', { detail: driverLocation }));
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#10B981';
    if (progress >= 40) return '#F59E0B';
    return '#4F46E5';
  };

  const isStopCompleted = (stop) => {
    return stop?.status === 'Completed' || stop?.completed === true;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4, mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 4 }} />
          </Grid>
          <Grid item xs={12} lg={5}>
            <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 4 }} />
          </Grid>
        </Grid>
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

  const currentStop = route.stops?.[activeStop];
  const progressColor = getProgressColor(route.progress || 0);
  const completedStopsCount = route.stops?.filter(s => isStopCompleted(s)).length || 0;
  const totalStops = route.stops?.length || 0;
  const allStopsCompleted = completedStopsCount === totalStops && totalStops > 0;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/driver/routes')}
          sx={{ mb: 3, color: '#4F46E5' }}
        >
          Back to Routes
        </Button>

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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TruckIcon sx={{ color: '#4F46E5' }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Route #{route.routeId || route._id?.slice(-6) || id?.slice(-6)}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                {route.date ? new Date(route.date).toLocaleDateString() : 'Date not set'} • {route.shift || 'Morning'} Shift
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh">
                <IconButton onClick={fetchRouteDetails} sx={{ bgcolor: 'white' }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="My Location">
                <IconButton onClick={centerOnCurrentLocation} sx={{ bgcolor: 'white' }}>
                  <MyLocationIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" fontWeight={500}>Overall Progress</Typography>
              <Typography variant="body2" fontWeight={500} sx={{ color: progressColor }}>
                {Math.round(route.progress || 0)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={route.progress || 0}
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
              icon={route.status === 'Completed' ? <DoneAllIcon /> : <RouteIcon />}
              label={`Status: ${route.status || 'Active'}`}
              sx={{
                bgcolor: route.status === 'Completed' ? alpha('#10B981', 0.1) : alpha('#4F46E5', 0.1),
                color: route.status === 'Completed' ? '#10B981' : '#4F46E5',
                fontWeight: 600
              }}
            />
            <Chip
              icon={<ScheduleIcon />}
              label={`Stops: ${completedStopsCount}/${totalStops}`}
              variant="outlined"
            />
            <Chip
              icon={<DeleteIcon />}
              label={`Waste: ${route.totalWaste || 0} kg`}
              variant="outlined"
            />
            {driverLocation && (
              <Chip
                icon={<MyLocationIcon />}
                label="Live Tracking Active"
                sx={{ bgcolor: alpha('#10B981', 0.1), color: '#10B981' }}
              />
            )}
            {allStopsCompleted && (
              <Chip
                icon={<DoneAllIcon />}
                label="All Stops Completed"
                sx={{ bgcolor: alpha('#10B981', 0.1), color: '#10B981' }}
              />
            )}
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
        </Paper>

        <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            sx={{
              borderBottom: `1px solid ${alpha('#4F46E5', 0.1)}`,
              bgcolor: alpha('#4F46E5', 0.02),
              px: 2
            }}
          >
            <Tab icon={<MapIcon />} iconPosition="start" label="Route Map" />
            <Tab icon={<ListIcon />} iconPosition="start" label="Stops List" />
          </Tabs>

          {activeTab === 0 && (
            <Box sx={{ p: 2 }}>
              <RouteMap 
                route={route} 
                driverLocation={driverLocation}
                onStopClick={handleStopFocus}
              />
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              {!allStopsCompleted && route.status !== 'Completed' && totalStops > 0 ? (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Stop {activeStop + 1} of {totalStops}
                  </Typography>
                  
                  <Stepper
                    activeStep={activeStop}
                    sx={{
                      mb: 4,
                      '& .MuiStepLabel-root .Mui-completed': { color: '#10B981' },
                      '& .MuiStepLabel-root .Mui-active': { color: '#4F46E5' },
                    }}
                  >
                    {route.stops.map((stop, idx) => (
                      <Step key={idx} completed={isStopCompleted(stop)}>
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
                            <Typography variant="h6">Stop #{activeStop + 1}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {currentStop.location || currentStop.address || 'Location not available'}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<LocationOn />}
                            onClick={() => {
                              const lat = currentStop.lat || currentStop.binDetails?.location?.lat;
                              const lng = currentStop.lng || currentStop.binDetails?.location?.lng;
                              if (lat && lng) window.open(`https://maps.google.com/?q=${lat},${lng}`);
                            }}
                          >
                            Open in Maps
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<CollectionIcon />}
                            onClick={() => setShowCollectionProof(true)}
                            sx={{ bgcolor: '#10B981' }}
                          >
                            Submit Collection Proof
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                      disabled={activeStop === 0}
                      onClick={() => setActiveStop(activeStop - 1)}
                      startIcon={<NavigateBefore />}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setShowCollectionProof(true)}
                      disabled={isStopCompleted(currentStop)}
                      sx={{ bgcolor: '#10B981' }}
                    >
                      Complete Stop with Proof
                    </Button>
                    <Button
                      disabled={activeStop === totalStops - 1}
                      onClick={() => setActiveStop(activeStop + 1)}
                      endIcon={<NavigateNext />}
                    >
                      Next
                    </Button>
                  </Box>
                </>
              ) : (allStopsCompleted || route.status === 'Completed') ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <DoneAllIcon sx={{ fontSize: 80, color: '#10B981', mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#10B981', mb: 1 }}>
                    Route Completed! 🎉
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    You have successfully completed all {totalStops} stops.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/driver/routes')}
                    sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}
                  >
                    View All Routes
                  </Button>
                </Box>
              ) : null}
            </Box>
          )}
        </Paper>
      </motion.div>

      {/* Collection Proof Modal - ONLY SHOW WHEN BUTTON CLICKED */}
      {showCollectionProof && route && currentStop && (
        <CollectionProof
          route={route}
          currentStop={currentStop}
          onComplete={handleCollectionProofComplete}
          onClose={() => setShowCollectionProof(false)}
        />
      )}

      {/* Simple Collection Dialog (Fallback) */}
      <Dialog
        open={openCollectionDialog}
        onClose={() => setOpenCollectionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Complete Stop</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Waste Type"
            value={collectionData.wasteType}
            onChange={(e) => setCollectionData({ ...collectionData, wasteType: e.target.value })}
            margin="normal"
          >
            <MenuItem value="General">General Waste</MenuItem>
            <MenuItem value="Recyclable">Recyclable</MenuItem>
            <MenuItem value="Organic">Organic</MenuItem>
            <MenuItem value="Hazardous">Hazardous</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Waste (kg)"
            type="number"
            value={collectionData.wasteCollected}
            onChange={(e) => setCollectionData({ ...collectionData, wasteCollected: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={2}
            value={collectionData.notes}
            onChange={(e) => setCollectionData({ ...collectionData, notes: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCollectionDialog(false)}>Cancel</Button>
          <Button onClick={handleCompleteStop} variant="contained" disabled={submitting}>
            {submitting ? 'Completing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RouteDetails;