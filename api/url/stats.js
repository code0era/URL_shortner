const connectDB = require('../lib/db');
const Url = require('../lib/Url');

module.exports = async (req, res) => {
  await connectDB();

  const totalUrls = await Url.countDocuments();
  const totalClicks = await Url.aggregate([{ $group: { _id: null, total: { $sum: '$clicks' } } }]);
  const activeUrls = await Url.countDocuments({ isActive: true });
  const topUrls = await Url.find().sort({ clicks: -1 }).limit(5).select('originalUrl shortId clicks createdAt');
  const recentUrls = await Url.find().sort({ createdAt: -1 }).limit(5).select('originalUrl shortId clicks createdAt');

  res.json({
    totalUrls,
    totalClicks: totalClicks[0]?.total || 0,
    activeUrls, topUrls, recentUrls
  });
};
