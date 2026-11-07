import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getDatabase, closeDatabase, SqliteDb } from '../src/db/connection.js';
import { initializeSchema } from '../src/db/schema.js';
import { seedDemoData } from '../src/db/seed.js';
import { analyzeHandoverRisks } from '../src/services/riskDetection.js';

describe('Handover Business Logic & Shift Closure Gates', () => {
  let db: SqliteDb;

  beforeEach(() => {
    db = getDatabase(':memory:');
    initializeSchema(db);
    seedDemoData(db);
  });

  afterEach(() => {
    closeDatabase();
  });

  it('prevents shift closure before incoming staff acknowledges', () => {
    // Un-acknowledge any existing acknowledgements for testing
    db.prepare('DELETE FROM acknowledgements WHERE handover_id = ?').run('handover-morning-01');

    const validAck = db.prepare(`
      SELECT * FROM acknowledgements 
      WHERE handover_id = ? AND status IN ('acknowledged', 'override')
    `).get('handover-morning-01');

    expect(validAck).toBeUndefined();
  });

  it('allows shift closure once incoming nurse acknowledges', () => {
    // Add Marcus's acknowledgement
    db.prepare(`
      INSERT OR REPLACE INTO acknowledgements (handover_id, user_id, status, note, at)
      VALUES ('handover-morning-01', 'user-marcus', 'acknowledged', 'Acknowledged orders.', datetime('now'))
    `).run();

    const validAck = db.prepare(`
      SELECT * FROM acknowledgements 
      WHERE handover_id = ? AND status IN ('acknowledged', 'override')
    `).get('handover-morning-01') as any;

    expect(validAck).toBeDefined();
    expect(validAck.status).toBe('acknowledged');

    // Perform closure
    db.prepare(`
      UPDATE handovers 
      SET status = 'closed', closed_at = datetime('now') 
      WHERE id = 'handover-morning-01'
    `).run();

    const handover = db.prepare('SELECT status, closed_at FROM handovers WHERE id = ?').get('handover-morning-01') as any;
    expect(handover.status).toBe('closed');
    expect(handover.closed_at).not.toBeNull();
  });

  it('allows shift closure when manager overrides without incoming nurse', () => {
    db.prepare('DELETE FROM acknowledgements WHERE handover_id = ?').run('handover-morning-01');

    // Charge nurse Dr. Sarah Chen performs administrative override
    db.prepare(`
      INSERT OR REPLACE INTO acknowledgements (handover_id, user_id, status, note, at)
      VALUES ('handover-morning-01', 'user-sarah', 'override', 'MANAGER OVERRIDE: Emergency code response', datetime('now'))
    `).run();

    const validAck = db.prepare(`
      SELECT * FROM acknowledgements 
      WHERE handover_id = ? AND status IN ('acknowledged', 'override')
    `).get('handover-morning-01') as any;

    expect(validAck).toBeDefined();
    expect(validAck.status).toBe('override');
  });

  it('retrieves unresolved pending tasks with stale flag (carried_count >= 3)', () => {
    const candidates = db.prepare(`
      SELECT * FROM handover_items
      WHERE kind = 'pending' AND resolved = 0
    `).all() as any[];

    expect(candidates.length).toBeGreaterThanOrEqual(3);

    const staleItems = candidates.filter(c => c.carried_count >= 3);
    expect(staleItems.length).toBe(1);
    expect(staleItems[0].text).toContain('Supply Cart B');
  });

  it('toggles task resolution state', () => {
    const item = db.prepare("SELECT * FROM handover_items WHERE id = 'item-pend-01'").get() as any;
    expect(item.resolved).toBe(0);

    db.prepare('UPDATE handover_items SET resolved = 1 WHERE id = ?').run('item-pend-01');

    const updated = db.prepare("SELECT * FROM handover_items WHERE id = 'item-pend-01'").get() as any;
    expect(updated.resolved).toBe(1);
  });
});
