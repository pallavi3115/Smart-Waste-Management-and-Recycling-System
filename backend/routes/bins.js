const express = require('express');
const {
  registerBin,
  updateBinStatus,
  getAllBins,
  getBinById,        // Make sure this matches the exported function name
  getBinStatus,      // If you have this function
  getBinsByArea,     // If you have this function
  recordCollection,
  getBinStats
} = require('../controllers/binController');
const { protect, authorize } = require('../middleware/Auth');

const router = express.Router();

// Public routes
router.get('/all', getAllBins);
router.get('/status/:id', getBinById); // or getBinStatus - use the correct one
router.post('/update', updateBinStatus);

// Protected routes
router.post('/register', protect, authorize('Admin'), registerBin);
router.post('/collect', protect, authorize('Driver'), recordCollection);
router.get('/stats', protect, authorize('Admin'), getBinStats);

// Optional: if you have these routes
if (getBinsByArea) {
  router.get('/area/:area', getBinsByArea);
}

module.exports = router;