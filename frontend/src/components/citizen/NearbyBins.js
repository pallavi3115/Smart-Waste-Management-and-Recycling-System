import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
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
  LinearProgress,
  Stack
} from '@mui/material';
import {
  LocationOn,
  Search,
  MyLocation,
  FilterList,
  Refresh,
  Directions,
  ZoomIn,
  ZoomOut
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { showSuccess, showError } from '../../utils/toast';

// Fix Leaflet default icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

// Map controller component
const MapController = ({ center, zoom, onMapLoad }) => {
  const map = useMap();
  
  useEffect(() => {
    if (onMapLoad) onMapLoad(map);
  }, [map, onMapLoad]);
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

// Create custom marker icon based on fill level
const createCustomIcon = (fillLevel) => {
  const color = fillLevel >= 80 ? '#EF4444' : fillLevel >= 50 ? '#F59E0B' : '#10B981';
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2); cursor: pointer;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
          </div>`,
    className: 'custom-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
};

// Default center (Indore, India)
const defaultCenter = [22.7196, 75.8577];

const NearbyBins = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [bins, setBins] = useState([]);
  const [filteredBins, setFilteredBins] = useState([]);
  const [selectedBin, setSelectedBin] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterFillLevel, setFilterFillLevel] = useState('all');
  const [mapRef, setMapRef] = useState(null);
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    fetchBins();
    getUserLocation();
  }, []);

  const fetchBins = async () => {
    setTimeout(() => {
      const mockBins = [
        { id: 1, name: 'Central Park Bin', location: [22.7196, 75.8577], fillLevel: 85, type: 'General', lastEmptied: '2024-01-15T10:30:00', address: 'Central Park, Indore', capacity: '1000L', distance: '0.3 km' },
        { id: 2, name: 'Rajwada Bin', location: [22.7186, 75.8567], fillLevel: 45, type: 'Recyclable', lastEmptied: '2024-01-15T09:00:00', address: 'Rajwada Square, Indore', capacity: '800L', distance: '0.5 km' },
        { id: 3, name: 'Vijay Nagar Bin', location: [22.7556, 75.8877], fillLevel: 92, type: 'General', lastEmptied: '2024-01-14T16:00:00', address: 'Vijay Nagar Main Road, Indore', capacity: '1200L', distance: '2.1 km' },
        { id: 4, name: 'Geeta Bhawan Bin', location: [22.7126, 75.8627], fillLevel: 25, type: 'Organic', lastEmptied: '2024-01-15T11:00:00', address: 'Geeta Bhawan Square, Indore', capacity: '600L', distance: '1.2 km' },
        { id: 5, name: 'Palasia Bin', location: [22.7286, 75.8827], fillLevel: 68, type: 'Recyclable', lastEmptied: '2024-01-15T08:30:00', address: 'Palasia Main Road, Indore', capacity: '800L', distance: '1.8 km' },
        { id: 6, name: 'Sapna Sangeeta Bin', location: [22.7416, 75.8727], fillLevel: 78, type: 'General', lastEmptied: '2024-01-14T14:00:00', address: 'Sapna Sangeeta Square, Indore', capacity: '1000L', distance: '2.5 km' }
      ];
      setBins(mockBins);
      setFilteredBins(mockBins);
      setLoading(false);
    }, 1500);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = [position.coords.latitude, position.coords.longitude];
          setUserLocation(location);
          setCenter(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          showError('Unable to get your location');
        }
      );
    }
  };

  const handleSearch = () => {
    if (!searchQuery) {
      setFilteredBins(bins);
      return;
    }
    const filtered = bins.filter(bin =>
      bin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bin.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBins(filtered);
    showSuccess(`Found ${filtered.length} bins`);
  };

  const handleFilter = () => {
    let filtered = [...bins];

    if (filterType !== 'all') {
      filtered = filtered.filter(bin => bin.type === filterType);
    }

    if (filterFillLevel !== 'all') {
      if (filterFillLevel === 'low') filtered = filtered.filter(bin => bin.fillLevel <= 30);
      else if (filterFillLevel === 'medium') filtered = filtered.filter(bin => bin.fillLevel > 30 && bin.fillLevel <= 70);
      else if (filterFillLevel === 'high') filtered = filtered.filter(bin => bin.fillLevel > 70);
    }

    setFilteredBins(filtered);
    showSuccess(`Found ${filtered.length} bins`);
  };

  const handleLocateMe = () => {
    if (userLocation) {
      setCenter(userLocation);
      setZoom(15);
      mapRef?.setView(userLocation, 15);
      showSuccess('Showing your location');
    } else {
      getUserLocation();
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => prev + 1);
    mapRef?.setZoom(zoom + 1);
  };

  const handleZoomOut = () => {
    setZoom(prev => prev - 1);
    mapRef?.setZoom(zoom - 1);
  };

  const handleGetDirections = (bin) => {
    const url = `https://www.openstreetmap.org/directions?engine=graphhopper_foot&route=${userLocation?.[0] || 22.7196},${userLocation?.[1] || 75.8577}&to=${bin.location[0]},${bin.location[1]}`;
    window.open(url, '_blank');
  };

  const getBinColor = (fillLevel) => {
    if (fillLevel >= 80) return '#EF4444';
    if (fillLevel >= 50) return '#F59E0B';
    return '#10B981';
  };

  const getStatusText = (fillLevel) => {
    if (fillLevel >= 80) return 'Critical - Needs Collection';
    if (fillLevel >= 50) return 'Partial - Moderate';
    return 'Available - Good';
  };

  const clearFilters = () => {
    setFilterType('all');
    setFilterFillLevel('all');
    setSearchQuery('');
    setFilteredBins(bins);
    showSuccess('Filters cleared');
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Nearby Bins</Typography>
        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 4, mb: 3 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Skeleton variant="rectangular" height={550} sx={{ borderRadius: 4 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Skeleton variant="rectangular" height={550} sx={{ borderRadius: 4 }} />
          </Grid>
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
                Nearby Bins
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Find and locate waste bins near your location
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchBins}
                sx={{ borderRadius: 2, borderColor: alpha('#4F46E5', 0.5), color: '#4F46E5' }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<MyLocation />}
                onClick={handleLocateMe}
                sx={{ borderRadius: 2, bgcolor: '#4F46E5' }}
              >
                Locate Me
              </Button>
            </Stack>
          </Box>
        </motion.div>

        {/* Filter Section - Horizontal at the Top */}
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
                  placeholder="Search by name or address..."
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
                  <InputLabel>Bin Type</InputLabel>
                  <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Bin Type">
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="General">General Waste</MenuItem>
                    <MenuItem value="Recyclable">Recyclable</MenuItem>
                    <MenuItem value="Organic">Organic</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 2.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Fill Level</InputLabel>
                  <Select value={filterFillLevel} onChange={(e) => setFilterFillLevel(e.target.value)} label="Fill Level">
                    <MenuItem value="all">All Levels</MenuItem>
                    <MenuItem value="low">Low (&lt;30%)</MenuItem>
                    <MenuItem value="medium">Medium (30-70%)</MenuItem>
                    <MenuItem value="high">High (&gt;70%)</MenuItem>
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

            {/* Statistics and Legend Row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, flexWrap: 'wrap', gap: 2 }}>
              <Stack direction="row" spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Total Bins:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#4F46E5' }}>{filteredBins.length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Available:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#10B981' }}>
                    {filteredBins.filter(b => b.fillLevel <= 50).length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Needs Attention:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#EF4444' }}>
                    {filteredBins.filter(b => b.fillLevel > 70).length}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981' }} />
                  <Typography variant="caption">Available (&lt;50%)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                  <Typography variant="caption">Partial (50-80%)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#EF4444' }} />
                  <Typography variant="caption">Full (&gt;80%)</Typography>
                </Box>
              </Stack>
            </Box>
          </Paper>
        </motion.div>

        {/* Main Content - Bins List (40%) + Map (60%) */}
        <Grid container spacing={3}>
          {/* Bins List - 40% */}
          <Grid size={{ xs: 12, md: 5 }}>
            <motion.div variants={fadeInUp}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 4,
                  background: alpha(theme.palette.background.paper, 0.95),
                  border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                  height: '100%'
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, px: 1 }}>
                  Nearby Bins ({filteredBins.length})
                </Typography>
                <Box sx={{ maxHeight: 550, overflowY: 'auto', pr: 1 }}>
                  {filteredBins.map((bin) => (
                    <Card
                      key={bin.id}
                      sx={{
                        mb: 2,
                        cursor: 'pointer',
                        borderRadius: 2,
                        transition: 'all 0.3s',
                        border: selectedBin?.id === bin.id ? `2px solid ${getBinColor(bin.fillLevel)}` : `1px solid ${alpha('#4F46E5', 0.1)}`,
                        '&:hover': { transform: 'translateX(4px)', boxShadow: 3 }
                      }}
                      onClick={() => {
                        setSelectedBin(bin);
                        setCenter(bin.location);
                        setZoom(16);
                        mapRef?.setView(bin.location, 16);
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{bin.name}</Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {bin.address}
                            </Typography>
                          </Box>
                          <Chip
                            label={bin.type}
                            size="small"
                            sx={{ bgcolor: alpha('#4F46E5', 0.1), color: '#4F46E5', fontSize: '0.7rem' }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={bin.fillLevel}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: alpha(getBinColor(bin.fillLevel), 0.2),
                                '& .MuiLinearProgress-bar': { bgcolor: getBinColor(bin.fillLevel), borderRadius: 3 }
                              }}
                            />
                          </Box>
                          <Typography variant="caption" fontWeight={600} sx={{ minWidth: 35 }}>
                            {bin.fillLevel}%
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Chip
                            label={getStatusText(bin.fillLevel)}
                            size="small"
                            sx={{ bgcolor: alpha(getBinColor(bin.fillLevel), 0.1), color: getBinColor(bin.fillLevel), fontSize: '0.7rem' }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            📍 {bin.distance}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<Directions />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGetDirections(bin);
                            }}
                            sx={{ color: '#4F46E5', fontSize: '0.7rem' }}
                          >
                            Directions
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          {/* Map - 60% */}
          <Grid size={{ xs: 12, md: 7 }}>
            <motion.div variants={fadeInUp}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 4,
                  background: alpha(theme.palette.background.paper, 0.95),
                  border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Map Controls */}
                <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Tooltip title="Zoom In">
                    <IconButton
                      size="small"
                      onClick={handleZoomIn}
                      sx={{ bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#F1F5F9' } }}
                    >
                      <ZoomIn />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Zoom Out">
                    <IconButton
                      size="small"
                      onClick={handleZoomOut}
                      sx={{ bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#F1F5F9' } }}
                    >
                      <ZoomOut />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="My Location">
                    <IconButton
                      size="small"
                      onClick={handleLocateMe}
                      sx={{ bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#F1F5F9' } }}
                    >
                      <MyLocation />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Leaflet Map */}
                <MapContainer
                  center={center}
                  zoom={zoom}
                  style={{ height: '550px', width: '100%', borderRadius: '12px', zIndex: 1 }}
                  whenReady={(e) => setMapRef(e.target)}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  <MapController center={center} zoom={zoom} onMapLoad={setMapRef} />
                  
                  {/* User Location Circle */}
                  {userLocation && (
                    <Circle
                      center={userLocation}
                      radius={500}
                      pathOptions={{
                        color: '#4F46E5',
                        fillColor: '#4F46E5',
                        fillOpacity: 0.1,
                        weight: 2
                      }}
                    />
                  )}
                  
                  {/* Bin Markers */}
                  {filteredBins.map((bin) => (
                    <Marker
                      key={bin.id}
                      position={bin.location}
                      icon={createCustomIcon(bin.fillLevel)}
                      eventHandlers={{
                        click: () => setSelectedBin(bin)
                      }}
                    >
                      <Popup>
                        <Box sx={{ minWidth: 200, p: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{bin.name}</Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {bin.address}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={bin.fillLevel}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                            <Typography variant="caption">{bin.fillLevel}%</Typography>
                          </Box>
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Chip label={bin.type} size="small" />
                            <Chip
                              label={getStatusText(bin.fillLevel)}
                              size="small"
                              sx={{ bgcolor: alpha(getBinColor(bin.fillLevel), 0.1), color: getBinColor(bin.fillLevel) }}
                            />
                          </Stack>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Directions />}
                            onClick={() => handleGetDirections(bin)}
                            sx={{ mt: 1, fontSize: '0.7rem', borderColor: '#4F46E5', color: '#4F46E5' }}
                          >
                            Get Directions
                          </Button>
                        </Box>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default NearbyBins;