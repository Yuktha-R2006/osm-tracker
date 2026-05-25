require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require("path");

const authRoutes = require('./routes/auth');
const platformRoutes = require('./routes/platforms');
const subscriptionRoutes = require('./routes/subscriptions');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');

const { errorHandler } = require('./middleware/errorMiddleware');
const startCronJobs = require('./utils/cronJobs');
const { getUsers } = require('./controllers/adminController');
const { protect, admin } = require('./middleware/authMiddleware');

const app = express();

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://YOUR-FRONTEND-VERCEL.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve public dynamic uploads statically (platform logos)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// API Routes
app.get('/api/users', protect, admin, getUsers);
console.log("Auth routes mounted at /api/auth");
app.use('/api/auth', authRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Catch-all route to return JSON 404 for all unmatched API endpoints
app.use((req, res) => {
  console.log("404 route reached:", req.originalUrl);
  res.status(404).json({
    message: `API Endpoint Not Found: ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

// Database Connection
const connectDB = require('./config/db');

connectDB().then(() => {
  startCronJobs();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});

