import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Divider,
  useTheme,
  Fade,
  Zoom,
  Grow,
  IconButton,
  Tooltip,
  Badge,
  Skeleton,
  alpha
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  EmojiEvents as EmojiEventsIcon,
  Recycling as RecyclingIcon,
  Report as ReportIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Verified as VerifiedIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { formatDistance, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, showError, showLoading, dismissToast } from '../../utils/toast';
import CountUp from 'react-countup';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

// Mock chart data
const activityData = [
  { month: 'Jan', reports: 5, recycling: 25 },
  { month: 'Feb', reports: 8, recycling: 35 },
  { month: 'Mar', reports: 12, recycling: 45 },
  { month: 'Apr', reports: 10, recycling: 40 },
  { month: 'May', reports: 15, recycling: 55 },
  { month: 'Jun', reports: 18, recycling: 65 },
];

const materialData = [
  { name: 'Plastic', value: 45, color: '#4F46E5' },
  { name: 'Paper', value: 30, color: '#10B981' },
  { name: 'Glass', value: 15, color: '#F59E0B' },
  { name: 'Metal', value: 10, color: '#EF4444' },
];

const ProfilePage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfileData = useCallback(async () => {
    const toastId = showLoading('Loading profile data...');
    try {
      setLoading(true);
      const response = await userService.getProfile();
      setProfileData(response.data);
      setProfileError('');
      dismissToast(toastId);
      showSuccess('Profile loaded successfully!');
    } catch (err) {
      console.error('Profile error:', err);
      dismissToast(toastId);
      setProfileError('Failed to load profile data. Using local data.');
      showError('Could not fetch profile data. Showing cached version.');
      setProfileData(user);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleShare = () => {
    showSuccess('Profile link copied to clipboard!');
  };

  const handleDownloadReport = () => {
    showLoading('Generating report...');
    setTimeout(() => {
      dismissToast();
      showSuccess('Report downloaded successfully!');
    }, 2000);
  };

  const getRoleColor = () => {
    if (userData?.role === 'Admin') return '#EF4444';
    if (userData?.role === 'Driver') return '#F59E0B';
    return '#4F46E5';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4 }} />
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  const userData = profileData || user;

  if (!userData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Fade in timeout={500}>
          <Alert 
            severity="warning" 
            action={
              <Button color="inherit" size="small" onClick={() => navigate('/login')}>
                Login
              </Button>
            }
          >
            No user data available. Please log in again.
          </Alert>
        </Fade>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Profile Header */}
        <motion.div variants={itemVariants}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              mb: 4,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha('#4F46E5', 0.08)} 0%, ${alpha('#7C3AED', 0.03)} 100%)`,
              border: `1px solid ${alpha('#4F46E5', 0.1)}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Decorative background */}
            <Box
              sx={{
                position: 'absolute',
                top: -80,
                right: -80,
                width: 250,
                height: 250,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha('#4F46E5', 0.15)} 0%, transparent 70%)`,
                zIndex: 0
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -80,
                left: -80,
                width: 250,
                height: 250,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha('#7C3AED', 0.1)} 0%, transparent 70%)`,
                zIndex: 0
              }}
            />
            
            <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
              <Grid item>
                <Zoom in timeout={500}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Tooltip title="Verified Account">
                        <VerifiedIcon sx={{ color: getRoleColor(), fontSize: 28, bgcolor: 'white', borderRadius: '50%', p: 0.5 }} />
                      </Tooltip>
                    }
                  >
                    <Avatar
                      sx={{
                        width: 130,
                        height: 130,
                        background: `linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)`,
                        fontSize: '3.5rem',
                        border: `4px solid ${alpha('#fff', 0.2)}`,
                        boxShadow: `0 8px 25px ${alpha('#4F46E5', 0.3)}`,
                      }}
                    >
                      {userData?.name?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                  </Badge>
                </Zoom>
              </Grid>
              <Grid item xs>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#1E293B' }}>
                    {userData?.name || 'User'}
                  </Typography>
                  {userData?.role === 'Admin' && (
                    <Chip
                      icon={<StarIcon />}
                      label="Admin"
                      sx={{ bgcolor: alpha('#EF4444', 0.1), color: '#EF4444', fontWeight: 600 }}
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                  <Chip
                    icon={<BadgeIcon />}
                    label={userData?.role || 'Citizen'}
                    sx={{ bgcolor: alpha(getRoleColor(), 0.1), color: getRoleColor(), fontWeight: 500 }}
                  />
                  <Chip
                    icon={<EmailIcon />}
                    label={userData?.email || 'No email'}
                    variant="outlined"
                    sx={{ borderColor: alpha('#4F46E5', 0.3) }}
                  />
                  {userData?.phoneNumber && (
                    <Chip
                      icon={<PhoneIcon />}
                      label={userData.phoneNumber}
                      variant="outlined"
                      sx={{ borderColor: alpha('#4F46E5', 0.3) }}
                    />
                  )}
                </Box>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  Member since {userData?.createdAt ? 
                    format(new Date(userData.createdAt), 'dd MMM yyyy') : 
                    'Recently'}
                </Typography>
              </Grid>
              <Grid item>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Tooltip title="Refresh Profile">
                    <IconButton 
                      onClick={handleRefresh} 
                      disabled={refreshing}
                      sx={{ 
                        bgcolor: alpha('#4F46E5', 0.05),
                        '&:hover': { bgcolor: alpha('#4F46E5', 0.1) }
                      }}
                    >
                      <TimelineIcon sx={{ color: '#4F46E5' }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Share Profile">
                    <IconButton 
                      onClick={handleShare}
                      sx={{ 
                        bgcolor: alpha('#4F46E5', 0.05),
                        '&:hover': { bgcolor: alpha('#4F46E5', 0.1) }
                      }}
                    >
                      <ShareIcon sx={{ color: '#4F46E5' }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download Report">
                    <IconButton 
                      onClick={handleDownloadReport}
                      sx={{ 
                        bgcolor: alpha('#4F46E5', 0.05),
                        '&:hover': { bgcolor: alpha('#4F46E5', 0.1) }
                      }}
                    >
                      <DownloadIcon sx={{ color: '#4F46E5' }} />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => navigate('/profile/edit')}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)'
                      }
                    }}
                  >
                    Edit Profile
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: alpha('#10B981', 0.05),
                  border: `1px solid ${alpha('#10B981', 0.1)}`,
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha('#10B981', 0.1), color: '#10B981' }}>
                      <CheckCircleIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
                        <CountUp end={userData?.reports?.length || 0} duration={2} />
                      </Typography>
                      <Typography variant="body2" color="textSecondary">Total Reports</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: alpha('#4F46E5', 0.05),
                  border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha('#4F46E5', 0.1), color: '#4F46E5' }}>
                      <CheckCircleIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#4F46E5' }}>
                        <CountUp end={userData?.reports?.filter(r => r.status === 'RESOLVED').length || 0} duration={2} />
                      </Typography>
                      <Typography variant="body2" color="textSecondary">Resolved</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: alpha('#F59E0B', 0.05),
                  border: `1px solid ${alpha('#F59E0B', 0.1)}`,
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha('#F59E0B', 0.1), color: '#F59E0B' }}>
                      <EmojiEventsIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                        <CountUp end={userData?.rewards?.points || 0} duration={2} />
                      </Typography>
                      <Typography variant="body2" color="textSecondary">Points Earned</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: alpha('#EF4444', 0.05),
                  border: `1px solid ${alpha('#EF4444', 0.1)}`,
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha('#EF4444', 0.1), color: '#EF4444' }}>
                      <TrendingUpIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#EF4444' }}>
                        <CountUp end={userData?.recycling?.total || 0} duration={2} /> kg
                      </Typography>
                      <Typography variant="body2" color="textSecondary">Recycled</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.95),
              border: `1px solid ${alpha('#4F46E5', 0.1)}`,
              overflow: 'hidden'
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 60,
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: alpha('#4F46E5', 0.05)
                  }
                },
                '& .Mui-selected': {
                  color: '#4F46E5 !important'
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#4F46E5',
                  height: 3
                }
              }}
            >
              <Tab label="Personal Info" icon={<PersonIcon />} iconPosition="start" />
              <Tab label="Activity" icon={<ReportIcon />} iconPosition="start" />
              <Tab label="Rewards" icon={<EmojiEventsIcon />} iconPosition="start" />
              <Tab label="Recycling" icon={<RecyclingIcon />} iconPosition="start" />
              <Tab label="Analytics" icon={<TrendingUpIcon />} iconPosition="start" />
              <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
              <Tab label="Notifications" icon={<NotificationsIcon />} iconPosition="start" />
            </Tabs>
          </Paper>
        </motion.div>

        {/* Tab Content */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              background: alpha(theme.palette.background.paper, 0.95),
              border: `1px solid ${alpha('#4F46E5', 0.1)}`,
              minHeight: 500
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={tabValue}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Personal Info Tab */}
                {tabValue === 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ color: '#4F46E5', fontWeight: 600, mb: 3 }}>
                      Personal Information
                    </Typography>
                    <Grid container spacing={4}>
                      <Grid item xs={12} md={6}>
                        <List sx={{ bgcolor: alpha('#4F46E5', 0.02), borderRadius: 3 }}>
                          <ListItem>
                            <ListItemIcon>
                              <PersonIcon sx={{ color: '#4F46E5' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary="Full Name"
                              secondary={userData?.name || 'Not provided'}
                              primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary' }}
                              secondaryTypographyProps={{ variant: 'body1', sx: { fontWeight: 500 } }}
                            />
                          </ListItem>
                          <Divider component="li" />
                          <ListItem>
                            <ListItemIcon>
                              <EmailIcon sx={{ color: '#4F46E5' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary="Email"
                              secondary={userData?.email || 'Not provided'}
                              primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary' }}
                              secondaryTypographyProps={{ variant: 'body1', sx: { fontWeight: 500 } }}
                            />
                          </ListItem>
                          <Divider component="li" />
                          <ListItem>
                            <ListItemIcon>
                              <PhoneIcon sx={{ color: '#4F46E5' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary="Phone Number"
                              secondary={userData?.phoneNumber || 'Not provided'}
                              primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary' }}
                              secondaryTypographyProps={{ variant: 'body1', sx: { fontWeight: 500 } }}
                            />
                          </ListItem>
                        </List>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <List sx={{ bgcolor: alpha('#4F46E5', 0.02), borderRadius: 3 }}>
                          <ListItem>
                            <ListItemIcon>
                              <LocationOnIcon sx={{ color: '#4F46E5' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary="Address"
                              secondary={
                                userData?.address ? (
                                  <>
                                    {userData.address.street && <>{userData.address.street}<br /></>}
                                    {userData.address.city && <>{userData.address.city}, </>}
                                    {userData.address.state && <>{userData.address.state} </>}
                                    {userData.address.zipCode && <>{userData.address.zipCode}</>}
                                  </>
                                ) : 'Not provided'
                              }
                              primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary' }}
                              secondaryTypographyProps={{ variant: 'body1', sx: { fontWeight: 500 } }}
                            />
                          </ListItem>
                          <Divider component="li" />
                          <ListItem>
                            <ListItemIcon>
                              <CalendarIcon sx={{ color: '#4F46E5' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary="Member Since"
                              secondary={userData?.createdAt ? 
                                format(new Date(userData.createdAt), 'dd MMM yyyy') : 
                                'Recently'}
                              primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary' }}
                              secondaryTypographyProps={{ variant: 'body1', sx: { fontWeight: 500 } }}
                            />
                          </ListItem>
                          <Divider component="li" />
                          <ListItem>
                            <ListItemIcon>
                              <BadgeIcon sx={{ color: '#4F46E5' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary="Account Type"
                              secondary={userData?.role || 'Citizen'}
                              primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary' }}
                              secondaryTypographyProps={{ variant: 'body1', sx: { fontWeight: 500 } }}
                            />
                          </ListItem>
                        </List>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Activity Tab */}
                {tabValue === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ color: '#4F46E5', fontWeight: 600, mb: 3 }}>
                      Recent Activity
                    </Typography>
                    {userData?.reports && userData.reports.length > 0 ? (
                      <List>
                        {userData.reports.slice(0, 5).map((report, index) => (
                          <Grow in timeout={500} key={report.id || index}>
                            <Paper
                              elevation={0}
                              sx={{
                                mb: 2,
                                p: 2,
                                borderRadius: 2,
                                bgcolor: alpha('#4F46E5', 0.02),
                                border: `1px solid ${alpha('#4F46E5', 0.05)}`,
                                transition: 'all 0.3s',
                                '&:hover': { bgcolor: alpha('#4F46E5', 0.05) }
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar sx={{ bgcolor: report.status === 'RESOLVED' ? alpha('#10B981', 0.1) : alpha('#F59E0B', 0.1) }}>
                                    {report.status === 'RESOLVED' ? <CheckCircleIcon sx={{ color: '#10B981' }} /> : <ScheduleIcon sx={{ color: '#F59E0B' }} />}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{report.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatDistance(new Date(report.createdAt), new Date(), { addSuffix: true })}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Chip
                                  label={report.status}
                                  size="small"
                                  sx={{
                                    bgcolor: report.status === 'RESOLVED' ? alpha('#10B981', 0.1) : alpha('#F59E0B', 0.1),
                                    color: report.status === 'RESOLVED' ? '#10B981' : '#F59E0B',
                                    fontWeight: 600
                                  }}
                                />
                              </Box>
                            </Paper>
                          </Grow>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <ReportIcon sx={{ fontSize: 64, color: alpha('#4F46E5', 0.2), mb: 2 }} />
                        <Typography color="textSecondary">No recent activity</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate(user?.role === 'Admin' ? '/admin/reports' : '/citizen/my-reports')}
                        sx={{ borderRadius: 2, borderColor: alpha('#4F46E5', 0.5), color: '#4F46E5' }}
                      >
                        View All Reports
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Rewards Tab */}
                {tabValue === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ color: '#4F46E5', fontWeight: 600, mb: 3 }}>
                      Rewards & Achievements
                    </Typography>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid item xs={12} md={4}>
                        <Zoom in timeout={500}>
                          <Card sx={{ textAlign: 'center', p: 3, borderRadius: 3, background: alpha('#F59E0B', 0.05), border: `1px solid ${alpha('#F59E0B', 0.1)}` }}>
                            <EmojiEventsIcon sx={{ fontSize: 50, color: '#F59E0B', mb: 1 }} />
                            <Typography variant="h3" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                              <CountUp end={userData?.rewards?.points || 0} duration={2} />
                            </Typography>
                            <Typography color="textSecondary">Total Points</Typography>
                          </Card>
                        </Zoom>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Zoom in timeout={500} style={{ transitionDelay: '100ms' }}>
                          <Card sx={{ textAlign: 'center', p: 3, borderRadius: 3, background: alpha('#4F46E5', 0.05), border: `1px solid ${alpha('#4F46E5', 0.1)}` }}>
                            <BadgeIcon sx={{ fontSize: 50, color: '#4F46E5', mb: 1 }} />
                            <Typography variant="h3" sx={{ fontWeight: 700, color: '#4F46E5' }}>
                              <CountUp end={userData?.rewards?.level || 1} duration={2} />
                            </Typography>
                            <Typography color="textSecondary">Current Level</Typography>
                          </Card>
                        </Zoom>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Zoom in timeout={500} style={{ transitionDelay: '200ms' }}>
                          <Card sx={{ textAlign: 'center', p: 3, borderRadius: 3, background: alpha('#10B981', 0.05), border: `1px solid ${alpha('#10B981', 0.1)}` }}>
                            <RecyclingIcon sx={{ fontSize: 50, color: '#10B981', mb: 1 }} />
                            <Typography variant="h3" sx={{ fontWeight: 700, color: '#10B981' }}>
                              <CountUp end={userData?.rewards?.badges?.length || 0} duration={2} />
                            </Typography>
                            <Typography color="textSecondary">Badges Earned</Typography>
                          </Card>
                        </Zoom>
                      </Grid>
                    </Grid>

                    <Typography variant="h6" gutterBottom sx={{ color: '#4F46E5', fontWeight: 600 }}>
                      Badges
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {userData?.rewards?.badges && userData.rewards.badges.length > 0 ? (
                        userData.rewards.badges.map((badge, index) => (
                          <Grow in timeout={500} key={index}>
                            <Chip
                              icon={<EmojiEventsIcon />}
                              label={badge.name}
                              sx={{
                                bgcolor: alpha('#4F46E5', 0.1),
                                color: '#4F46E5',
                                fontWeight: 500,
                                '&:hover': { transform: 'scale(1.05)' }
                              }}
                            />
                          </Grow>
                        ))
                      ) : (
                        <Typography color="textSecondary">No badges earned yet</Typography>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Recycling Tab */}
                {tabValue === 3 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ color: '#4F46E5', fontWeight: 600, mb: 3 }}>
                      Recycling Statistics
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Card sx={{ p: 3, borderRadius: 3, background: alpha('#10B981', 0.05), border: `1px solid ${alpha('#10B981', 0.1)}` }}>
                          <Typography variant="subtitle1" gutterBottom color="#10B981">Material Distribution</Typography>
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={materialData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {materialData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Card sx={{ p: 3, borderRadius: 3, background: alpha('#3B82F6', 0.05), border: `1px solid ${alpha('#3B82F6', 0.1)}` }}>
                          <Typography variant="subtitle1" gutterBottom color="#3B82F6">Monthly Trend</Typography>
                          <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={activityData}>
                              <CartesianGrid strokeDasharray="3 3" stroke={alpha('#4F46E5', 0.1)} />
                              <XAxis dataKey="month" stroke="#64748B" />
                              <YAxis stroke="#64748B" />
                              <RechartsTooltip />
                              <Area type="monotone" dataKey="recycling" stroke="#10B981" fill={alpha('#10B981', 0.2)} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Analytics Tab */}
                {tabValue === 4 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ color: '#4F46E5', fontWeight: 600, mb: 3 }}>
                      Performance Analytics
                    </Typography>
                    <Card sx={{ p: 3, borderRadius: 3, background: alpha('#4F46E5', 0.02), border: `1px solid ${alpha('#4F46E5', 0.1)}` }}>
                      <Typography variant="subtitle1" gutterBottom color="#4F46E5">Reports & Recycling Trend</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={activityData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={alpha('#4F46E5', 0.1)} />
                          <XAxis dataKey="month" stroke="#64748B" />
                          <YAxis stroke="#64748B" />
                          <RechartsTooltip />
                          <Bar dataKey="reports" fill="#4F46E5" name="Reports" radius={[8, 8, 0, 0]} />
                          <Bar dataKey="recycling" fill="#10B981" name="Recycling (kg)" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </Box>
                )}

                {/* Security Tab */}
                {tabValue === 5 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ color: '#4F46E5', fontWeight: 600, mb: 3 }}>
                      Security Settings
                    </Typography>
                    <List sx={{ bgcolor: alpha('#4F46E5', 0.02), borderRadius: 3 }}>
                      <ListItem
                        secondaryAction={
                          <Button variant="outlined" size="small" sx={{ borderRadius: 2, borderColor: alpha('#4F46E5', 0.5), color: '#4F46E5' }}>Change</Button>
                        }
                      >
                        <ListItemIcon>
                          <SecurityIcon sx={{ color: '#4F46E5' }} />
                        </ListItemIcon>
                        <ListItemText primary="Password" secondary="Last changed 30 days ago" />
                      </ListItem>
                      <Divider component="li" />
                      <ListItem
                        secondaryAction={
                          <Button variant="outlined" size="small" sx={{ borderRadius: 2, borderColor: alpha('#4F46E5', 0.5), color: '#4F46E5' }}>Enable</Button>
                        }
                      >
                        <ListItemIcon>
                          <SecurityIcon sx={{ color: '#4F46E5' }} />
                        </ListItemIcon>
                        <ListItemText primary="Two-Factor Authentication" secondary="Not enabled - Recommended for better security" />
                      </ListItem>
                    </List>
                  </Box>
                )}

                {/* Notifications Tab */}
                {tabValue === 6 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ color: '#4F46E5', fontWeight: 600, mb: 3 }}>
                      Notification Preferences
                    </Typography>
                    <List sx={{ bgcolor: alpha('#4F46E5', 0.02), borderRadius: 3 }}>
                      <ListItem
                        secondaryAction={
                          <Button variant="outlined" size="small" sx={{ borderRadius: 2, borderColor: alpha('#4F46E5', 0.5), color: '#4F46E5' }}>Configure</Button>
                        }
                      >
                        <ListItemText primary="Email Notifications" secondary="Receive updates via email" />
                      </ListItem>
                      <Divider component="li" />
                      <ListItem
                        secondaryAction={
                          <Button variant="outlined" size="small" sx={{ borderRadius: 2, borderColor: alpha('#4F46E5', 0.5), color: '#4F46E5' }}>Configure</Button>
                        }
                      >
                        <ListItemText primary="SMS Notifications" secondary="Receive updates via SMS" />
                      </ListItem>
                      <Divider component="li" />
                      <ListItem
                        secondaryAction={
                          <Button variant="outlined" size="small" sx={{ borderRadius: 2, borderColor: alpha('#4F46E5', 0.5), color: '#4F46E5' }}>Configure</Button>
                        }
                      >
                        <ListItemText primary="Push Notifications" secondary="Receive updates in browser" />
                      </ListItem>
                    </List>
                  </Box>
                )}
              </motion.div>
            </AnimatePresence>
          </Paper>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default ProfilePage;