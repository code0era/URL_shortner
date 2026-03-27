const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const validUrl = require('valid-url');
const QRCode = require('qrcode');
const Url = require('../models/Url');

// @route   POST /api/url/shorten
// @desc    Create a short URL
router.post('/shorten', async (req, res) => {
  try {
    const { originalUrl, customAlias, expiresIn, password, maxClicks, tags } = req.body;

    // Validate URL
    if (!validUrl.isWebUri(originalUrl)) {
      return res.status(400).json({ error: 'Invalid URL. Please provide a valid URL including http:// or https://' });
    }

    // Check if custom alias is taken
    if (customAlias) {
      const aliasExists = await Url.findOne({ customAlias });
      if (aliasExists) {
        return res.status(409).json({ error: 'Custom alias already in use. Please choose another.' });
      }
    }

    // Check if URL already shortened (return existing if no custom alias)
    if (!customAlias) {
      const existingUrl = await Url.findOne({ originalUrl, customAlias: null });
      if (existingUrl) {
        return res.status(200).json(existingUrl);
      }
    }

    // Generate short ID
    const shortId = customAlias || nanoid(8);

    // Calculate expiry date
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn));
    }

    // Create new URL document
    const url = new Url({
      originalUrl,
      shortId,
      customAlias: customAlias || undefined,
      expiresAt,
      password: password || null,
      maxClicks: maxClicks || null,
      tags: tags || []
    });

    await url.save();
    res.status(201).json(url);
  } catch (error) {
    console.error('Shorten URL Error:', error);
    res.status(500).json({ error: 'Server error while creating short URL' });
  }
});

// @route   POST /api/url/shorten/bulk
// @desc    Bulk shorten multiple URLs
router.post('/shorten/bulk', async (req, res) => {
  try {
    const { urls } = req.body;
    
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of URLs' });
    }

    if (urls.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 URLs can be shortened at once' });
    }

    const results = [];
    for (const url of urls) {
      if (!validUrl.isWebUri(url)) {
        results.push({ originalUrl: url, error: 'Invalid URL' });
        continue;
      }

      const shortId = nanoid(8);
      const newUrl = new Url({ originalUrl: url, shortId });
      await newUrl.save();
      results.push(newUrl);
    }

    res.status(201).json(results);
  } catch (error) {
    console.error('Bulk Shorten Error:', error);
    res.status(500).json({ error: 'Server error while bulk shortening' });
  }
});

// @route   GET /api/url/all
// @desc    Get all shortened URLs with pagination
router.get('/all', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;
    const search = req.query.search || '';

    const query = search
      ? { originalUrl: { $regex: search, $options: 'i' } }
      : {};

    const total = await Url.countDocuments(query);
    const urls = await Url.find(query)
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-clickDetails');

    res.json({
      urls,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Get All URLs Error:', error);
    res.status(500).json({ error: 'Server error while fetching URLs' });
  }
});

// @route   GET /api/url/stats
// @desc    Get overall statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUrls = await Url.countDocuments();
    const totalClicks = await Url.aggregate([
      { $group: { _id: null, total: { $sum: '$clicks' } } }
    ]);
    const activeUrls = await Url.countDocuments({ isActive: true });
    const topUrls = await Url.find()
      .sort({ clicks: -1 })
      .limit(5)
      .select('originalUrl shortId clicks createdAt');

    const recentUrls = await Url.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('originalUrl shortId clicks createdAt');

    // Clicks per day for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const clicksPerDay = await Url.aggregate([
      { $unwind: '$clickDetails' },
      { $match: { 'clickDetails.timestamp': { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$clickDetails.timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalUrls,
      totalClicks: totalClicks[0]?.total || 0,
      activeUrls,
      topUrls,
      recentUrls,
      clicksPerDay
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({ error: 'Server error while fetching stats' });
  }
});

// @route   GET /api/url/:shortId/analytics
// @desc    Get detailed analytics for a specific URL
router.get('/:shortId/analytics', async (req, res) => {
  try {
    const url = await Url.findOne({ shortId: req.params.shortId });
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Aggregate click data
    const referrerStats = {};
    const browserStats = {};
    const clicksByHour = new Array(24).fill(0);
    const clicksByDay = {};

    url.clickDetails.forEach(click => {
      // Referrer stats
      const ref = click.referrer || 'Direct';
      referrerStats[ref] = (referrerStats[ref] || 0) + 1;

      // Browser stats (simplified)
      const ua = click.userAgent || 'Unknown';
      let browser = 'Other';
      if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Safari')) browser = 'Safari';
      else if (ua.includes('Edge')) browser = 'Edge';
      browserStats[browser] = (browserStats[browser] || 0) + 1;

      // Clicks by hour
      const hour = new Date(click.timestamp).getHours();
      clicksByHour[hour]++;

      // Clicks by day
      const day = new Date(click.timestamp).toISOString().split('T')[0];
      clicksByDay[day] = (clicksByDay[day] || 0) + 1;
    });

    res.json({
      url: {
        originalUrl: url.originalUrl,
        shortId: url.shortId,
        totalClicks: url.clicks,
        createdAt: url.createdAt,
        isActive: url.isActive,
        expiresAt: url.expiresAt
      },
      analytics: {
        referrerStats,
        browserStats,
        clicksByHour,
        clicksByDay,
        recentClicks: url.clickDetails.slice(-20).reverse()
      }
    });
  } catch (error) {
    console.error('Get Analytics Error:', error);
    res.status(500).json({ error: 'Server error while fetching analytics' });
  }
});

// @route   GET /api/url/:shortId/qr
// @desc    Generate QR code for a short URL
router.get('/:shortId/qr', async (req, res) => {
  try {
    const url = await Url.findOne({ shortId: req.params.shortId });
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const shortUrl = `${baseUrl}/${url.shortId}`;
    
    const qrCode = await QRCode.toDataURL(shortUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    res.json({ qrCode, shortUrl });
  } catch (error) {
    console.error('QR Code Error:', error);
    res.status(500).json({ error: 'Server error while generating QR code' });
  }
});

// @route   PUT /api/url/:shortId
// @desc    Update a URL (toggle active, update tags, etc.)
router.put('/:shortId', async (req, res) => {
  try {
    const { isActive, tags, maxClicks, expiresIn } = req.body;
    const url = await Url.findOne({ shortId: req.params.shortId });
    
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    if (isActive !== undefined) url.isActive = isActive;
    if (tags) url.tags = tags;
    if (maxClicks) url.maxClicks = maxClicks;
    if (expiresIn) {
      url.expiresAt = new Date();
      url.expiresAt.setHours(url.expiresAt.getHours() + parseInt(expiresIn));
    }

    await url.save();
    res.json(url);
  } catch (error) {
    console.error('Update URL Error:', error);
    res.status(500).json({ error: 'Server error while updating URL' });
  }
});

// @route   DELETE /api/url/:shortId
// @desc    Delete a shortened URL
router.delete('/:shortId', async (req, res) => {
  try {
    const url = await Url.findOneAndDelete({ shortId: req.params.shortId });
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    res.json({ message: 'URL deleted successfully', url });
  } catch (error) {
    console.error('Delete URL Error:', error);
    res.status(500).json({ error: 'Server error while deleting URL' });
  }
});

module.exports = router;
