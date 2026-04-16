import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Box,
  Paper,
  Rating,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Skeleton,
  Divider,
  Tooltip,
  Button,
  Stack,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  Wc,
  Search,
  FilterList,
  Refresh,
  Directions,
  Star,
  CheckCircle,
  Cancel,
  Info,
  Phone,
  CleaningServices,
  WheelchairPickup,
  LocalDrink
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { showSuccess, showError } from '../../utils/toast';

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

const PublicToilets = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [toilets, setToilets] = useState([]);
  const [filteredToilets, setFilteredToilets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRating, setFilterRating] = useState('all');

  useEffect(() => {
    fetchToilets();
  }, []);

  const fetchToilets = async () => {
    setTimeout(() => {
      const mockToilets = [
        { 
          id: 1, name: 'Central Park Toilet', location: 'Near Gate 1, Central Park', status: 'Open', rating: 4.5,
          cleanliness: 4.2, accessibility: true, hasWater: true, hasSanitizer: true, contact: '+91 9876543210',
          distance: '0.3 km', openingHours: '24/7', lastCleaned: '30 minutes ago', reviews: 128,
          facilities: ['Wheelchair Access', 'Hand Sanitizer', 'Running Water']
        },
        { 
          id: 2, name: 'Market Complex Toilet', location: 'Sector 12, Main Market', status: 'Open', rating: 4.0,
          cleanliness: 3.8, accessibility: true, hasWater: true, hasSanitizer: false, contact: '+91 9876543211',
          distance: '0.5 km', openingHours: '6:00 AM - 10:00 PM', lastCleaned: '1 hour ago', reviews: 95,
          facilities: ['Wheelchair Access', 'Running Water']
        },
        { 
          id: 3, name: 'Bus Stand Toilet', location: 'Main Road, City Bus Stand', status: 'Maintenance', rating: 3.5,
          cleanliness: 3.0, accessibility: false, hasWater: true, hasSanitizer: false, contact: '+91 9876543212',
          distance: '0.8 km', openingHours: '24/7', lastCleaned: '3 hours ago', reviews: 210,
          facilities: ['Running Water']
        },
        { 
          id: 4, name: 'Railway Station Toilet', location: 'Platform 1, Railway Station', status: 'Open', rating: 4.2,
          cleanliness: 4.0, accessibility: true, hasWater: true, hasSanitizer: true, contact: '+91 9876543213',
          distance: '1.2 km', openingHours: '24/7', lastCleaned: '45 minutes ago', reviews: 320,
          facilities: ['Wheelchair Access', 'Hand Sanitizer', 'Running Water', 'Baby Changing']
        },
        { 
          id: 5, name: 'Park Street Toilet', location: 'Park Street, Near Food Court', status: 'Closed', rating: 2.5,
          cleanliness: 2.0, accessibility: false, hasWater: false, hasSanitizer: false, contact: '+91 9876543214',
          distance: '1.5 km', openingHours: '8:00 AM - 6:00 PM', lastCleaned: 'Yesterday', reviews: 45,
          facilities: []
        },
        { 
          id: 6, name: 'Mall Toilet', location: '3rd Floor, City Mall', status: 'Open', rating: 4.8,
          cleanliness: 4.7, accessibility: true, hasWater: true, hasSanitizer: true, contact: '+91 9876543215',
          distance: '2.0 km', openingHours: '10:00 AM - 10:00 PM', lastCleaned: '15 minutes ago', reviews: 450,
          facilities: ['Wheelchair Access', 'Hand Sanitizer', 'Running Water', 'Baby Changing', 'Air Freshener']
        }
      ];
      setToilets(mockToilets);
      setFilteredToilets(mockToilets);
      setLoading(false);
    }, 1500);
  };

  const handleSearch = () => {
    if (!searchQuery) {
      setFilteredToilets(toilets);
      return;
    }
    const filtered = toilets.filter(toilet =>
      toilet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      toilet.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredToilets(filtered);
    showSuccess(`Found ${filtered.length} toilets`);
  };

  const handleFilter = () => {
    let filtered = [...toilets];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(toilet => toilet.status === filterStatus);
    }

    if (filterRating !== 'all') {
      if (filterRating === 'high') filtered = filtered.filter(toilet => toilet.rating >= 4);
      else if (filterRating === 'medium') filtered = filtered.filter(toilet => toilet.rating >= 3 && toilet.rating < 4);
      else if (filterRating === 'low') filtered = filtered.filter(toilet => toilet.rating < 3);
    }

    setFilteredToilets(filtered);
    showSuccess(`Found ${filtered.length} toilets`);
  };

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterRating('all');
    setSearchQuery('');
    setFilteredToilets(toilets);
    showSuccess('Filters cleared');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return '#10B981';
      case 'Maintenance': return '#F59E0B';
      case 'Closed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <CheckCircle sx={{ fontSize: 14 }} />;
      case 'Maintenance': return <Info sx={{ fontSize: 14 }} />;
      case 'Closed': return <Cancel sx={{ fontSize: 14 }} />;
      default: return <Info sx={{ fontSize: 14 }} />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Public Toilets</Typography>
        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 4, mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
              <Skeleton variant="rectangular" height={380} sx={{ borderRadius: 4 }} />
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
                Public Toilets
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Find clean and accessible public toilets near you
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchToilets}
              sx={{ borderRadius: 2, borderColor: alpha('#4F46E5', 0.5), color: '#4F46E5' }}
            >
              Refresh
            </Button>
          </Box>
        </motion.div>

        {/* Filter Section */}
        <motion.div variants={fadeInUp}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 4,
              background: alpha(theme.palette.background.paper, 0.95),
              border: `1px solid ${alpha('#4F46E5', 0.1)}`
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  placeholder="Search by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: '#4F46E5' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={handleSearch}>
                          <Search />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 2.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 2.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Rating</InputLabel>
                  <Select value={filterRating} onChange={(e) => setFilterRating(e.target.value)} label="Rating">
                    <MenuItem value="all">All Ratings</MenuItem>
                    <MenuItem value="high">High (4+ stars)</MenuItem>
                    <MenuItem value="medium">Medium (3-4 stars)</MenuItem>
                    <MenuItem value="low">Low (Below 3 stars)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 1.5 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<FilterList />}
                  onClick={handleFilter}
                  sx={{ borderRadius: 2, bgcolor: '#4F46E5' }}
                >
                  Filter
                </Button>
              </Grid>

              <Grid size={{ xs: 12, md: 1.5 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={clearFilters}
                  sx={{ borderRadius: 2, borderColor: alpha('#4F46E5', 0.5), color: '#4F46E5' }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>

            {/* Statistics */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, flexWrap: 'wrap', gap: 2 }}>
              <Stack direction="row" spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Total Toilets:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#4F46E5' }}>{filteredToilets.length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Open:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#10B981' }}>
                    {filteredToilets.filter(t => t.status === 'Open').length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Maintenance:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#F59E0B' }}>
                    {filteredToilets.filter(t => t.status === 'Maintenance').length}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Paper>
        </motion.div>

        {/* Toilets Grid - Equal sized cards */}
        <Grid container spacing={3}>
          {filteredToilets.map((toilet, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={toilet.id}>
              <motion.div
                variants={fadeInUp}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                style={{ height: '100%' }}
              >
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    background: alpha(theme.palette.background.paper, 0.95),
                    border: `1px solid ${alpha(getStatusColor(toilet.status), 0.2)}`,
                    transition: 'all 0.3s',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: `0 15px 30px ${alpha(getStatusColor(toilet.status), 0.15)}`,
                      borderColor: alpha(getStatusColor(toilet.status), 0.4)
                    }
                  }}
                >
                  <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: alpha(getStatusColor(toilet.status), 0.1), color: getStatusColor(toilet.status), width: 32, height: 32 }}>
                          <Wc sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                          {toilet.name}
                        </Typography>
                      </Box>
                      <Chip
                        icon={getStatusIcon(toilet.status)}
                        label={toilet.status}
                        size="small"
                        sx={{ bgcolor: alpha(getStatusColor(toilet.status), 0.1), color: getStatusColor(toilet.status), fontWeight: 600, height: 24, fontSize: '0.7rem' }}
                      />
                    </Box>

                    {/* Location */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16, color: '#64748B', mt: 0.2 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', lineHeight: 1.3 }}>
                        {toilet.location}
                      </Typography>
                    </Box>

                    {/* Distance & Hours */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Chip
                        icon={<AccessTime sx={{ fontSize: 12 }} />}
                        label={toilet.openingHours.length > 15 ? toilet.openingHours.substring(0, 12) + '...' : toilet.openingHours}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 24 }}
                      />
                      <Chip
                        label={`📍 ${toilet.distance}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 24 }}
                      />
                    </Box>

                    {/* Rating */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <Rating value={toilet.rating} readOnly precision={0.5} size="small" />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        ({toilet.reviews})
                      </Typography>
                    </Box>

                    {/* Cleanliness Score */}
                    <Box sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.65rem' }}>Cleanliness</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#4F46E5', fontSize: '0.65rem' }}>
                          {toilet.cleanliness}/5
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(toilet.cleanliness / 5) * 100}
                        sx={{
                          height: 3,
                          borderRadius: 2,
                          bgcolor: alpha('#4F46E5', 0.1),
                          '& .MuiLinearProgress-bar': { bgcolor: '#4F46E5', borderRadius: 2 }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.6rem' }}>
                        Last cleaned: {toilet.lastCleaned}
                      </Typography>
                    </Box>

                    {/* Facilities */}
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block', fontSize: '0.65rem' }}>
                        Facilities:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {toilet.facilities.slice(0, 3).map((facility, idx) => (
                          <Chip
                            key={idx}
                            label={facility}
                            size="small"
                            sx={{ bgcolor: alpha('#4F46E5', 0.05), fontSize: '0.6rem', height: 20 }}
                          />
                        ))}
                        {toilet.facilities.length === 0 && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>No special facilities</Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Amenities Icons */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                      {toilet.accessibility && (
                        <Tooltip title="Wheelchair Accessible">
                          <WheelchairPickup sx={{ fontSize: 18, color: '#10B981' }} />
                        </Tooltip>
                      )}
                      {toilet.hasWater && (
                        <Tooltip title="Running Water Available">
                          <LocalDrink sx={{ fontSize: 18, color: '#3B82F6' }} />
                        </Tooltip>
                      )}
                      {toilet.hasSanitizer && (
                        <Tooltip title="Hand Sanitizer Available">
                          <CleaningServices sx={{ fontSize: 18, color: '#8B5CF6' }} />
                        </Tooltip>
                      )}
                    </Box>

                    {/* Actions - Fixed at bottom */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        startIcon={<Directions sx={{ fontSize: 16 }} />}
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(toilet.name + ' ' + toilet.location)}`, '_blank')}
                        sx={{ borderRadius: 2, borderColor: alpha('#4F46E5', 0.5), color: '#4F46E5', fontSize: '0.7rem', py: 0.5 }}
                      >
                        Directions
                      </Button>
                      {toilet.contact && (
                        <Tooltip title="Call for info">
                          <IconButton
                            size="small"
                            onClick={() => window.location.href = `tel:${toilet.contact}`}
                            sx={{ border: `1px solid ${alpha('#4F46E5', 0.2)}`, borderRadius: 2 }}
                          >
                            <Phone sx={{ fontSize: 18, color: '#4F46E5' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {filteredToilets.length === 0 && (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
            <Wc sx={{ fontSize: 64, color: alpha('#4F46E5', 0.3), mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No toilets found</Typography>
            <Typography variant="body2" color="text.secondary">Try adjusting your filters</Typography>
          </Paper>
        )}
      </motion.div>
    </Container>
  );
};

export default PublicToilets;