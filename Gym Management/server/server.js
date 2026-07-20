// backend/server.js

// 1. Import necessary packages
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Import DB connection function

// 2. Import Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const settingsRoutes = require('./routes/settingRoutes'); // Optional: Agar banayi hai
const attendanceRoutes = require('./routes/attendanceRoutes'); // Optional: Agar banayi hai

// 3. Initialize Express app
const app = express();

// 4. Middleware Setup
app.use(express.json()); // Allow Express to parse incoming JSON data (e.g., from req.body)
app.use(cors()); // Allow requests from your React frontend

// 5. Connect to MongoDB
connectDB();

// 6. Define API Endpoints
// Whenever a request comes to '/api/auth/...', use the authRoutes file
app.use('/api/auth', authRoutes);
// Whenever a request comes to '/api/users/...', use the userRoutes file
app.use('/api/users', userRoutes);


app.use('/api/settings', settingsRoutes);
app.use('/api/attendance', attendanceRoutes);

// 7. Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});