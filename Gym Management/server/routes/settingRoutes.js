const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../Middleware/authMiddleware');
const { getSettings, updateSettings } = require('../controller/settingController');

// Anyone can view settings (like fees)
router.route('/').get(getSettings);

// Only admin can update settings
router.route('/').put(protect, restrictTo('admin'), updateSettings);

module.exports = router;