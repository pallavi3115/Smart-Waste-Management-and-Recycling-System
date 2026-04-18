const express = require("express");
const router = express.Router();
const Staff = require("../models/Staff");

// ➕ Add Staff
router.post("/", async (req, res) => {
  try {
    const staff = await Staff.create(req.body);

    res.status(201).json({
      success: true,
      data: staff
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// 📋 Get All Staff
router.get("/", async (req, res) => {
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
});

module.exports = router;