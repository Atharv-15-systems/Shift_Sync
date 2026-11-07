import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/connection.js';
import { analyzeHandoverRisks } from '../services/riskDetection.js';
import crypto from 'crypto';

export const handoversRouter = Router();

// GET all handovers (optional filter by channelId or status)
handoversRouter.get('/', (req: Request, res: Response) => {
  const { channelId, status } = req.query;
  const db = getDatabase();

  let query = `
    SELECT h.*, u.name as author_name, u.avatar_color as author_avatar, u.role as author_role,
           c.name as channel_name
    FROM handovers h
    JOIN users u ON h.author_id = u.id
    JOIN channels c ON h.channel_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (channelId) {
    query += ' AND h.channel_id = ?';
    params.push(channelId);
  }
  if (status) {
    query += ' AND h.status = ?';
    params.push(status);
  }

  query += ' ORDER BY h.created_at DESC';

  const handovers = db.prepare(query).all(...params);

  // Fetch items & acks for each handover
  const fullHandovers = handovers.map((h: any) => {
    const items = db.prepare(`
      SELECT hi.*, u.name as owner_name
      FROM handover_items hi
      LEFT JOIN users u ON hi.owner_id = u.id
      WHERE hi.handover_id = ?
      ORDER BY 
        CASE hi.priority
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          ELSE 4
        END,
        hi.created_at ASC
    `).all(h.id);

    const acks = db.prepare(`
      SELECT a.*, u.name as user_name, u.role as user_role, u.avatar_color as user_avatar
      FROM acknowledgements a
      JOIN users u ON a.user_id = u.id
      WHERE a.handover_id = ?
      ORDER BY a.at ASC
    `).all(h.id);

    return {
      ...h,
      items,
      acknowledgements: acks,
      risks: h.risks_json ? JSON.parse(h.risks_json) : []
    };
  });

  res.json({ handovers: fullHandovers });
});

// GET single handover by ID
handoversRouter.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();

  const h = db.prepare(`
    SELECT h.*, u.name as author_name, u.avatar_color as author_avatar, u.role as author_role,
           c.name as channel_name
    FROM handovers h
    JOIN users u ON h.author_id = u.id
    JOIN channels c ON h.channel_id = c.id
    WHERE h.id = ?
  `).get(id) as any;

  if (!h) {
    return res.status(404).json({ error: 'Handover not found' });
  }

  const items = db.prepare(`
    SELECT hi.*, u.name as owner_name
    FROM handover_items hi
    LEFT JOIN users u ON hi.owner_id = u.id
    WHERE hi.handover_id = ?
    ORDER BY hi.created_at ASC
  `).all(id);

  const acks = db.prepare(`
    SELECT a.*, u.name as user_name, u.role as user_role, u.avatar_color as user_avatar
    FROM acknowledgements a
    JOIN users u ON a.user_id = u.id
    WHERE a.handover_id = ?
    ORDER BY a.at ASC
  `).all(id);

  res.json({
    handover: {
      ...h,
      items,
      acknowledgements: acks,
      risks: h.risks_json ? JSON.parse(h.risks_json) : []
    }
  });
});

// GET carry-over candidate tasks (unresolved pending tasks from the last submitted handover in this channel)
handoversRouter.get('/carryover/candidates', (req: Request, res: Response) => {
  const { channelId } = req.query;
  const db = getDatabase();

  let query = `
    SELECT hi.*, u.name as owner_name, h.shift_type as origin_shift
    FROM handover_items hi
    JOIN handovers h ON hi.handover_id = h.id
    LEFT JOIN users u ON hi.owner_id = u.id
    WHERE hi.kind = 'pending' AND hi.resolved = 0
  `;
  const params: any[] = [];

  if (channelId) {
    query += ' AND h.channel_id = ?';
    params.push(channelId);
  }

  query += ' ORDER BY hi.carried_count DESC, hi.created_at ASC';

  const candidates = db.prepare(query).all(...params);

  // Mark items with carried_count >= 3 as stale
  const formatted = candidates.map((item: any) => ({
    ...item,
    isStale: item.carried_count >= 3
  }));

  res.json({ candidates: formatted });
});

// POST Create or Submit Handover
handoversRouter.post('/', (req: Request, res: Response) => {
  const {
    channelId,
    authorId,
    shiftType,
    status = 'submitted', // 'draft' or 'submitted'
    items = [],
    notes = ''
  } = req.body;

  if (!channelId || !authorId || !shiftType) {
    return res.status(400).json({ error: 'channelId, authorId, and shiftType are required' });
  }

  const db = getDatabase();
  const handoverId = `handover-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

  // Analyze risks and generate offline 3-line summary
  const analysis = analyzeHandoverRisks(items, notes);

  try {
    const createTx = db.transaction(() => {
      // 1. Insert Handover Record
      const insertHandover = db.prepare(`
        INSERT INTO handovers (id, channel_id, author_id, shift_type, status, summary, risks_json, notes, created_at, submitted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ${status === 'submitted' ? "datetime('now')" : 'NULL'})
      `);

      insertHandover.run(
        handoverId,
        channelId,
        authorId,
        shiftType,
        status,
        analysis.ruleBasedSummary,
        JSON.stringify(analysis.risks),
        notes
      );

      // 2. Insert Items (Completed, Pending, Warnings)
      const insertItem = db.prepare(`
        INSERT INTO handover_items (
          id, handover_id, kind, text, priority, owner_id, due_at, resolved, carried_count, origin_item_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of items) {
        const itemId = `item-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
        const isCompleted = item.kind === 'completed' ? 1 : 0;
        // If this item was carried over, increment count
        const carriedCount = item.originItemId ? (item.carriedCount || 0) + 1 : (item.carriedCount || 0);

        insertItem.run(
          itemId,
          handoverId,
          item.kind,
          item.text,
          item.priority || 'medium',
          item.ownerId || null,
          item.dueAt || null,
          isCompleted,
          carriedCount,
          item.originItemId || null
        );
      }
    });

    createTx();

    res.status(201).json({
      success: true,
      handoverId,
      status,
      summary: analysis.ruleBasedSummary,
      risks: analysis.risks
    });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to create handover: ${err.message}` });
  }
});

// POST Acknowledge a Handover
handoversRouter.post('/:id/acknowledge', (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, note } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const db = getDatabase();

  try {
    const ackTx = db.transaction(() => {
      // Check handover existence
      const handover = db.prepare('SELECT * FROM handovers WHERE id = ?').get(id) as any;
      if (!handover) {
        throw new Error('Handover not found');
      }

      // Check user role
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
      if (!user) {
        throw new Error('User not found');
      }

      // Insert acknowledgement record
      db.prepare(`
        INSERT OR REPLACE INTO acknowledgements (handover_id, user_id, status, note, at)
        VALUES (?, ?, 'acknowledged', ?, datetime('now'))
      `).run(id, userId, note || 'Shift handover reviewed and acknowledged.');

      // Update handover status to 'acknowledged' if not closed
      if (handover.status !== 'closed') {
        db.prepare("UPDATE handovers SET status = 'acknowledged' WHERE id = ?").run(id);
      }
    });

    ackTx();

    res.json({ success: true, message: 'Handover acknowledged successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST Manager Override on Handover
handoversRouter.post('/:id/override', (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, reason } = req.body;

  if (!userId || !reason) {
    return res.status(400).json({ error: 'userId and reason are required' });
  }

  const db = getDatabase();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

  if (!user || user.role !== 'manager') {
    return res.status(403).json({ error: 'Only managers can perform administrative override' });
  }

  try {
    const overrideTx = db.transaction(() => {
      db.prepare(`
        INSERT OR REPLACE INTO acknowledgements (handover_id, user_id, status, note, at)
        VALUES (?, ?, 'override', ?, datetime('now'))
      `).run(id, userId, `MANAGER OVERRIDE: ${reason}`);

      db.prepare("UPDATE handovers SET status = 'acknowledged' WHERE id = ?").run(id);
    });

    overrideTx();

    res.json({ success: true, message: 'Manager override applied successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Close Shift (Gate: requires at least one acknowledgement or manager override)
handoversRouter.post('/:id/close', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();

  const handover = db.prepare('SELECT * FROM handovers WHERE id = ?').get(id) as any;
  if (!handover) {
    return res.status(404).json({ error: 'Handover not found' });
  }

  // Check acknowledgement gate: at least one 'acknowledged' or 'override'
  const validAck = db.prepare(`
    SELECT * FROM acknowledgements 
    WHERE handover_id = ? AND status IN ('acknowledged', 'override')
  `).get(id);

  if (!validAck) {
    return res.status(412).json({
      error: 'Shift closure blocked: Outgoing staff cannot close shift until incoming staff acknowledges or a manager overrides.'
    });
  }

  db.prepare(`
    UPDATE handovers 
    SET status = 'closed', closed_at = datetime('now') 
    WHERE id = ?
  `).run(id);

  res.json({ success: true, message: 'Shift closed successfully.' });
});

// POST Mark task item as resolved
handoversRouter.post('/items/:id/resolve', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();

  const item = db.prepare('SELECT * FROM handover_items WHERE id = ?').get(id) as any;
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const newResolvedState = item.resolved === 1 ? 0 : 1;
  db.prepare('UPDATE handover_items SET resolved = ? WHERE id = ?').run(newResolvedState, id);

  res.json({ success: true, resolved: newResolvedState === 1 });
});

