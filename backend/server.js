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
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy match error'), false);
    }
    return callback(null, true);
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


const frontendPath = path.resolve(__dirname, "../frontend/dist");

// 1. Explicitly serve static production JS/CSS assets from the dist/assets folder under /assets prefix
app.use('/assets', express.static(path.resolve(frontendPath, 'assets')));

// 2. Serve static frontend built files at the root / (for favicon.svg, icons.svg, etc.)
app.use(express.static(frontendPath));

// 3. Serve public dynamic uploads statically
app.use('/uploads', express.static(path.resolve(__dirname, 'public/uploads')));

// 4. Serve local source assets (for fallback default logos)
app.use('/assets', express.static(path.resolve(__dirname, '../frontend/src/assets')));

// API Routes
app.get('/api/users', protect, admin, getUsers);
app.use('/api/auth', authRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Catch-all route to serve the React SPA for UI routes, returning proper 404 JSON for static/API misses
app.use((req, res) => {
  if (
    req.path.startsWith("/api") ||
    req.path.startsWith("/uploads") ||
    req.path.startsWith("/assets")
  ) {
    return res.status(404).json({
      message: `Not Found: ${req.originalUrl}`,
    });
  }

  res.sendFile(path.resolve(frontendPath, "index.html"));
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

