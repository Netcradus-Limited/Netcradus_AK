const Joi = require('joi');

const createInquirySchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Full name is required',
    'string.min': 'Full name must be at least 2 characters',
  }),
  email: Joi.string().trim().email().allow('', null).optional().messages({
    'string.email': 'Please provide a valid email address',
  }),
  phone: Joi.string().trim().min(7).max(20).required().messages({
    'string.empty': 'Phone number is required',
  }),
  interestedCourse: Joi.string().trim().required().messages({
    'string.empty': 'Interested programme or course is required',
  }),
  qualification: Joi.string().trim().allow('').max(200).optional(),
  institutionName: Joi.string().trim().allow('').max(200).optional(),
  message: Joi.string().trim().allow('').max(3000).optional(),
  source: Joi.string()
    .trim()
    .valid(
      'contact_page',
      'quick_enquiry',
      'callback_request',
      'demo_request',
      'workshop_registration',
      'admissions_enquiry',
      'institution_enquiry',
      'programme_page'
    )
    .default('quick_enquiry'),
}).custom((value, helpers) => {
  if (['contact_page', 'quick_enquiry', 'admissions_enquiry', 'institution_enquiry'].includes(value.source) && (!value.email || !value.email.trim())) {
    return helpers.message('Email address is required');
  }
  return value;
});

module.exports = {
  createInquirySchema,
};
