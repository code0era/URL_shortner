const connectDB = require('../../lib/db');
const Url = require('../../lib/Url');
const { nanoid } = require('nanoid');
const validUrl = require('valid-url');

module.exports = async (req, res) => {
  await connectDB();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { urls } = req.body;
  if (!Array.isArray(urls) || urls.length === 0 || urls.length > 50) {
    return res.status(400).json({ error: 'Provide 1-50 URLs' });
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
};
