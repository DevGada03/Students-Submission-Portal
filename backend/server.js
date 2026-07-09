const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/authRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('Student Assignment Portal API');
});

// Database Connection
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('CRITICAL ERROR: MONGODB_URI is not defined in environment variables!');
            return;
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected successfully');
    } catch (error) {
        console.error('Database connection error:', error.message);
    }
};

// Start connection
connectDB();

// Export app for serverless environments (Vercel)
module.exports = app;

// Only listen when not deployed on Vercel serverless functions
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
