import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/connection.js';

export const preferencesRouter = Router();

// GET User Preferences
preferencesRouter.get('/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const db = getDatabase();

  const pref = db.prepare('SELECT * FROM preferences WHERE user_id = ?').get(userId);
  if (!pref) {
    return res.status(404).json({ error: 'Preferences not found' });
  }

  res.json({ preferences: pref });
});

// PUT Update User Preferences
preferencesRouter.put('/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const {
    active_theme = 'aurora',
    is_dark = 0,
    glass_blur = 16,
    glass_opacity = 0.75,
    glass_border_brightness = 0.8,
    glass_corner_radius = 16,
    custom_accent = null,
    layout_density = 'comfortable',
    font_family = 'system'
  } = req.body;

  const db = getDatabase();

  db.prepare(`
    INSERT OR REPLACE INTO preferences (
      user_id, active_theme, is_dark, glass_blur, glass_opacity,
      glass_border_brightness, glass_corner_radius, custom_accent,
      layout_density, font_family, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    userId,
    active_theme,
    is_dark ? 1 : 0,
    glass_blur,
    glass_opacity,
    glass_border_brightness,
    glass_corner_radius,
    custom_accent,
    layout_density,
    font_family
  );

  const updated = db.prepare('SELECT * FROM preferences WHERE user_id = ?').get(userId);
  res.json({ success: true, preferences: updated });
});

