// const express = require('express');
// const {
//   getRecyclingCenters,
//   getRecyclingCenter,
//   addRecyclingCenter,
//   getRecyclingStats
// } = require('../controllers/recyclingController');
// const { protect, authorize } = require('../middleware/auth');

// const router = express.Router();

// router.get('/centers', getRecyclingCenters);
// router.get('/centers/:id', getRecyclingCenter);
// router.post('/centers', protect, authorize('Admin'), addRecyclingCenter);
// router.get('/stats', getRecyclingStats);

// module.exports = router;

const express = require('express');
const router = express.Router();

// Simple placeholder routes
router.get('/centers', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalCenters: 0,
      totalRecycled: 0
    }
  });
});

module.exports = router;