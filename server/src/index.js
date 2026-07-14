require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');
const initDb = require('./db/initDb');

// Import routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const quizRoutes = require('./routes/quizRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const forumRoutes = require('./routes/forumRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Import middlewares
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for local development / testing
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (thumbnails, videos, assignments)
const uploadsPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));
console.log('Serving static uploads from:', uploadsPath);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the LMS Premium API Server' });
});

// 404 Route
app.use((req, res, next) => {
  res.status(404).json({ message: `API Endpoint ${req.originalUrl} not found` });
});

// Central Error Handler
app.use(errorHandler);

// Initialize DB and Boot Server
async function startServer() {
  try {
    // Connect to database (PostgreSQL pool or SQLite fallback)
    db.init();

    // Auto-migrate tables and insert mock seed data
    await initDb();

    app.listen(PORT, () => {
      console.log(`LMS Backend Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
