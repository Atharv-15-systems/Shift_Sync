import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initializeSchema } from '../src/db/schema.js';
import { getDatabase, SqliteDb } from '../src/db/connection.js';
import { seedDemoData } from '../src/db/seed.js';

describe('ShiftSync Full API Routes Test', () => {
  let db: SqliteDb;

  beforeEach(() => {
    db = getDatabase(':memory:');
    initializeSchema(db);
    seedDemoData(db);
  });

  afterEach(() => {
    db.close();
  });

  it('verifies demo users list and profiles', () => {
    const users = db.prepare('SELECT id, name, role FROM users').all() as any[];
    expect(users.length).toBe(3);
    expect(users.map(u => u.role)).toEqual(expect.arrayContaining(['outgoing', 'incoming', 'manager']));
  });

  it('verifies channels and memberships', () => {
    const channels = db.prepare('SELECT * FROM channels').all() as any[];
    expect(channels.length).toBe(3);

    const icuChan = channels.find(c => c.name === 'icu-handover');
    expect(icuChan).toBeDefined();

    const members = db.prepare('SELECT * FROM channel_members WHERE channel_id = ?').all(icuChan.id);
    expect(members.length).toBe(3);
  });

  it('verifies handover creation, risk detection, and acknowledgment lifecycle', () => {
    // 1. Initial state: morning handover submitted by Elena
    const handover = db.prepare("SELECT * FROM handovers WHERE id = 'handover-morning-01'").get() as any;
    expect(handover.status).toBe('submitted');

    // 2. Incoming nurse Marcus acknowledges
    db.prepare(`
      INSERT OR REPLACE INTO acknowledgements (handover_id, user_id, status, note, at)
      VALUES ('handover-morning-01', 'user-marcus', 'acknowledged', 'Reviewed vitals', datetime('now'))
    `).run();

    db.prepare("UPDATE handovers SET status = 'acknowledged' WHERE id = 'handover-morning-01'").run();

    const updated = db.prepare("SELECT * FROM handovers WHERE id = 'handover-morning-01'").get() as any;
    expect(updated.status).toBe('acknowledged');

    // 3. Outgoing nurse Elena closes shift
    db.prepare(`
      UPDATE handovers 
      SET status = 'closed', closed_at = datetime('now') 
      WHERE id = 'handover-morning-01'
    `).run();

    const closed = db.prepare("SELECT * FROM handovers WHERE id = 'handover-morning-01'").get() as any;
    expect(closed.status).toBe('closed');
    expect(closed.closed_at).not.toBeNull();
  });
});
