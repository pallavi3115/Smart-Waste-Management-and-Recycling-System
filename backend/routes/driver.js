const express = require('express');
const router = express.Router();

// In-memory storage for route states (in production, use database)
let routeStates = {
  '1': {
    progress: 100,
    completedStops: 8,
    status: 'Completed',
    totalWaste: 850,
    stops: [
      { _id: 's1', stopId: 1, status: 'Completed', completed: true, wasteCollected: 120 },
      { _id: 's2', stopId: 2, status: 'Completed', completed: true, wasteCollected: 95 },
      { _id: 's3', stopId: 3, status: 'Completed', completed: true, wasteCollected: 110 }
    ]
  },
  '2': {
    progress: 65,
    completedStops: 4,
    status: 'In Progress',
    totalWaste: 450,
    stops: [
      { _id: 's4', stopId: 1, status: 'Completed', completed: true, wasteCollected: 85 },
      { _id: 's5', stopId: 2, status: 'In Progress', completed: false, wasteCollected: 0 },
      { _id: 's6', stopId: 3, status: 'Pending', completed: false, wasteCollected: 0 }
    ]
  },
  '3': {
    progress: 20,
    completedStops: 2,
    status: 'Started',
    totalWaste: 150,
    stops: [
      { _id: 's7', stopId: 1, status: 'Completed', completed: true, wasteCollected: 75 },
      { _id: 's8', stopId: 2, status: 'Completed', completed: true, wasteCollected: 75 },
      { _id: 's9', stopId: 3, status: 'Pending', completed: false, wasteCollected: 0 },
      { _id: 's10', stopId: 4, status: 'Pending', completed: false, wasteCollected: 0 },
      { _id: 's11', stopId: 5, status: 'Pending', completed: false, wasteCollected: 0 }
    ]
  },
  '4': {
    progress: 0,
    completedStops: 0,
    status: 'Assigned',
    totalWaste: 0,
    stops: [
      { _id: 's12', stopId: 1, status: 'Pending', completed: false, wasteCollected: 0 },
      { _id: 's13', stopId: 2, status: 'Pending', completed: false, wasteCollected: 0 },
      { _id: 's14', stopId: 3, status: 'Pending', completed: false, wasteCollected: 0 }
    ]
  }
};

// Mock driver data
const getDriverData = (userId) => {
  return {
    _id: userId,
    user: {
      name: 'Driver User',
      email: 'driver@test.com',
      phoneNumber: '9876543212',
      profilePicture: 'default-avatar.png'
    },
    employeeId: 'DRV001',
    vehicleType: 'Truck',
    vehicleNumber: 'DL-01-AB-1234',
    assignedZone: 'Zone A',
    shift: 'Morning',
    isOnline: true,
    performance: {
      rating: 4.5,
      totalCollections: 128,
      onTimeRate: 95
    },
    earnings: {
      total: 45000,
      thisMonth: 15000,
      lastMonth: 30000
    }
  };
};

// Middleware to verify driver token
const verifyDriverToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token || !token.startsWith('mock-jwt-token-')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  const userId = token.split('-').pop();
  
  const users = {
    '1': { id: '1', name: 'Admin User', role: 'Admin' },
    '2': { id: '2', name: 'Citizen User', role: 'Citizen' },
    '3': { id: '3', name: 'Driver User', role: 'Driver' }
  };
  
  const user = users[userId];
  
  if (!user || user.role !== 'Driver') {
    return res.status(403).json({ success: false, message: 'Access denied. Driver only.' });
  }
  
  req.user = user;
  next();
};

// ==================== DASHBOARD ====================
router.get('/dashboard', verifyDriverToken, (req, res) => {
  console.log('Driver dashboard accessed by:', req.user.name);
  
  const route3State = routeStates['3'];
  
  res.json({
    success: true,
    data: {
      driver: getDriverData(req.user.id),
      todayRoute: {
        id: '3',
        routeId: 'R003',
        status: route3State.status,
        stopsCount: 10,
        completedStops: route3State.completedStops,
        progress: route3State.progress,
        totalWaste: route3State.totalWaste,
        isOnSchedule: true
      },
      weeklyStats: {
        totalWaste: 1250,
        averagePerDay: 178.5
      },
      attendance: {
        presentDays: 18,
        lateDays: 2,
        absentDays: 0,
        totalDays: 20
      },
      performance: {
        rating: 4.5,
        totalCollections: 128,
        onTimeRate: 95
      },
      earnings: {
        total: 45000,
        thisMonth: 15000,
        lastMonth: 30000
      },
      notifications: [
        { _id: '1', title: 'New Route Assigned', message: 'You have a new route for today', type: 'route', read: false, createdAt: new Date() }
      ]
    }
  });
});

