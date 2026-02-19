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
      
      // For mock users, we need valid ObjectId format
      // Let's create proper ObjectId-like strings
      const mockUsers = {
        '1': '000000000000000000000001', // Valid ObjectId format
        '2': '000000000000000000000002'
      };

      const mockObjectId = mockUsers[userId];
      
      if (!mockObjectId) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      // Set mock user with proper ObjectId format
      req.user = {
        id: mockObjectId,
        _id: mockObjectId,
        name: userId === '1' ? 'Admin User' : 'Citizen User',
        email: userId === '1' ? 'admin@test.com' : 'citizen@test.com',
        role: userId === '1' ? 'Admin' : 'Citizen'
      };
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
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};