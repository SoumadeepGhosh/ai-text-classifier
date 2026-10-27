import app from './app';
import { env } from './config/env';

const startServer = (): void => {
  const port = env.PORT;

  if (!env.GEMINI_API_KEY) {
    console.warn('Warning: GEMINI_API_KEY is not defined in the environment or .env file.');
  }

  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port} (${env.NODE_ENV})`);
  });

  // Gracefully close active connections on termination signals.
  const shutdown = (signal: string): void => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });

    // Force exit if connections do not close within 10 seconds.
    setTimeout(() => {
      console.error('Forced shutdown due to timed-out connections.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (err: Error) => {
    console.error('Uncaught Exception:', err);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    console.error('Unhandled Promise Rejection:', reason);
  });
};

startServer();
