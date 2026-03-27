const connectDB = require('../lib/db');
const Url = require('../lib/Url');
const { nanoid } = require('nanoid');
const validUrl = require('valid-url');

module.exports = async (req, res) => {
  await connectDB();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { originalUrl, customAlias, expiresIn, maxClicks, tags } = req.body;

  if (!validUrl.isWebUri(originalUrl)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  if (customAlias) {
    const exists = await Url.findOne({ customAlias });
    if (exists) return res.status(409).json({ error: 'Alias already in use' });
  }

  if (!customAlias) {
    const existing = await Url.findOne({ originalUrl, customAlias: null });
    if (existing) return res.status(200).json(existing);
  }

  const shortId = customAlias || nanoid(8);
  let expiresAt = null;
  if (expiresIn) {
    expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn));
  }

  const url = new Url({
    originalUrl, shortId,
    customAlias: customAlias || undefined,
    expiresAt, maxClicks: maxClicks || null,
    tags: tags || []
  });

  await url.save();
  res.status(201).json(url);
};
