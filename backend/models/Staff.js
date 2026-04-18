const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["Driver", "Admin", "Supervisor"],
      default: "Driver"
    },
    phone: { type: String },
    area: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Staff", staffSchema);