const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length >= 2;
      },
      message: 'Quiz question must have at least 2 options',
    },
  },
  correctOptionIndex: {
    type: Number,
    required: true,
    // Note: Correct answers MUST be filtered out in future public APIs to prevent cheating.
  },
});

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
      index: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'Module ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Lesson slug is required'],
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: ['video', 'lab_video', 'text', 'pdf', 'resource', 'quiz'],
      required: [true, 'Lesson type is required'],
    },
    durationSeconds: {
      type: Number,
      default: 0,
      min: [0, 'Duration cannot be negative'],
    },
    order: {
      type: Number,
      required: [true, 'Lesson order is required'],
    },
    preview: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: true,
    },
    video: {
      type: String,
      trim: true,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    pdf: {
      type: String,
      trim: true,
      default: '',
    },
    resources: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    quiz: {
      type: [quizQuestionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to restrict order within a module
lessonSchema.index({ moduleId: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('Lesson', lessonSchema);
