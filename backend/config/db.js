// Corrected db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    // The options object has been removed from this line
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected...');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;