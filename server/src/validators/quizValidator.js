const Joi = require('joi');

const quizSubmissionSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .required()
          .messages({
            'string.empty': 'Question ID is required',
            'string.pattern.base': 'Question ID must be a valid 24-character hex ObjectId',
            'any.required': 'Question ID is required',
          }),
        selectedOptionIndex: Joi.number()
          .integer()
          .min(0)
          .required()
          .messages({
            'number.base': 'Selected option index must be a number',
            'number.integer': 'Selected option index must be an integer',
            'number.min': 'Selected option index cannot be negative',
            'any.required': 'Selected option index is required',
          }),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.base': 'Answers must be an array of question responses',
      'array.min': 'At least one answer must be provided',
      'any.required': 'Answers array is required',
    }),
  startedAt: Joi.date().iso().optional().messages({
    'date.base': 'startedAt must be a valid date or ISO timestamp',
  }),
});

module.exports = {
  quizSubmissionSchema,
};
