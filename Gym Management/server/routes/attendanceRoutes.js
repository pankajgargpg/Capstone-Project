const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../Middleware/authMiddleware');
const { markAttendance, getAttendance } = require('../controller/attendanceController');

router.use(protect);

// Trainer marks attendance
router.route('/').post(restrictTo('trainer'), markAttendance);

// Trainer or member getting logs
router.route('/').get(getAttendance);

module.exports = router;