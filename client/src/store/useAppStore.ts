import { create } from 'zustand';
import { nexconnService, NexconnConnectionStatus, NexconnMessage } from '../lib/nexconn.ts';

export interface User {
  id: string;
  name: string;
  role: 'outgoing' | 'incoming' | 'manager';
  avatar_color: string;
  nexconn_user_id: string;
}

export interface Channel {
  id: string;
  workspace_id: string;
  name: string;
  type: 'shift' | 'general' | 'dm';
  nexconn_group_id: string;
  workspace_name?: string;
  members: Array<{ id: string; name: string; role: string; avatar_color: string }>;
}

export interface HandoverItem {
  id: string;
  handover_id: string;
  kind: 'completed' | 'pending' | 'warning';
  text: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  owner_id?: string | null;
  owner_name?: string | null;
  due_at?: string | null;
  resolved: number;
  carried_count: number;
  origin_item_id?: string | null;
}

export interface Acknowledgement {
  handover_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  user_avatar: string;
  status: 'read' | 'acknowledged' | 'override';
  note?: string;
  at: string;
}

export interface Handover {
  id: string;
  channel_id: string;
  channel_name?: string;
  author_id: string;
  author_name: string;
  author_avatar: string;
  author_role: string;
  shift_type: 'Morning' | 'Evening' | 'Night';
  status: 'draft' | 'submitted' | 'acknowledged' | 'closed';
  summary?: string;
  risks_json?: string;
  notes?: string;
  created_at: string;
  submitted_at?: string;
  closed_at?: string;
  items: HandoverItem[];
  acknowledgements: Acknowledgement[];
  risks?: Array<{ keyword: string; severity: string; text: string; category?: string }>;
}

export interface UserPreferences {
  active_theme: string;
  is_dark: number;
  glass_blur: number;
  glass_opacity: number;
  glass_border_brightness: number;
  glass_corner_radius: number;
  custom_accent?: string | null;
  layout_density: string;
  font_family: string;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  channels: Channel[];
  activeChannelId: string;
  handovers: Handover[];
  activeHandoverId: string | null;
  carryoverCandidates: HandoverItem[];
  messages: NexconnMessage[];
  preferences: UserPreferences;
  nexconnStatus: { status: NexconnConnectionStatus; detail: string };
  isLoading: boolean;
  activeTab: 'handover' | 'chat' | 'settings' | 'history';

