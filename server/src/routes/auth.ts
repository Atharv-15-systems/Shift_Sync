import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/connection.js';
import { seedDemoData } from '../db/seed.js';
import { issueNexconnToken, getNexconnConfig } from '../services/nexconn.js';

export const authRouter = Router();

// GET all demo users
authRouter.get('/users', (_req: Request, res: Response) => {
  const db = getDatabase();
  const users = db.prepare('SELECT id, name, role, avatar_color, nexconn_user_id, created_at FROM users').all();
  res.json({ users });
});

// GET Nexconn client configuration (public App Key)
authRouter.get('/config', (_req: Request, res: Response) => {
  const config = getNexconnConfig();
  res.json({
    appKey: config.appKey,
    isConfigured: config.isConfigured
  });
});

// POST Login as a specific user
authRouter.post('/login', async (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const db = getDatabase();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Retrieve user preferences
  const preferences = db.prepare('SELECT * FROM preferences WHERE user_id = ?').get(userId);

  // Attempt to issue/retrieve Nexconn token
  const tokenResult = await issueNexconnToken(user.id, user.name);

  res.json({
    user,
    preferences,
    nexconn: {
      isConfigured: tokenResult.isConfigured,
      token: tokenResult.token || null,
      error: tokenResult.error || null
    }
  });
});

// POST Reset and Re-seed Hospital Ward Demo Data
authRouter.post('/seed-demo', (_req: Request, res: Response) => {
  try {
    const db = getDatabase();
    seedDemoData(db);
    res.json({ success: true, message: 'Hospital Ward demo data seeded successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to seed demo data: ${err.message}` });
  }
});

