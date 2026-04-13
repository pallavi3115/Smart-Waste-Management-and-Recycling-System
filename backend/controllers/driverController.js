const Driver = require('../models/Driver');
const Route = require('../models/Route');
const CollectionLog = require('../models/CollectionLog');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

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
    const notifications = driver.notifications.slice(-10).reverse();

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
        performance: driver.performance,
        earnings: driver.earnings,
        notifications
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

// @desc    Update driver location
// @route   POST /api/driver/location
// @access  Private/Driver
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

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
      lastUpdated: new Date()
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
      io.emit('driverLocation', {
        driverId: driver._id,
        location: { lat, lng },
        routeId: currentRoute._id
      });
    }

    res.json({
      success: true,
      message: 'Location updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

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
    const { phoneNumber, address, vehicleNumber } = req.body;

    // Update user
    await User.findByIdAndUpdate(req.user.id, { phoneNumber, address });

    // Update driver
    const driver = await Driver.findOneAndUpdate(
      { user: req.user.id },
      { vehicleNumber },
      { new: true }
    );

    res.json({
      success: true,
      data: driver,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle online status
// @route   PUT /api/driver/toggle-status
// @access  Private/Driver
exports.toggleStatus = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });
    
    driver.isOnline = !driver.isOnline;
    await driver.save();

    res.json({
      success: true,
      isOnline: driver.isOnline,
      message: driver.isOnline ? 'You are now online' : 'You are now offline'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get driver earnings
// @route   GET /api/driver/earnings
// @access  Private/Driver
exports.getEarnings = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });
    
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
          collections: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        current: driver.earnings,
        monthlyBreakdown: monthlyEarnings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};