const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
  createOrderSchema,
  verifyPaymentSchema,
} = require('../validators/paymentValidator');

// Both endpoints require authentication
router.use(protect);

router.post(
  '/create-order',
  validate(createOrderSchema),
  paymentController.createOrder
);

router.post(
  '/verify',
  validate(verifyPaymentSchema),
  paymentController.verifyPayment
);

module.exports = router;
