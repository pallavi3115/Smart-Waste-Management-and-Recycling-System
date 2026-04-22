const express = require('express');
const { protect, authorize } = require('../middleware/Auth');
const User = require('../models/User');
const Driver = require('../models/Driver');

const router = express.Router();

// All admin routes are protected and require Admin role
router.use(protect);
router.use(authorize('Admin'));

// ==================== DASHBOARD ROUTES ====================

// Admin dashboard stats
router.get('/dashboard', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      totalBins: 156,
      binsCollectedToday: 23,
      recyclingRate: '68%',
      activeAlerts: 3,
      monthlyTrend: '+12%'
    }
  });
});

// ==================== STAFF MANAGEMENT ROUTES ====================

// @desc    Get all users (for staff management)
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    
    // For each user, fetch additional driver info if role is Driver
    const usersWithDetails = await Promise.all(users.map(async (user) => {
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        address: user.address,
        createdAt: user.createdAt,
        status: user.isActive ? 'Active' : 'Inactive'
      };
      
      // If user is a driver, fetch driver-specific details
      if (user.role === 'Driver') {
        const driver = await Driver.findOne({ user: user._id });
        if (driver) {
          userData.employeeId = driver.employeeId;
          userData.vehicleType = driver.vehicleType;
          userData.vehicleNumber = driver.vehicleNumber;
          userData.assignedZone = driver.assignedZone;
          userData.shift = driver.shift;
          userData.performance = driver.performance;
          userData.earnings = driver.earnings;
          userData.joiningDate = driver.joiningDate;
        }
      }
      
      return userData;
    }));
    
    res.json({
      success: true,
      count: usersWithDetails.length,
      data: usersWithDetails
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @desc    Get single user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      address: user.address,
      createdAt: user.createdAt,
      status: user.isActive ? 'Active' : 'Inactive'
    };
    
    // If user is a driver, fetch driver details
    if (user.role === 'Driver') {
      const driver = await Driver.findOne({ user: user._id });
      if (driver) {
        userData.employeeId = driver.employeeId;
        userData.vehicleType = driver.vehicleType;
        userData.vehicleNumber = driver.vehicleNumber;
        userData.assignedZone = driver.assignedZone;
        userData.shift = driver.shift;
        userData.joiningDate = driver.joiningDate;
        userData.performance = driver.performance;
        userData.earnings = driver.earnings;
      }
    }
    
    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @desc    Create new staff member (Admin/Driver/Supervisor)
// @route   POST /api/admin/users
// @access  Private/Admin
router.post('/users', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role, 
      phoneNumber, 
      address, 
      employeeId, 
      vehicleType, 
      vehicleNumber, 
      assignedZone, 
      shift 
    } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Driver',
      phoneNumber,
      address,
      isActive: true
    });
    
    // If role is Driver, create driver profile
    if (role === 'Driver') {
      await Driver.create({
        user: user._id,
        employeeId: employeeId || `EMP${Date.now().toString().slice(-6)}`,
        vehicleType: vehicleType || 'Truck',
        vehicleNumber: vehicleNumber || 'PENDING',
        assignedZone: assignedZone || 'Zone A',
        shift: shift || 'Morning',
        joiningDate: new Date(),
        status: 'Active'
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @desc    Update staff member
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', async (req, res) => {
  try {
    const { name, phoneNumber, address, role, status, employeeId, vehicleType, vehicleNumber, assignedZone, shift } = req.body;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        phoneNumber, 
        address, 
        role, 
        isActive: status === 'Active' 
      },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // If user is a driver, update driver profile
    if (user.role === 'Driver') {
      await Driver.findOneAndUpdate(
        { user: user._id },
        { 
          employeeId,
          vehicleType,
          vehicleNumber,
          assignedZone,
          shift
        },
        { upsert: true, new: true }
      );
    }
    
    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @desc    Delete staff member
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // If user is a driver, delete driver profile
    if (user.role === 'Driver') {
      await Driver.findOneAndDelete({ user: user._id });
    }
    
    // Delete user
    await User.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @desc    Get staff statistics
// @route   GET /api/admin/staff-stats
// @access  Private/Admin
router.get('/staff-stats', async (req, res) => {
  try {
    const totalStaff = await User.countDocuments({ role: { $in: ['Admin', 'Driver', 'Supervisor'] } });
    const activeDrivers = await User.countDocuments({ role: 'Driver', isActive: true });
    const totalDrivers = await User.countDocuments({ role: 'Driver' });
    const supervisors = await User.countDocuments({ role: 'Supervisor' });
    const admins = await User.countDocuments({ role: 'Admin' });
    
    // Get top performers (drivers with highest ratings)
    const drivers = await Driver.find()
      .populate('user', 'name email')
      .sort('-performance.rating')
      .limit(5);
    
    res.json({
      success: true,
      data: {
        totalStaff,
        activeDrivers,
        totalDrivers,
        supervisors,
        admins,
        topPerformers: drivers.map(d => ({
          id: d._id,
          name: d.user?.name,
          email: d.user?.email,
          rating: d.performance?.rating || 0,
          collections: d.performance?.totalCollections || 0,
          employeeId: d.employeeId
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching staff stats:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ==================== EXISTING ROUTES ====================
// Add any other existing admin routes here...

module.exports = router;