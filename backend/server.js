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
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Normalize origins by stripping trailing slashes for comparison
    const cleanOrigin = origin.replace(/\/$/, '');
    const cleanAllowed = allowedOrigins.map(o => o.replace(/\/$/, ''));
    
    if (cleanAllowed.includes(cleanOrigin)) {
      return callback(null, true);
    }
    
    return callback(new Error(`CORS policy match error for origin: ${origin}`), false);
  },
  credentials: true
}));
app.use(express.json());

// Prevent browser caching of SPA entry HTML to avoid stale compiled asset requests
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/index.html') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  }
  next();
});

// Serve public dynamic uploads statically (platform logos)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Serve frontend static assets
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// API Routes
app.get('/api/users', protect, admin, getUsers);
app.use('/api/auth', authRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Frontend fallback serving
app.use((req, res, next) => {
  if (
    req.path.startsWith("/api") ||
    req.path.startsWith("/uploads") ||
    req.path.startsWith("/assets")
  ) {
    return next();
  }

  res.sendFile(path.join(frontendPath, "index.html"));
});

// Catch-all route to return JSON 404 for all unmatched API endpoints
app.use((req, res) => {
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

