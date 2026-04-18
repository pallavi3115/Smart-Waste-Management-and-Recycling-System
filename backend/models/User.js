const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // ⚠️ missing tha (important)

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },

  // 🔥 ROLE (Staff yahi se handle hoga)
  role: {
    type: String,
    enum: ['Citizen', 'Admin', 'Driver', 'Supervisor'],
    default: 'Citizen'
  },

  phoneNumber: String,

  profilePicture: {
    type: String,
    default: 'default-avatar.png'
  },

  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },

  isActive: {
    type: Boolean,
    default: true
  },

  lastLogin: Date,

  passwordChangedAt: Date,

  passwordResetToken: String,
  passwordResetExpires: Date,

}, {
  timestamps: true
});


// ================= PASSWORD HASH =================
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});


// ================= COMPARE PASSWORD =================
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};


// ================= JWT TOKEN =================
userSchema.methods.generateToken = function() {
  return jwt.sign(
    {
      id: this._id,
      role: this.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};


// ================= RESET TOKEN =================
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};


// ================= EXPORT =================
module.exports = mongoose.model('User', userSchema);