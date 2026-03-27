const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  referrer: {
    type: String,
    default: 'Direct'
  },
  userAgent: {
    type: String,
    default: 'Unknown'
  },
  ipAddress: {
    type: String,
    default: 'Unknown'
  }
});

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: [true, 'Original URL is required'],
    trim: true
  },
  shortId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customAlias: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  clickDetails: [clickSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  password: {
    type: String,
    default: null
  },
  maxClicks: {
    type: Number,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: String,
    default: 'anonymous'
  }
}, {
  timestamps: true
});

// Index for faster lookups
urlSchema.index({ createdAt: -1 });
urlSchema.index({ clicks: -1 });

// Virtual for checking if URL is expired
urlSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Virtual for checking if max clicks reached
urlSchema.virtual('maxClicksReached').get(function() {
  if (!this.maxClicks) return false;
  return this.clicks >= this.maxClicks;
});

urlSchema.set('toJSON', { virtuals: true });
urlSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Url', urlSchema);
