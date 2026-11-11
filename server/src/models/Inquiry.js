const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    interestedCourse: {
      type: String,
      required: [true, 'Course interest is required'],
      trim: true,
    },
    qualification: {
      type: String,
      default: '',
      trim: true,
    },
    institutionName: {
      type: String,
      default: '',
      trim: true,
    },
    message: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'converted', 'closed'],
      default: 'new',
      index: true,
    },
    source: {
      type: String,
      enum: [
        'contact_page',
        'quick_enquiry',
        'callback_request',
        'demo_request',
        'workshop_registration',
        'admissions_enquiry',
        'institution_enquiry',
        'programme_page'
      ],
      required: [true, 'Inquiry source is required'],
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes on createdAt
inquirySchema.index({ createdAt: 1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
