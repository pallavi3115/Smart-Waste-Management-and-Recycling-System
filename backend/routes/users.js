// const express = require('express');
// const router = express.Router();
// const { protect, authorize } = require('../middleware/auth');

// // @desc    Get all users
// // @route   GET /api/users
// // @access  Private/Admin
// router.get('/', protect, authorize('Admin'), (req, res) => {
//   res.json({
//     success: true,
//     data: []
//   });
// });

// // @desc    Get user by ID
// // @route   GET /api/users/:id
// // @access  Private/Admin
// router.get('/:id', protect, authorize('Admin'), (req, res) => {
//   res.json({
//     success: true,
//     data: {
//       id: req.params.id,
//       name: 'Sample User',
//       email: 'user@example.com',
//       role: 'Citizen'
//     }
//   });
// });

// // @desc    Update user
// // @route   PUT /api/users/:id
// // @access  Private/Admin
// router.put('/:id', protect, authorize('Admin'), (req, res) => {
//   res.json({
//     success: true,
//     data: req.body
//   });
// });

// // @desc    Delete user
// // @route   DELETE /api/users/:id
// // @access  Private/Admin
// router.delete('/:id', protect, authorize('Admin'), (req, res) => {
//   res.json({
//     success: true,
//     message: 'User deleted successfully'
//   });
// });

// // @desc    Get user profile
// // @route   GET /api/users/profile/me
// // @access  Private
// router.get('/profile/me', protect, (req, res) => {
//   res.json({
//     success: true,
//     data: req.user
//   });
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/Auth');
const User = require('../models/User');

// GET ALL STAFF
router.get('/', protect, async (req, res) => {
  try {
    const staff = await User.find().select('-password');

    res.json({
      success: true,
      data: staff
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD STAFF
router.post('/', protect, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE STAFF
router.put('/:id', protect, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE STAFF
router.delete('/:id', protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User deleted"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;