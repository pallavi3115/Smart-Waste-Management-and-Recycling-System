// const express = require('express');
// const {
//   registerBin,
//   updateBinStatus,
//   getAllBins,
//   getBinStatus
// } = require('../controllers/binController');
// const { protect, authorize } = require('../middleware/Auth');

// const router = express.Router();

// router.post('/register', protect, authorize('Admin'), registerBin);
// router.post('/update', updateBinStatus);
// router.get('/all', protect, authorize('Admin'), getAllBins);
// router.get('/status/:id', getBinStatus);

// module.exports = router;



const express = require('express');
const {
  registerBin,
  updateBinStatus,
  getAllBins,
  getBinStatus,
  getBinsByArea
} = require('../controllers/binController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register', protect, authorize('Admin'), registerBin);
router.post('/update', updateBinStatus);
router.get('/all', getAllBins);
router.get('/status/:id', getBinStatus);
router.get('/area/:area', getBinsByArea);

module.exports = router;