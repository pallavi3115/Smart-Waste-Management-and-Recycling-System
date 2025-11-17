const express = require('express');
const {
  getRecyclingCenters,
  getRecyclingCenter,
  addRecyclingCenter,
  getRecyclingStats
} = require('../controllers/recyclingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/centers', getRecyclingCenters);
router.get('/centers/:id', getRecyclingCenter);
router.post('/centers', protect, authorize('Admin'), addRecyclingCenter);
router.get('/stats', getRecyclingStats);

module.exports = router;