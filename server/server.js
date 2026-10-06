const dotenv = require('dotenv');
// Initialize environment configs
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const app = require('./src/app');

// Catch uncaught exceptions globally to prevent silent app crashes
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down process...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

let server;

const startServer = async () => {
  // 1. Connect MongoDB
  await connectDB();

  // 2. Start Express server
  server = app.listen(PORT, () => {
    console.log(`[Netcradus Backend] Server successfully launched in ${NODE_ENV} mode on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('[Startup Error] Failed to initialize server:', err);
  process.exit(1);
});

// Graceful shutdown function
const shutdownGracefully = (signal) => {
  console.log(`\n[Shutdown] Received ${signal}. Starting graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log('[Shutdown] HTTP server closed.');
      try {
        await mongoose.connection.close();
        console.log('[Shutdown] Mongoose connection closed.');
        process.exit(0);
      } catch (err) {
        console.error('[Shutdown Error] Error closing Mongoose:', err);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

// Catch SIGINT and SIGTERM
process.on('SIGINT', () => shutdownGracefully('SIGINT'));
process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));

// Catch unhandled async promise rejections globally to terminate node process gracefully
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down process gracefully...');
  console.error(err.name, err.message, err.stack);
  if (server) {
    server.close(async () => {
      try {
        await mongoose.connection.close();
        console.log('[Shutdown] Mongoose connection closed after unhandled rejection.');
      } catch (dbErr) {
        console.error('[Shutdown Error] Failed to close Mongoose connection:', dbErr);
      }
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
