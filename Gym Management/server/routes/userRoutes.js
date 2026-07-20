const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');

// FIXED: Yahan 'assignTrainer' ko import karna zaroori tha
const { getUsers, assignTrainer, renewMembership } = require('../controller/userController');

// Only Admin can view all users
router.route('/').get(protect, restrictTo('admin','trainer'), getUsers);

// FIXED: Yahan assign-trainer ka route define karna zaroori tha
router.route('/:id/assign-trainer').put(protect, restrictTo('admin'), assignTrainer);

// Admin & Member can renew membership
router.route('/:id/renew').put(protect, restrictTo('admin', 'member'), renewMembership);

module.exports = router;
