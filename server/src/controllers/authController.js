const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendPasswordResetEmail } = require('../services/emailService');

/**
 * Sign JWT and attach HTTP-Only Cookie
 */
const createSendToken = (user, statusCode, res) => {
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is missing.');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: Authentication key missing.',
    });
  }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  };

  res.cookie('token', token, cookieOptions);

  // Hide password in response output
  const userSanitized = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || '',
    avatar: user.avatar || '',
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };

  res.status(statusCode).json({
    success: true,
    token,
    data: userSanitized,
  });
};

/**
 * @desc    Register a new student account
 * @route   POST /api/v1/auth/signup
 * @access  Public
 */
exports.signup = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  // Check if email already registered
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'An account with this email address already exists. Please log in.',
    });
  }

  // Create user record - strictly enforce student role for public signup
  const newUser = await User.create({
    fullName,
    email,
    phone,
    password,
    role: 'student',
  });

  createSendToken(newUser, 201, res);
});

/**
 * @desc    Authenticate student / user login
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and explicitly select password field
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password, user.password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
  }

  // Reject disabled accounts
  if (user.status === 'disabled') {
    return res.status(403).json({
      success: false,
      message: 'Your account has been disabled. Please contact support.',
    });
  }

  createSendToken(user, 200, res);
});

/**
 * @desc    Get currently authenticated user session
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

/**
 * @desc    Logout user and invalidate authentication cookie
 * @route   POST /api/v1/auth/logout
 * @access  Public / Private
 */
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    sameSite: 'strict',
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully.',
  });
});

/**
 * @desc    Request password reset token email
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  // Generic message returned regardless of existence to prevent account enumeration
  const genericMessage = 'If an account exists with that email address, a password reset link has been dispatched.';

  if (!user) {
    return res.status(200).json({
      success: true,
      message: genericMessage,
    });
  }

  // Generate secure token and set hash + expiry on user document
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail({
      to: user.email,
      fullName: user.fullName,
      resetToken,
    });

    res.status(200).json({
      success: true,
      message: genericMessage,
    });
  } catch (err) {
    // If sending fails, clean up token fields to avoid lingering reset tokens
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.error('[authController] Failed to dispatch password reset email:', err.message);

    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({
        success: false,
        message: 'There was an error sending the password reset email. Please try again later.',
      });
    }

    return res.status(500).json({
      success: false,
      message: `Email dispatch error: ${err.message}`,
    });
  }
});

/**
 * @desc    Reset password using token
 * @route   POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash incoming raw token to compare against database hash
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user with active, non-expired reset token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Password reset token is invalid or has expired.',
    });
  }

  // Set new password (triggers User pre('save') bcrypt hash hook automatically)
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // Return clean success message instructing user to log in with new password
  res.status(200).json({
    success: true,
    message: 'Password reset successful. Please log in with your new password.',
  });
});