// ==================== LOCATION ====================
router.post('/location', verifyDriverToken, (req, res) => {
  const { lat, lng, heading, speed } = req.body;
  console.log(`📍 Driver ${req.user.name} location: ${lat}, ${lng}`);
  res.json({ success: true, message: 'Location updated' });
});

// ==================== PROFILE ====================
router.get('/profile', verifyDriverToken, (req, res) => {
  res.json({
    success: true,
    data: getDriverData(req.user.id)
  });
});

router.put('/profile', verifyDriverToken, (req, res) => {
  res.json({ success: true, message: 'Profile updated successfully' });
});

// ==================== STATUS ====================
router.put('/toggle-status', verifyDriverToken, (req, res) => {
  res.json({ success: true, isOnline: true, message: 'Status updated' });
});

// ==================== EARNINGS ====================
router.get('/earnings', verifyDriverToken, (req, res) => {
  res.json({
    success: true,
    data: {
      current: {
        total: 45000,
        thisMonth: 15000,
        lastMonth: 30000
      },
      monthlyBreakdown: [
        { _id: { year: 2024, month: 1 }, totalWaste: 1250, collections: 45, earnings: 6250 },
        { _id: { year: 2024, month: 2 }, totalWaste: 1350, collections: 48, earnings: 6750 },
        { _id: { year: 2024, month: 3 }, totalWaste: 1450, collections: 52, earnings: 7250 }
      ]
    }
  });
});

// ==================== ROUTES ====================

