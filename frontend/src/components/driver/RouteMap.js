import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Stack,
  CircularProgress,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert
} from '@mui/material';
import {
  MyLocation as MyLocationIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Layers as LayersIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color, isCurrent = false, isCompleted = false) => {
  const size = isCurrent ? 40 : 32;
  const iconHtml = isCurrent ? '🚛' : (isCompleted ? '✅' : '🗑️');
  
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      font-size: ${isCurrent ? 20 : 16}px;
      font-weight: bold;
      color: white;
    ">${iconHtml}</div>`,
    className: 'custom-marker',
    iconSize: [size, size],
    popupAnchor: [0, -20]
  });
};

// Component to fit bounds
const FitBounds = ({ positions }) => {
  const map = useMap();
  
  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);
  
  return null;
};

// Component to update driver location
const DriverLocationMarker = ({ location }) => {
  const map = useMap();
  
  useEffect(() => {
    if (location?.lat && location?.lng) {
      map.setView([location.lat, location.lng], 15);
    }
  }, [location, map]);
  
  if (!location?.lat || !location?.lng) return null;
  
  const driverIcon = createCustomIcon('#4F46E5', true);
  
  return (
    <Marker position={[location.lat, location.lng]} icon={driverIcon}>
      <Popup>🚛 Your Current Location</Popup>
    </Marker>
  );
};

const RouteMap = ({ route, driverLocation, onStopClick }) => {
  const [mapReady, setMapReady] = useState(false);
  const [showRouteList, setShowRouteList] = useState(false);
  const [mapLayers, setMapLayers] = useState('street');
  const [positions, setPositions] = useState([]);

  // Tile layer URLs
  const tileLayers = {
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  };

  // Collect all positions for bounds
  useEffect(() => {
    if (!route?.stops) return;
    
    const allPositions = [];
    
    // Add driver location
    if (driverLocation?.lat && driverLocation?.lng) {
      allPositions.push([driverLocation.lat, driverLocation.lng]);
    }
    
    // Add stop locations
    route.stops.forEach(stop => {
      const lat = stop.lat || stop.binDetails?.location?.lat;
      const lng = stop.lng || stop.binDetails?.location?.lng;
      if (lat && lng) {
        allPositions.push([lat, lng]);
      }
    });
    
    setPositions(allPositions);
  }, [route, driverLocation]);

  // Prepare stops with coordinates
  const stopsWithCoords = (route?.stops || []).map((stop, index) => {
    let lat = stop.lat || stop.binDetails?.location?.lat;
    let lng = stop.lng || stop.binDetails?.location?.lng;
    
    // Generate mock coordinates for demo if none provided
    if (!lat || !lng) {
      const baseLat = 28.6139;
      const baseLng = 77.2090;
      lat = baseLat + (index * 0.01);
      lng = baseLng + (index * 0.01);
    }
    
    return {
      ...stop,
      lat,
      lng,
      order: index + 1,
      isCompleted: stop.completed || stop.status === 'Completed'
    };
  });

  // Prepare polyline positions
  const polylinePositions = [];
  
  // Add driver location first
  if (driverLocation?.lat && driverLocation?.lng) {
    polylinePositions.push([driverLocation.lat, driverLocation.lng]);
  }
  
  // Add stops in order
  stopsWithCoords.forEach(stop => {
    polylinePositions.push([stop.lat, stop.lng]);
  });

  if (!route?.stops || route.stops.length === 0) {
    return (
      <Box sx={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="info">No stops available for this route</Alert>
      </Box>
    );
  }

  // Default center (Delhi)
  const defaultCenter = [28.6139, 77.2090];
  const defaultZoom = 12;

  return (
    <Box sx={{ position: 'relative', height: '100%', minHeight: 500, width: '100%' }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '500px', width: '100%', borderRadius: 12, zIndex: 1 }}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          url={tileLayers[mapLayers]}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {/* Draw route line */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            color="#4F46E5"
            weight={4}
            opacity={0.8}
            dashArray="10, 10"
          />
        )}
        
        {/* Driver location marker */}
        {driverLocation?.lat && driverLocation?.lng && (
          <Marker 
            position={[driverLocation.lat, driverLocation.lng]} 
            icon={createCustomIcon('#4F46E5', true)}
          >
            <Popup>🚛 Your Current Location</Popup>
          </Marker>
        )}
        
        {/* Stop markers */}
        {stopsWithCoords.map((stop) => (
          <Marker
            key={stop.stopId || stop.order}
            position={[stop.lat, stop.lng]}
            icon={createCustomIcon(
              stop.isCompleted ? '#10B981' : '#F59E0B',
              false,
              stop.isCompleted
            )}
            eventHandlers={{
              click: () => {
                if (onStopClick) onStopClick(stop.stopId);
              }
            }}
          >
            <Popup>
              <div style={{ minWidth: '160px' }}>
                <strong>{stop.location || stop.address || `Stop ${stop.order}`}</strong><br/>
                <span style={{ color: stop.isCompleted ? '#10B981' : '#F59E0B' }}>
                  {stop.isCompleted ? '✅ Completed' : '⏳ Pending'}
                </span><br/>
                Stop #{stop.order}<br/>
                {stop.wasteCollected > 0 && `${stop.wasteCollected} kg collected`}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Fit bounds to show all markers */}
        <FitBounds positions={positions} />
      </MapContainer>

      {/* Map Controls */}
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Stack spacing={0.5} sx={{ p: 0.5 }}>
          <Tooltip title="Map Style" placement="left">
            <IconButton size="small" onClick={() => setShowRouteList(!showRouteList)} sx={{ bgcolor: 'white' }}>
              <LayersIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Map Layer Selector */}
      <Drawer
        anchor="right"
        open={showRouteList}
        onClose={() => setShowRouteList(false)}
        PaperProps={{ sx: { width: 280, p: 2, borderRadius: '12px 0 0 12px' } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Map Layers</Typography>
          <IconButton size="small" onClick={() => setShowRouteList(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {Object.keys(tileLayers).map((layer) => (
            <ListItem
              key={layer}
              button
              selected={mapLayers === layer}
              onClick={() => {
                setMapLayers(layer);
                setShowRouteList(false);
              }}
            >
              <ListItemIcon><LayersIcon /></ListItemIcon>
              <ListItemText 
                primary={layer.charAt(0).toUpperCase() + layer.slice(1)} 
                secondary={mapLayers === layer ? 'Active' : ''}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Stop List Sidebar */}
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          maxWidth: 280,
          zIndex: 1000,
          borderRadius: 2,
          overflow: 'auto',
          maxHeight: 250,
          bgcolor: 'rgba(255,255,255,0.95)'
        }}
      >
        <Typography variant="subtitle2" sx={{ p: 1.5, bgcolor: '#4F46E5', color: 'white', fontWeight: 600 }}>
          Route Stops ({route.stops.length})
        </Typography>
        <List dense disablePadding>
          {stopsWithCoords.map((stop, idx) => (
            <ListItem
              key={idx}
              button
              onClick={() => {
                if (onStopClick) onStopClick(stop.stopId);
              }}
              sx={{
                borderBottom: '1px solid #e0e0e0',
                bgcolor: stop.isCompleted ? 'rgba(16,185,129,0.1)' : 'transparent'
              }}
            >
              <ListItemIcon>
                {stop.isCompleted ? (
                  <CheckCircleIcon sx={{ color: '#10B981', fontSize: 20 }} />
                ) : (
                  <PendingIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={`Stop ${idx + 1}: ${stop.location || stop.address || 'Unknown'}`}
                secondary={`${stop.wasteCollected || 0} kg collected`}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default RouteMap;