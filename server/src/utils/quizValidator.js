/**
 * Validation utility for quiz questions array in lesson/lecture management.
 * Used by both Instructor and Admin curriculum controllers to enforce
 * data integrity and security for quiz assessments.
 *
 * @param {Array} quiz - Array of question objects
 * @returns {string|null} Error string if validation fails, or null if valid
 */
function validateQuizQuestions(quiz) {
  if (!Array.isArray(quiz)) {
    return 'Quiz must be an array of question objects.';
  }

  for (let i = 0; i < quiz.length; i += 1) {
    const q = quiz[i];
    if (!q || typeof q !== 'object') {
      return `Question #${i + 1} is invalid.`;
    }
    if (!q.question || typeof q.question !== 'string' || !q.question.trim()) {
      return `Question #${i + 1} must have a non-empty question title.`;
    }
    if (!Array.isArray(q.options) || q.options.length < 2) {
      return `Question #${i + 1} must have at least 2 options.`;
    }
    for (let j = 0; j < q.options.length; j += 1) {
      if (typeof q.options[j] !== 'string' || !q.options[j].trim()) {
        return `Question #${i + 1}, Option #${j + 1} cannot be blank.`;
      }
    }
    if (
      q.correctOptionIndex === undefined ||
      q.correctOptionIndex === null ||
      typeof q.correctOptionIndex !== 'number' ||
      !Number.isInteger(q.correctOptionIndex) ||
      q.correctOptionIndex < 0 ||
      q.correctOptionIndex >= q.options.length
    ) {
      return `Question #${i + 1} must have a valid correctOptionIndex between 0 and ${q.options.length - 1}.`;
    }
  }

  return null;
}

module.exports = {
  validateQuizQuestions,
};
