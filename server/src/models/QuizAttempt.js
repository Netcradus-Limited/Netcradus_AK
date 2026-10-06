const mongoose = require('mongoose');

const selectedAnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Question ID is required'],
    },
    selectedOptionIndex: {
      type: Number,
      required: [true, 'Selected option index is required'],
      min: [0, 'Option index cannot be negative'],
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'Lesson ID is required'],
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
      index: true,
    },
    answers: {
      type: [selectedAnswerSchema],
      default: [],
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score cannot be negative'],
    },
    totalQuestions: {
      type: Number,
      required: [true, 'Total questions count is required'],
      min: [1, 'Total questions must be at least 1'],
    },
    percentage: {
      type: Number,
      required: [true, 'Percentage is required'],
      min: [0, 'Percentage cannot be negative'],
      max: [100, 'Percentage cannot exceed 100'],
    },
    passed: {
      type: Boolean,
      default: false,
      index: true,
    },
    attemptNumber: {
      type: Number,
      default: 1,
      min: [1, 'Attempt number must be at least 1'],
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookup of a student's attempts for a specific lesson
quizAttemptSchema.index({ userId: 1, lessonId: 1, attemptNumber: -1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
