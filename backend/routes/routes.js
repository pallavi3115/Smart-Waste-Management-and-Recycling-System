const express = require('express');
const router = express.Router();

// ================== AUTH ==================
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

// ================== HELPER ==================
const calculateDistance = (p1, p2) => {
  const R = 6371;
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLon = (p2.lng - p1.lng) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(p1.lat * Math.PI / 180) *
    Math.cos(p2.lat * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

// ================== MOCK DATA ==================
let routesDB = [
  {
    _id: '1',
    routeId: 'R-2024-001',
    date: new Date(),
    shift: 'Morning',
    status: 'Assigned',
    totalDistance: 25,
    estimatedDuration: 180,
    stops: [
      {
        _id: 's1',
        stopNumber: 1,
        status: 'Pending',
        bin: { binId: 'BIN001' },
        binDetails: {
          location: { lat: 28.6139, lng: 77.2090 },
          expectedFillLevel: 90
        }
      },
      {
        _id: 's2',
        stopNumber: 2,
        status: 'Pending',
        bin: { binId: 'BIN002' },
        binDetails: {
          location: { lat: 28.6355, lng: 77.2290 },
          expectedFillLevel: 60
        }
      }
    ]
  }
];

// ================== GET ALL ROUTES ==================
router.get('/', verifyDriverToken, (req, res) => {
  const data = routesDB.map(r => ({
    ...r,
    stopsCount: r.stops.length,
    completedStops: r.stops.filter(s => s.status === "Completed").length,
    progress:
      (r.stops.filter(s => s.status === "Completed").length / r.stops.length) * 100
  }));

  res.json({ success: true, data });
});

// ================== GET SINGLE ROUTE ==================
router.get('/:id', verifyDriverToken, (req, res) => {
  const route = routesDB.find(r => r._id === req.params.id);

  if (!route) {
    return res.status(404).json({ success: false, message: "Route not found" });
  }

  res.json({
    success: true,
    data: {
      ...route,
      progress:
        (route.stops.filter(s => s.status === "Completed").length / route.stops.length) * 100
    }
  });
});

// ================== OPTIMIZE ROUTE 🔥 ==================
router.put('/:id/optimize', verifyDriverToken, (req, res) => {
  const route = routesDB.find(r => r._id === req.params.id);

  if (!route) {
    return res.status(404).json({ success: false, message: "Route not found" });
  }

  let stops = [...route.stops];

  // 🔥 Step 1: Priority (high fill first)
  stops.sort((a, b) =>
    (b.binDetails?.expectedFillLevel || 0) -
    (a.binDetails?.expectedFillLevel || 0)
  );

  // 🔥 Step 2: Nearest neighbor
  const optimized = [];
  let current = stops.shift();

  optimized.push(current);

  while (stops.length > 0) {
    let nearestIndex = 0;
    let minDist = Infinity;

    stops.forEach((stop, i) => {
      const dist = calculateDistance(
        current.binDetails.location,
        stop.binDetails.location
      );

      if (dist < minDist) {
        minDist = dist;
        nearestIndex = i;
      }
    });

    current = stops.splice(nearestIndex, 1)[0];
    optimized.push(current);
  }

  // update order
  optimized.forEach((s, i) => (s.stopNumber = i + 1));

  route.stops = optimized;

  res.json({
    success: true,
    data: route,
    message: "Route optimized 🚀"
  });
});

// ================== START ROUTE ==================
router.put('/:id/start', verifyDriverToken, (req, res) => {
  const route = routesDB.find(r => r._id === req.params.id);

  route.status = "Started";

  res.json({
    success: true,
    message: "Route started successfully",
    data: route
  });
});

// ================== COMPLETE STOP ==================
router.post('/:routeId/stop/:stopId/complete', verifyDriverToken, (req, res) => {
  const route = routesDB.find(r => r._id === req.params.routeId);

  const stop = route.stops.find(s => s._id === req.params.stopId);

  if (!stop) {
    return res.status(404).json({ success: false, message: "Stop not found" });
  }

  stop.status = "Completed";

  res.json({
    success: true,
    message: "Stop completed ✅",
    data: stop
  });
});

// ================== REPORT ISSUE ==================
router.post('/:id/report-issue', verifyDriverToken, (req, res) => {
  res.json({
    success: true,
    message: "Issue reported successfully ⚠️"
  });
});

module.exports = router;