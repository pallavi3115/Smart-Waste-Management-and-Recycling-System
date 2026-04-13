const express = require('express');
const router = express.Router();

// Middleware to verify driver token
const verifyDriverToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token || !token.startsWith('mock-jwt-token-')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  const userId = token.split('-').pop();
  
  const users = {
    '1': { id: '1', role: 'Admin' },
    '2': { id: '2', role: 'Citizen' },
    '3': { id: '3', role: 'Driver' }
  };
  
  const user = users[userId];
  
  if (!user || user.role !== 'Driver') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  
  req.user = user;
  next();
};

// Get assigned routes
router.get('/', verifyDriverToken, (req, res) => {
  res.json({
    success: true,
    data: [
      {
        _id: '1',
        routeId: 'R-2024-001',
        date: new Date(),
        shift: 'Morning',
        status: 'Assigned',
        stopsCount: 12,
        completedStops: 0,
        progress: 0,
        totalDistance: 25,
        estimatedDuration: 180
      },
      {
        _id: '2',
        routeId: 'R-2024-002',
        date: new Date(Date.now() + 86400000),
        shift: 'Morning',
        status: 'Assigned',
        stopsCount: 8,
        completedStops: 0,
        progress: 0,
        totalDistance: 18,
        estimatedDuration: 120
      }
    ]
  });
});

// Get single route details
router.get('/:id', verifyDriverToken, (req, res) => {
  res.json({
    success: true,
    data: {
      _id: req.params.id,
      routeId: 'R-2024-001',
      date: new Date(),
      shift: 'Morning',
      status: 'Assigned',
      stops: [
        {
          _id: 'stop1',
          stopNumber: 1,
          bin: { binId: 'BIN001', location: { lat: 28.6139, lng: 77.2090 } },
          binDetails: { expectedFillLevel: 75 },
          status: 'Pending'
        },
        {
          _id: 'stop2',
          stopNumber: 2,
          bin: { binId: 'BIN002', location: { lat: 28.6355, lng: 77.2290 } },
          binDetails: { expectedFillLevel: 60 },
          status: 'Pending'
        }
      ],
      progress: 0,
      totalDistance: 25,
      estimatedDuration: 180
    }
  });
});

// Start route
router.put('/:id/start', verifyDriverToken, (req, res) => {
  res.json({ success: true, message: 'Route started successfully' });
});

// Complete stop
router.post('/:routeId/stop/:stopId/complete', verifyDriverToken, (req, res) => {
  res.json({ success: true, message: 'Stop completed successfully' });
});

// Report issue
router.post('/:id/report-issue', verifyDriverToken, (req, res) => {
  res.json({ success: true, message: 'Issue reported successfully' });
});

module.exports = router;