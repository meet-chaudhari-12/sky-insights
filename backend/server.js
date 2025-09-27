const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
