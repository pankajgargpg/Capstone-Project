const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  standardFee: { type: Number, default: 1500 },
  trainerFee: { type: Number, default: 3000 }
});

module.exports = mongoose.model('GymSettings', settingsSchema);