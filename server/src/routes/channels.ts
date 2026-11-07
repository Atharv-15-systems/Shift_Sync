import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/connection.js';

export const channelsRouter = Router();

// GET all channels for current workspace
channelsRouter.get('/', (_req: Request, res: Response) => {
  const db = getDatabase();
  const channels = db.prepare(`
    SELECT c.id, c.workspace_id, c.name, c.type, c.nexconn_group_id, c.created_at,
           w.name as workspace_name
    FROM channels c
    JOIN workspaces w ON c.workspace_id = w.id
    ORDER BY c.created_at ASC
  `).all();

  // Get members for each channel
  const channelsWithMembers = channels.map((chan: any) => {
    const members = db.prepare(`
      SELECT u.id, u.name, u.role, u.avatar_color
      FROM channel_members cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.channel_id = ?
    `).all(chan.id);

    return {
      ...chan,
      members
    };
  });

  res.json({ channels: channelsWithMembers });
});

// GET specific channel
channelsRouter.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();

  const channel = db.prepare(`
    SELECT c.*, w.name as workspace_name
    FROM channels c
    JOIN workspaces w ON c.workspace_id = w.id
    WHERE c.id = ?
  `).get(id) as any;

  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' });
  }

  const members = db.prepare(`
    SELECT u.id, u.name, u.role, u.avatar_color
    FROM channel_members cm
    JOIN users u ON cm.user_id = u.id
    WHERE cm.channel_id = ?
  `).all(id);

  res.json({ channel: { ...channel, members } });
});
