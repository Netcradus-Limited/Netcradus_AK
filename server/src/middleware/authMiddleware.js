const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Extract token from HTTP-only Cookie or Authorization Header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'You are not logged in. Please log in to access this page.',
    });
  }

  // 2. Verify JWT Token safely without fallback secret
  try {
    if (!process.env.JWT_SECRET) {
      console.error('FATAL: JWT_SECRET environment variable is missing.');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Authentication key missing.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if User still exists in Database
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'The account belonging to this token no longer exists.',
      });
    }

    // 4. Check if User account is active
    if (currentUser.status === 'disabled') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been disabled. Please contact support.',
      });
    }

    // 5. Attach User object to Request
    req.user = currentUser;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.',
    });
  }
});

/**
 * Optional authentication middleware: populates req.user if token is present, but does not block guests if missing
 */
const optionalProtect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token && process.env.JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id);
      if (currentUser && currentUser.status !== 'disabled') {
        req.user = currentUser;
      }
    } catch (err) {
      // Ignore token verification errors on optional routes
    }
  }
  next();
});

/**
 * Restrict routes to specific user roles
 * @param  {...string} roles Allowed roles ('admin', 'super_admin', 'student', etc.)
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};

module.exports = { protect, optionalProtect, restrictTo };


