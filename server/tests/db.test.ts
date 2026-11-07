import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getDatabase, SqliteDb } from '../src/db/connection.js';
import { initializeSchema } from '../src/db/schema.js';
import { seedDemoData } from '../src/db/seed.js';

describe('Database Schema & Seed Engine', () => {
  let db: SqliteDb;

  beforeEach(() => {
    db = getDatabase(':memory:');
    initializeSchema(db);
  });

  afterEach(() => {
    db.close();
  });

  it('initializes all normalized tables properly', () => {
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all().map((row: any) => row.name);

    expect(tables).toContain('users');
    expect(tables).toContain('workspaces');
    expect(tables).toContain('channels');
    expect(tables).toContain('channel_members');
    expect(tables).toContain('handovers');
    expect(tables).toContain('handover_items');
    expect(tables).toContain('acknowledgements');
    expect(tables).toContain('preferences');
  });

  it('seeds hospital demo data correctly', () => {
    seedDemoData(db);

    const users = db.prepare('SELECT * FROM users').all();
    expect(users.length).toBe(3);

    const elena = db.prepare('SELECT * FROM users WHERE id = ?').get('user-elena') as any;
    expect(elena.name).toBe('Elena Rostova');
    expect(elena.role).toBe('outgoing');

    const marcus = db.prepare('SELECT * FROM users WHERE id = ?').get('user-marcus') as any;
    expect(marcus.name).toBe('Marcus Vance');
    expect(marcus.role).toBe('incoming');

    const handovers = db.prepare('SELECT * FROM handovers').all();
    expect(handovers.length).toBe(1);

    const items = db.prepare('SELECT * FROM handover_items').all();
    expect(items.length).toBe(7);

    // Stale item verification (carried_count >= 3)
    const staleItems = db.prepare('SELECT * FROM handover_items WHERE carried_count >= 3').all();
    expect(staleItems.length).toBe(1);

    // Critical warnings verification
    const warnings = db.prepare("SELECT * FROM handover_items WHERE kind = 'warning'").all();
    expect(warnings.length).toBe(2);
  });

  it('enforces foreign key constraints', () => {
    expect(() => {
      db.prepare(`
        INSERT INTO channels (id, workspace_id, name, type, nexconn_group_id)
        VALUES ('chan-invalid', 'non-existent-workspace', 'test', 'shift', 'test')
      `).run();
    }).toThrow();
  });

  it('handles atomic transaction rollback on failure', () => {
    seedDemoData(db);
    const initialItemCount = (db.prepare('SELECT COUNT(*) as count FROM handover_items').get() as any).count;

    expect(() => {
      const failingTx = db.transaction(() => {
        db.prepare(`
          INSERT INTO handover_items (id, handover_id, kind, text)
          VALUES ('item-valid', 'handover-morning-01', 'pending', 'Valid item')
        `).run();

        // This will fail due to foreign key violation
        db.prepare(`
          INSERT INTO handover_items (id, handover_id, kind, text)
          VALUES ('item-broken', 'non-existent-handover', 'pending', 'Broken item')
        `).run();
      });

      failingTx();
    }).toThrow();

    const finalItemCount = (db.prepare('SELECT COUNT(*) as count FROM handover_items').get() as any).count;
    expect(finalItemCount).toBe(initialItemCount);
  });
});
