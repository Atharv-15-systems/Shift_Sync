# ShiftSync Development Roadmap

## Phase 1: Foundation & Scaffolding
- [ ] Root monorepo setup & scripts
- [ ] Server scaffolding (Express, TypeScript, error handling, tests)
- [ ] Client scaffolding (Vite, React 18, Tailwind, Lucide, Framer Motion)
- [ ] Liquid Glass design system CSS variables & optical material tokens

## Phase 2: Database & Core Storage
- [ ] SQLite database initialization with WAL mode & foreign keys
- [ ] Normalized tables (`users`, `channels`, `channel_members`, `handovers`, `handover_items`, `acknowledgements`, `preferences`)
- [ ] Hospital demo seed scenario
- [ ] Data layer repositories with transaction safety

## Phase 3: Auth & Nexconn Real-Time Adapter
- [ ] Demo user login & session management
- [ ] Server token issuance via Nexconn User Management API
- [ ] Client Nexconn adapter (`client/src/lib/nexconn.ts`) with lifecycle & connection indicators
- [ ] Connection status pill & multi-user switcher

## Phase 4: Channels & Collaboration
- [ ] Workspaces & shift channels (Morning, Evening, Night)
- [ ] 1-on-1 direct messages
- [ ] Real-time messaging with typing indicators & unread counts
- [ ] Apple Liquid Glass 3-pane layout

## Phase 5: Structured Handover Engine
- [ ] Handover form (Completed, Pending with priority/owner/due, Warnings, Notes)
- [ ] Draft auto-save & atomic submission
- [ ] Rich handover card in channel feed
- [ ] Offline rule-based risk detection (urgent, allergy, broken, leak, etc.)

## Phase 6: Acknowledgement Gate & Carry-Over
- [ ] Prominent acknowledgement action & live status
- [ ] Shift closure block until incoming acknowledgement (or manager override)
- [ ] Automatic carry-over of unresolved pending tasks
- [ ] Stale task detection (>= 3 shifts) with zero duplicate carry-overs

## Phase 7: Appearance Engine & Personalization
- [ ] Theme presets (Aurora, Midnight, Sunset, Minimal Mono, High Contrast)
- [ ] Live glass sliders (blur, opacity, border, corner radius)
- [ ] Font & layout customization
- [ ] Local persistence & backend synchronization

## Phase 8: History, Search, Export & Notifications
- [ ] Timeline filterable by priority, staff, shift, status
- [ ] Clean printable / PDF export view
- [ ] In-app notification center & toasts

## Phase 9: Testing, Verification & Final Delivery
- [ ] Full automated test suite (TDD on critical logic)
- [ ] Multi-user real-time verification
- [ ] 1-click Hospital Ward Demo & 60-second judge walkthrough
- [ ] Comprehensive README & Git hygiene check

