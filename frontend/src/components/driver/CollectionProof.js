import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  alpha
} from '@mui/material';
import {
  PhotoCamera,
  Delete,
  CheckCircle,
  Close,
  NavigateNext,
  NavigateBefore,
  DoneAll
} from '@mui/icons-material';
import { driverService } from '../../services/driverService';
import { showSuccess, showError, showLoading } from '../../utils/toast';

const CollectionProof = ({ route, currentStop, onComplete, onClose }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    wasteType: 'General',
    wasteCollected: '',
    notes: ''
  });

  // 🔥 SAFETY CHECK - Agar direct route se aaya hai toh kuch mat dikhao
  if (!route || !currentStop) {
    console.log('CollectionProof: Invalid usage - component should be used as modal only');
    return null;
  }

  const steps = ['Take Photo', 'Enter Details', 'Submit'];

  const handleTakePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setPhoto(file);
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const isStepValid = () => {
    if (activeStep === 0) return photo !== null;
    if (activeStep === 1) return formData.wasteCollected && parseFloat(formData.wasteCollected) > 0;
    return true;
  };

  const handleNext = () => {
    if (!isStepValid()) {
      if (activeStep === 0) showError('Please take a photo');
      if (activeStep === 1) showError('Enter waste amount');
      return;
    }
    
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => setActiveStep(activeStep - 1);

  const handleSubmit = async () => {
    if (!formData.wasteCollected || parseFloat(formData.wasteCollected) <= 0) {
      showError('Enter waste amount');
      return;
    }

    setSubmitting(true);
    showLoading('Submitting...');

    try {
      const stopId = currentStop.stopId || currentStop._id;
      const routeId = route._id || route.routeId;
      
      const payload = {
        wasteCollected: parseFloat(formData.wasteCollected),
        wasteType: formData.wasteType,
        notes: formData.notes,
        completedAt: new Date().toISOString()
      };

      const response = await driverService.completeStop(routeId, stopId, payload);
      
      if (response.success) {
        showSuccess('Collection proof submitted! 🎉');
        if (onComplete) onComplete(response.data);
        onClose();
      } else {
        showError(response.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      showError(error.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const getStopName = () => {
    return currentStop.location || currentStop.address || `Stop ${currentStop.stopId || ''}`;
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">📸 Collection Proof</Typography>
            <Typography variant="caption" color="text.secondary">
              {getStopName()}
            </Typography>
          </Box>
          <IconButton onClick={onClose}><Close /></IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label, idx) => (
            <Step key={label} completed={activeStep > idx}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box>
            {photoPreview ? (
              <Card>
                <CardMedia component="img" image={photoPreview} sx={{ height: 200, objectFit: 'cover' }} />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>Photo captured</Typography>
                    <Button size="small" color="error" onClick={removePhoto}>Retake</Button>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Button
                fullWidth
                variant="outlined"
                onClick={handleTakePhoto}
                sx={{ height: 150, flexDirection: 'column', gap: 1, borderStyle: 'dashed' }}
              >
                <PhotoCamera sx={{ fontSize: 48 }} />
                <Typography>Take Photo</Typography>
              </Button>
            )}
          </Box>
        )}

        {activeStep === 1 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Waste Type"
                value={formData.wasteType}
                onChange={(e) => setFormData({ ...formData, wasteType: e.target.value })}
              >
                <MenuItem value="General">General Waste</MenuItem>
                <MenuItem value="Recyclable">Recyclable</MenuItem>
                <MenuItem value="Organic">Organic</MenuItem>
                <MenuItem value="Hazardous">Hazardous</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Waste (kg)"
                type="number"
                value={formData.wasteCollected}
                onChange={(e) => setFormData({ ...formData, wasteCollected: e.target.value })}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        )}

        {activeStep === 2 && (
          <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), p: 2 }}>
            <Typography variant="subtitle2">Review</Typography>
            <Typography variant="body2">Stop: {getStopName()}</Typography>
            <Typography variant="body2">Type: {formData.wasteType}</Typography>
            <Typography variant="body2">Quantity: {formData.wasteCollected} kg</Typography>
            {photoPreview && <Typography variant="body2">✅ Photo attached</Typography>}
          </Card>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={submitting}
            endIcon={activeStep === 2 ? <DoneAll /> : <NavigateNext />}
            sx={activeStep === 2 ? { bgcolor: '#10B981' } : {}}
          >
            {submitting ? <CircularProgress size={24} /> : (activeStep === 2 ? 'Submit' : 'Next')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CollectionProof;