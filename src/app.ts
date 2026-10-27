import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import classifyRoutes from './routes/classify.route';
import { notFoundHandler } from './middleware/not-found.middleware';
import { errorHandler } from './middleware/error.middleware';

/**
 * Creates and configures the Express application instance.
 */
export const createApp = (): Application => {
  const app: Application = express();

  // 1. Security Headers via Helmet
  app.use(helmet());

  // 2. Cross-Origin Resource Sharing
  app.use(cors());

  // 3. Request Logging via Morgan
  const morganFormat = env.isProduction() ? 'combined' : 'dev';
  app.use(morgan(morganFormat));

  // 4. Request Body Parsing with strict JSON handling
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 5. Health Check Endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // 6. Application Routes
  app.use('/api', classifyRoutes);

  // 7. 404 Route Not Found Middleware
  app.use(notFoundHandler);

  // 8. Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};

const app = createApp();

export default app;

