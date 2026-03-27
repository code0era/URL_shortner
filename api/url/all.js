const connectDB = require('../lib/db');
const Url = require('../lib/Url');

module.exports = async (req, res) => {
  try {
    await connectDB();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const query = search ? { originalUrl: { $regex: search, $options: 'i' } } : {};
    const total = await Url.countDocuments(query);
    const urls = await Url.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-clickDetails');

    res.json({ urls, pagination: { total, page, pages: Math.ceil(total / limit), limit } });
  } catch (err) {
    console.error('Get all error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};
