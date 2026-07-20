// This file handles non-auth user actions (like Admin fetching all users)
const User = require('../model/userModel');

// @desc    Get all users (Members & Trainers)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); // Don't send passwords
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign trainer to member
// @route   PUT /api/users/:id/assign-trainer
// @access  Private/Admin
const assignTrainer = async (req, res) => {
    try {
        const { trainerId } = req.body;
        const user = await User.findById(req.params.id);

        if (user) {
            user.assignedTrainer = trainerId;
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Renew membership
// @route   PUT /api/users/:id/renew
// @access  Private/Admin
const renewMembership = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Add 30 days to current date or existing expiry
            const baseDate = (user.membershipExpiry && new Date(user.membershipExpiry) > new Date())
                             ? new Date(user.membershipExpiry)
                             : new Date();
            user.membershipExpiry = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
            
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    assignTrainer,
    renewMembership
};