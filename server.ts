import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { app } from './backend/app';
import { seedDatabase } from './backend/data/seed';
import { connectMongo } from './backend/config/db';

dotenv.config();

async function startServer() {
  const PORT = process.env.PORT || 3000;

  // Serve static public assets
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Vite middleware for development vs static dist in production
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

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Hound & Harbor] Pet Platform running on http://0.0.0.0:${PORT}`);
  });

  // Initialize MongoDB Atlas connection & database seed in background
  connectMongo()
    .then(() => seedDatabase())
    .catch((err) => {
      console.error('Database initialization error on boot:', err);
    });
}

startServer();
