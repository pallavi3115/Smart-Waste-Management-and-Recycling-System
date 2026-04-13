import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Fade,
  Zoom,
  Paper,
  Stack,
  LinearProgress,
  Badge,
  alpha
} from '@mui/material';
import {
  Delete,
  Recycling,
  EmojiEvents,
  LocationOn,
  CloudUpload,
  Speed,
  Menu as MenuIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  SmartToy as SmartToyIcon,
  People as PeopleIcon,
  Verified as VerifiedIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  Timeline as TimelineIcon,
  QrCodeScanner as QrCodeScannerIcon,
  NotificationsActive as NotificationsActiveIcon,
  Map as MapIcon,
  Security as SecurityIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const scaleOnHover = {
  whileHover: { scale: 1.05, transition: { duration: 0.3 } },
  whileTap: { scale: 0.95 }
};

// Feature data
const features = [
  {
    icon: <CloudUpload sx={{ fontSize: 32 }} />,
    title: '4-Step Reporting',
    description: 'Report issues in seconds with photo capture and AI categorization',
    color: '#4F46E5',
    gradient: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    detailedDescription: 'Our streamlined 4-step process makes reporting waste issues quick and easy.',
    steps: ['Capture Photo', 'AI Categorization', 'Add Details', 'Submit Report'],
    benefits: ['Save time', 'Reduce errors', 'Track progress', 'Earn points']
  },
  {
    icon: <Speed sx={{ fontSize: 32 }} />,
    title: 'Real-time Tracking',
    description: 'Track your complaints with live status updates and SLA monitoring',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    detailedDescription: 'Stay informed about your complaint progress with real-time tracking.',
    steps: ['Live Location', 'Status Updates', 'SLA Monitoring', 'Push Notifications'],
    benefits: ['Transparency', 'Timely resolution', 'Escalation options', 'Photo evidence']
  },
  {
    icon: <EmojiEvents sx={{ fontSize: 32 }} />,
    title: 'Rewards & Badges',
    description: 'Earn points and badges for keeping your community clean',
    color: '#D97706',
    gradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    detailedDescription: 'Get rewarded for your environmental contributions.',
    steps: ['Earn Points', 'Unlock Badges', 'Leaderboards', 'Redeem Rewards'],
    benefits: ['Motivation', 'Recognition', 'Real rewards', 'Community impact']
  },
  {
    icon: <Recycling sx={{ fontSize: 32 }} />,
    title: 'Recycling Guide',
    description: 'Learn how to recycle properly with AI-powered waste classification',
    color: '#DC2626',
    gradient: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
    detailedDescription: 'Master the art of recycling with our intelligent guide.',
    steps: ['AI Classification', 'Educational Content', 'Material Guide', 'Find Centers'],
    benefits: ['Reduce contamination', 'Increase recycling', 'Environmental education', 'Track impact']
  },
  {
    icon: <LocationOn sx={{ fontSize: 32 }} />,
    title: 'Nearby Facilities',
    description: 'Find recycling centers and public toilets near you',
    color: '#0284C7',
    gradient: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
    detailedDescription: 'Locate essential waste management facilities in your area.',
    steps: ['GPS Location', 'Interactive Map', 'Facility Details', 'Get Directions'],
    benefits: ['Save time', 'Reduce dumping', 'Verified facilities', 'Real-time status']
  },
  {
    icon: <Delete sx={{ fontSize: 32 }} />,
    title: 'Smart Bins',
    description: 'IoT-enabled bins with real-time fill level monitoring',
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
    detailedDescription: 'Revolutionary smart bins for efficient waste collection.',
    steps: ['Fill Monitoring', 'Fire Detection', 'Route Optimization', 'Citizen Alerts'],
    benefits: ['Reduce overflow', 'Optimize routes', 'Save fuel', 'Better allocation']
  }
];

const stats = [
  { value: '50K+', label: 'Active Users', icon: <PeopleIcon />, trend: '+15%' },
  { value: '100K+', label: 'Reports Resolved', icon: <CheckCircleIcon />, trend: '+22%' },
  { value: '500K+', label: 'Recycled (kg)', icon: <Recycling />, trend: '+30%' },
  { value: '10K+', label: 'CO₂ Saved (tons)', icon: <TrendingUpIcon />, trend: '+18%' }
];

const testimonials = [
  { name: 'Rajesh Kumar', role: 'Citizen', comment: 'This app has transformed how we manage waste in our community!', rating: 5, avatar: 'R' },
  { name: 'Priya Sharma', role: 'Environmental Activist', comment: 'The AI categorization is incredibly accurate and helpful.', rating: 5, avatar: 'P' },
  { name: 'Amit Patel', role: 'Municipal Officer', comment: 'Real-time tracking has improved our response time significantly.', rating: 4, avatar: 'A' }
];

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenDialog = (feature) => {
    setSelectedFeature(feature);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFeature(null);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      {/* Animated Background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: 'radial-gradient(circle at 0% 0%, rgba(79, 70, 229, 0.05) 0%, transparent 50%)',
        }}
      />

      {/* Navigation Bar */}
      <AppBar 
        position="fixed" 
        elevation={scrolled ? 8 : 0}
        sx={{ 
          backgroundColor: scrolled ? alpha(theme.palette.background.paper, 0.95) : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          transition: 'all 0.3s ease',
          borderBottom: scrolled ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => scrollToSection('hero')}>
              <Recycling sx={{ color: 'primary.main', fontSize: 32 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                SmartWaste
              </Typography>
            </Box>
          </motion.div>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 4 }}>
              {['Features', 'How It Works', 'Testimonials'].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Button 
                    color="inherit" 
                    onClick={() => scrollToSection(item.toLowerCase().replace(/\s/g, '-'))}
                    sx={{ fontWeight: 500, '&:hover': { color: 'primary.main' } }}
                  >
                    {item}
                  </Button>
                </motion.div>
              ))}
            </Box>
          )}

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button 
              variant="contained" 
              onClick={() => navigate('/login')}
              sx={{ 
                borderRadius: 3,
                px: 3,
                py: 1,
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)'
                }
              }}
            >
              Get Started
            </Button>
          </motion.div>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box id="hero" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', pt: { xs: 8, md: 0 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={fadeInUp}>
                  <Chip 
                    label="✨ Welcome to the Future of Waste Management"
                    sx={{ 
                      mb: 3,
                      bgcolor: alpha('#4F46E5', 0.1),
                      color: '#4F46E5',
                      fontWeight: 600
                    }}
                  />
                </motion.div>
                
                <motion.div variants={fadeInUp}>
                  <Typography 
                    variant="h1" 
                    sx={{ 
                      fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                      fontWeight: 800,
                      lineHeight: 1.2,
                      mb: 2,
                      background: 'linear-gradient(135deg, #1E293B 0%, #4F46E5 50%, #7C3AED 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Smart Waste Management for Smart Cities
                  </Typography>
                </motion.div>
                
                <motion.div variants={fadeInUp}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                    Join thousands of citizens making their city cleaner and greener with our AI-powered waste management system.
                  </Typography>
                </motion.div>
                
                <motion.div variants={fadeInUp}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button 
                      variant="contained" 
                      size="large"
                      onClick={() => navigate('/register')}
                      endIcon={<ArrowForwardIcon />}
                      sx={{ 
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(79, 70, 229, 0.4)'
                        }
                      }}
                    >
                      Start Reporting
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="large"
                      onClick={() => scrollToSection('features')}
                      sx={{ 
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        borderColor: alpha('#4F46E5', 0.5),
                        '&:hover': {
                          borderColor: '#4F46E5',
                          backgroundColor: alpha('#4F46E5', 0.05)
                        }
                      }}
                    >
                      Learn More
                    </Button>
                  </Stack>
                </motion.div>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '10%',
                      left: '10%',
                      width: '80%',
                      height: '80%',
                      background: 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%)',
                      borderRadius: '50%',
                      zIndex: 0
                    }
                  }}
                >
                  <Box
                    component="img"
                    src="https://unsplash.com/photos/litter-signage-YzSZN3qvHeo"
                    alt="Smart Waste Management"
                    sx={{ 
                      width: '100%', 
                      maxHeight: 500, 
                      position: 'relative',
                      zIndex: 1,
                      filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.1))'
                    }}
                  />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8, bgcolor: alpha('#4F46E5', 0.02) }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      background: alpha('#4F46E5', 0.05),
                      borderRadius: 4,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        background: alpha('#4F46E5', 0.08),
                        borderColor: alpha('#4F46E5', 0.2)
                      }
                    }}
                  >
                    <Avatar sx={{ bgcolor: alpha('#4F46E5', 0.1), color: '#4F46E5', width: 56, height: 56, margin: '0 auto 16px' }}>
                      {stat.icon}
                    </Avatar>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {stat.label}
                    </Typography>
                    <Chip 
                      label={stat.trend} 
                      size="small" 
                      sx={{ 
                        bgcolor: alpha('#10B981', 0.1), 
                        color: '#10B981',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }} 
                    />
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container id="features" maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Typography 
            variant="h2" 
            align="center" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 800,
              mb: 2
            }}
          >
            Why Choose <Box component="span" sx={{ color: 'primary.main' }}>Smart Waste?</Box>
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}>
            Innovative features designed to revolutionize waste management in your city
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <Card 
                  onClick={() => handleOpenDialog(feature)}
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 4,
                    transition: 'all 0.3s',
                    background: `linear-gradient(135deg, ${alpha(feature.color, 0.05)} 0%, ${alpha(feature.color, 0.02)} 100%)`,
                    border: `1px solid ${alpha(feature.color, 0.1)}`,
                    '&:hover': {
                      boxShadow: `0 20px 40px ${alpha(feature.color, 0.15)}`,
                      borderColor: alpha(feature.color, 0.3)
                    }
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 100,
                      height: 100,
                      background: `radial-gradient(circle, ${alpha(feature.color, 0.1)} 0%, transparent 70%)`,
                      borderRadius: '0 0 0 100%'
                    }}
                  />
                  <CardContent sx={{ p: 4 }}>
                    <Avatar 
                      sx={{ 
                        background: feature.gradient,
                        width: 64,
                        height: 64,
                        mb: 3,
                        boxShadow: `0 8px 20px ${alpha(feature.color, 0.3)}`
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      {feature.description}
                    </Typography>
                    <Button 
                      size="small" 
                      endIcon={<ArrowForwardIcon />}
                      sx={{ 
                        color: feature.color,
                        '&:hover': { bgcolor: alpha(feature.color, 0.1) }
                      }}
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box id="how-it-works" sx={{ py: { xs: 6, md: 10 }, bgcolor: alpha('#4F46E5', 0.02) }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography 
              variant="h2" 
              align="center" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 800,
                mb: 2
              }}
            >
              How It <Box component="span" sx={{ color: 'primary.main' }}>Works</Box>
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}>
              Simple 4-step process to report and resolve waste issues
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {[
              { step: '01', title: 'Report', description: 'Citizens report waste issues via app', icon: <CloudUpload /> },
              { step: '02', title: 'Verify', description: 'AI verifies and categorizes the report', icon: <VerifiedIcon /> },
              { step: '03', title: 'Assign', description: 'Assigned to nearest collection team', icon: <PeopleIcon /> },
              { step: '04', title: 'Resolve', description: 'Issue resolved and citizen notified', icon: <CheckCircleIcon /> }
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      position: 'relative',
                      borderRadius: 4,
                      background: alpha('#4F46E5', 0.05),
                      border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        background: alpha('#4F46E5', 0.08),
                        borderColor: alpha('#4F46E5', 0.2)
                      }
                    }}
                  >
                    <Typography variant="h2" sx={{ position: 'absolute', top: 10, right: 20, opacity: 0.1, fontWeight: 800, fontSize: '4rem' }}>
                      {item.step}
                    </Typography>
                    <Avatar sx={{ bgcolor: '#4F46E5', width: 64, height: 64, margin: '0 auto 16px' }}>
                      {item.icon}
                    </Avatar>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                      {item.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {item.description}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Container id="testimonials" maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Typography 
            variant="h2" 
            align="center" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 800,
              mb: 2
            }}
          >
            What Our <Box component="span" sx={{ color: 'primary.main' }}>Users Say</Box>
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}>
            Trusted by thousands of citizens and municipalities
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card sx={{ 
                  height: '100%', 
                  p: 3, 
                  borderRadius: 4,
                  background: alpha('#4F46E5', 0.02),
                  border: `1px solid ${alpha('#4F46E5', 0.1)}`
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#4F46E5', width: 56, height: 56 }}>
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{testimonial.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{testimonial.role}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', minHeight: 80 }}>
                    "{testimonial.comment}"
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} sx={{ color: '#F59E0B', fontSize: 20 }} />
                    ))}
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', position: 'relative', overflow: 'hidden' }}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, color: 'white', mb: 2 }}>
              Ready to Make a Difference?
            </Typography>
            <Typography variant="h6" sx={{ color: alpha('#fff', 0.9), mb: 4, maxWidth: 500, mx: 'auto' }}>
              Join the smart waste management revolution today. Start reporting issues and earn rewards for keeping your city clean.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/register')}
              sx={{ 
                bgcolor: 'white',
                color: '#4F46E5',
                px: 6,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: 3,
                '&:hover': {
                  bgcolor: alpha('#fff', 0.9),
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }
              }}
            >
              Get Started Now
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, bgcolor: '#0F172A', color: '#94A3B8' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Recycling sx={{ color: '#4F46E5' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>SmartWaste</Typography>
              </Box>
              <Typography variant="body2">
                Making cities cleaner and greener with AI-powered waste management solutions.
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={4}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>Product</Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#4F46E5' } }}>Features</Typography>
                    <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#4F46E5' } }}>Pricing</Typography>
                    <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#4F46E5' } }}>FAQ</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>Company</Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#4F46E5' } }}>About Us</Typography>
                    <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#4F46E5' } }}>Contact</Typography>
                    <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#4F46E5' } }}>Privacy Policy</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>Support</Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#4F46E5' } }}>Help Center</Typography>
                    <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#4F46E5' } }}>Community</Typography>
                    <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#4F46E5' } }}>Status</Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, borderColor: alpha('#94A3B8', 0.2) }} />
          <Typography variant="body2" align="center">
            © 2024 SmartWaste. All rights reserved.
          </Typography>
        </Container>
      </Box>

      {/* Feature Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 500 }}
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        {selectedFeature && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ background: selectedFeature.gradient, width: 56, height: 56 }}>
                    {selectedFeature.icon}
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {selectedFeature.title}
                  </Typography>
                </Box>
                <IconButton onClick={handleCloseDialog} sx={{ bgcolor: alpha('#4F46E5', 0.1) }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <Divider />
            <DialogContent>
              <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                {selectedFeature.detailedDescription}
              </Typography>

              <Typography variant="h6" gutterBottom sx={{ color: selectedFeature.color, fontWeight: 600 }}>
                How it works:
              </Typography>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {selectedFeature.steps.map((step, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: alpha(selectedFeature.color, 0.05) }}>
                      <Avatar sx={{ bgcolor: selectedFeature.color, width: 32, height: 32 }}>{idx + 1}</Avatar>
                      <Typography variant="body1">{step}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ color: selectedFeature.color, fontWeight: 600 }}>
                Key Benefits:
              </Typography>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {selectedFeature.benefits.map((benefit, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: '#10B981', fontSize: 20 }} />
                      <Typography variant="body2">{benefit}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCloseDialog} variant="contained" sx={{ background: selectedFeature.gradient }}>
                Got it
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default LandingPage;