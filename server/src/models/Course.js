const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Course slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    shortDescription: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Course category is required'],
      trim: true,
      index: true,
    },
    level: {
      type: String,
      required: [true, 'Course level is required'],
      trim: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    language: {
      type: String,
      default: 'English',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      // Price is stored in paise (smallest unit). E.g. ₹999 = 99900 paise
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
      validate: {
        validator: function (value) {
          if (value === undefined || value === null) {
            return true;
          }
          // Document context (creation or doc.save())
          if (this && this.price !== undefined) {
            return value <= this.price;
          }
          // Query context (findByIdAndUpdate / updateOne with runValidators)
          if (this && typeof this.getUpdate === 'function') {
            const update = this.getUpdate();
            const updatePrice = update?.price ?? update?.$set?.price;
            if (updatePrice !== undefined) {
              return value <= updatePrice;
            }
          }
          return true;
        },
        message: 'Discount price ({VALUE}) must be less than or equal to the original price',
      },
    },
    currency: {
      type: String,
      default: 'INR',
    },
    duration: {
      type: String,
      trim: true,
    },
    requirements: {
      type: [String],
      default: [],
    },
    learningOutcomes: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    bannerClass: {
      type: String,
      default: 'cyber-bg',
    },
    bannerIcon: {
      type: String,
      default: 'fa-solid fa-graduation-cap',
    },
    highlights: {
      type: [String],
      default: [],
    },
    tools: {
      type: [String],
      default: [],
    },
    cert: {
      type: String,
      default: '',
    },
    roles: {
      type: [String],
      default: [],
    },
    prereq: {
      type: String,
      default: '',
    },
    published: {
      type: Boolean,
      default: true,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Course', courseSchema);
