const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/Auth');

// @desc    Generate QR code for bin
// @route   POST /api/qr/generate
// @access  Private/Admin
router.post('/generate', protect, (req, res) => {
  res.json({
    success: true,
    data: {
      qrCode: 'data:image/png;base64,mockQRCodeData',
      binId: req.body.binId
    }
  });
});

// @desc    Scan QR code
// @route   POST /api/qr/scan
// @access  Private
router.post('/scan', protect, (req, res) => {
  res.json({
    success: true,
    data: {
      binId: 'BIN-123',
      location: 'Sector 12, Central Park',
      fillLevel: 45,
      lastCollected: new Date()
    }
  });
});

// @desc    Get bin info by QR
// @route   GET /api/qr/bin/:code
// @access  Public
router.get('/bin/:code', (req, res) => {
  res.json({
    success: true,
    data: {
      binId: req.params.code,
      location: 'Sample Location',
      fillLevel: 50,
      status: 'Partial'
    }
  });
});

module.exports = router;