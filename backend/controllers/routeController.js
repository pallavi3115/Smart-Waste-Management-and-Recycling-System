const Route = require('../models/Route');
const Driver = require('../models/Driver');
const CollectionLog = require('../models/CollectionLog');
const Bin = require('../models/Bin');

// @desc    Get driver's assigned routes
// @route   GET /api/driver/routes
// @access  Private/Driver
exports.getAssignedRoutes = async (req, res) => {
  try {
    const { status, date } = req.query;
    
    const driver = await Driver.findOne({ user: req.user.id });
    
    let query = { driver: driver._id };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    } else {
      // Default to today and future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.date = { $gte: today };
    }

    const routes = await Route.find(query)
      .populate('stops.bin', 'binId location fillLevel status')
      .sort('date startTime');

    // Add progress calculation
    const routesWithProgress = routes.map(route => ({
      ...route.toObject(),
      progress: route.progress,
      totalWaste: route.getTotalWaste(),
      isOnSchedule: route.isOnSchedule()
    }));

    res.json({
      success: true,
      count: routes.length,
      data: routesWithProgress
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single route details
// @route   GET /api/driver/routes/:id
// @access  Private/Driver
exports.getRouteDetails = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('stops.bin', 'binId location fillLevel status type alerts');
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Verify driver owns this route
    const driver = await Driver.findOne({ user: req.user.id });
    if (route.driver.toString() !== driver._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this route'
      });
    }

    // Get optimized navigation order
    const stopsWithNavigation = route.stops.map((stop, index) => ({
      ...stop.toObject(),
      stopNumber: index + 1,
      distanceToNext: index < route.stops.length - 1 ? 
        calculateDistance(stop.binDetails.location, route.stops[index + 1].binDetails.location) : 0
    }));

    res.json({
      success: true,
      data: {
        ...route.toObject(),
        stops: stopsWithNavigation,
        progress: route.progress,
        totalWaste: route.getTotalWaste(),
        isOnSchedule: route.isOnSchedule()
      }
    });
  } catch (error) {
    console.error('Error fetching route details:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to calculate distance between two coordinates
function calculateDistance(point1, point2) {
  const R = 6371; // Earth's radius in km
  const lat1 = point1.lat;
  const lon1 = point1.lng;
  const lat2 = point2.lat;
  const lon2 = point2.lng;
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// @desc    Start a route
// @route   PUT /api/driver/routes/:id/start
// @access  Private/Driver
exports.startRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    if (route.status !== 'Assigned') {
      return res.status(400).json({
        success: false,
        message: 'Route cannot be started'
      });
    }

    route.status = 'Started';
    route.startTime = new Date();
    await route.save();

    // Add notification to driver
    const driver = await Driver.findOne({ user: req.user.id });
    driver.notifications.unshift({
      title: 'Route Started',
      message: `You have started route ${route.routeId}`,
      type: 'route_start'
    });
    await driver.save();

    res.json({
      success: true,
      data: route,
      message: 'Route started successfully'
    });
  } catch (error) {
    console.error('Error starting route:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Complete a stop
// @route   POST /api/driver/routes/:routeId/stop/:stopId/complete
// @access  Private/Driver
exports.completeStop = async (req, res) => {
  try {
    const { routeId, stopId } = req.params;
    const { wasteCollected, wasteType, photos, notes, issues } = req.body;

    const route = await Route.findById(routeId);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    const stop = route.stops.id(stopId);
    if (!stop) {
      return res.status(404).json({
        success: false,
        message: 'Stop not found'
      });
    }

    // Update stop
    stop.status = 'Completed';
    stop.actualArrival = stop.actualArrival || new Date();
    stop.actualDeparture = new Date();
    stop.wasteCollected = wasteCollected;
    stop.wasteType = wasteType;
    stop.photos = photos;
    stop.notes = notes;
    stop.issues = issues || [];

    // Update bin fill level
    if (stop.bin) {
      await Bin.findByIdAndUpdate(stop.bin, {
        currentFillLevel: 0,
        lastCollected: new Date()
      });
    }

    // Create collection log
    const collectionLog = await CollectionLog.create({
      route: route._id,
      driver: route.driver,
      bin: stop.bin,
      wasteType,
      quantity: wasteCollected,
      fillLevelBefore: stop.binDetails.expectedFillLevel,
      fillLevelAfter: 0,
      photos: {
        before: photos?.before,
        after: photos?.after
      },
      location: stop.binDetails.location,
      notes,
      issues
    });

    // Check if all stops are completed
    const allCompleted = route.stops.every(s => s.status === 'Completed');
    if (allCompleted) {
      route.status = 'Completed';
      route.endTime = new Date();
      route.actualDuration = (route.endTime - route.startTime) / (1000 * 60);
    } else {
      route.status = 'In Progress';
    }

    await route.save();

    res.json({
      success: true,
      data: {
        stop,
        collectionLog,
        routeProgress: route.progress,
        routeStatus: route.status
      },
      message: 'Stop completed successfully'
    });
  } catch (error) {
    console.error('Error completing stop:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Report issue on route
// @route   POST /api/driver/routes/:id/report-issue
// @access  Private/Driver
exports.reportIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, message, stopId } = req.body;

    const route = await Route.findById(id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    const alert = {
      type,
      message,
      timestamp: new Date(),
      resolved: false
    };

    route.alerts.push(alert);

    if (stopId) {
      const stop = route.stops.id(stopId);
      if (stop) {
        stop.status = 'Failed';
        stop.notes = message;
      }
    }

    await route.save();

    // Notify admin
    const io = req.app.get('io');
    io.emit('routeAlert', {
      routeId: route._id,
      alert,
      driver: req.user.id
    });

    res.json({
      success: true,
      data: alert,
      message: 'Issue reported successfully'
    });
  } catch (error) {
    console.error('Error reporting issue:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};