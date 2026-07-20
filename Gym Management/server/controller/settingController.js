const GymSettings = require('../model/settingModel');

// @desc    Get Gym Settings
// @route   GET /api/settings
// @access  Public or Private
const getSettings = async (req, res) => {
    try {
        let settings = await GymSettings.findOne();
        if (!settings) {
            // Create default settings if none exist
            settings = await GymSettings.create({
                standardMembershipFee: 1500,
                personalTrainerFee: 3000
            });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Gym Settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    try {
        const { standardMembershipFee, personalTrainerFee } = req.body;
        let settings = await GymSettings.findOne();

        if (settings) {
            settings.standardMembershipFee = standardMembershipFee || settings.standardMembershipFee;
            settings.personalTrainerFee = personalTrainerFee || settings.personalTrainerFee;
            
            const updatedSettings = await settings.save();
            res.json(updatedSettings);
        } else {
            res.status(404).json({ message: 'Settings not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSettings, updateSettings };