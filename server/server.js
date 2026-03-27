const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Url = require('./models/Url');

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/url', require('./routes/url'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'URL Shortener API is running',
    timestamp: new Date().toISOString()
  });
});

// @route   GET /:shortId
// @desc    Redirect to original URL
app.get('/:shortId', async (req, res) => {
  try {
    const url = await Url.findOne({ shortId: req.params.shortId });
    
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Check if URL is active
    if (!url.isActive) {
      return res.status(410).json({ error: 'This URL has been deactivated' });
    }

    // Check expiry
    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).json({ error: 'This URL has expired' });
    }

    // Check max clicks
    if (url.maxClicks && url.clicks >= url.maxClicks) {
      return res.status(410).json({ error: 'This URL has reached its maximum click limit' });
    }

    // Track click
    url.clicks++;
    url.clickDetails.push({
      timestamp: new Date(),
      referrer: req.get('Referrer') || 'Direct',
      userAgent: req.get('User-Agent') || 'Unknown',
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown'
    });

    await url.save();

    // Redirect
    return res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Redirect Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
  🚀 URL Shortener Server running!
  📡 Port: ${PORT}
  🌐 API: http://localhost:${PORT}/api
  💾 MongoDB: ${process.env.MONGO_URI ? 'Connected' : 'Not configured'}
  `);
});
