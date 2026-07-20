const User = require('../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Token Generate karne ka function
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// --- REGISTER USER ---
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body; 
        
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the user in database
        const user = await User.create({ 
            name, 
            email, 
            password: hashedPassword,
            role // Ensures trainer role gets saved correctly
        });
        
        // Send back user data with token
        res.status(201).json({
            _id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            token: generateToken(user._id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- LOGIN USER ---
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });

        // Check if user exists and password matches
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                token: generateToken(user._id, user.role)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- GET CURRENT USER (For Page Refresh) ---
exports.getMe = async (req, res) => {
    try {
        // Find user by ID (req.user is set by authMiddleware using the token)
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Return exactly what the login response returns
        res.json({
            _id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            assignedTrainer: user.assignedTrainer,
            membershipExpiry: user.membershipExpiry,
            token: req.headers.authorization.split(' ')[1] // Extract the token from the "Bearer <token>" header
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
