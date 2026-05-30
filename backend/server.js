const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000',
        /\.vercel\.app$/,
    ],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static('uploads'));

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
    } else {
        console.log('Database connected successfully');
        release();
    }
});

// Test route
app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is running', status: 'OK' });
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const userRoutes = require('./routes/userRoutes');
const bondRoutes = require('./routes/bondRoutes');
const inspectionRoutes = require('./routes/inspectionRoutes');
const documentRoutes = require('./routes/documentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bonds', bondRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);

// Start server - keep this at the bottom
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});