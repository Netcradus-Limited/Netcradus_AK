const Inquiry = require('../models/Inquiry');
const asyncHandler = require('../utils/asyncHandler');
const { createInquirySchema } = require('../validators/inquiryValidator');

/**
 * @desc    Submit an Academy lead / inquiry (Quick enquiry, Callback, Workshop demo)
 * @route   POST /api/v1/inquiries
 * @access  Public
 */
const createInquiry = asyncHandler(async (req, res, next) => {
  // 1. Validate payload via Joi schema
  const { error, value } = createInquirySchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return res.status(400).json({
      success: false,
      message: errorMessage,
    });
  }

  const { fullName, email, phone, interestedCourse, qualification, institutionName, message, source } = value;

  // 2. Create Inquiry record
  const inquiry = await Inquiry.create({
    fullName: fullName.trim(),
    email: email ? email.toLowerCase().trim() : '',
    phone: phone.trim(),
    interestedCourse: interestedCourse.trim(),
    qualification: qualification ? qualification.trim() : '',
    institutionName: institutionName ? institutionName.trim() : '',
    message: message ? message.trim() : '',
    source: source || 'quick_enquiry',
    status: 'new',
  });

  res.status(201).json({
    success: true,
    message: 'Thank you! Your enquiry has been received. Our admissions team will contact you shortly.',
    data: inquiry,
  });
});

module.exports = {
  createInquiry,
};
