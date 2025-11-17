// const Bin = require('../models/Bin');

// // @desc    Register new bin
// // @route   POST /api/bins/register
// // @access  Admin
// exports.registerBin = async (req, res) => {
//   try {
//     const bin = await Bin.create(req.body);
//     res.status(201).json({
//       success: true,
//       data: bin
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Update bin status from IoT sensor
// // @route   POST /api/bins/update
// // @access  Public (for IoT devices)
// exports.updateBinStatus = async (req, res) => {
//   try {
//     const { binId, fill_level, fire_alert, status } = req.body;
    
//     const bin = await Bin.findByIdAndUpdate(
//       binId,
//       {
//         fill_level,
//         fire_alert,
//         status,
//         last_updated: Date.now()
//       },
//       { new: true, runValidators: true }
//     );

//     if (!bin) {
//       return res.status(404).json({
//         success: false,
//         message: 'Bin not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: bin
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Get all bins
// // @route   GET /api/bins/all
// // @access  Admin
// exports.getAllBins = async (req, res) => {
//   try {
//     const bins = await Bin.find().populate('assigned_truck');
//     res.status(200).json({
//       success: true,
//       count: bins.length,
//       data: bins
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Get bin status
// // @route   GET /api/bins/status/:id
// // @access  Public
// exports.getBinStatus = async (req, res) => {
//   try {
//     const bin = await Bin.findById(req.params.id);
    
//     if (!bin) {
//       return res.status(404).json({
//         success: false,
//         message: 'Bin not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: bin
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// Mock bins database
let bins = [
  {
    id: '1',
    location: { latitude: 28.6139, longitude: 77.2090 },
    fill_level: 45,
    fire_alert: false,
    status: 'Partial',
    area: 'Central Delhi',
    last_updated: new Date()
  },
  {
    id: '2', 
    location: { latitude: 28.5355, longitude: 77.3910 },
    fill_level: 92,
    fire_alert: false,
    status: 'Full',
    area: 'South Delhi',
    last_updated: new Date()
  },
  {
    id: '3',
    location: { latitude: 28.7041, longitude: 77.1025 },
    fill_level: 15,
    fire_alert: true,
    status: 'Empty',
    area: 'North Delhi',
    last_updated: new Date()
  },
  {
    id: '4',
    location: { latitude: 28.4595, longitude: 77.0266 },
    fill_level: 78,
    fire_alert: false,
    status: 'Partial',
    area: 'Gurugram',
    last_updated: new Date()
  }
];

// @desc    Register new bin
// @route   POST /api/bins/register
// @access  Admin
exports.registerBin = async (req, res) => {
  try {
    const { location, area } = req.body;
    
    const bin = {
      id: (bins.length + 1).toString(),
      location,
      fill_level: 0,
      fire_alert: false,
      status: 'Empty',
      area,
      last_updated: new Date()
    };

    bins.push(bin);

    res.status(201).json({
      success: true,
      data: bin
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update bin status from IoT sensor
// @route   POST /api/bins/update
// @access  Public (for IoT devices)
exports.updateBinStatus = async (req, res) => {
  try {
    const { binId, fill_level, fire_alert, status } = req.body;
    
    const binIndex = bins.findIndex(bin => bin.id === binId);
    
    if (binIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Bin not found'
      });
    }

    bins[binIndex] = {
      ...bins[binIndex],
      fill_level,
      fire_alert,
      status,
      last_updated: new Date()
    };

    res.status(200).json({
      success: true,
      data: bins[binIndex]
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all bins
// @route   GET /api/bins/all
// @access  Public
exports.getAllBins = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: bins.length,
      data: bins
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get bin status
// @route   GET /api/bins/status/:id
// @access  Public
exports.getBinStatus = async (req, res) => {
  try {
    const bin = bins.find(b => b.id === req.params.id);
    
    if (!bin) {
      return res.status(404).json({
        success: false,
        message: 'Bin not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bin
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get bins by area
// @route   GET /api/bins/area/:area
// @access  Public
exports.getBinsByArea = async (req, res) => {
  try {
    const areaBins = bins.filter(bin => 
      bin.area.toLowerCase().includes(req.params.area.toLowerCase())
    );

    res.status(200).json({
      success: true,
      count: areaBins.length,
      data: areaBins
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};