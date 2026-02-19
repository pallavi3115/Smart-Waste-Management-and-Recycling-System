const Bin = require('../models/Bin');
const Report = require('../models/Report');
const RecyclingCenter = require('../models/RecyclingCenter');
const PublicToilet = require('../models/PublicToilet');

// @desc    Get all map data
// @route   GET /api/map/data
// @access  Public
exports.getMapData = async (req, res) => {
  try {
    const { bounds, types } = req.query;

    // Parse bounds [sw_lng, sw_lat, ne_lng, ne_lat]
    const [swLng, swLat, neLng, neLat] = bounds.split(',').map(Number);

    const locationQuery = {
      'location.coordinates': {
        $geoWithin: {
          $box: [
            [swLng, swLat],
            [neLng, neLat]
          ]
        }
      }
    };

    let results = {};

    if (!types || types.includes('bins')) {
      results.bins = await Bin.find({
        ...locationQuery,
        isActive: true
      }).select('binId location fillLevel status alerts type');
    }

    if (!types || types.includes('reports')) {
      results.reports = await Report.find({
        ...locationQuery,
        status: { $nin: ['RESOLVED', 'REJECTED'] }
      }).select('title category priority location status');
    }

    if (!types || types.includes('centers')) {
      results.centers = await RecyclingCenter.find({
        ...locationQuery,
        isActive: true
      }).select('name location materials capacity operatingHours');
    }

    if (!types || types.includes('toilets')) {
      results.toilets = await PublicToilet.find({
        ...locationQuery,
        isActive: true
      }).select('name location facilities isOpenNow');
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get heatmap data
// @route   GET /api/map/heatmap
// @access  Public
exports.getHeatmapData = async (req, res) => {
  try {
    const { type = 'reports', days = 30 } = req.query;

    const since = new Date();
    since.setDate(since.getDate() - days);

    let data = [];

    if (type === 'reports') {
      const reports = await Report.aggregate([
        {
          $match: {
            createdAt: { $gte: since }
          }
        },
        {
          $group: {
            _id: {
              coordinates: '$location.coordinates'
            },
            weight: { $sum: 1 },
            priority: { $first: '$priority' }
          }
        },
        {
          $project: {
            lat: { $arrayElemAt: ['$_id.coordinates', 1] },
            lng: { $arrayElemAt: ['$_id.coordinates', 0] },
            weight: 1,
            priority: 1
          }
        }
      ]);

      data = reports.map(r => ({
        lat: r.lat,
        lng: r.lng,
        weight: r.weight,
        priority: r.priority
      }));
    } else if (type === 'bins') {
      const bins = await Bin.aggregate([
        {
          $match: {
            'alerts.fire': true
          }
        },
        {
          $group: {
            _id: {
              coordinates: '$location.coordinates'
            },
            weight: { $sum: 1 }
          }
        },
        {
          $project: {
            lat: { $arrayElemAt: ['$_id.coordinates', 1] },
            lng: { $arrayElemAt: ['$_id.coordinates', 0] },
            weight: 1
          }
        }
      ]);

      data = bins.map(b => ({
        lat: b.lat,
        lng: b.lng,
        weight: b.weight
      }));
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get route between points
// @route   POST /api/map/route
// @access  Private
exports.getRoute = async (req, res) => {
  try {
    const { origin, destinations } = req.body;

    // This would integrate with Google Maps Directions API
    // For now, return a simplified response
    
    res.json({
      success: true,
      data: {
        origin,
        destinations,
        waypoints: destinations,
        distance: 15000, // meters
        duration: 3600, // seconds
        polyline: "encoded_polyline_string"
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reverse geocode
// @route   GET /api/map/geocode
// @access  Public
exports.reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    // This would integrate with Google Maps Geocoding API
    // For now, return dummy data
    
    res.json({
      success: true,
      data: {
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        ward: "Ward 12",
        zone: "Zone A",
        city: "Indore",
        country: "India"
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};