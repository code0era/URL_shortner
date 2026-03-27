const connectDB = require('../../lib/db');
const Url = require('../../lib/Url');

module.exports = async (req, res) => {
  await connectDB();
  const { shortId } = req.query;
  const url = await Url.findOne({ shortId });
  if (!url) return res.status(404).json({ error: 'URL not found' });

  if (req.method === 'PUT') {
    const { isActive, tags, maxClicks, expiresIn } = req.body;
    if (isActive !== undefined) url.isActive = isActive;
    if (tags) url.tags = tags;
    if (maxClicks) url.maxClicks = maxClicks;
    if (expiresIn) {
      url.expiresAt = new Date();
      url.expiresAt.setHours(url.expiresAt.getHours() + parseInt(expiresIn));
    }
    await url.save();
    return res.json(url);
  }

  if (req.method === 'DELETE') {
    await Url.findOneAndDelete({ shortId });
    return res.json({ message: 'Deleted', url });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
