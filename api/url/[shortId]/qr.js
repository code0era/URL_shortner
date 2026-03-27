const connectDB = require('../../lib/db');
const Url = require('../../lib/Url');
const QRCode = require('qrcode');

module.exports = async (req, res) => {
  await connectDB();
  const { shortId } = req.query;
  const url = await Url.findOne({ shortId });
  if (!url) return res.status(404).json({ error: 'URL not found' });

  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5000';
  const shortUrl = `${baseUrl}/s/${url.shortId}`;
  const qrCode = await QRCode.toDataURL(shortUrl, { width: 300, margin: 2 });

  res.json({ qrCode, shortUrl });
};
