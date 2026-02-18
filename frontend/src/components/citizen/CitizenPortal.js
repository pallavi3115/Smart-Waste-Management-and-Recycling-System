import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  Report as ReportIcon,
  Recycling as RecyclingIcon,
  // Removed HistoryIcon
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { binService } from '../../services/binService';
import { recyclingService } from '../../services/recyclingService';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert'; // This path is correct

// ... rest of the code remains the same

const CitizenPortal = () => {
  const { user } = useAuth();
  const [bins, setBins] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportDialog, setReportDialog] = useState(false);
  const [selectedBin, setSelectedBin] = useState(null);
  const [reportForm, setReportForm] = useState({
    issue_type: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [binsRes, centersRes] = await Promise.all([
        binService.getAllBins(),
        recyclingService.getAllCenters()
      ]);

      setBins(binsRes.data);
      setCenters(centersRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmit = async () => {
    try {
      // Here you would call an API to submit the report
      console.log('Report submitted:', {
        binId: selectedBin.id,
        ...reportForm,
        userId: user.id
      });
      
      setReportDialog(false);
      setReportForm({ issue_type: '', description: '' });
      setSelectedBin(null);
      
      // Show success message (you might want to add a snackbar)
      alert('Report submitted successfully!');
    } catch (err) {
      alert('Failed to submit report');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Empty': return '#4caf50';
      case 'Partial': return '#ff9800';
      case 'Full': return '#f44336';
      default: return '#999';
    }
  };

  if (loading) return <LoadingSpinner message="Loading citizen portal..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchData} />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.name}!
        </Typography>
        <Typography variant="body1">
          Help us keep your community clean by reporting issues and recycling responsibly.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RecyclingIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">Recycling Centers</Typography>
                  <Typography variant="h4">{centers.length}</Typography>
                </Box>
              </Box>
              <Divider />
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Near you: {centers.filter(c => c.current_load < c.capacity).length} centers accepting waste
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ReportIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">Report Issue</Typography>
                  <Typography variant="h4">{bins.filter(b => b.status === 'Full').length}</Typography>
                </Box>
              </Box>
              <Divider />
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  {bins.filter(b => b.status === 'Full').length} bins need attention
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">Notifications</Typography>
                  <Typography variant="h4">3</Typography>
                </Box>
              </Box>
              <Divider />
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Your bin will be collected in 2 hours
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Nearby Bins */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Nearby Bins
            </Typography>
            <Grid container spacing={2}>
              {bins.slice(0, 6).map((bin) => (
                <Grid item xs={12} sm={6} md={4} key={bin.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Bin #{bin.id}</Typography>
                        <Chip
                          label={bin.status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(bin.status),
                            color: 'white'
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Location: {bin.area}
                      </Typography>
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Fill Level</Typography>
                          <Typography variant="body2">{bin.fill_level}%</Typography>
                        </Box>
                        <Box sx={{ height: 8, bgcolor: '#eee', borderRadius: 4, overflow: 'hidden' }}>
                          <Box
                            sx={{
                              width: `${bin.fill_level}%`,
                              height: '100%',
                              bgcolor: getStatusColor(bin.status)
                            }}
                          />
                        </Box>
                      </Box>
                      {bin.fire_alert && (
                        <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
                          FIRE ALERT! Emergency services notified.
                        </Alert>
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={() => {
                          setSelectedBin(bin);
                          setReportDialog(true);
                        }}
                        startIcon={<ReportIcon />}
                      >
                        Report Issue
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Recycling Tips */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'success.light', color: 'white' }}>
            <Typography variant="h5" gutterBottom>
              ♻️ Recycling Tips
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                  <CardContent>
                    <Typography variant="h6">Plastic</Typography>
                    <Typography variant="body2">
                      Rinse containers before recycling. Remove caps and labels.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                  <CardContent>
                    <Typography variant="h6">Paper</Typography>
                    <Typography variant="body2">
                      Keep paper dry and clean. Flatten cardboard boxes.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                  <CardContent>
                    <Typography variant="h6">Glass</Typography>
                    <Typography variant="body2">
                      Separate by color. Remove lids and rinse.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                  <CardContent>
                    <Typography variant="h6">Metal</Typography>
                    <Typography variant="body2">
                      Crush cans to save space. Check if items are recyclable.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Report Issue Dialog */}
      <Dialog open={reportDialog} onClose={() => setReportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report Issue - Bin #{selectedBin?.id}</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Issue Type"
            value={reportForm.issue_type}
            onChange={(e) => setReportForm({ ...reportForm, issue_type: e.target.value })}
            margin="normal"
          >
            <MenuItem value="Overflow">Bin Overflowing</MenuItem>
            <MenuItem value="Damaged">Bin Damaged</MenuItem>
            <MenuItem value="Fire">Fire Hazard</MenuItem>
            <MenuItem value="Smell">Bad Odor</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Description"
            value={reportForm.description}
            onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
            margin="normal"
            multiline
            rows={4}
            placeholder="Please describe the issue in detail..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleReportSubmit} 
            variant="contained" 
            color="primary"
            disabled={!reportForm.issue_type || !reportForm.description}
          >
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CitizenPortal;