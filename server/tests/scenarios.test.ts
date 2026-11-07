import { describe, it, expect, beforeEach } from 'vitest';
import { getDatabase, SqliteDb } from '../src/db/connection.js';
import { initializeSchema } from '../src/db/schema.js';
import { seedScenario } from '../src/db/scenarios.js';

describe('Multi-Industry Scenario Engine', () => {
  let db: SqliteDb;

  beforeEach(() => {
    db = getDatabase(':memory:');
    initializeSchema(db);
  });

  it('seeds healthcare scenario with ICU users and critical hazards', () => {
    seedScenario(db, 'healthcare');

    const users = db.prepare('SELECT name, role FROM users ORDER BY name').all() as any[];
    expect(users.length).toBe(3);
    expect(users.map(u => u.name)).toContain('Elena Rostova');
    expect(users.map(u => u.name)).toContain('Marcus Vance');

    const workspace = db.prepare('SELECT name FROM workspaces LIMIT 1').get() as any;
    expect(workspace.name).toContain('St. Jude Hospital');

    const handover = db.prepare('SELECT * FROM handovers LIMIT 1').get() as any;
    expect(handover).toBeDefined();

    const items = db.prepare('SELECT * FROM handover_items WHERE handover_id = ?').all(handover.id) as any[];
    const staleItems = items.filter(i => i.carried_count >= 3);
    expect(staleItems.length).toBeGreaterThan(0);
  });

  it('switches to hospitality scenario cleanly without duplicate keys', () => {
    seedScenario(db, 'hospitality');

    const workspace = db.prepare('SELECT name FROM workspaces LIMIT 1').get() as any;
    expect(workspace.name).toContain('Grand Hyatt');

    const users = db.prepare('SELECT name FROM users ORDER BY name').all() as any[];
    expect(users.map(u => u.name)).toContain('Sophia Lin');
    expect(users.map(u => u.name)).toContain('Liam Patel');
  });

  it('switches to cloudops scenario with P1 infrastructure incidents', () => {
    seedScenario(db, 'cloudops');

    const workspace = db.prepare('SELECT name FROM workspaces LIMIT 1').get() as any;
    expect(workspace.name).toContain('Cloud SRE');

    const users = db.prepare('SELECT name FROM users ORDER BY name').all() as any[];
    expect(users.map(u => u.name)).toContain('Alex Rivera');
    expect(users.map(u => u.name)).toContain('Dev Gupta');

    const items = db.prepare("SELECT text FROM handover_items WHERE kind = 'warning'").all() as any[];
    const hasLatencyWarning = items.some(i => i.text.toLowerCase().includes('latency') || i.text.toLowerCase().includes('p1'));
    expect(hasLatencyWarning).toBe(true);
  });
});
