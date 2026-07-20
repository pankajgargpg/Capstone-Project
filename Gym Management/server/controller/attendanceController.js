const Attendance = require('../model/attendanceModel');

// @desc    Mark Attendance
// @route   POST /api/attendance
// @access  Private/Trainer
const markAttendance = async (req, res) => {
    try {
        const { memberId, status } = req.body;
        // req.user is set by your authMiddleware
        const trainerId = req.user._id; 

        const attendance = new Attendance({
            memberId,
            trainerId,
            status
        });

        const createdAttendance = await attendance.save();
        res.status(201).json(createdAttendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Attendance Logs (For Member or Trainer)
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res) => {
    try {
        let query = {};
        // If trainer, fetch logs marked by them. If member, fetch their own logs.
        if (req.user.role === 'trainer') {
            query = { trainerId: req.user._id };
        } else if (req.user.role === 'member') {
            query = { memberId: req.user._id };
        }

        const logs = await Attendance.find(query)
                                     .populate('memberId', 'name email') // Get member details
                                     .sort({ date: -1 }); // Newest first
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { markAttendance, getAttendance };