const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  key: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
photoSchema.index({ user: 1, uploadedAt: -1 });
photoSchema.index({ key: 1 });

// Method to increment view count
photoSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Static method to get user's photos
photoSchema.statics.findByUser = function(userId, limit = 50, skip = 0) {
  return this.find({ user: userId })
    .sort({ uploadedAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get public photos
photoSchema.statics.findPublic = function(limit = 50, skip = 0) {
  return this.find({ isPublic: true })
    .populate('user', 'username firstName lastName')
    .sort({ uploadedAt: -1 })
    .limit(limit)
    .skip(skip);
};

module.exports = mongoose.model('Photo', photoSchema);