// Get all routes for driver
router.get('/routes', verifyDriverToken, (req, res) => {
  console.log('Driver routes requested by:', req.user.name);
  
  const mockRoutes = [
    { 
      _id: '1', 
      routeId: 'R001', 
      status: routeStates['1'].status, 
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), 
      totalDistance: 45.5, 
      estimatedDuration: 120, 
      stopsCount: 8,
      progress: routeStates['1'].progress,
      fuelUsed: 12.5,
      driver: req.user.name,
      vehicle: 'DL-01-AB-1234',
      startTime: '08:00 AM',
      endTime: '10:00 AM',
      totalWaste: routeStates['1'].totalWaste,
      shift: 'Morning',
      isOnSchedule: true,
      completedStops: routeStates['1'].completedStops,
      stops: [
        { _id: 's1', stopId: 1, location: 'Sector 12', address: 'Main Market', status: 'Completed', completed: true, wasteCollected: 120, order: 1 },
        { _id: 's2', stopId: 2, location: 'Sector 15', address: 'Community Center', status: 'Completed', completed: true, wasteCollected: 95, order: 2 },
        { _id: 's3', stopId: 3, location: 'Block A', address: 'Residential Area', status: 'Completed', completed: true, wasteCollected: 110, order: 3 }
      ]
    },
    { 
      _id: '2', 
      routeId: 'R002', 
      status: routeStates['2'].status, 
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), 
      totalDistance: 38.2, 
      estimatedDuration: 95, 
      stopsCount: 6,
      progress: routeStates['2'].progress,
      fuelUsed: 8.2,
      driver: req.user.name,
      vehicle: 'DL-02-CD-5678',
      startTime: '09:00 AM',
      totalWaste: routeStates['2'].totalWaste,
      shift: 'Morning',
      isOnSchedule: true,
      completedStops: routeStates['2'].completedStops,
      stops: [
        { _id: 's4', stopId: 1, location: 'Sector 20', address: 'Shopping Complex', status: routeStates['2'].stops[0].status, completed: routeStates['2'].stops[0].completed, wasteCollected: routeStates['2'].stops[0].wasteCollected, order: 1 },
        { _id: 's5', stopId: 2, location: 'Sector 8', address: 'Hospital Road', status: routeStates['2'].stops[1].status, completed: routeStates['2'].stops[1].completed, wasteCollected: routeStates['2'].stops[1].wasteCollected, order: 2 },
        { _id: 's6', stopId: 3, location: 'Block C', address: 'Commercial Area', status: routeStates['2'].stops[2].status, completed: routeStates['2'].stops[2].completed, wasteCollected: routeStates['2'].stops[2].wasteCollected, order: 3 }
      ]
    },
    { 
      _id: '3', 
      routeId: 'R003', 
      status: routeStates['3'].status, 
      date: new Date().toISOString(), 
      totalDistance: 52.8, 
      estimatedDuration: 150, 
      stopsCount: 10,
      progress: routeStates['3'].progress,
      fuelUsed: 3.5,
      driver: req.user.name,
      vehicle: 'DL-03-EF-9012',
      startTime: '11:00 AM',
      totalWaste: routeStates['3'].totalWaste,
      shift: 'Morning',
      isOnSchedule: true,
      completedStops: routeStates['3'].completedStops,
      stops: [
        { _id: 's7', stopId: 1, location: 'Sector 25', address: 'Industrial Area', status: routeStates['3'].stops[0].status, completed: routeStates['3'].stops[0].completed, wasteCollected: routeStates['3'].stops[0].wasteCollected, expectedFillLevel: 85, order: 1 },
        { _id: 's8', stopId: 2, location: 'Sector 30', address: 'Warehouse', status: routeStates['3'].stops[1].status, completed: routeStates['3'].stops[1].completed, wasteCollected: routeStates['3'].stops[1].wasteCollected, expectedFillLevel: 70, order: 2 },
        { _id: 's9', stopId: 3, location: 'Sector 35', address: 'Business Park', status: routeStates['3'].stops[2].status, completed: routeStates['3'].stops[2].completed, wasteCollected: routeStates['3'].stops[2].wasteCollected, expectedFillLevel: 60, order: 3 },
        { _id: 's10', stopId: 4, location: 'Sector 40', address: 'Residential Complex', status: routeStates['3'].stops[3].status, completed: routeStates['3'].stops[3].completed, wasteCollected: routeStates['3'].stops[3].wasteCollected, expectedFillLevel: 45, order: 4 },
        { _id: 's11', stopId: 5, location: 'Sector 45', address: 'Mall Road', status: routeStates['3'].stops[4].status, completed: routeStates['3'].stops[4].completed, wasteCollected: routeStates['3'].stops[4].wasteCollected, expectedFillLevel: 80, order: 5 }
      ]
    },
    { 
      _id: '4', 
      routeId: 'R004', 
      status: routeStates['4'].status, 
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), 
      totalDistance: 28.5, 
      estimatedDuration: 75, 
      stopsCount: 5,
      progress: routeStates['4'].progress,
      fuelUsed: 0,
      driver: req.user.name,
      vehicle: 'DL-04-GH-3456',
      totalWaste: routeStates['4'].totalWaste,
      shift: 'Evening',
      isOnSchedule: true,
      completedStops: routeStates['4'].completedStops,
      stops: [
        { _id: 's12', stopId: 1, location: 'Sector 5', address: 'Residential Colony', status: routeStates['4'].stops[0].status, completed: routeStates['4'].stops[0].completed, wasteCollected: routeStates['4'].stops[0].wasteCollected, expectedFillLevel: 50, order: 1 },
        { _id: 's13', stopId: 2, location: 'Sector 7', address: 'Market Area', status: routeStates['4'].stops[1].status, completed: routeStates['4'].stops[1].completed, wasteCollected: routeStates['4'].stops[1].wasteCollected, expectedFillLevel: 65, order: 2 },
        { _id: 's14', stopId: 3, location: 'Sector 9', address: 'School Area', status: routeStates['4'].stops[2].status, completed: routeStates['4'].stops[2].completed, wasteCollected: routeStates['4'].stops[2].wasteCollected, expectedFillLevel: 40, order: 3 }
      ]
    }
  ];
  
  // Filter by status if provided
  const { status } = req.query;
  let filteredRoutes = mockRoutes;
  if (status && status !== 'all') {
    filteredRoutes = mockRoutes.filter(r => r.status === status);
  }
  
  res.json({ 
    success: true, 
    data: filteredRoutes 
  });
});

