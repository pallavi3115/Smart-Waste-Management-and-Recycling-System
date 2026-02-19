import React, { useState, useEffect, useCallback } from 'react'; // Add useCallback
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
  Badge
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
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { formatDistance } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, showError, showLoading, dismissToast } from '../../utils/toast';
import CountUp from 'react-countup';

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

const ProfilePage = () => {
  const theme = useTheme();
  const { user } = useAuth(); // Remove updateUser if not used
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [profileError, setProfileError] = useState(''); // Renamed from error to profileError
  const [tabValue, setTabValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Define fetchProfileData with useCallback to avoid dependency issues
  const fetchProfileData = useCallback(async () => {
    const toastId = showLoading('Loading profile data...');
    try {
      setLoading(true);
      console.log('Fetching profile data...');
      const response = await userService.getProfile();
      console.log('Profile data received:', response.data);
      setProfileData(response.data);
      setProfileError('');
      dismissToast(toastId);
      showSuccess('Profile loaded successfully!');
    } catch (err) {
      console.error('Profile error:', err);
      dismissToast(toastId);
      setProfileError('Failed to load profile data. Using local data.');
      showError('Could not fetch profile data. Showing cached version.');
      // Fallback to local user data
      setProfileData(user);
    } finally {
      setLoading(false);
    }
  }, [user]); // Add user as dependency

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]); // Now includes fetchProfileData in dependencies

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleShare = () => {
    // Share profile (mock)
    showSuccess('Profile link copied to clipboard!');
  };

  const handleDownloadReport = () => {
    showLoading('Generating report...');
    setTimeout(() => {
      dismissToast();
      showSuccess('Report downloaded successfully!');
    }, 2000);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <LinearProgress color="primary" />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography variant="h6" color="textSecondary">
            Loading profile...
          </Typography>
        </Box>
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
            elevation={3}
            sx={{ 
              p: 3, 
              mb: 3,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}05 100%)`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Decorative background */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${theme.palette.primary.main}20 0%, transparent 70%)`,
                zIndex: 0
              }}
            />
            
            <Grid container spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
              <Grid item>
                <Zoom in timeout={500}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Tooltip title="Verified Account">
                        <VerifiedIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
                      </Tooltip>
                    }
                  >
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        bgcolor: 'primary.main',
                        fontSize: '3.5rem',
                        border: `4px solid ${theme.palette.background.paper}`,
                        boxShadow: theme.shadows[3]
                      }}
                    >
                      {userData?.name?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                  </Badge>
                </Zoom>
              </Grid>
              <Grid item xs>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {userData?.name || 'User'}
                  </Typography>
                  {userData?.role === 'Admin' && (
                    <Chip
                      icon={<StarIcon />}
                      label="Admin"
                      color="warning"
                      size="small"
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip
                    icon={<BadgeIcon />}
                    label={userData?.role || 'Citizen'}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    icon={<EmailIcon />}
                    label={userData?.email || 'No email'}
                    variant="outlined"
                    size="small"
                  />
                  {userData?.phoneNumber && (
                    <Chip
                      icon={<PhoneIcon />}
                      label={userData.phoneNumber}
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Member since {userData?.createdAt ? 
                    formatDistance(new Date(userData.createdAt), new Date(), { addSuffix: true }) : 
                    'Recently'}
                </Typography>
              </Grid>
              <Grid item>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Refresh Profile">
                    <IconButton 
                      onClick={handleRefresh} 
                      disabled={refreshing}
                      sx={{ 
                        bgcolor: theme.palette.background.paper,
                        boxShadow: theme.shadows[1]
                      }}
                    >
                      <TimelineIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Share Profile">
                    <IconButton 
                      onClick={handleShare}
                      sx={{ 
                        bgcolor: theme.palette.background.paper,
                        boxShadow: theme.shadows[1]
                      }}
                    >
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download Report">
                    <IconButton 
                      onClick={handleDownloadReport}
                      sx={{ 
                        bgcolor: theme.palette.background.paper,
                        boxShadow: theme.shadows[1]
                      }}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => navigate('/profile/edit')}
                    sx={{
                      ml: 1,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                    }}
                  >
                    Edit Profile
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants}>
          <Paper 
            sx={{ 
              mb: 3,
              borderRadius: 3,
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
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  }
                }
              }}
            >
              <Tab label="Personal Info" icon={<PersonIcon />} iconPosition="start" />
              <Tab label="Activity" icon={<ReportIcon />} iconPosition="start" />
              <Tab label="Rewards" icon={<EmojiEventsIcon />} iconPosition="start" />
              <Tab label="Recycling" icon={<RecyclingIcon />} iconPosition="start" />
              <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
              <Tab label="Notifications" icon={<NotificationsIcon />} iconPosition="start" />
            </Tabs>
          </Paper>
        </motion.div>

        {/* Tab Content */}
        <motion.div variants={itemVariants}>
          <Paper 
            sx={{ 
              p: 4,
              borderRadius: 4,
              minHeight: 400
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
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                      Personal Information
                    </Typography>
                    <Grid container spacing={4}>
                      <Grid item xs={12} md={6}>
                        <List>
                          <ListItem>
                            <ListItemIcon>
                              <PersonIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Full Name"
                              secondary={userData?.name || 'Not provided'}
                              primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary' }}
                              secondaryTypographyProps={{ variant: 'body1' }}
                            />
                          </ListItem>
                          <Divider variant="inset" component="li" />
                          <ListItem>
                            <ListItemIcon>
                              <EmailIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Email"
                              secondary={userData?.email || 'Not provided'}
                              primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary' }}
                              secondaryTypographyProps={{ variant: 'body1' }}
                            />
                          </ListItem>
                          <Divider variant="inset" component="li" />
                          <ListItem>
                            <ListItemIcon>
                              <PhoneIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Phone Number"
                              secondary={userData?.phoneNumber || 'Not provided'}
                              primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary' }}
                              secondaryTypographyProps={{ variant: 'body1' }}
                            />
                          </ListItem>
                        </List>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <List>
                          <ListItem>
                            <ListItemIcon>
                              <LocationOnIcon color="primary" />
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
                              secondaryTypographyProps={{ variant: 'body1' }}
                            />
                          </ListItem>
                          <Divider variant="inset" component="li" />
                          <ListItem>
                            <ListItemIcon>
                              <CalendarIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Member Since"
                              secondary={userData?.createdAt ? 
                                formatDistance(new Date(userData.createdAt), new Date(), { addSuffix: true }) : 
                                'Recently'
                              }
                              primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary' }}
                              secondaryTypographyProps={{ variant: 'body1' }}
                            />
                          </ListItem>
                          <Divider variant="inset" component="li" />
                          <ListItem>
                            <ListItemIcon>
                              <BadgeIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Account Type"
                              secondary={userData?.role || 'Citizen'}
                              primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary' }}
                              secondaryTypographyProps={{ variant: 'body1' }}
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
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                      Recent Activity
                    </Typography>
                    {userData?.reports && userData.reports.length > 0 ? (
                      <List>
                        {userData.reports.slice(0, 5).map((report, index) => (
                          <Grow in timeout={500} key={report.id || index}>
                            <ListItem
                              secondaryAction={
                                <Chip
                                  label={report.status}
                                  size="small"
                                  color={report.status === 'RESOLVED' ? 'success' : 'warning'}
                                />
                              }
                            >
                              <ListItemIcon>
                                <ReportIcon color={report.status === 'RESOLVED' ? 'success' : 'warning'} />
                              </ListItemIcon>
                              <ListItemText
                                primary={report.title}
                                secondary={formatDistance(new Date(report.createdAt), new Date(), { addSuffix: true })}
                              />
                            </ListItem>
                          </Grow>
                        ))}
                      </List>
                    ) : (
                      <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                        No recent activity
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate(user?.role === 'Admin' ? '/admin/reports' : '/citizen/my-reports')}
                      >
                        View All Reports
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Rewards Tab */}
                {tabValue === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                      Rewards & Achievements
                    </Typography>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid item xs={12} md={4}>
                        <Zoom in timeout={500}>
                          <Card sx={{ textAlign: 'center', p: 2 }}>
                            <CardContent>
                              <EmojiEventsIcon sx={{ fontSize: 60, color: 'gold', mb: 1 }} />
                              <Typography variant="h3" sx={{ fontWeight: 700, color: 'gold' }}>
                                <CountUp end={userData?.rewards?.points || 0} duration={2} />
                              </Typography>
                              <Typography color="textSecondary">Total Points</Typography>
                            </CardContent>
                          </Card>
                        </Zoom>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Zoom in timeout={500} style={{ transitionDelay: '100ms' }}>
                          <Card sx={{ textAlign: 'center', p: 2 }}>
                            <CardContent>
                              <BadgeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
                              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                <CountUp end={userData?.rewards?.level || 1} duration={2} />
                              </Typography>
                              <Typography color="textSecondary">Current Level</Typography>
                            </CardContent>
                          </Card>
                        </Zoom>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Zoom in timeout={500} style={{ transitionDelay: '200ms' }}>
                          <Card sx={{ textAlign: 'center', p: 2 }}>
                            <CardContent>
                              <RecyclingIcon sx={{ fontSize: 60, color: 'success.main', mb: 1 }} />
                              <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                                <CountUp end={userData?.rewards?.badges?.length || 0} duration={2} />
                              </Typography>
                              <Typography color="textSecondary">Badges Earned</Typography>
                            </CardContent>
                          </Card>
                        </Zoom>
                      </Grid>
                    </Grid>

                    <Typography variant="h6" gutterBottom>
                      Badges
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {userData?.rewards?.badges && userData.rewards.badges.length > 0 ? (
                        userData.rewards.badges.map((badge, index) => (
                          <Grow in timeout={500} key={index}>
                            <Chip
                              icon={<EmojiEventsIcon />}
                              label={badge.name}
                              color="primary"
                              variant="outlined"
                              sx={{ 
                                p: 2,
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  transition: 'transform 0.2s'
                                }
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
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                      Recycling Statistics
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Card sx={{ 
                          background: `linear-gradient(135deg, ${theme.palette.success.light}20 0%, ${theme.palette.success.main}10 100%)`,
                        }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom color="success.main">
                              Total Recycled
                            </Typography>
                            <Typography variant="h2" color="success.main" sx={{ fontWeight: 700 }}>
                              <CountUp end={userData?.recycling?.total || 0} duration={2} /> kg
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Card sx={{ 
                          background: `linear-gradient(135deg, ${theme.palette.info.light}20 0%, ${theme.palette.info.main}10 100%)`,
                        }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom color="info.main">
                              CO₂ Saved
                            </Typography>
                            <Typography variant="h2" color="info.main" sx={{ fontWeight: 700 }}>
                              <CountUp end={userData?.recycling?.co2Saved || 0} duration={2} /> kg
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Security Tab */}
                {tabValue === 4 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                      Security Settings
                    </Typography>
                    <List>
                      <ListItem
                        secondaryAction={
                          <Button variant="outlined" size="small">Change</Button>
                        }
                      >
                        <ListItemIcon>
                          <SecurityIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Password"
                          secondary="Last changed 30 days ago"
                        />
                      </ListItem>
                      <Divider component="li" />
                      <ListItem
                        secondaryAction={
                          <Button variant="outlined" size="small">Enable</Button>
                        }
                      >
                        <ListItemIcon>
                          <SecurityIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Two-Factor Authentication"
                          secondary="Not enabled - Recommended for better security"
                        />
                      </ListItem>
                    </List>
                  </Box>
                )}

                {/* Notifications Tab */}
                {tabValue === 5 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                      Notification Preferences
                    </Typography>
                    <List>
                      <ListItem
                        secondaryAction={
                          <Button variant="outlined" size="small">Configure</Button>
                        }
                      >
                        <ListItemText
                          primary="Email Notifications"
                          secondary="Receive updates via email"
                        />
                      </ListItem>
                      <Divider component="li" />
                      <ListItem
                        secondaryAction={
                          <Button variant="outlined" size="small">Configure</Button>
                        }
                      >
                        <ListItemText
                          primary="SMS Notifications"
                          secondary="Receive updates via SMS"
                        />
                      </ListItem>
                      <Divider component="li" />
                      <ListItem
                        secondaryAction={
                          <Button variant="outlined" size="small">Configure</Button>
                        }
                      >
                        <ListItemText
                          primary="Push Notifications"
                          secondary="Receive updates in browser"
                        />
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