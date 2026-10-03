import express, { Express } from 'express';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api';
import { errorHandler } from './middleware/errorHandler';
import { connectMongo } from './config/db';

dotenv.config();

export function createExpressApp(): Express {
  const app = express();

  // Request parsers & middlewares (50mb to allow high-res direct image uploads to Cloudinary)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Ensure MongoDB connection is active for every incoming API request (vital for serverless / Vercel)
  app.use(async (req, res, next) => {
    try {
      await connectMongo();
    } catch (err: any) {
      console.warn('[MongoDB Middleware] Pre-connect error:', err?.message || err);
    }
    next();
  });

  // Mount API router
  app.use('/api', apiRouter);

  // Catch-all for undefined /api routes so they return JSON 404, never Vite HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Global API error handler
  app.use(errorHandler);

  return app;
}

export const app = createExpressApp();
export default app;