// Get specific route details
router.get('/routes/:id', verifyDriverToken, (req, res) => {
  console.log(`Driver route ${req.params.id} requested by:`, req.user.name);
  
  const routeId = req.params.id;
  const routeState = routeStates[routeId];
  
  if (!routeState) {
    return res.status(404).json({ success: false, message: 'Route not found' });
  }
  
  const baseRouteData = {
    '1': {
      _id: '1', routeId: 'R001', totalDistance: 45.5, estimatedDuration: 120, actualDuration: 115,
      fuelUsed: 12.5, driver: req.user.name, vehicle: 'DL-01-AB-1234',
      startTime: '08:00 AM', endTime: '10:00 AM', shift: 'Morning', isOnSchedule: true,
      totalStops: 8, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    '2': {
      _id: '2', routeId: 'R002', totalDistance: 38.2, estimatedDuration: 95, actualDuration: null,
      fuelUsed: 8.2, driver: req.user.name, vehicle: 'DL-02-CD-5678',
      startTime: '09:00 AM', shift: 'Morning', isOnSchedule: true,
      totalStops: 6, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    '3': {
      _id: '3', routeId: 'R003', totalDistance: 52.8, estimatedDuration: 150, actualDuration: null,
      fuelUsed: 3.5, driver: req.user.name, vehicle: 'DL-03-EF-9012',
      startTime: '11:00 AM', shift: 'Morning', isOnSchedule: true,
      totalStops: 10, date: new Date().toISOString()
    },
      '4': {
      _id: '4', routeId: 'R004', totalDistance: 28.5, estimatedDuration: 75, actualDuration: null,
      fuelUsed: 0, driver: req.user.name, vehicle: 'DL-04-GH-3456',
      startTime: null, shift: 'Evening', isOnSchedule: true,
      totalStops: 5, date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  };
  
  const baseData = baseRouteData[routeId];
  
  if (!baseData) {
    return res.status(404).json({ success: false, message: 'Route not found' });
  }
  
  const stopsWithDetails = {
    '1': [
      { _id: 's1', stopId: 1, location: 'Sector 12', address: 'Main Market', wasteType: 'General', expectedFillLevel: 85, actualArrival: '08:15 AM', actualDeparture: '08:20 AM', order: 1 },
      { _id: 's2', stopId: 2, location: 'Sector 15', address: 'Community Center', wasteType: 'Recyclable', expectedFillLevel: 70, actualArrival: '08:45 AM', actualDeparture: '08:50 AM', order: 2 },
      { _id: 's3', stopId: 3, location: 'Block A', address: 'Residential Area', wasteType: 'General', expectedFillLevel: 90, actualArrival: '09:30 AM', actualDeparture: '09:35 AM', order: 3 }
    ],
    '2': [
      { _id: 's4', stopId: 1, location: 'Sector 20', address: 'Shopping Complex', wasteType: 'General', expectedFillLevel: 75, actualArrival: '09:20 AM', actualDeparture: '09:25 AM', order: 1 },
      { _id: 's5', stopId: 2, location: 'Sector 8', address: 'Hospital Road', wasteType: null, expectedFillLevel: 80, actualArrival: null, actualDeparture: null, order: 2 },
      { _id: 's6', stopId: 3, location: 'Block C', address: 'Commercial Area', wasteType: null, expectedFillLevel: 60, actualArrival: null, actualDeparture: null, order: 3 }
    ],
    '3': [
      { _id: 's7', stopId: 1, location: 'Sector 25', address: 'Industrial Area', wasteType: 'General', expectedFillLevel: 85, actualArrival: '11:15 AM', actualDeparture: '11:20 AM', order: 1 },
      { _id: 's8', stopId: 2, location: 'Sector 30', address: 'Warehouse', wasteType: 'Recyclable', expectedFillLevel: 70, actualArrival: '11:45 AM', actualDeparture: '11:50 AM', order: 2 },
      { _id: 's9', stopId: 3, location: 'Sector 35', address: 'Business Park', wasteType: null, expectedFillLevel: 60, actualArrival: null, actualDeparture: null, order: 3 },
      { _id: 's10', stopId: 4, location: 'Sector 40', address: 'Residential Complex', wasteType: null, expectedFillLevel: 45, actualArrival: null, actualDeparture: null, order: 4 },
      { _id: 's11', stopId: 5, location: 'Sector 45', address: 'Mall Road', wasteType: null, expectedFillLevel: 80, actualArrival: null, actualDeparture: null, order: 5 }
    ],
     '4': [
      { _id: 's12', stopId: 1, location: 'Sector 5', address: 'Residential Colony', lat: 28.6700, lng: 77.2650, wasteType: null, expectedFillLevel: 50, actualArrival: null, actualDeparture: null, order: 1 },
      { _id: 's13', stopId: 2, location: 'Sector 7', address: 'Market Area', lat: 28.6750, lng: 77.2700, wasteType: null, expectedFillLevel: 65, actualArrival: null, actualDeparture: null, order: 2 },
      { _id: 's14', stopId: 3, location: 'Sector 9', address: 'School Area', lat: 28.6800, lng: 77.2750, wasteType: null, expectedFillLevel: 40, actualArrival: null, actualDeparture: null, order: 3 },
      { _id: 's15', stopId: 4, location: 'Sector 11', address: 'Hospital Area', lat: 28.6850, lng: 77.2800, wasteType: null, expectedFillLevel: 55, actualArrival: null, actualDeparture: null, order: 4 },
      { _id: 's16', stopId: 5, location: 'Sector 13', address: 'Park Area', lat: 28.6900, lng: 77.2850, wasteType: null, expectedFillLevel: 35, actualArrival: null, actualDeparture: null, order: 5 }
    ]
  };
  
  const stopsWithState = stopsWithDetails[routeId].map(stop => {
    const stateStop = routeState.stops.find(s => s.stopId === stop.stopId);
    return {
      ...stop,
      status: stateStop?.status || stop.status,
      completed: stateStop?.completed || false,
      wasteCollected: stateStop?.wasteCollected || 0,
      notes: stateStop?.notes || ''
    };
  });
  
  const responseData = {
    ...baseData,
    status: routeState.status,
    progress: routeState.progress,
    totalWaste: routeState.totalWaste,
    completedStops: routeState.completedStops,
    stops: stopsWithState,
    alerts: []
  };
  
  console.log(`Returning route data for ${routeId}:`, responseData);
  res.json({ success: true, data: responseData });
});

// Start a route
router.put('/routes/:id/start', verifyDriverToken, (req, res) => {
  const routeId = req.params.id;
  console.log(`Route ${routeId} started by:`, req.user.name);
  
  if (routeStates[routeId]) {
    routeStates[routeId].status = 'In Progress';
  }
  
  res.json({ 
    success: true, 
    message: 'Route started successfully',
    data: {
      _id: routeId,
      status: 'In Progress',
      startTime: new Date().toISOString()
    }
  });
});

// Complete a stop on the route
router.post('/routes/:routeId/stop/:stopId/complete', verifyDriverToken, (req, res) => {
  const { routeId, stopId } = req.params;
  const { wasteCollected, wasteType, notes, actualFillLevel } = req.body;
  
  console.log(`Stop ${stopId} completed on route ${routeId} with ${wasteCollected}kg of ${wasteType}`);
  
  // Update route state
  if (routeStates[routeId]) {
    const stopIndex = routeStates[routeId].stops.findIndex(s => s.stopId === parseInt(stopId));
    
    if (stopIndex !== -1 && !routeStates[routeId].stops[stopIndex].completed) {
      // Update the stop
      routeStates[routeId].stops[stopIndex].status = 'Completed';
      routeStates[routeId].stops[stopIndex].completed = true;
      routeStates[routeId].stops[stopIndex].wasteCollected = parseFloat(wasteCollected) || 50;
      routeStates[routeId].stops[stopIndex].notes = notes || '';
      
      // Update route totals
      const completedCount = routeStates[routeId].stops.filter(s => s.completed).length;
      const totalStops = routeStates[routeId].stops.length;
      const newProgress = (completedCount / totalStops) * 100;
      
      routeStates[routeId].completedStops = completedCount;
      routeStates[routeId].progress = newProgress;
      routeStates[routeId].totalWaste += parseFloat(wasteCollected) || 50;
      
      // Update route status if all stops completed
      if (completedCount === totalStops) {
        routeStates[routeId].status = 'Completed';
      }
      
      console.log(`Route ${routeId} updated:`, {
        completedStops: completedCount,
        totalStops: totalStops,
        progress: newProgress,
        status: routeStates[routeId].status
      });
    }
  }
  
  // Calculate updated stats
  const currentState = routeStates[routeId];
  const completedCount = currentState?.completedStops || 0;
  const totalStops = currentState?.stops.length || 10;
  const progress = (completedCount / totalStops) * 100;
  
  res.json({ 
    success: true, 
    message: 'Stop completed successfully',
    data: {
      stop: {
        _id: `stop_${stopId}`,
        stopId: parseInt(stopId),
        status: 'Completed',
        wasteCollected: parseFloat(wasteCollected) || 50,
        wasteType: wasteType || 'General',
        completedAt: new Date().toISOString()
      },
      progress: progress,
      totalWaste: currentState?.totalWaste || 200,
      routeStatus: currentState?.status || 'In Progress',
      completedStops: completedCount,
      remainingStops: totalStops - completedCount,
      totalStops: totalStops
    }
  });
});

// Report an issue on route
router.post('/routes/:routeId/report-issue', verifyDriverToken, (req, res) => {
  const { routeId } = req.params;
  const { issueType, message, location, stopId } = req.body;
  
  console.log(`Issue reported on route ${routeId}: ${issueType} - ${message}`);
  
  res.json({ 
    success: true, 
    message: 'Issue reported successfully',
    data: {
      id: Date.now().toString(),
      type: issueType,
      message: message,
      location: location,
      timestamp: new Date().toISOString(),
      resolved: false
    }
  });
});

// ==================== ATTENDANCE ====================
router.post('/attendance/check-in', verifyDriverToken, (req, res) => {
  const { lat, lng, location } = req.body;
  console.log(`Driver ${req.user.name} checked in at:`, location);
  
  res.json({ 
    success: true, 
    message: 'Checked in successfully',
    data: {
      checkInTime: new Date().toISOString(),
      status: 'Present'
    }
  });
});

router.post('/attendance/check-out', verifyDriverToken, (req, res) => {
  const { lat, lng, location } = req.body;
  console.log(`Driver ${req.user.name} checked out at:`, location);
  
  res.json({ 
    success: true, 
    message: 'Checked out successfully',
    data: {
      checkOutTime: new Date().toISOString(),
      workDuration: '8 hours 30 minutes'
    }
  });
});

router.get('/attendance', verifyDriverToken, (req, res) => {
  res.json({
    success: true,
    data: [
      { _id: '1', date: new Date().toISOString(), checkInTime: '09:00 AM', checkOutTime: '05:30 PM', status: 'Present' },
      { _id: '2', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), checkInTime: '09:15 AM', checkOutTime: '05:30 PM', status: 'Late' },
      { _id: '3', date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), checkInTime: '09:00 AM', checkOutTime: '05:30 PM', status: 'Present' }
    ]
  });
});

// ==================== NOTIFICATIONS ====================
router.get('/notifications', verifyDriverToken, (req, res) => {
  res.json({
    success: true,
    data: [
      { _id: '1', title: 'New Route Assigned', message: 'You have a new route for tomorrow', type: 'route', read: false, createdAt: new Date() },
      { _id: '2', title: 'Performance Bonus', message: 'You earned a bonus of ₹5000 this month', type: 'earning', read: false, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
    ]
  });
});

router.put('/notifications/:id/read', verifyDriverToken, (req, res) => {
  res.json({ success: true, message: 'Notification marked as read' });
});

// Debug endpoint to check route states
router.get('/debug/states', verifyDriverToken, (req, res) => {
  res.json({ success: true, data: routeStates });
});

module.exports = router;