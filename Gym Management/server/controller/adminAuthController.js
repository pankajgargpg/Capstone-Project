const User = require('../model/userModel');

// @desc    Get all users (Admin only)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin adds a new user (Member/Trainer)
exports.createUserByAdmin = async (req, res) => {
    // ... Logic similar to register, but admin can specify role
};

// @desc    Renew membership
exports.renewMembership = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.membershipExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            await user.save();
            res.json({ message: 'Membership renewed', user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
};