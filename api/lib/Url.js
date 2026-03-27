const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  referrer: { type: String, default: 'Direct' },
  userAgent: { type: String, default: 'Unknown' },
  ipAddress: { type: String, default: 'Unknown' }
});

const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true, trim: true },
  shortId: { type: String, required: true, unique: true, index: true },
  customAlias: { type: String, unique: true, sparse: true, trim: true },
  clicks: { type: Number, default: 0 },
  clickDetails: [clickSchema],
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, default: null },
  maxClicks: { type: Number, default: null },
  tags: [{ type: String, trim: true }],
  createdBy: { type: String, default: 'anonymous' }
}, { timestamps: true });

urlSchema.index({ createdAt: -1 });
urlSchema.index({ clicks: -1 });
urlSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.models.Url || mongoose.model('Url', urlSchema);
