import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
  Skeleton,
  Divider,
  Tooltip,
  Stack,
  Avatar,
  LinearProgress,
  Fade
} from '@mui/material';
import {
  Recycling as RecyclingIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  LocalDrink as WaterIcon,
  EnergySavingsLeaf as EnergyIcon,
  EmojiEvents as RewardIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  ArrowForward as ArrowForwardIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { showSuccess } from '../../utils/toast';
import CountUp from 'react-countup';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

// Recycling statistics
const recyclingStats = {
  totalRecycled: 1250000,
  co2Saved: 85000,
  waterSaved: 2500000,
  energySaved: 1500000,
  treesSaved: 12500
};

// Resource links for each material type
const getResourceLink = (materialName) => {
  const links = {
    'Plastic': 'https://www.epa.gov/recycle/recycling-basics#plastics',
    'Glass': 'https://www.gpi.org/recycling-glass-facts',
    'Paper': 'https://www.epa.gov/recycle/recycling-basics#paper',
    'Metal': 'https://www.epa.gov/recycle/recycling-basics#metals',
    'E-Waste': 'https://www.epa.gov/recycle/electronics-donation-and-recycling',
    'Organic': 'https://www.epa.gov/recycle/composting-home'
  };
  return links[materialName] || 'https://www.epa.gov/recycle/recycling-basics';
};

// External resource links
const externalResources = {
  recycleCoach: 'https://recyclecoach.com',
  earth911: 'https://earth911.com',
  epaRecycling: 'https://www.epa.gov/recycle'
};

const RecyclingGuide = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showImpact, setShowImpact] = useState(false);

  const handleLearnMore = (materialName) => {
    const url = getResourceLink(materialName);
    window.open(url, '_blank', 'noopener noreferrer');
  };

  const materials = [
    { 
      id: 1,
      name: 'Plastic', 
      icon: '🥤',
      color: '#FF6B6B',
      bgGradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
      tips: [
        'Rinse containers before recycling',
        'Remove caps and labels',
        'Check for recycling symbol (♻️)',
        'Flatten bottles to save space'
      ],
      recyclable: true,
      impact: { co2Saved: 1.5, waterSaved: 100, energySaved: 20 },
      funFact: 'Recycling one ton of plastic saves 5,774 kWh of energy!'
    },
    { 
      id: 2,
      name: 'Glass', 
      icon: '🥃',
      color: '#4ECDC4',
      bgGradient: 'linear-gradient(135deg, #4ECDC4 0%, #6EE7DE 100%)',
      tips: [
        'Rinse bottles and jars',
        'Remove caps and lids',
        'Separate by color (clear, green, brown)',
        'Do not break glass'
      ],
      recyclable: true,
      impact: { co2Saved: 0.8, waterSaved: 50, energySaved: 15 },
      funFact: 'Glass can be recycled infinitely without losing quality!'
    },
    { 
      id: 3,
      name: 'Paper', 
      icon: '📄',
      color: '#45B7D1',
      bgGradient: 'linear-gradient(135deg, #45B7D1 0%, #6EC8E0 100%)',
      tips: [
        'Keep paper dry and clean',
        'Flatten cardboard boxes',
        'Remove plastic windows from envelopes',
        'Shred sensitive documents'
      ],
      recyclable: true,
      impact: { co2Saved: 2.0, waterSaved: 70, energySaved: 25 },
      funFact: 'Recycling one ton of paper saves 17 trees and 7,000 gallons of water!'
    },
    { 
      id: 4,
      name: 'Metal', 
      icon: '🥫',
      color: '#F7B731',
      bgGradient: 'linear-gradient(135deg, #F7B731 0%, #F9C851 100%)',
      tips: [
        'Crush cans to save space',
        'Remove labels (optional)',
        'Rinse to avoid odors',
        'Separate aluminum from steel'
      ],
      recyclable: true,
      impact: { co2Saved: 3.0, waterSaved: 120, energySaved: 35 },
      funFact: 'Recycling aluminum saves 95% of the energy needed to make new aluminum!'
    },
    { 
      id: 5,
      name: 'E-Waste', 
      icon: '💻',
      color: '#A855F7',
      bgGradient: 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)',
      tips: [
        'Take to special e-waste centers',
        'Remove batteries separately',
        'Wipe personal data from devices',
        'Donate working electronics'
      ],
      recyclable: true,
      impact: { co2Saved: 4.0, waterSaved: 200, energySaved: 40 },
      funFact: 'E-waste contains gold, silver, and copper worth billions of dollars!'
    },
    { 
      id: 6,
      name: 'Organic', 
      icon: '🍎',
      color: '#10B981',
      bgGradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      tips: [
        'Compost at home or use green bins',
        'Cut into smaller pieces for faster composting',
        'Mix with dry leaves and paper',
        'Avoid meat and dairy in home compost'
      ],
      recyclable: true,
      impact: { co2Saved: 1.0, waterSaved: 30, energySaved: 5 },
      funFact: 'Composting reduces methane emissions from landfills by up to 50%!'
    }
  ];

  const categories = ['all', 'Plastic', 'Glass', 'Paper', 'Metal', 'E-Waste', 'Organic'];

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleShare = () => {
    showSuccess('Guide shared successfully!');
  };

  const handleDownload = () => {
    showSuccess('Guide downloaded successfully!');
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || material.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Recycling Guide</Typography>
        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 4, mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant="rectangular" height={480} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={fadeInUp}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Recycling Guide
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Learn how to recycle properly and make a difference for our environment
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Share Guide">
                <IconButton onClick={handleShare} sx={{ bgcolor: alpha('#4F46E5', 0.05) }}>
                  <ShareIcon sx={{ color: '#4F46E5' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download PDF">
                <IconButton onClick={handleDownload} sx={{ bgcolor: alpha('#4F46E5', 0.05) }}>
                  <DownloadIcon sx={{ color: '#4F46E5' }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </motion.div>

        {/* Impact Statistics */}
        <motion.div variants={fadeInUp}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha('#10B981', 0.08)} 0%, ${alpha('#34D399', 0.03)} 100%)`,
              border: `1px solid ${alpha('#10B981', 0.15)}`
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#10B981' }}>
                🌍 Our Collective Impact
              </Typography>
              <Button
                size="small"
                onClick={() => setShowImpact(!showImpact)}
                sx={{ color: '#10B981' }}
              >
                {showImpact ? 'Show Less' : 'Show More'}
              </Button>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
                    <CountUp end={recyclingStats.totalRecycled / 1000} duration={2} suffix="K" />
                  </Typography>
                  <Typography variant="caption">kg Recycled</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#3B82F6' }}>
                    <CountUp end={recyclingStats.co2Saved / 1000} duration={2} suffix="K" />
                  </Typography>
                  <Typography variant="caption">CO₂ Saved (kg)</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B5CF6' }}>
                    <CountUp end={recyclingStats.waterSaved / 1000} duration={2} suffix="K" />
                  </Typography>
                  <Typography variant="caption">Water Saved (L)</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                    <CountUp end={recyclingStats.treesSaved} duration={2} />
                  </Typography>
                  <Typography variant="caption">Trees Saved</Typography>
                </Box>
              </Grid>
            </Grid>
            
            {showImpact && (
              <Fade in={showImpact}>
                <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${alpha('#10B981', 0.1)}` }}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Together, we've made a significant impact on our environment! 
                    Every small action counts towards a sustainable future.
                  </Typography>
                </Box>
              </Fade>
            )}
          </Paper>
        </motion.div>

        {/* Search and Filter - FIXED */}
        <motion.div variants={fadeInUp}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 4,
              borderRadius: 4,
              background: alpha(theme.palette.background.paper, 0.95),
              border: `1px solid ${alpha('#4F46E5', 0.1)}`
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#4F46E5' }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {categories.map((category) => (
                    <Chip
                      key={category}
                      label={category === 'all' ? 'All Materials' : category}
                      onClick={() => setSelectedCategory(category)}
                      color={selectedCategory === category ? 'primary' : 'default'}
                      sx={{
                        bgcolor: selectedCategory === category ? '#4F46E5' : 'transparent',
                        color: selectedCategory === category ? 'white' : 'inherit',
                        '&:hover': {
                          bgcolor: selectedCategory === category ? '#4F46E5' : alpha('#4F46E5', 0.1)
                        }
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Materials Grid */}
        <Grid container spacing={3}>
          {filteredMaterials.map((material, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              key={material.id}
              sx={{ display: 'flex' }}
            >
              <motion.div
                variants={fadeInUp}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                style={{ width: '100%', height: '100%' }}
              >
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    background: alpha(theme.palette.background.paper, 0.95),
                    border: `1px solid ${alpha(material.color, 0.2)}`,
                    transition: 'all 0.3s',
                    height: '100%',
                    minHeight: 520,
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: `0 15px 30px ${alpha(material.color, 0.15)}`,
                      borderColor: alpha(material.color, 0.4)
                    }
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      p: 2.5,
                      background: material.bgGradient,
                      color: 'white',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      minHeight: 80
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography variant="h5" sx={{ fontSize: '2rem' }}>
                        {material.icon}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {material.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={material.recyclable ? 'Recyclable' : 'Check Locally'}
                      size="small"
                      sx={{ bgcolor: alpha('#fff', 0.25), color: 'white', fontWeight: 600 }}
                    />
                  </Box>

                  {/* Content */}
                  <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: material.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      💡 Recycling Tips
                    </Typography>
                    <Box sx={{ mb: 2.5 }}>
                      {material.tips.map((tip, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: material.color }} />
                          <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
                            {tip}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: material.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      🌱 Environmental Impact (per kg)
                    </Typography>
                    <Stack spacing={1.5} sx={{ mb: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <WaterIcon sx={{ fontSize: 18, color: '#3B82F6' }} />
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(material.impact.waterSaved / 200) * 100}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: alpha('#3B82F6', 0.1),
                              '& .MuiLinearProgress-bar': { bgcolor: '#3B82F6', borderRadius: 3 }
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 60, textAlign: 'right' }}>
                          {material.impact.waterSaved} L
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <EnergyIcon sx={{ fontSize: 18, color: '#F59E0B' }} />
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(material.impact.energySaved / 40) * 100}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: alpha('#F59E0B', 0.1),
                              '& .MuiLinearProgress-bar': { bgcolor: '#F59E0B', borderRadius: 3 }
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 60, textAlign: 'right' }}>
                          {material.impact.energySaved} kWh
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider sx={{ my: 1.5 }} />

                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(material.color, 0.05),
                        border: `1px solid ${alpha(material.color, 0.15)}`,
                        mt: 'auto'
                      }}
                    >
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, lineHeight: 1.4 }}>
                        <InfoIcon sx={{ fontSize: 18, color: material.color }} />
                        <span>{material.funFact}</span>
                      </Typography>
                    </Paper>
                  </CardContent>

                  <Box sx={{ p: 2.5, pt: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="medium"
                      endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                      onClick={() => handleLearnMore(material.name)}
                      sx={{
                        borderRadius: 2,
                        borderColor: alpha(material.color, 0.5),
                        color: material.color,
                        py: 1,
                        '&:hover': {
                          borderColor: material.color,
                          backgroundColor: alpha(material.color, 0.08)
                        }
                      }}
                    >
                      Learn More About {material.name} Recycling
                    </Button>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {filteredMaterials.length === 0 && (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
            <RecyclingIcon sx={{ fontSize: 64, color: alpha('#4F46E5', 0.3), mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No materials found</Typography>
            <Typography variant="body2" color="text.secondary">Try adjusting your search</Typography>
          </Paper>
        )}

        {/* External Resources Section */}
        <motion.div variants={fadeInUp}>
          <Paper
            elevation={0}
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha('#4F46E5', 0.05)} 0%, ${alpha('#7C3AED', 0.02)} 100%)`,
              border: `1px solid ${alpha('#4F46E5', 0.1)}`
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <RecyclingIcon sx={{ color: '#4F46E5' }} /> Additional Recycling Resources
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Find more detailed information from trusted sources:
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>
              <Button
                size="small"
                href={externalResources.epaRecycling}
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                sx={{ color: '#4F46E5' }}
              >
                EPA Recycling Basics
              </Button>
              <Button
                size="small"
                href={externalResources.earth911}
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                sx={{ color: '#4F46E5' }}
              >
                Earth911 Recycling Search
              </Button>
              <Button
                size="small"
                href={externalResources.recycleCoach}
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                sx={{ color: '#4F46E5' }}
              >
                Recycle Coach
              </Button>
            </Stack>
          </Paper>
        </motion.div>

        {/* Call to Action */}
        <motion.div variants={fadeInUp}>
          <Paper
            elevation={0}
            sx={{
              mt: 3,
              p: 3,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha('#10B981', 0.05)} 0%, ${alpha('#34D399', 0.02)} 100%)`,
              border: `1px solid ${alpha('#10B981', 0.1)}`,
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              🌟 Want to make a bigger impact?
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<RewardIcon />}
                onClick={() => window.location.href = '/citizen/rewards'}
                sx={{ borderRadius: 2, bgcolor: '#4F46E5', '&:hover': { bgcolor: '#4338CA' } }}
              >
                Earn Rewards
              </Button>
              <Button
                variant="outlined"
                startIcon={<RecyclingIcon />}
                onClick={() => window.location.href = '/citizen/nearby'}
                sx={{ borderRadius: 2, borderColor: alpha('#4F46E5', 0.5), color: '#4F46E5' }}
              >
                Find Recycling Centers
              </Button>
            </Stack>
          </Paper>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default RecyclingGuide;