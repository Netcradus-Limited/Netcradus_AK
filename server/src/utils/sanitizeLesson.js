/**
 * Sanitizes lesson objects for student and public responses.
 * Ensures sensitive data such as correctOptionIndex in quiz questions is NEVER exposed.
 * 
 * @param {Object} lesson - Mongoose Document or plain lesson object
 * @returns {Object|null} Sanitized lesson object
 */
const sanitizeLessonForStudent = (lesson) => {
  if (!lesson) return null;

  const lessonObj = typeof lesson.toObject === 'function' ? lesson.toObject() : { ...lesson };

  if (Array.isArray(lessonObj.quiz)) {
    lessonObj.quiz = lessonObj.quiz.map((question) => {
      const qObj = typeof question.toObject === 'function' ? question.toObject() : { ...question };
      const { correctOptionIndex, ...safeQuestion } = qObj;
      return safeQuestion;
    });
  }

  return lessonObj;
};

module.exports = {
  sanitizeLessonForStudent,
};
