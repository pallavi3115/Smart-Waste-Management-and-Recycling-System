const express = require('express');
const router = express.Router();

const RecyclingCenter = require('../models/RecyclingCenter');

// ✅ CREATE CENTER (UPDATED with all fields)
router.post('/centers', async (req, res) => {
  try {
    const { 
      name, 
      capacity, 
      latitude, 
      longitude, 
      address,
      phone,
      email,
      operatingHours,
      contactPerson,
      description,
      materials
    } = req.body;

    if (!name || !capacity || latitude === undefined || longitude === undefined || !address) {
      return res.status(400).json({
        success: false,
        message: "Required fields: name, capacity, latitude, longitude, address"
      });
    }

    const newCenter = new RecyclingCenter({
      name,
      capacity,
      latitude,
      longitude,
      address,
      phone: phone || 'N/A',
      email: email || 'N/A',
      operatingHours: operatingHours || '9:00 AM - 6:00 PM',
      contactPerson: contactPerson || 'Not specified',
      description: description || '',
      materials: materials || [],
      current_load: 0,
      isActive: true,
      rating: { average: 0, count: 0 },
      totalProcessed: 0,
      co2Saved: 0
    });

    await newCenter.save();

    res.status(201).json({
      success: true,
      data: newCenter
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ GET ALL CENTERS (UPDATED to return all fields)
router.get('/centers', async (req, res) => {
  try {
    const centers = await RecyclingCenter.find();
    
    // Format centers to ensure all fields are present
    const formattedCenters = centers.map(center => ({
      _id: center._id,
      name: center.name,
      address: center.address,
      capacity: center.capacity,
      current_load: center.current_load || 0,
      latitude: center.latitude,
      longitude: center.longitude,
      phone: center.phone || 'N/A',
      email: center.email || 'N/A',
      operatingHours: center.operatingHours || '9:00 AM - 6:00 PM',
      contactPerson: center.contactPerson || 'Not specified',
      description: center.description || '',
      materials: center.materials || [],
      rating: center.rating || { average: 0, count: 0 },
      isActive: center.isActive,
      totalProcessed: center.totalProcessed || 0,
      co2Saved: center.co2Saved || 0,
      energySaved: center.energySaved || 0,
      createdAt: center.createdAt,
      updatedAt: center.updatedAt
    }));

    res.json({
      success: true,
      data: formattedCenters
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ GET ALL CENTERS - ALIAS FOR /all endpoint
router.get('/all', async (req, res) => {
  try {
    const centers = await RecyclingCenter.find();
    
    const formattedCenters = centers.map(center => ({
      _id: center._id,
      name: center.name,
      address: center.address,
      capacity: center.capacity,
      current_load: center.current_load || 0,
      latitude: center.latitude,
      longitude: center.longitude,
      phone: center.phone || 'N/A',
      email: center.email || 'N/A',
      operatingHours: center.operatingHours || '9:00 AM - 6:00 PM',
      contactPerson: center.contactPerson || 'Not specified',
      description: center.description || '',
      materials: center.materials || [],
      rating: center.rating || { average: 0, count: 0 },
      isActive: center.isActive,
      totalProcessed: center.totalProcessed || 0,
      co2Saved: center.co2Saved || 0
    }));

    res.json({
      success: true,
      data: formattedCenters
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ GET SINGLE CENTER (UPDATED)
router.get('/centers/:id', async (req, res) => {
  try {
    const center = await RecyclingCenter.findById(req.params.id);
    
    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Recycling center not found'
      });
    }

    const formattedCenter = {
      _id: center._id,
      name: center.name,
      address: center.address,
      capacity: center.capacity,
      current_load: center.current_load || 0,
      latitude: center.latitude,
      longitude: center.longitude,
      phone: center.phone || 'N/A',
      email: center.email || 'N/A',
      operatingHours: center.operatingHours || '9:00 AM - 6:00 PM',
      contactPerson: center.contactPerson || 'Not specified',
      description: center.description || '',
      materials: center.materials || [],
      rating: center.rating || { average: 0, count: 0 },
      isActive: center.isActive,
      totalProcessed: center.totalProcessed || 0,
      co2Saved: center.co2Saved || 0
    };

    res.json({
      success: true,
      data: formattedCenter
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ UPDATE CENTER (UPDATED)
router.put('/centers/:id', async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      capacity: req.body.capacity,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      address: req.body.address,
      phone: req.body.phone || 'N/A',
      email: req.body.email || 'N/A',
      operatingHours: req.body.operatingHours || '9:00 AM - 6:00 PM',
      contactPerson: req.body.contactPerson || 'Not specified',
      description: req.body.description || '',
      materials: req.body.materials || [],
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    };

    const center = await RecyclingCenter.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Recycling center not found'
      });
    }

    res.json({
      success: true,
      data: center
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ DELETE CENTER
router.delete('/centers/:id', async (req, res) => {
  try {
    const center = await RecyclingCenter.findByIdAndDelete(req.params.id);

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Recycling center not found'
      });
    }

    res.json({
      success: true,
      message: 'Recycling center deleted successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ STATS API (UPDATED with more metrics)
router.get('/stats', async (req, res) => {
  try {
    const centers = await RecyclingCenter.find();

    const totalCenters = centers.length;
    const fullCapacity = centers.filter(c => c.current_load >= c.capacity).length;
    const activeCenters = centers.filter(c => c.isActive).length;
    
    const totalCapacity = centers.reduce((sum, c) => sum + c.capacity, 0);
    const totalLoad = centers.reduce((sum, c) => sum + c.current_load, 0);
    const utilizationRate = totalCapacity > 0 ? ((totalLoad / totalCapacity) * 100).toFixed(1) : 0;
    
    const totalProcessed = centers.reduce((sum, c) => sum + (c.totalProcessed || 0), 0);
    const totalCO2Saved = centers.reduce((sum, c) => sum + (c.co2Saved || 0), 0);
    const avgRating = centers.length > 0 
      ? (centers.reduce((sum, c) => sum + (c.rating?.average || 0), 0) / centers.length).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        totalCenters,
        fullCapacity,
        activeCenters,
        utilizationRate: `${utilizationRate}%`,
        totalProcessed,
        totalCO2Saved,
        avgRating: parseFloat(avgRating)
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;