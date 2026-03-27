const connectDB = require('../lib/db');
const Url = require('../lib/Url');

module.exports = async (req, res) => {
  await connectDB();
  const { shortId } = req.query;
  const url = await Url.findOne({ shortId });

  if (!url) return res.status(404).json({ error: 'URL not found' });
  if (!url.isActive) return res.status(410).json({ error: 'URL deactivated' });
  if (url.expiresAt && new Date() > url.expiresAt) return res.status(410).json({ error: 'URL expired' });
  if (url.maxClicks && url.clicks >= url.maxClicks) return res.status(410).json({ error: 'Max clicks reached' });

  url.clicks++;
  url.clickDetails.push({
    timestamp: new Date(),
    referrer: req.headers.referer || 'Direct',
    userAgent: req.headers['user-agent'] || 'Unknown',
    ipAddress: req.headers['x-forwarded-for'] || 'Unknown'
  });
  await url.save();

  res.redirect(302, url.originalUrl);
};
