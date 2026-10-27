import app from './app';
import { env } from './config/env';

/**
 * Boots the HTTP server and registers process lifecycle handlers.
 */
const startServer = (): void => {
  const port = env.PORT;

  // Validate environment variables on startup
  if (!env.GEMINI_API_KEY) {
    console.warn(
      '\n⚠️  [CONFIG WARNING]: GEMINI_API_KEY is not defined in your environment or .env file.' +
      '\n    Please provide a valid GEMINI_API_KEY to enable AI text classification.\n'
    );
  }

  const server = app.listen(port, () => {
    console.log(`====================================================`);
    console.log(`🚀 AI Text Classifier API running successfully!`);
    console.log(`📡 Environment:  ${env.NODE_ENV}`);
    console.log(`🌐 Local URL:    http://localhost:${port}`);
    console.log(`🩺 Health check: http://localhost:${port}/health`);
    console.log(`🎯 Endpoint:     POST http://localhost:${port}/api/classify`);
    console.log(`🤖 Gemini Model: ${env.GEMINI_MODEL}`);
    console.log(`====================================================`);
  });

  // Graceful shutdown handling
  const shutdown = (signal: string): void => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });

    // Force close after 10 seconds if lingering connections exist
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Global uncaught handlers to prevent silent abrupt terminations
  process.on('uncaughtException', (err: Error) => {
    console.error('CRITICAL: Uncaught Exception:', err);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    console.error('CRITICAL: Unhandled Promise Rejection:', reason);
  });
};

startServer();

