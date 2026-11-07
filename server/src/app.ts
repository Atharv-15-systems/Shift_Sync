import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { getDatabase } from './db/connection.js';
import { initializeSchema } from './db/schema.js';
import { seedDemoData } from './db/seed.js';

import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { channelsRouter } from './routes/channels.js';
import { handoversRouter } from './routes/handovers.js';
import { preferencesRouter } from './routes/preferences.js';
import { createScenariosRouter } from './routes/scenarios.js';

export function createApp() {
  const app = express();

  // Initialize DB and ensure schema exists
  const db = getDatabase();
  initializeSchema(db);

  // Auto-seed if users table is empty
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any)?.count || 0;
  if (userCount === 0) {
    seedDemoData(db);
  }

  app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
  }));
  app.use(express.json());

  // Mount API Routes
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/channels', channelsRouter);
  app.use('/api/handovers', handoversRouter);
  app.use('/api/preferences', preferencesRouter);
  app.use('/api/scenarios', createScenariosRouter(db));

  // Global Error Handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[API Error]:', err);
    res.status(500).json({
      error: err.message || 'Internal Server Error'
    });
  });

  return app;
}
