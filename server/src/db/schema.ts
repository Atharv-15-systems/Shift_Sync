import { SqliteDb } from './connection.js';

export function initializeSchema(db: SqliteDb): void {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('outgoing', 'incoming', 'manager')),
      avatar_color TEXT NOT NULL,
      nexconn_user_id TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Workspaces table
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Channels table
    CREATE TABLE IF NOT EXISTS channels (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('shift', 'general', 'dm')),
      nexconn_group_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Channel members table
    CREATE TABLE IF NOT EXISTS channel_members (
      channel_id TEXT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      joined_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (channel_id, user_id)
    );

    -- Handovers table
    CREATE TABLE IF NOT EXISTS handovers (
      id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
      author_id TEXT NOT NULL REFERENCES users(id),
      shift_type TEXT NOT NULL CHECK(shift_type IN ('Morning', 'Evening', 'Night')),
      status TEXT NOT NULL CHECK(status IN ('draft', 'submitted', 'acknowledged', 'closed')),
      summary TEXT,
      risks_json TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      submitted_at TEXT,
      closed_at TEXT
    );

    -- Handover items (completed, pending, warnings)
    CREATE TABLE IF NOT EXISTS handover_items (
      id TEXT PRIMARY KEY,
      handover_id TEXT NOT NULL REFERENCES handovers(id) ON DELETE CASCADE,
      kind TEXT NOT NULL CHECK(kind IN ('completed', 'pending', 'warning')),
      text TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'critical')),
      owner_id TEXT REFERENCES users(id),
      due_at TEXT,
      resolved INTEGER NOT NULL DEFAULT 0,
      carried_count INTEGER NOT NULL DEFAULT 0,
      origin_item_id TEXT REFERENCES handover_items(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Acknowledgements
    CREATE TABLE IF NOT EXISTS acknowledgements (
      handover_id TEXT NOT NULL REFERENCES handovers(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL CHECK(status IN ('read', 'acknowledged', 'override')),
      note TEXT,
      at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (handover_id, user_id, status)
    );

    -- Appearance & user preferences
    CREATE TABLE IF NOT EXISTS preferences (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      active_theme TEXT NOT NULL DEFAULT 'aurora',
      is_dark INTEGER NOT NULL DEFAULT 0,
      glass_blur INTEGER NOT NULL DEFAULT 16,
      glass_opacity REAL NOT NULL DEFAULT 0.75,
      glass_border_brightness REAL NOT NULL DEFAULT 0.8,
      glass_corner_radius INTEGER NOT NULL DEFAULT 16,
      custom_accent TEXT,
      layout_density TEXT NOT NULL DEFAULT 'comfortable',
      font_family TEXT NOT NULL DEFAULT 'system',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Performance indexes
    CREATE INDEX IF NOT EXISTS idx_handovers_channel ON handovers(channel_id);
    CREATE INDEX IF NOT EXISTS idx_handovers_status ON handovers(status);
    CREATE INDEX IF NOT EXISTS idx_handover_items_handover ON handover_items(handover_id);
    CREATE INDEX IF NOT EXISTS idx_handover_items_kind ON handover_items(kind);
    CREATE INDEX IF NOT EXISTS idx_handover_items_resolved ON handover_items(resolved);
    CREATE INDEX IF NOT EXISTS idx_acknowledgements_handover ON acknowledgements(handover_id);
  `);
}
