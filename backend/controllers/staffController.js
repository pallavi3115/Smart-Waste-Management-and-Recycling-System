const Staff = require("../models/Staff");

// ➕ Create Staff
exports.createStaff = async (req, res) => {
  try {
    const { name, email, role, phone, area } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    const existing = await Staff.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    const staff = await Staff.create({
      name,
      email,
      role,
      phone,
      area
    });

    res.status(201).json({
      success: true,
      data: staff
    });

  } catch (err) {
    console.log("CREATE STAFF ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// 📋 Get All Staff
exports.getStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: staff
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};