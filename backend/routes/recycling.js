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

/*const express = require('express');
const router = express.Router();

// GET all centers
router.get('/centers', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// GET stats
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalCenters: 0,
      totalRecycled: 0
    }
  });
});

// 🔥 ADD THIS (IMPORTANT)
router.post('/centers', (req, res) => {
  try {
    const newCenter = req.body;

    res.status(201).json({
      success: true,
      message: "Center created successfully",
      data: newCenter
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;*/


const express = require('express');
const router = express.Router();

const RecyclingCenter = require('../models/RecyclingCenter');


// ✅ CREATE CENTER
router.post('/centers', async (req, res) => {
  try {
    const { name, capacity, latitude, longitude, address } = req.body;

    if (!name || !capacity || latitude === undefined || longitude === undefined || !address) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const newCenter = new RecyclingCenter({
      name,
      capacity,
      latitude,
      longitude,
      address,
      current_load: 0,
      isActive: true
    });

    await newCenter.save();

    res.status(201).json({
      success: true,
      data: newCenter
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ GET ALL CENTERS
router.get('/centers', async (req, res) => {
  try {
    const centers = await RecyclingCenter.find();

    res.json({
      success: true,
      data: centers
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ STATS API (IMPORTANT 🔥)
router.get('/stats', async (req, res) => {
  try {
    const centers = await RecyclingCenter.find();

    const totalCenters = centers.length;

    const fullCapacity = centers.filter(
      c => c.current_load >= c.capacity
    ).length;

    const activeCenters = centers.filter(
      c => c.isActive
    ).length;

    res.json({
      success: true,
      data: {
        totalCenters,
        fullCapacity,
        activeCenters,
        utilizationRate: "70%"
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;