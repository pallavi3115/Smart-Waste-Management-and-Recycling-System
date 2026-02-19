const express = require('express');
const router = express.Router();

// @desc    Get all map data
// @route   GET /api/map/data
// @access  Public
router.get('/data', (req, res) => {
  res.json({
    success: true,
    data: {
      bins: [],
      reports: [],
      centers: [],
      toilets: []
    }
  });
});

// @desc    Get heatmap data
// @route   GET /api/map/heatmap
// @access  Public
router.get('/heatmap', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// @desc    Get route between points
// @route   POST /api/map/route
// @access  Private
router.post('/route', (req, res) => {
  res.json({
    success: true,
    data: {
      distance: 5000,
      duration: 1200,
      polyline: 'mock_polyline_data'
    }
  });
});

// @desc    Reverse geocode
// @route   GET /api/map/geocode
// @access  Public
router.get('/geocode', (req, res) => {
  res.json({
    success: true,
    data: {
      address: 'Sample Address',
      ward: 'Ward 1',
      city: 'Delhi'
    }
  });
});

module.exports = router;