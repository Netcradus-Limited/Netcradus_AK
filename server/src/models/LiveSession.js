const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    meetingUrl: {
      type: String,
      required: [true, 'Meeting URL is required'],
      trim: true,
      validate: {
        validator: function (url) {
          if (!url || typeof url !== 'string') return false;
          const trimmed = url.trim().toLowerCase();
          return trimmed.startsWith('https://') || trimmed.startsWith('http://');
        },
        message: 'Meeting URL must be a valid HTTP or HTTPS web link',
      },
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
      validate: {
        validator: function (endTime) {
          return !this.startTime || endTime > this.startTime;
        },
        message: 'End time must be after the start time',
      },
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for chronological querying by course
liveSessionSchema.index({ courseId: 1, startTime: 1 });

module.exports = mongoose.model('LiveSession', liveSessionSchema);
