const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Replace with your MongoDB Compass connection string
        // Usually it's mongodb://localhost:27017/your_db_name
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gym_management');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;