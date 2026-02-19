import React from 'react';
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
  useMediaQuery
} from '@mui/material';
import {
  Delete,
  Recycling,
  EmojiEvents,
  LocationOn,
  CloudUpload,
  Speed,
  Menu as MenuIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: <CloudUpload sx={{ fontSize: 40 }} />,
    title: '4-Step Reporting',
    description: 'Report issues in seconds with photo capture and AI categorization'
  },
  {
    icon: <Speed sx={{ fontSize: 40 }} />,
    title: 'Real-time Tracking',
    description: 'Track your complaints with live status updates and SLA monitoring'
  },
  {
    icon: <EmojiEvents sx={{ fontSize: 40 }} />,
    title: 'Rewards & Badges',
    description: 'Earn points and badges for keeping your community clean'
  },
  {
    icon: <Recycling sx={{ fontSize: 40 }} />,
    title: 'Recycling Guide',
    description: 'Learn how to recycle properly with AI-powered waste classification'
  },
  {
    icon: <LocationOn sx={{ fontSize: 40 }} />,
    title: 'Nearby Facilities',
    description: 'Find recycling centers and public toilets near you'
  },
  {
    icon: <Delete sx={{ fontSize: 40 }} />,
    title: 'Smart Bins',
    description: 'IoT-enabled bins with real-time fill level monitoring'
  }
];

const stats = [
  { label: 'Active Users', value: '50K+' },
  { label: 'Reports Resolved', value: '100K+' },
  { label: 'Recycled (kg)', value: '500K+' },
  { label: 'CO₂ Saved (tons)', value: '10K+' }
];

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  return (
    <Box>
      {/* Navigation */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            ♻️ Smart Waste
          </Typography>
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit">Features</Button>
              <Button color="inherit">How It Works</Button>
              <Button color="inherit">Contact</Button>
            </Box>
          )}
          <Button 
            variant="contained" 
            sx={{ ml: 2 }}
            onClick={() => navigate('/login')}
          >
            Get Started
          </Button>
          {isMobile && (
            <IconButton>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(45deg, #2E7D32 30%, #1976D2 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2
                }}
              >
                Smart Waste Management
              </Typography>
              <Typography variant="h5" color="text.secondary" paragraph>
                Join thousands of citizens making their city cleaner and greener with our AI-powered waste management system.
              </Typography>
              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate('/register')}
                >
                  Start Reporting
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => navigate('/about')}
                >
                  Learn More
                </Button>
              </Box>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Box
                component="img"
                src="/hero-illustration.svg"
                alt="Smart Waste Management"
                sx={{ width: '100%', maxHeight: 400 }}
              />
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'primary.main', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Box sx={{ textAlign: 'center', color: 'white' }}>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="h6">
                      {stat.label}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h3" 
          align="center" 
          gutterBottom
          sx={{ fontWeight: 700, mb: 6 }}
        >
          Why Choose Smart Waste?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardContent>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main',
                        width: 60,
                        height: 60,
                        mb: 2
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h5" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
            Ready to Make a Difference?
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Join the smart waste management revolution today. Start reporting issues and earn rewards for keeping your city clean.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/register')}
            sx={{ mt: 2 }}
          >
            Get Started Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;