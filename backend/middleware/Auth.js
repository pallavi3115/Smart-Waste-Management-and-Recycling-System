const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // For development with mock tokens
    if (token.startsWith('mock-jwt-token-')) {
      const userId = token.split('-').pop();
      
      // Mock users with proper ObjectId format - ADDED DRIVER
      const mockUsers = {
        '1': {
          id: '000000000000000000000001',
          _id: '000000000000000000000001',
          name: 'Admin User',
          email: 'admin@test.com',
          role: 'Admin',
          phoneNumber: '9876543210'
        },
        '2': {
          id: '000000000000000000000002',
          _id: '000000000000000000000002',
          name: 'Citizen User',
          email: 'citizen@test.com',
          role: 'Citizen',
          phoneNumber: '9876543211'
        },
        '3': {
          id: '000000000000000000000003',
          _id: '000000000000000000000003',
          name: 'Driver User',
          email: 'driver@test.com',
          role: 'Driver',
          phoneNumber: '9876543212'
        }
      };

      const user = mockUsers[userId];
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token - User not found'
        });
      }

      // Set mock user with proper ObjectId format
      req.user = user;
      return next();
    }

    // For real JWT tokens
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route. Required: ${roles.join(', ')}`
      });
    }
    next();
  };
};