import RecyclingCenter from "../models/recycling.model.js";

// ✅ CREATE CENTER
export const createCenter = async (req, res) => {
  try {
    const { name, capacity, latitude, longitude, address } = req.body;

    // ✅ FIXED VALIDATION
    if (
      !name ||
      !capacity ||
      latitude === undefined ||
      longitude === undefined ||
      !address
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const center = new RecyclingCenter({
      name,
      capacity,
      latitude,
      longitude,
      address
    });

    await center.save();

    res.status(201).json({
      success: true,
      data: center
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// ✅ GET ALL
export const getCenters = async (req, res) => {
  const centers = await RecyclingCenter.find();
  res.json({ data: centers });
};

// ✅ STATS (IMPORTANT - 404 FIX)
export const getStats = async (req, res) => {
  const totalCenters = await RecyclingCenter.countDocuments();

  res.json({
    totalCenters,
    utilizationRate: "70%"
  });
};