import { SqliteDb } from './connection.js';

export type IndustryType = 'healthcare' | 'hospitality' | 'cloudops';

export interface IndustryScenarioConfig {
  id: IndustryType;
  displayName: string;
  badge: string;
  workspaceName: string;
  description: string;
}

export const SCENARIO_CONFIGS: Record<IndustryType, IndustryScenarioConfig> = {
  healthcare: {
    id: 'healthcare',
    displayName: 'Healthcare (ICU Acute Care)',
    badge: '🏥 St. Jude Hospital',
    workspaceName: 'St. Jude Hospital — Acute Care Unit',
    description: 'High-acuity intensive care ward handover with severe patient allergy alerts, arterial lines, and oxygen line pressure hazards.'
  },
  hospitality: {
    id: 'hospitality',
    displayName: 'Hospitality (Grand Hyatt Night Audit)',
    badge: '🏨 Grand Hyatt Hotel',
    workspaceName: 'Grand Hyatt — Front Office & Night Audit',
    description: 'Luxury hotel evening-to-night audit transition featuring VIP delegation arrivals, cash safe drops, and active maintenance leaks.'
  },
  cloudops: {
    id: 'cloudops',
    displayName: 'CloudOps / Tech SRE (24/7 Ops)',
    badge: '💻 Apex Global SRE',
    workspaceName: 'Apex Global Financial — Cloud SRE 24/7',
    description: 'Mission-critical 24/7 follow-the-sun DevOps SRE handover with P1 payment gateway latency, Redis cache failover, and canary deploys.'
  }
};

