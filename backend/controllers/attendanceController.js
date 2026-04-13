const Attendance = require('../models/Attendance');
const Driver = require('../models/Driver');

// @desc    Check in
// @route   POST /api/driver/attendance/check-in
// @access  Private/Driver
exports.checkIn = async (req, res) => {
  try {
    const { location, photo, notes } = req.body;

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
    let attendance = await Attendance.findOne({
      driver: driver._id,
      date: today
    });

    if (attendance) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }

    // Get shift start time
    const shiftStart = new Date();
    const [hours, minutes] = driver.shiftTimings.start.split(':');
    shiftStart.setHours(parseInt(hours), parseInt(minutes), 0);

    const isLate = new Date() > shiftStart;
    const lateMinutes = isLate ? Math.floor((new Date() - shiftStart) / (1000 * 60)) : 0;

    attendance = await Attendance.create({
      driver: driver._id,
      date: today,
      shift: driver.shift,
      checkIn: {
        time: new Date(),
        location,
        photo,
        notes
      },
      status: isLate ? 'Late' : 'Present',
      lateMinutes
    });

    // Update driver online status
    driver.isOnline = true;
    await driver.save();

    res.json({
      success: true,
      data: attendance,
      message: isLate ? `Checked in late by ${lateMinutes} minutes` : 'Checked in successfully'
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check out
// @route   POST /api/driver/attendance/check-out
// @access  Private/Driver
exports.checkOut = async (req, res) => {
  try {
    const { location, photo, notes } = req.body;

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
      date: today
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No check-in found for today'
      });
    }

    if (attendance.checkOut.time) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out'
      });
    }

    // Calculate overtime
    const shiftEnd = new Date();
    const [hours, minutes] = driver.shiftTimings.end.split(':');
    shiftEnd.setHours(parseInt(hours), parseInt(minutes), 0);

    const overtime = new Date() > shiftEnd ? Math.floor((new Date() - shiftEnd) / (1000 * 60)) : 0;

    attendance.checkOut = {
      time: new Date(),
      location,
      photo,
      notes
    };
    attendance.overtime = overtime;

    await attendance.save();

    // Update driver online status
    driver.isOnline = false;
    await driver.save();

    res.json({
      success: true,
      data: attendance,
      message: overtime ? `Checked out with ${overtime} minutes overtime` : 'Checked out successfully'
    });
  } catch (error) {
    console.error('Check-out error:', error);
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
    const { year, month } = req.query;
    
    const driver = await Driver.findOne({ user: req.user.id });
    
    let query = { driver: driver._id };
    
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query).sort('-date');

    // Calculate statistics
    const stats = {
      present: attendance.filter(a => a.status === 'Present').length,
      late: attendance.filter(a => a.status === 'Late').length,
      absent: attendance.filter(a => a.status === 'Absent').length,
      halfDay: attendance.filter(a => a.status === 'Half Day').length,
      leave: attendance.filter(a => a.status === 'Leave').length,
      totalOvertime: attendance.reduce((sum, a) => sum + (a.overtime || 0), 0),
      totalLate: attendance.reduce((sum, a) => sum + (a.lateMinutes || 0), 0)
    };

    res.json({
      success: true,
      data: {
        records: attendance,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};