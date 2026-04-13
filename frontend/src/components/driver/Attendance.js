import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
// Removed: PhotoCamera as CameraIcon (not used)
import { driverService } from '../../services/driverService';
import { format } from 'date-fns';
import { showSuccess, showError, showLoading } from '../../utils/toast';
import { motion } from 'framer-motion';
// Removed: AnimatePresence (not used)

const Attendance = () => {
  const theme = useTheme();
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [openPhotoDialog, setOpenPhotoDialog] = useState(false);
  // Removed: photo state (not used)
  const [notes, setNotes] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [todayStatus, setTodayStatus] = useState(null);

  useEffect(() => {
    fetchAttendance();
    getLocation();
    checkTodayStatus();
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await driverService.getAttendance();
      setAttendance(response.data.records || []);
      setStats(response.data.stats || { present: 0, late: 0, absent: 0, totalOvertime: 0 });
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const checkTodayStatus = async () => {
    try {
      const response = await driverService.getTodayStatus();
      setTodayStatus(response.data);
    } catch (error) {
      console.error('Error checking today status:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAttendance();
    checkTodayStatus();
  };

  const handleCheckIn = async () => {
    if (!currentLocation) {
      showError('Please enable location services');
      return;
    }

    setCheckingIn(true);
    showLoading('Checking in...');

    try {
      await driverService.checkIn({
        location: currentLocation,
        notes
      });
      showSuccess('Checked in successfully! 🎉');
      fetchAttendance();
      checkTodayStatus();
      setOpenPhotoDialog(false);
      setNotes('');
    } catch (error) {
      showError(error.response?.data?.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!currentLocation) {
      showError('Please enable location services');
      return;
    }

    setCheckingOut(true);
    showLoading('Checking out...');

    try {
      await driverService.checkOut({
        location: currentLocation,
        notes
      });
      showSuccess('Checked out successfully! 🎉');
      fetchAttendance();
      checkTodayStatus();
    } catch (error) {
      showError(error.response?.data?.message || 'Check-out failed');
    } finally {
      setCheckingOut(false);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      Present: { icon: <CheckCircleIcon />, color: '#10B981', bg: alpha('#10B981', 0.1) },
      Late: { icon: <TimeIcon />, color: '#F59E0B', bg: alpha('#F59E0B', 0.1) },
      Absent: { icon: <CancelIcon />, color: '#EF4444', bg: alpha('#EF4444', 0.1) },
      'Half Day': { icon: <TimeIcon />, color: '#3B82F6', bg: alpha('#3B82F6', 0.1) },
      Leave: { icon: <CalendarIcon />, color: '#6B7280', bg: alpha('#6B7280', 0.1) }
    };
    const config = statusConfig[status] || statusConfig.Absent;
    return (
      <Chip
        icon={config.icon}
        label={status}
        size="small"
        sx={{ bgcolor: config.bg, color: config.color, fontWeight: 600 }}
      />
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress sx={{ borderRadius: 2, height: 6 }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Attendance
        </Typography>
        <Tooltip title="Refresh">
          <IconButton
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{
              bgcolor: alpha('#4F46E5', 0.05),
              '&:hover': { bgcolor: alpha('#4F46E5', 0.1) }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card
              elevation={0}
              sx={{
                textAlign: 'center',
                p: 2,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha('#10B981', 0.05)} 0%, ${alpha('#10B981', 0.02)} 100%)`,
                border: `1px solid ${alpha('#10B981', 0.1)}`
              }}
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  margin: '0 auto 12px',
                  bgcolor: alpha('#10B981', 0.1),
                  color: '#10B981'
                }}
              >
                <CheckCircleIcon />
              </Avatar>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#10B981' }}>
                {stats.present || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">Present</Typography>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={6} sm={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              elevation={0}
              sx={{
                textAlign: 'center',
                p: 2,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha('#F59E0B', 0.05)} 0%, ${alpha('#F59E0B', 0.02)} 100%)`,
                border: `1px solid ${alpha('#F59E0B', 0.1)}`
              }}
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  margin: '0 auto 12px',
                  bgcolor: alpha('#F59E0B', 0.1),
                  color: '#F59E0B'
                }}
              >
                <TimeIcon />
              </Avatar>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#F59E0B' }}>
                {stats.late || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">Late</Typography>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={6} sm={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              elevation={0}
              sx={{
                textAlign: 'center',
                p: 2,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha('#EF4444', 0.05)} 0%, ${alpha('#EF4444', 0.02)} 100%)`,
                border: `1px solid ${alpha('#EF4444', 0.1)}`
              }}
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  margin: '0 auto 12px',
                  bgcolor: alpha('#EF4444', 0.1),
                  color: '#EF4444'
                }}
              >
                <CancelIcon />
              </Avatar>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#EF4444' }}>
                {stats.absent || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">Absent</Typography>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={6} sm={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card
              elevation={0}
              sx={{
                textAlign: 'center',
                p: 2,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha('#4F46E5', 0.05)} 0%, ${alpha('#4F46E5', 0.02)} 100%)`,
                border: `1px solid ${alpha('#4F46E5', 0.1)}`
              }}
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  margin: '0 auto 12px',
                  bgcolor: alpha('#4F46E5', 0.1),
                  color: '#4F46E5'
                }}
              >
                <TrendingUpIcon />
              </Avatar>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#4F46E5' }}>
                {stats.totalOvertime || 0} min
              </Typography>
              <Typography variant="body2" color="textSecondary">Overtime</Typography>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Check In/Out Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            background: alpha(theme.palette.background.paper, 0.95),
            border: `1px solid ${alpha('#4F46E5', 0.1)}`,
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            {todayStatus?.checkedIn ? 'Ready to end your shift?' : 'Start your workday'}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                onClick={() => setOpenPhotoDialog(true)}
                disabled={checkingIn || todayStatus?.checkedIn}
                sx={{
                  py: 2,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)'
                  },
                  '&.Mui-disabled': {
                    background: alpha('#4F46E5', 0.5)
                  }
                }}
              >
                {checkingIn ? 'Checking In...' : 'Check In'}
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<LogoutIcon />}
                onClick={handleCheckOut}
                disabled={checkingOut || !todayStatus?.checkedIn}
                sx={{
                  py: 2,
                  borderRadius: 3,
                  borderColor: alpha('#EF4444', 0.5),
                  color: '#EF4444',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#EF4444',
                    backgroundColor: alpha('#EF4444', 0.05),
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {checkingOut ? 'Checking Out...' : 'Check Out'}
              </Button>
            </Grid>
          </Grid>
          {currentLocation && (
            <Box sx={{ mt: 3 }}>
              <Chip
                icon={<LocationIcon />}
                label={`Location: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`}
                size="small"
                sx={{ bgcolor: alpha('#4F46E5', 0.05), color: '#4F46E5' }}
              />
            </Box>
          )}
        </Paper>
      </motion.div>

      {/* Attendance History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            background: alpha(theme.palette.background.paper, 0.95),
            border: `1px solid ${alpha('#4F46E5', 0.1)}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <HistoryIcon sx={{ color: '#4F46E5' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Attendance History
            </Typography>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha('#4F46E5', 0.03) }}>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Shift</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Check In</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Check Out</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Late</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Overtime</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="textSecondary" sx={{ py: 4 }}>
                        No attendance records found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  attendance.map((record) => (
                    <TableRow key={record._id} hover>
                      <TableCell>{format(new Date(record.date), 'dd MMM yyyy')}</TableCell>
                      <TableCell>
                        <Chip
                          label={record.shift}
                          size="small"
                          sx={{ bgcolor: alpha('#4F46E5', 0.05), fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        {record.checkIn?.time ? format(new Date(record.checkIn.time), 'hh:mm a') : '-'}
                      </TableCell>
                      <TableCell>
                        {record.checkOut?.time ? format(new Date(record.checkOut.time), 'hh:mm a') : '-'}
                      </TableCell>
                      <TableCell>{getStatusChip(record.status)}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${record.lateMinutes || 0} min`}
                          size="small"
                          sx={{ bgcolor: alpha('#F59E0B', 0.1), color: '#F59E0B' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${record.overtime || 0} min`}
                          size="small"
                          sx={{ bgcolor: alpha('#4F46E5', 0.1), color: '#4F46E5' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </motion.div>

      {/* Check-in Dialog */}
      <Dialog
        open={openPhotoDialog}
        onClose={() => setOpenPhotoDialog(false)}
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
        <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>Check In</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Notes (Optional)"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            margin="normal"
            placeholder="Add any notes about your shift..."
            sx={{ mb: 2 }}
          />
          {currentLocation && (
            <Alert
              severity="success"
              icon={<LocationIcon />}
              sx={{
                borderRadius: 2,
                bgcolor: alpha('#10B981', 0.1),
                color: '#10B981'
              }}
            >
              Location captured: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpenPhotoDialog(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCheckIn}
            variant="contained"
            disabled={checkingIn}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)'
              }
            }}
          >
            {checkingIn ? 'Checking In...' : 'Confirm Check In'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Attendance;