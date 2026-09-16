const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 1. Security Headers via Helmet
app.use(helmet());

// 2. Enable CORS with configurable origins
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 3. Logger configurations based on environment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 4. Body parser and size limits to prevent DOS
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 5. Data sanitization to protect against MongoDB Query Injections
app.use(mongoSanitize());

// 6. Targeted Rate Limiters
// Auth Limiter: Protects sensitive authentication routes against brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 50, // 50 attempts per 15 min
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public Course Catalog Limiter: High capacity for public catalog & curriculum browsing
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 5000 : 2000, // 2000 requests per 15 min for normal browsing
  message: {
    success: false,
    message: 'Too many requests to public courses catalog, please try again shortly.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API Limiter: General protection for other application endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 5000 : 1000,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general API rate limiter
app.use('/api', apiLimiter);

// Import API Routers
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const lectureRoutes = require('./routes/lectureRoutes');

// 7. Base server health verification endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Netcradus LMS API Server is running healthy',
    timestamp: new Date()
  });
});

// 8. Mount Academy API Routers
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/courses', publicLimiter, courseRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/lectures', lectureRoutes);


// 8. Capture and forward unhandled endpoint requests
app.all('*', (req, res, next) => {
  const err = new Error(`Endpoint ${req.originalUrl} does not exist on this server`);
  err.statusCode = 404;
  next(err);
});

// 9. Centralized Error Interceptor
app.use(errorHandler);

module.exports = app;
