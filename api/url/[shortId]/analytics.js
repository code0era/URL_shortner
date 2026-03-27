const connectDB = require('../../lib/db');
const Url = require('../../lib/Url');

module.exports = async (req, res) => {
  try {
    await connectDB();
    const { shortId } = req.query;
    const url = await Url.findOne({ shortId });
    if (!url) return res.status(404).json({ error: 'URL not found' });

    const referrerStats = {}, browserStats = {};
    url.clickDetails.forEach(c => {
      const ref = c.referrer || 'Direct';
      referrerStats[ref] = (referrerStats[ref] || 0) + 1;
      let browser = 'Other';
      const ua = c.userAgent || '';
      if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Safari')) browser = 'Safari';
      else if (ua.includes('Edge')) browser = 'Edge';
      browserStats[browser] = (browserStats[browser] || 0) + 1;
    });

    res.json({
      url: { originalUrl: url.originalUrl, shortId: url.shortId, totalClicks: url.clicks, createdAt: url.createdAt, isActive: url.isActive },
      analytics: { referrerStats, browserStats, recentClicks: url.clickDetails.slice(-20).reverse() }
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};