  // Actions
  setActiveTab: (tab: 'handover' | 'chat' | 'settings' | 'history') => void;
  setActiveChannelId: (channelId: string) => void;
  setActiveHandoverId: (handoverId: string | null) => void;
  fetchInitialData: () => Promise<void>;
  loginAsUser: (userId: string) => Promise<void>;
  acknowledgeHandover: (handoverId: string, note?: string) => Promise<{ success: boolean; error?: string }>;
  overrideHandover: (handoverId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  closeShift: (handoverId: string) => Promise<{ success: boolean; error?: string }>;
  resolveItem: (itemId: string) => Promise<void>;
  submitHandover: (data: {
    channelId: string;
    shiftType: 'Morning' | 'Evening' | 'Night';
    items: Array<{ kind: string; text: string; priority?: string; ownerId?: string; dueAt?: string; originItemId?: string; carriedCount?: number }>;
    notes?: string;
  }) => Promise<{ success: boolean; handoverId?: string; error?: string }>;
  sendChatMessage: (text: string) => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  resetDemoData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: [],
  channels: [],
  activeChannelId: 'chan-icu',
  handovers: [],
  activeHandoverId: null,
  carryoverCandidates: [],
  messages: [
    {
      id: 'msg-seed-1',
      channelId: 'chan-icu',
      senderId: 'user-elena',
      senderName: 'Elena Rostova',
      senderAvatar: '#2563eb',
      text: 'Good afternoon team. Morning handover has been submitted with critical arterial line schedule and latex allergy warning.',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'msg-seed-2',
      channelId: 'chan-icu',
      senderId: 'user-marcus',
      senderName: 'Marcus Vance',
      senderAvatar: '#059669',
      text: 'Thanks Elena, reviewing now. Will take over bed 304 flushes and contact radiology for bed 308 CT report.',
      timestamp: new Date(Date.now() - 1800000).toISOString()
    }
  ],
  preferences: {
    active_theme: 'aurora',
    is_dark: 0,
    glass_blur: 16,
    glass_opacity: 0.75,
    glass_border_brightness: 0.8,
    glass_corner_radius: 16,
    custom_accent: '#2563eb',
    layout_density: 'comfortable',
    font_family: 'system'
  },
  nexconnStatus: { status: 'disconnected', detail: '' },
  isLoading: false,
  activeTab: 'handover',

  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveChannelId: (id) => set({ activeChannelId: id }),
  setActiveHandoverId: (id) => set({ activeHandoverId: id }),

  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      // 1. Fetch Users
      const usersRes = await fetch('/api/auth/users');
      const usersData = await usersRes.json();
      const users = usersData.users || [];

      // 2. Fetch Channels
      const chanRes = await fetch('/api/channels');
      const chanData = await chanRes.json();
      const channels = chanData.channels || [];

      // 3. Fetch Handovers
      const handoversRes = await fetch('/api/handovers');
      const handoversData = await handoversRes.json();
      const handovers = handoversData.handovers || [];

      // 4. Fetch Carryover candidates
      const carryRes = await fetch('/api/handovers/carryover/candidates');
      const carryData = await carryRes.json();
      const carryoverCandidates = carryData.candidates || [];

      // Set default current user to Elena if none
      const current = get().currentUser || users[0] || null;

      set({
        users,
        channels,
        handovers,
        carryoverCandidates,
        currentUser: current,
        activeHandoverId: handovers.length > 0 ? handovers[0].id : null,
        isLoading: false
      });

      // Subscribe to Nexconn connection status
      nexconnService.subscribeStatus((status, detail) => {
        set({ nexconnStatus: { status, detail: detail || '' } });
      });

      // Subscribe to real-time messages
      nexconnService.subscribeMessages((msg) => {
        set((state) => ({
          messages: [...state.messages, msg]
        }));
      });

      // Initialize Nexconn configuration check
      const configRes = await fetch('/api/auth/config');
      const configData = await configRes.json();
      if (configData.appKey) {
        await nexconnService.initialize(configData.appKey);
      }
    } catch (err) {
      console.error('[Fetch Initial Data Error]:', err);
      set({ isLoading: false });
    }
  },

  loginAsUser: async (userId: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.user) {
        set({ currentUser: data.user });
        if (data.preferences) {
          set({ preferences: data.preferences });
          applyThemeSettings(data.preferences);
        }

        // Connect user to Nexconn if token provided
        if (data.nexconn && data.nexconn.token) {
          await nexconnService.connect(data.nexconn.token, data.user.id);
        }
      }
    } catch (err) {
      console.error('[Login Error]:', err);
    }
  },

  acknowledgeHandover: async (handoverId: string, note?: string) => {
    const user = get().currentUser;
    if (!user) return { success: false, error: 'User not signed in' };

    try {
      const res = await fetch(`/api/handovers/${handoverId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, note })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Acknowledgement failed');

      // Refresh handovers
      await get().fetchInitialData();

      // Broadcast acknowledgement message to channel
      await nexconnService.sendMessage(
        get().activeChannelId,
        { id: user.id, name: user.name, avatar: user.avatar_color },
        `✓ ${user.name} (${user.role.toUpperCase()}) acknowledged shift handover. Note: "${note || 'Acknowledged'}"`,
        { type: 'acknowledgement', handoverId }
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  overrideHandover: async (handoverId: string, reason: string) => {
    const user = get().currentUser;
    if (!user || user.role !== 'manager') {
      return { success: false, error: 'Only managers can execute administrative override.' };
    }

    try {
      const res = await fetch(`/api/handovers/${handoverId}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Override failed');

      await get().fetchInitialData();

      // Broadcast override notice to channel
      await nexconnService.sendMessage(
        get().activeChannelId,
        { id: user.id, name: user.name, avatar: user.avatar_color },
        `⚡ ADMINISTRATIVE OVERRIDE by ${user.name}: "${reason}"`,
        { type: 'acknowledgement', handoverId }
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  closeShift: async (handoverId: string) => {
    try {
      const res = await fetch(`/api/handovers/${handoverId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Shift closure failed');

      await get().fetchInitialData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  resolveItem: async (itemId: string) => {
    try {
      await fetch(`/api/handovers/items/${itemId}/resolve`, { method: 'POST' });
      await get().fetchInitialData();
    } catch (err) {
      console.error('[Resolve Item Error]:', err);
    }
  },

  submitHandover: async (data) => {
    const user = get().currentUser;
    if (!user) return { success: false, error: 'User not signed in' };

    try {
      const res = await fetch('/api/handovers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: data.channelId,
          authorId: user.id,
          shiftType: data.shiftType,
          status: 'submitted',
          items: data.items,
          notes: data.notes
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Submission failed');

      await get().fetchInitialData();

      // Broadcast structured handover notification in Nexconn channel
      await nexconnService.sendMessage(
        data.channelId,
        { id: user.id, name: user.name, avatar: user.avatar_color },
        `📋 New ${data.shiftType} Shift Handover submitted by ${user.name}.\n${result.summary}`,
        { type: 'handover_card', handoverId: result.handoverId }
      );

      return { success: true, handoverId: result.handoverId };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  sendChatMessage: async (text: string) => {
    const user = get().currentUser;
    if (!user || !text.trim()) return;

    await nexconnService.sendMessage(
      get().activeChannelId,
      { id: user.id, name: user.name, avatar: user.avatar_color },
      text.trim(),
      { type: 'chat' }
    );
  },

  updatePreferences: async (partial) => {
    const updated = { ...get().preferences, ...partial };
    set({ preferences: updated });
    applyThemeSettings(updated);

    const user = get().currentUser;
    if (user) {
      try {
        await fetch(`/api/preferences/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
      } catch (err) {
        console.error('[Update Preferences Error]:', err);
      }
    }
  },

  resetDemoData: async () => {
    set({ isLoading: true });
    try {
      await fetch('/api/auth/seed-demo', { method: 'POST' });
      await get().fetchInitialData();
    } catch (err) {
      console.error('[Reset Demo Error]:', err);
    } finally {
      set({ isLoading: false });
    }
  }
}));

// DOM helper to apply Liquid Glass theme variables dynamically
export function applyThemeSettings(prefs: UserPreferences) {
  const root = document.documentElement;

  // 1. Dark mode
  if (prefs.is_dark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // 2. Preset theme data attribute
  root.setAttribute('data-theme', prefs.active_theme);

  // 3. Dynamic glass controls
  root.style.setProperty('--glass-blur', `${prefs.glass_blur}px`);
  root.style.setProperty('--glass-radius', `${prefs.glass_corner_radius}px`);
  root.style.setProperty('--glass-saturation', `${100 + (prefs.glass_border_brightness * 100)}%`);

  if (prefs.custom_accent) {
    root.style.setProperty('--primary-accent', prefs.custom_accent);
  }
}