export function seedScenario(db: SqliteDb, industry: IndustryType = 'healthcare'): void {
  const transaction = db.transaction(() => {
    // 1. Wipe all existing tables in child-to-parent order
    db.prepare('DELETE FROM acknowledgements').run();
    db.prepare('DELETE FROM handover_items').run();
    db.prepare('DELETE FROM handovers').run();
    db.prepare('DELETE FROM channel_members').run();
    db.prepare('DELETE FROM channels').run();
    db.prepare('DELETE FROM workspaces').run();
    db.prepare('DELETE FROM preferences').run();
    db.prepare('DELETE FROM users').run();

    const insertUser = db.prepare(`
      INSERT INTO users (id, name, role, avatar_color, nexconn_user_id)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertPref = db.prepare(`
      INSERT INTO preferences (user_id, active_theme, is_dark, glass_blur, glass_opacity, glass_border_brightness, glass_corner_radius, custom_accent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertWorkspace = db.prepare('INSERT INTO workspaces (id, name) VALUES (?, ?)');
    const insertChannel = db.prepare(`
      INSERT INTO channels (id, workspace_id, name, type, nexconn_group_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    const insertMember = db.prepare('INSERT INTO channel_members (channel_id, user_id) VALUES (?, ?)');
    const insertHandover = db.prepare(`
      INSERT INTO handovers (id, channel_id, author_id, shift_type, status, summary, risks_json, notes, created_at, submitted_at, closed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 hours'), datetime('now', '-1 hours'), ?)
    `);
    const insertItem = db.prepare(`
      INSERT INTO handover_items (id, handover_id, kind, text, priority, owner_id, due_at, resolved, carried_count, origin_item_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertAck = db.prepare(`
      INSERT INTO acknowledgements (handover_id, user_id, status, note, at)
      VALUES (?, ?, ?, ?, datetime('now', '-30 minutes'))
    `);

    if (industry === 'healthcare') {
      // USERS
      insertUser.run('user-elena', 'Elena Rostova', 'outgoing', '#2563eb', 'nexconn_user_elena');
      insertUser.run('user-marcus', 'Marcus Vance', 'incoming', '#059669', 'nexconn_user_marcus');
      insertUser.run('user-sarah', 'Dr. Sarah Chen', 'manager', '#7c3aed', 'nexconn_user_sarah');

      insertPref.run('user-elena', 'aurora', 1, 16, 0.75, 0.8, 16, '#2563eb');
      insertPref.run('user-marcus', 'midnight', 1, 20, 0.70, 0.9, 16, '#059669');
      insertPref.run('user-sarah', 'aurora', 1, 16, 0.80, 0.8, 14, '#7c3aed');

      // WORKSPACE & CHANNELS
      insertWorkspace.run('ws-acute-care', 'St. Jude Hospital — Acute Care Unit');
      insertChannel.run('chan-icu', 'ws-acute-care', 'icu-handover', 'shift', 'group_icu_handover');
      insertChannel.run('chan-general', 'ws-acute-care', 'general-staff', 'general', 'group_general_staff');
      insertChannel.run('chan-dm-em', 'ws-acute-care', 'Marcus & Elena', 'dm', 'dm_marcus_elena');

      ['user-elena', 'user-marcus', 'user-sarah'].forEach(uid => {
        insertMember.run('chan-icu', uid);
        insertMember.run('chan-general', uid);
      });
      insertMember.run('chan-dm-em', 'user-elena');
      insertMember.run('chan-dm-em', 'user-marcus');

      // HANDOVER
      const hid = 'handover-morning-01';
      const summaryText = 'Morning shift completed smoothly. Patient 304 requires frequent arterial line flushes. Warning noted for severe latex allergy and minor oxygen regulator leak.';
      const risksJson = JSON.stringify([
        { keyword: 'allergy', severity: 'critical', text: 'ALERT: Patient 304 has severe latex allergy - verify all equipment' },
        { keyword: 'leak', severity: 'high', text: 'WARNING: Oxygen regulator valve on bed 307 has minor pressure leak - biomed notified' }
      ]);

      insertHandover.run(
        hid,
        'chan-icu',
        'user-elena',
        'Morning',
        'submitted',
        summaryText,
        risksJson,
        'Family of patient 302 scheduled to visit at 18:00. Blood bank confirmed two PRBC units available.',
        null
      );

      // ITEMS
      insertItem.run('item-comp-01', hid, 'completed', 'Patient 302 IV antibiotic infusion (Vancomycin 1g) administered at 10:00', 'medium', 'user-elena', null, 1, 0, null);
      insertItem.run('item-comp-02', hid, 'completed', 'Patient 305 morning post-op vitals recorded and stable (BP 124/78, HR 72)', 'low', 'user-elena', null, 1, 0, null);

      insertItem.run('item-pend-01', hid, 'pending', 'Patient 304 arterial line flush check every 2 hours (next due: 15:00)', 'critical', 'user-marcus', '15:00', 0, 1, null);
      insertItem.run('item-pend-02', hid, 'pending', 'Patient 308 post-op CT scan report follow-up with Dr. Kim in Radiology', 'high', 'user-marcus', '16:30', 0, 1, null);
      insertItem.run('item-pend-03', hid, 'pending', 'Restock central line dressing kits in Supply Cart B (backordered from pharmacy)', 'medium', null, '18:00', 0, 3, null); // STALE

      insertItem.run('item-warn-01', hid, 'warning', 'ALERT: Patient 304 has severe latex allergy - verify all catheters and surgical gloves', 'critical', null, null, 0, 0, null);
      insertItem.run('item-warn-02', hid, 'warning', 'WARNING: Oxygen regulator valve on bed 307 has minor pressure leak - biomed notified ticket #8841', 'high', null, null, 0, 0, null);

      insertAck.run(hid, 'user-marcus', 'read', 'Reviewed vitals and pending CT scan orders.');

    } else if (industry === 'hospitality') {
      // USERS
      insertUser.run('user-sophia', 'Sophia Lin', 'outgoing', '#d97706', 'nexconn_user_sophia');
      insertUser.run('user-liam', 'Liam Patel', 'incoming', '#059669', 'nexconn_user_liam');
      insertUser.run('user-gm', 'Marcus Aurelius', 'manager', '#dc2626', 'nexconn_user_gm');

      insertPref.run('user-sophia', 'sunset', 1, 18, 0.75, 0.85, 16, '#d97706');
      insertPref.run('user-liam', 'midnight', 1, 20, 0.70, 0.9, 16, '#059669');
      insertPref.run('user-gm', 'aurora', 1, 16, 0.80, 0.8, 14, '#dc2626');

      // WORKSPACE & CHANNELS
      insertWorkspace.run('ws-hyatt', 'Grand Hyatt — Front Office & Night Audit');
      insertChannel.run('chan-frontdesk', 'ws-hyatt', 'front-desk-handover', 'shift', 'group_frontdesk');
      insertChannel.run('chan-vip', 'ws-hyatt', 'vip-concierge', 'general', 'group_vip');
      insertChannel.run('chan-dm-sl', 'ws-hyatt', 'Sophia & Liam', 'dm', 'dm_sophia_liam');

      ['user-sophia', 'user-liam', 'user-gm'].forEach(uid => {
        insertMember.run('chan-frontdesk', uid);
        insertMember.run('chan-vip', uid);
      });
      insertMember.run('chan-dm-sl', 'user-sophia');
      insertMember.run('chan-dm-sl', 'user-liam');

      // HANDOVER
      const hid = 'handover-hosp-01';
      const summaryText = 'Evening Front Office to Night Audit shift handoff. Diplomatic VIP delegation incoming at 23:00. Room 412 ceiling leak reported.';
      const risksJson = JSON.stringify([
        { keyword: 'leak', severity: 'critical', text: 'HAZARD: Room 412 bathroom ceiling pipe has active drip - main valve tagged' },
        { keyword: 'security', severity: 'high', text: 'SECURITY: French Diplomatic delegation arriving at 23:00 via South VIP portico' }
      ]);

      insertHandover.run(
        hid,
        'chan-frontdesk',
        'user-sophia',
        'Evening',
        'submitted',
        summaryText,
        risksJson,
        'Convention ballroom setup begins at 05:00 tomorrow. Night audit reports must be compiled by 04:30.',
        null
      );

      insertItem.run('item-hp-1', hid, 'completed', 'Balanced mid-shift merchant card settlement reconciliation ($48,250 verified)', 'medium', 'user-sophia', null, 1, 0, null);
      insertItem.run('item-hp-2', hid, 'completed', 'Checked in 142 group convention guests with pre-encoded digital key cards', 'low', 'user-sophia', null, 1, 0, null);

      insertItem.run('item-hp-3', hid, 'pending', 'Perform mandatory Night Audit cash drawer drop and safe transfer verification', 'critical', 'user-liam', '23:30', 0, 1, null);
      insertItem.run('item-hp-4', hid, 'pending', 'Deliver VIP French Champagne & handwritten welcome letter to Presidential Suite', 'high', 'user-liam', '22:45', 0, 1, null);
      insertItem.run('item-hp-5', hid, 'pending', 'Replace faulty electronic RFID door lock on Room 308 (guest relocated)', 'high', null, '02:00', 0, 3, null); // STALE

      insertItem.run('item-hp-6', hid, 'warning', 'HAZARD: Room 412 bathroom ceiling pipe has active drip - main valve tagged by engineering', 'critical', null, null, 0, 0, null);
      insertItem.run('item-hp-7', hid, 'warning', 'SECURITY: French Diplomatic delegation arriving at 23:00 via South VIP portico. Coordinate with security detail', 'critical', null, null, 0, 0, null);

      insertAck.run(hid, 'user-liam', 'read', 'Reviewed VIP arrival logistics and night drop checklist.');

    } else if (industry === 'cloudops') {
      // USERS
      insertUser.run('user-alex', 'Alex Rivera', 'outgoing', '#6366f1', 'nexconn_user_alex');
      insertUser.run('user-dev', 'Dev Gupta', 'incoming', '#10b981', 'nexconn_user_dev');
      insertUser.run('user-sam', 'Samantha Reed', 'manager', '#ec4899', 'nexconn_user_sam');

      insertPref.run('user-alex', 'midnight', 1, 18, 0.75, 0.85, 16, '#6366f1');
      insertPref.run('user-dev', 'aurora', 1, 20, 0.70, 0.9, 16, '#10b981');
      insertPref.run('user-sam', 'minimal', 1, 16, 0.80, 0.8, 14, '#ec4899');

      // WORKSPACE & CHANNELS
      insertWorkspace.run('ws-apex', 'Apex Global Financial — Cloud SRE 24/7');
      insertChannel.run('chan-sre', 'ws-apex', 'sre-shift-handover', 'shift', 'group_sre_handover');
      insertChannel.run('chan-p1', 'ws-apex', 'p1-incident-bridge', 'general', 'group_p1_incident');
      insertChannel.run('chan-dm-ad', 'ws-apex', 'Alex & Dev', 'dm', 'dm_alex_dev');

      ['user-alex', 'user-dev', 'user-sam'].forEach(uid => {
        insertMember.run('chan-sre', uid);
        insertMember.run('chan-p1', uid);
      });
      insertMember.run('chan-dm-ad', 'user-alex');
      insertMember.run('chan-dm-ad', 'user-dev');

      // HANDOVER
      const hid = 'handover-sre-01';
      const summaryText = 'APAC to EMEA/US SRE follow-the-sun handover. P1 payment gateway latency spike under investigation. Redis failover completed.';
      const risksJson = JSON.stringify([
        { keyword: 'danger', severity: 'critical', text: 'INCIDENT P1: Intermittent 504 gateway timeouts observed from us-east-1 payment webhook partners' },
        { keyword: 'fail', severity: 'high', text: 'INFRA HAZARD: Redis primary memory saturation hit 89% - shard scale-out in progress' }
      ]);

      insertHandover.run(
        hid,
        'chan-sre',
        'user-alex',
        'Morning',
        'submitted',
        summaryText,
        risksJson,
        'Zero-downtime PostgreSQL read-replica maintenance scheduled for 22:00 UTC tonight.',
        null
      );

      insertItem.run('item-co-1', hid, 'completed', 'Completed rolling patch update for Kubernetes v1.30.2 on cluster-prod-eu-west', 'medium', 'user-alex', null, 1, 0, null);
      insertItem.run('item-co-2', hid, 'completed', 'Drained and cordoned rogue worker node worker-08 with anomalous I/O wait times', 'high', 'user-alex', null, 1, 0, null);

      insertItem.run('item-co-3', hid, 'pending', 'Monitor payment gateway p99 API latency post-ingress rate limiter tuning', 'critical', 'user-dev', '16:00', 0, 1, null);
      insertItem.run('item-co-4', hid, 'pending', 'Execute dry-run canary deployment for core billing microservice v2.8.4', 'high', 'user-dev', '17:30', 0, 1, null);
      insertItem.run('item-co-5', hid, 'pending', 'Decommission legacy RabbitMQ cluster-03 and archive durable message logs', 'medium', null, '20:00', 0, 3, null); // STALE

      insertItem.run('item-co-6', hid, 'warning', 'INCIDENT P1: Intermittent 504 gateway timeouts observed from us-east-1 payment webhook partners', 'critical', null, null, 0, 0, null);
      insertItem.run('item-co-7', hid, 'warning', 'INFRA HAZARD: Redis primary memory saturation hit 89% - shard scale-out in progress', 'critical', null, null, 0, 0, null);

      insertAck.run(hid, 'user-dev', 'read', 'Monitoring p99 latency grafana dashboard.');
    }
  });

  transaction();
}
