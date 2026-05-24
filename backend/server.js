require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

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
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy match error'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// Static File Serving
const path = require('path');
app.use('/assets', express.static(path.join(__dirname, '../frontend/src/assets')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.get('/api/users', protect, admin, getUsers);
app.use('/api/auth', authRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve Frontend static assets
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Fallback wildcard route to serve React SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
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

