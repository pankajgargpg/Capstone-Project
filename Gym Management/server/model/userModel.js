const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member', 'trainer'], default: 'member' },
  assignedTrainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  membershipExpiry: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);