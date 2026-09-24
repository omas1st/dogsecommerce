import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { apiRouter } from './backend/routes/api';
import { errorHandler } from './backend/middleware/errorHandler';
import { seedDatabase } from './backend/data/seed';
import { connectMongo } from './backend/config/db';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Request parsers & middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Mount API router FIRST
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


  // Serve static public assets
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Hound & Harbor] Production-ready Pet Platform running on http://0.0.0.0:${PORT}`);
  });

  // Initialize MongoDB Atlas connection & database seed in background
  connectMongo()
    .then(() => seedDatabase())
    .catch((err) => {
      console.error('Database initialization error on boot:', err);
    });
}

startServer();
