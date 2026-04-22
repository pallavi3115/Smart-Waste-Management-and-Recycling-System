// backend/controllers/driverController.js
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const CollectionLog = require('../models/CollectionLog');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Bin = require('../models/Bin');

// ==================== DASHBOARD ====================

// @desc    Get driver dashboard data
// @route   GET /api/driver/dashboard
// @access  Private/Driver
exports.getDashboard = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    // Get today's route
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRoute = await Route.findOne({
      driver: driver._id,
      date: { $gte: today, $lt: tomorrow }
    }).populate('stops.bin', 'binId location fillLevel');

    // Get weekly stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyCollections = await CollectionLog.aggregate([
      {
        $match: {
          driver: driver._id,
          createdAt: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalWaste: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get attendance for this month
    const monthStart = new Date();
    monthStart.setDate(1);
    const attendance = await Attendance.find({
      driver: driver._id,
      date: { $gte: monthStart }
    });

    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const lateDays = attendance.filter(a => a.status === 'Late').length;
    const absentDays = attendance.filter(a => a.status === 'Absent').length;

    // Get notifications
    const notifications = driver.notifications || [];
    const recentNotifications = notifications.slice(-10).reverse();

    res.json({
      success: true,
      data: {
        driver: {
          ...driver.toObject(),
          user: await User.findById(driver.user).select('name email phoneNumber profilePicture')
        },
        todayRoute: todayRoute ? {
          id: todayRoute._id,
          routeId: todayRoute.routeId,
          status: todayRoute.status,
          stopsCount: todayRoute.stops.length,
          completedStops: todayRoute.stops.filter(s => s.status === 'Completed').length,
          progress: todayRoute.progress,
          totalWaste: todayRoute.getTotalWaste(),
          isOnSchedule: todayRoute.isOnSchedule()
        } : null,
        weeklyStats: {
          collections: weeklyCollections,
          totalWaste: weeklyCollections.reduce((sum, day) => sum + day.totalWaste, 0),
          averagePerDay: weeklyCollections.length ? 
            (weeklyCollections.reduce((sum, day) => sum + day.totalWaste, 0) / weeklyCollections.length).toFixed(1) : 0
        },
        attendance: {
          presentDays,
          lateDays,
          absentDays,
          totalDays: attendance.length
        },
        performance: driver.performance || { rating: 0, totalCollections: 0, onTimeRate: 0 },
        earnings: driver.earnings || { total: 0, thisMonth: 0, lastMonth: 0 },
        notifications: recentNotifications
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== LOCATION ====================

// @desc    Update driver location
// @route   POST /api/driver/location
// @access  Private/Driver
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng, heading, speed } = req.body;

    const driver = await Driver.findOne({ user: req.user.id });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    driver.currentLocation = {
      lat,
      lng,
      heading: heading || 0,
      speed: speed || 0,
      updatedAt: new Date()
    };
    driver.isOnline = true;
    await driver.save();

    // Update current route if in progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const currentRoute = await Route.findOne({
      driver: driver._id,
      date: { $gte: today, $lt: tomorrow },
      status: { $in: ['Started', 'In Progress'] }
    });

    if (currentRoute) {
      // Emit location via socket
      const io = req.app.get('io');
      if (io) {
        io.emit('driverLocation', {
          driverId: driver._id,
          location: { lat, lng, heading, speed },
          routeId: currentRoute._id
        });
      }
    }

    res.json({
      success: true,
      message: 'Location updated'
    });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== PROFILE ====================

// @desc    Get driver profile
// @route   GET /api/driver/profile
// @access  Private/Driver
exports.getProfile = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id })
      .populate('user', 'name email phoneNumber profilePicture address');
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    res.json({
      success: true,
      data: driver
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update driver profile
// @route   PUT /api/driver/profile
// @access  Private/Driver
exports.updateProfile = async (req, res) => {
  try {
    const { phoneNumber, address, vehicleNumber, name } = req.body;

    // Update user
    await User.findByIdAndUpdate(req.user.id, { 
      phoneNumber, 
      address,
      name: name || undefined
    });

    // Update driver
    const driver = await Driver.findOneAndUpdate(
      { user: req.user.id },
      { vehicleNumber },
      { new: true }
    ).populate('user', 'name email phoneNumber profilePicture address');

    res.json({
      success: true,
      data: driver,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== STATUS ====================

// @desc    Toggle online status
// @route   PUT /api/driver/toggle-status
// @access  Private/Driver
exports.toggleStatus = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }
    
    driver.isOnline = !driver.isOnline;
    await driver.save();

    res.json({
      success: true,
      isOnline: driver.isOnline,
      message: driver.isOnline ? 'You are now online' : 'You are now offline'
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== EARNINGS ====================

// @desc    Get driver earnings
// @route   GET /api/driver/earnings
// @access  Private/Driver
exports.getEarnings = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }
    
    // Get monthly breakdown
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyEarnings = await CollectionLog.aggregate([
      {
        $match: {
          driver: driver._id,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalWaste: { $sum: '$quantity' },
          collections: { $sum: 1 },
          earnings: { $sum: { $multiply: ['$quantity', 5] } } // ₹5 per kg
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        current: driver.earnings || { total: 0, thisMonth: 0, lastMonth: 0 },
        monthlyBreakdown: monthlyEarnings
      }
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== ROUTES ====================

// @desc    Get all routes for driver
// @route   GET /api/driver/routes
// @access  Private/Driver
exports.getRoutes = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    const { status, date, limit = 50 } = req.query;
    
    // Build query
    let query = { driver: driver._id };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const routes = await Route.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .populate('stops.bin', 'binId location fillLevel');
    
    const formattedRoutes = routes.map(route => ({
      _id: route._id,
      routeId: route.routeId,
      driver: route.driver,
      truckId: route.truckId,
      status: route.status,
      date: route.date,
      shift: route.shift,
      progress: route.progress,
      totalWaste: route.getTotalWaste(),
      totalStops: route.stops.length,
      completedStops: route.stops.filter(s => s.status === 'Completed').length,
      isOnSchedule: route.isOnSchedule(),
      startTime: route.startTime,
      endTime: route.endTime,
      stops: route.stops.map((stop, idx) => ({
        _id: stop._id,
        stopId: stop.stopId,
        location: stop.binDetails?.location?.address || stop.bin?.location?.address,
        status: stop.status,
        completed: stop.status === 'Completed',
        wasteCollected: stop.wasteCollected,
        expectedFillLevel: stop.binDetails?.expectedFillLevel || stop.bin?.fillLevel,
        order: idx + 1
      }))
    }));
    
    res.json({
      success: true,
      count: formattedRoutes.length,
      data: formattedRoutes
    });
    
  } catch (error) {
    console.error('Get routes error:', error);
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
    const { id } = req.params;
    const driver = await Driver.findOne({ user: req.user.id });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }
    
    // Find route by _id or routeId
    const route = await Route.findOne({
      $or: [{ _id: id }, { routeId: id }],
      driver: driver._id
    }).populate('stops.bin', 'binId location fillLevel type');
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }
    
    // Format stops with proper IDs
    const formattedStops = route.stops.map((stop, index) => ({
      _id: stop._id,
      stopId: stop.stopId,
      bin: stop.bin,
      binDetails: stop.binDetails,
      status: stop.status,
      completed: stop.status === 'Completed',
      wasteCollected: stop.wasteCollected || 0,
      wasteType: stop.wasteType,
      notes: stop.notes,
      issues: stop.issues || [],
      estimatedArrival: stop.estimatedArrival,
      actualArrival: stop.actualArrival,
      estimatedDeparture: stop.estimatedDeparture,
      actualDeparture: stop.actualDeparture,
      location: stop.binDetails?.location?.address || stop.bin?.location?.address,
      expectedFillLevel: stop.binDetails?.expectedFillLevel || stop.bin?.fillLevel,
      photos: stop.photos || [],
      order: index + 1
    }));
    
    res.json({
      success: true,
      data: {
        _id: route._id,
        routeId: route.routeId,
        driver: route.driver,
        truckId: route.truckId,
        status: route.status,
        date: route.date,
        shift: route.shift,
        progress: route.progress,
        totalWaste: route.getTotalWaste(),
        totalStops: route.stops.length,
        completedStops: route.stops.filter(s => s.status === 'Completed').length,
        isOnSchedule: route.isOnSchedule(),
        startTime: route.startTime,
        endTime: route.endTime,
        estimatedDuration: route.estimatedDuration,
        actualDuration: route.actualDuration,
        totalDistance: route.totalDistance,
        fuelUsed: route.fuelUsed,
        stops: formattedStops,
        alerts: route.alerts || [],
        routeGeometry: route.routeGeometry,
        notes: route.notes,
        createdAt: route.createdAt,
        updatedAt: route.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Get route details error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Start a route
// @route   PUT /api/driver/routes/:id/start
// @access  Private/Driver
exports.startRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findOne({ user: req.user.id });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }
    
    const route = await Route.findOneAndUpdate(
      { $or: [{ _id: id }, { routeId: id }], driver: driver._id },
      { 
        status: 'In Progress',
        startTime: new Date()
      },
      { new: true }
    );
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }
    
    // Update driver status
    driver.isOnline = true;
    await driver.save();
    
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('routeStarted', {
        driverId: driver._id,
        driverName: driver.name,
        routeId: route._id,
        routeNumber: route.routeId
      });
    }
    
    res.json({
      success: true,
      message: 'Route started successfully',
      data: {
        _id: route._id,
        routeId: route.routeId,
        status: route.status,
        startTime: route.startTime,
        totalStops: route.stops.length
      }
    });
    
  } catch (error) {
    console.error('Start route error:', error);
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
    const { wasteCollected, wasteType, notes, photos, actualFillLevel } = req.body;
    const driver = await Driver.findOne({ user: req.user.id });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }
    
    console.log('Completing stop:', { routeId, stopId, wasteCollected, wasteType });
    
    // Find the route
    let route = await Route.findOne({
      $or: [{ _id: routeId }, { routeId: routeId }],
      driver: driver._id
    });
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }
    
    // Find the stop - try multiple ways
    let stopIndex = -1;
    
    // Try by MongoDB _id
    stopIndex = route.stops.findIndex(s => s._id.toString() === stopId);
    
    // Try by stopId (Number)
    if (stopIndex === -1) {
      stopIndex = route.stops.findIndex(s => s.stopId === parseInt(stopId) || s.stopId === stopId);
    }
    
    if (stopIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Stop not found with ID: ${stopId}. Available stops: ${route.stops.map(s => s.stopId || s._id).join(', ')}`
      });
    }
    
    const stop = route.stops[stopIndex];
    
    // Update stop
    stop.status = 'Completed';
    stop.wasteCollected = parseFloat(wasteCollected) || 0;
    stop.wasteType = wasteType || 'General';
    stop.notes = notes || '';
    stop.actualArrival = stop.actualArrival || new Date();
    stop.actualDeparture = new Date();
    
    if (actualFillLevel) {
      stop.binDetails = {
        ...stop.binDetails,
        actualFillLevel: actualFillLevel
      };
    }
    
    if (photos) {
      stop.photos = stop.photos || [];
      if (photos.before) {
        stop.photos.push({ before: photos.before, timestamp: new Date() });
      }
      if (photos.after) {
        stop.photos.push({ after: photos.after, timestamp: new Date() });
      }
    }
    
    // Update bin fill level if bin reference exists
    if (stop.bin) {
      await Bin.findByIdAndUpdate(stop.bin, {
        fillLevel: actualFillLevel || 0,
        lastEmptied: new Date()
      });
    }
    
    // Create collection log
    await CollectionLog.create({
      driver: driver._id,
      route: route._id,
      bin: stop.bin,
      stopId: stop._id,
      quantity: parseFloat(wasteCollected) || 0,
      wasteType: wasteType || 'General',
      notes: notes || '',
      collectedAt: new Date()
    });
    
    // Calculate progress
    const completedStops = route.stops.filter(s => s.status === 'Completed').length;
    const totalStops = route.stops.length;
    const progress = (completedStops / totalStops) * 100;
    
    // Update route progress
    route.progress = progress;
    
    if (completedStops === totalStops) {
      route.status = 'Completed';
      route.endTime = new Date();
      route.actualDuration = route.endTime - route.startTime;
    }
    
    await route.save();
    
    // Update driver's total collections
    driver.performance = driver.performance || { rating: 0, totalCollections: 0, onTimeRate: 0 };
    driver.performance.totalCollections = (driver.performance.totalCollections || 0) + 1;
    driver.earnings = driver.earnings || { total: 0, thisMonth: 0, lastMonth: 0 };
    driver.earnings.total = (driver.earnings.total || 0) + (parseFloat(wasteCollected) || 0) * 5; // ₹5 per kg
    await driver.save();
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('stopCompleted', {
        driverId: driver._id,
        driverName: driver.name,
        routeId: route._id,
        routeNumber: route.routeId,
        stopId: stop._id,
        stopNumber: stopIndex + 1,
        progress: progress,
        completedStops: completedStops,
        remainingStops: totalStops - completedStops,
        totalStops: totalStops
      });
    }
    
    res.json({
      success: true,
      message: 'Stop completed successfully',
      data: {
        stop: {
          _id: stop._id,
          stopId: stop.stopId,
          status: stop.status,
          wasteCollected: stop.wasteCollected,
          wasteType: stop.wasteType,
          completedAt: stop.actualDeparture
        },
        progress: progress,
        totalWaste: route.getTotalWaste(),
        routeStatus: route.status,
        completedStops: completedStops,
        remainingStops: totalStops - completedStops,
        totalStops: totalStops
      }
    });
    
  } catch (error) {
    console.error('Complete stop error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Report an issue on route
// @route   POST /api/driver/routes/:routeId/report-issue
// @access  Private/Driver
exports.reportIssue = async (req, res) => {
  try {
    const { routeId } = req.params;
    const { issueType, message, location, stopId } = req.body;
    const driver = await Driver.findOne({ user: req.user.id });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }
    
    const route = await Route.findOne({
      $or: [{ _id: routeId }, { routeId: routeId }],
      driver: driver._id
    });
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }
    
    // Add alert to route
    route.alerts = route.alerts || [];
    route.alerts.push({
      type: issueType || 'General',
      message: message,
      location: location,
      stopId: stopId,
      timestamp: new Date(),
      resolved: false
    });
    
    await route.save();
    
    // Emit alert to admin
    const io = req.app.get('io');
    if (io) {
      io.emit('driverAlert', {
        driverId: driver._id,
        driverName: driver.name,
        routeId: route._id,
        routeNumber: route.routeId,
        alert: route.alerts[route.alerts.length - 1]
      });
    }
    
    res.json({
      success: true,
      message: 'Issue reported successfully',
      data: route.alerts[route.alerts.length - 1]
    });
    
  } catch (error) {
    console.error('Report issue error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== ATTENDANCE ====================

// @desc    Check in for duty
// @route   POST /api/driver/attendance/check-in
// @access  Private/Driver
exports.checkIn = async (req, res) => {
  try {
    const { lat, lng, location } = req.body;
    const driver = await Driver.findOne({ user: req.user.id });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      driver: driver._id,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });
    
    if (existingAttendance && existingAttendance.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }
    
    const checkInTime = new Date();
    const isLate = checkInTime.getHours() > 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 30);
    
    const attendance = await Attendance.findOneAndUpdate(
      { driver: driver._id, date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } },
      {
        driver: driver._id,
        date: today,
        checkInTime: checkInTime,
        checkInLocation: { lat, lng, address: location },
        status: isLate ? 'Late' : 'Present'
      },
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      message: isLate ? 'Checked in late' : 'Checked in successfully',
      data: attendance
    });
    
  } catch (error) {
    console.error('Check in error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check out from duty
// @route   POST /api/driver/attendance/check-out
// @access  Private/Driver
exports.checkOut = async (req, res) => {
  try {
    const { lat, lng, location } = req.body;
    const driver = await Driver.findOne({ user: req.user.id });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({
      driver: driver._id,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'No check-in found for today'
      });
    }
    
    if (attendance.checkOutTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out'
      });
    }
    
    attendance.checkOutTime = new Date();
    attendance.checkOutLocation = { lat, lng, address: location };
    await attendance.save();
    
    // Calculate work duration
    const workDuration = (attendance.checkOutTime - attendance.checkInTime) / (1000 * 60); // minutes
    
    res.json({
      success: true,
      message: 'Checked out successfully',
      data: {
        ...attendance.toObject(),
        workDuration: `${Math.floor(workDuration / 60)} hours ${Math.floor(workDuration % 60)} minutes`
      }
    });
    
  } catch (error) {
    console.error('Check out error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get attendance history
// @route   GET /api/driver/attendance
// @access  Private/Driver
exports.getAttendance = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }
    
    const { year, month } = req.query;
    let query = { driver: driver._id };
    
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const attendance = await Attendance.find(query).sort({ date: -1 });
    
    res.json({
      success: true,
      data: attendance
    });
    
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== NOTIFICATIONS ====================

// @desc    Get driver notifications
// @route   GET /api/driver/notifications
// @access  Private/Driver
exports.getNotifications = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }
    
    res.json({
      success: true,
      data: driver.notifications || []
    });
    
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/driver/notifications/:id/read
// @access  Private/Driver
exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findOne({ user: req.user.id });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }
    
    const notification = driver.notifications.id(id);
    if (notification) {
      notification.read = true;
      await driver.save();
    }
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
    
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};