const express = require('express');
const {
  registerBin,
  updateBinStatus,
  getAllBins,
  getBinById,
  getBinStats
} = require('../controllers/binController');

const router = express.Router();

// 🌍 PUBLIC ROUTES
router.get('/all', getAllBins);            // सभी bins
router.get('/:id', getBinById);            // single bin (⚠️ change किया)
router.post('/update', updateBinStatus);   // IoT updates

// 🔐 ADMIN ROUTES
router.post('/register', registerBin);     // add new bin
router.get('/stats', getBinStats);         // analytics

module.exports = router;