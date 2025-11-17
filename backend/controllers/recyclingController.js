// Mock recycling centers
let recyclingCenters = [
  {
    id: '1',
    name: 'Delhi Central Recycling Center',
    location: { latitude: 28.6129, longitude: 77.2295 },
    capacity: 1000,
    current_load: 650,
    materials_supported: ['Plastic', 'Glass', 'Paper', 'Metal'],
    contact_info: '+91 9876543210',
    operating_hours: '8:00 AM - 6:00 PM'
  },
  {
    id: '2',
    name: 'South Delhi Recycling Hub',
    location: { latitude: 28.5245, longitude: 77.2155 },
    capacity: 800,
    current_load: 320,
    materials_supported: ['Plastic', 'Paper'],
    contact_info: '+91 9876543211',
    operating_hours: '9:00 AM - 7:00 PM'
  },
  {
    id: '3',
    name: 'North Delhi Green Center',
    location: { latitude: 28.7041, longitude: 77.1025 },
    capacity: 1200,
    current_load: 890,
    materials_supported: ['Glass', 'Metal', 'E-Waste'],
    contact_info: '+91 9876543212',
    operating_hours: '8:30 AM - 5:30 PM'
  }
];

// Mock recycling logs
let recyclingLogs = [
  {
    id: '1',
    bin_id: '1',
    center_id: '1',
    material_type: 'Plastic',
    quantity: 25,
    timestamp: new Date('2024-01-15')
  },
  {
    id: '2',
    bin_id: '2',
    center_id: '2',
    material_type: 'Paper',
    quantity: 18,
    timestamp: new Date('2024-01-15')
  }
];

// @desc    Get all recycling centers
// @route   GET /api/recycling/centers
// @access  Public
exports.getRecyclingCenters = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: recyclingCenters.length,
      data: recyclingCenters
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get recycling center by ID
// @route   GET /api/recycling/centers/:id
// @access  Public
exports.getRecyclingCenter = async (req, res) => {
  try {
    const center = recyclingCenters.find(c => c.id === req.params.id);
    
    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Recycling center not found'
      });
    }

    res.status(200).json({
      success: true,
      data: center
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add new recycling center
// @route   POST /api/recycling/centers
// @access  Admin
exports.addRecyclingCenter = async (req, res) => {
  try {
    const { name, location, capacity, materials_supported, contact_info, operating_hours } = req.body;
    
    const center = {
      id: (recyclingCenters.length + 1).toString(),
      name,
      location,
      capacity,
      current_load: 0,
      materials_supported,
      contact_info,
      operating_hours
    };

    recyclingCenters.push(center);

    res.status(201).json({
      success: true,
      data: center
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get recycling statistics
// @route   GET /api/recycling/stats
// @access  Public
exports.getRecyclingStats = async (req, res) => {
  try {
    const totalCapacity = recyclingCenters.reduce((sum, center) => sum + center.capacity, 0);
    const totalLoad = recyclingCenters.reduce((sum, center) => sum + center.current_load, 0);
    const utilizationRate = ((totalLoad / totalCapacity) * 100).toFixed(1);

    // Material distribution
    const materialStats = {
      Plastic: 45,
      Paper: 30,
      Glass: 15,
      Metal: 8,
      'E-Waste': 2
    };

    res.status(200).json({
      success: true,
      data: {
        totalCenters: recyclingCenters.length,
        totalCapacity,
        totalLoad,
        utilizationRate: utilizationRate + '%',
        materialStats
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};