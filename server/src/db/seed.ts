import { SqliteDb } from './connection.js';

export function seedDemoData(db: SqliteDb): void {
  const transaction = db.transaction(() => {
    // Clear existing records to ensure idempotent clean seed
    db.prepare('DELETE FROM acknowledgements').run();
    db.prepare('DELETE FROM handover_items').run();
    db.prepare('DELETE FROM handovers').run();
    db.prepare('DELETE FROM channel_members').run();
    db.prepare('DELETE FROM channels').run();
    db.prepare('DELETE FROM workspaces').run();
    db.prepare('DELETE FROM preferences').run();
    db.prepare('DELETE FROM users').run();

    // 1. Insert Demo Users
    const insertUser = db.prepare(`
      INSERT INTO users (id, name, role, avatar_color, nexconn_user_id)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertUser.run('user-elena', 'Elena Rostova', 'outgoing', '#2563eb', 'nexconn_user_elena');
    insertUser.run('user-marcus', 'Marcus Vance', 'incoming', '#059669', 'nexconn_user_marcus');
    insertUser.run('user-sarah', 'Dr. Sarah Chen', 'manager', '#7c3aed', 'nexconn_user_sarah');

    // 2. Insert User Preferences
    const insertPref = db.prepare(`
      INSERT INTO preferences (user_id, active_theme, is_dark, glass_blur, glass_opacity, glass_border_brightness, glass_corner_radius, custom_accent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertPref.run('user-elena', 'aurora', 0, 16, 0.75, 0.8, 16, '#2563eb');
    insertPref.run('user-marcus', 'midnight', 1, 20, 0.70, 0.9, 16, '#059669');
    insertPref.run('user-sarah', 'aurora', 1, 16, 0.80, 0.8, 14, '#7c3aed');

    // 3. Insert Workspaces
    const insertWorkspace = db.prepare('INSERT INTO workspaces (id, name) VALUES (?, ?)');
    insertWorkspace.run('ws-acute-care', 'St. Jude Hospital — Acute Care Unit');

    // 4. Insert Channels
    const insertChannel = db.prepare(`
      INSERT INTO channels (id, workspace_id, name, type, nexconn_group_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertChannel.run('chan-icu', 'ws-acute-care', 'icu-handover', 'shift', 'group_icu_handover');
    insertChannel.run('chan-general', 'ws-acute-care', 'general-staff', 'general', 'group_general_staff');
    insertChannel.run('chan-dm-em', 'ws-acute-care', 'Marcus & Elena', 'dm', 'dm_marcus_elena');

    // 5. Channel Memberships
    const insertMember = db.prepare('INSERT INTO channel_members (channel_id, user_id) VALUES (?, ?)');
    // ICU Handover channel
    insertMember.run('chan-icu', 'user-elena');
    insertMember.run('chan-icu', 'user-marcus');
    insertMember.run('chan-icu', 'user-sarah');

    // General Staff channel
    insertMember.run('chan-general', 'user-elena');
    insertMember.run('chan-general', 'user-marcus');
    insertMember.run('chan-general', 'user-sarah');

    // DM channel
    insertMember.run('chan-dm-em', 'user-elena');
    insertMember.run('chan-dm-em', 'user-marcus');

    // 6. Insert Handover (Morning Shift submitted by Elena)
    const insertHandover = db.prepare(`
      INSERT INTO handovers (id, channel_id, author_id, shift_type, status, summary, risks_json, notes, created_at, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 hours'), datetime('now', '-1 hours'))
    `);

    const summaryText = 'Morning shift completed smoothly. Patient 304 requires frequent arterial line flushes. Warning noted for severe latex allergy and minor oxygen regulator leak.';
    const risksJson = JSON.stringify([
      { keyword: 'allergy', severity: 'critical', text: 'ALERT: Patient 304 has severe latex allergy - verify all equipment' },
      { keyword: 'leak', severity: 'high', text: 'WARNING: Oxygen regulator valve on bed 307 has minor pressure leak - biomed notified' }
    ]);

    insertHandover.run(
      'handover-morning-01',
      'chan-icu',
      'user-elena',
      'Morning',
      'submitted',
      summaryText,
      risksJson,
      'Family of patient 302 scheduled to visit at 18:00. Blood bank confirmed two PRBC units available.'
    );

    // 7. Insert Handover Items
    const insertItem = db.prepare(`
      INSERT INTO handover_items (id, handover_id, kind, text, priority, owner_id, due_at, resolved, carried_count, origin_item_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Completed
    insertItem.run('item-comp-01', 'handover-morning-01', 'completed', 'Patient 302 IV antibiotic infusion (Vancomycin 1g) administered at 10:00', 'medium', 'user-elena', null, 1, 0, null);
    insertItem.run('item-comp-02', 'handover-morning-01', 'completed', 'Patient 305 morning post-op vitals recorded and stable (BP 124/78, HR 72)', 'low', 'user-elena', null, 1, 0, null);

    // Pending
    insertItem.run('item-pend-01', 'handover-morning-01', 'pending', 'Patient 304 arterial line flush check every 2 hours (next due: 15:00)', 'critical', 'user-marcus', '15:00', 0, 1, null);
    insertItem.run('item-pend-02', 'handover-morning-01', 'pending', 'Patient 308 post-op CT scan report follow-up with Dr. Kim in Radiology', 'high', 'user-marcus', '16:30', 0, 1, null);
    insertItem.run('item-pend-03', 'handover-morning-01', 'pending', 'Restock central line dressing kits in Supply Cart B (backordered from pharmacy)', 'medium', null, '18:00', 0, 3, null); // STALE item (carried >= 3 times)

    // Warnings
    insertItem.run('item-warn-01', 'handover-morning-01', 'warning', 'ALERT: Patient 304 has severe latex allergy - verify all catheters and surgical gloves', 'critical', null, null, 0, 0, null);
    insertItem.run('item-warn-02', 'handover-morning-01', 'warning', 'WARNING: Oxygen regulator valve on bed 307 has minor pressure leak - biomed notified ticket #8841', 'high', null, null, 0, 0, null);

    // 8. Acknowledgements
    const insertAck = db.prepare(`
      INSERT INTO acknowledgements (handover_id, user_id, status, note, at)
      VALUES (?, ?, ?, ?, datetime('now', '-30 minutes'))
    `);
    insertAck.run('handover-morning-01', 'user-marcus', 'read', 'Reviewed vitals and pending CT scan orders.');
  });

  transaction();
}
