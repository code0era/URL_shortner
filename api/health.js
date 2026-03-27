module.exports = async (req, res) => {
  res.json({ status: 'OK', message: 'SnipURL API is running', timestamp: new Date().toISOString() });
};
