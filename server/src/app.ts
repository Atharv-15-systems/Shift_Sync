import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';

export function createApp() {
  const app = express();

  app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
  }));
  app.use(express.json());

  // Mount routes
  app.use('/api/health', healthRouter);

  // Global Error Handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[API Error]:', err);
    res.status(500).json({
      error: err.message || 'Internal Server Error'
    });
  });

  return app;
}
