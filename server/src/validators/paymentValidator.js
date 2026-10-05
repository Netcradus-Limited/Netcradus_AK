const Joi = require('joi');

const createOrderSchema = Joi.object({
  courseId: Joi.string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Course ID is required',
      'string.pattern.base': 'Invalid Course ID format',
      'any.required': 'Course ID is required',
    }),
});

const verifyPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string().trim().required().messages({
    'string.empty': 'Razorpay order ID is required',
    'any.required': 'Razorpay order ID is required',
  }),
  razorpay_payment_id: Joi.string().trim().required().messages({
    'string.empty': 'Razorpay payment ID is required',
    'any.required': 'Razorpay payment ID is required',
  }),
  razorpay_signature: Joi.string().trim().required().messages({
    'string.empty': 'Razorpay signature is required',
    'any.required': 'Razorpay signature is required',
  }),
  courseId: Joi.string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
});

module.exports = {
  createOrderSchema,
  verifyPaymentSchema,
};
