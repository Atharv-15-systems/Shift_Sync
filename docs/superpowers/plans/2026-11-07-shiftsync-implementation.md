# ShiftSync Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver ShiftSync, a competition-ready workplace shift handover and real-time collaboration platform featuring Apple Liquid Glass visual design, structured handovers, acknowledgement gates, automatic carry-overs, offline-capable risk detection, and Nexconn Chat SDK real-time messaging.

**Architecture:** Monorepo with separated `client/` (React 18, Vite, TypeScript, Tailwind CSS, Zustand, Framer Motion, Lucide) and `server/` (Node.js Express, TypeScript, SQLite `better-sqlite3`, Nexconn Server SDK). Real-time communication isolated in `client/src/lib/nexconn.ts` and backend token issuing in `server/src/services/nexconn.ts`.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Zustand, Framer Motion, Lucide-react, Express, SQLite (better-sqlite3), Nexconn Web Engine/Chat SDK, Nexconn Server SDK.

---

## Global Constraints
- Primary objective: fully functional, visually impressive, tested, competition-ready.
- Strict isolation of Nexconn SDK calls in `client/src/lib/nexconn.ts`.
- Master App Secret must never be exposed to frontend; token issuing strictly server-side.
- Offline-first rule-based risk detection working without external AI keys.
- Real SQLite transactional integrity for handovers, acknowledgements, and carry-overs.
- WCAG AA contrast, keyboard accessibility, reduced-motion support.
- Zero fake mockups or fabricated chat connections.

---

## Phase Breakdown (GSD Aligned)

### Phase 1: Foundation & Scaffolding
- [ ] Task 1.1: Root package configuration (`package.json`, concurrently scripts, `.env.example`).
- [ ] Task 1.2: Server scaffolding with TypeScript, Express, error handling, and test harness (Vitest / Supertest).
- [ ] Task 1.3: Client scaffolding with Vite, React 18, Tailwind CSS, Lucide, Framer Motion, and Vitest.
- [ ] Task 1.4: Liquid Glass design system foundation & CSS variables (Apple optical materials, specular borders, blur, saturation, dark/light mode tokens).

### Phase 2: Database Schema & Core Services
- [ ] Task 2.1: SQLite database initialization (`server/src/db/schema.ts`, `better-sqlite3`, WAL mode, foreign keys).
- [ ] Task 2.2: Normalized tables: `users`, `workspaces`, `channels`, `channel_members`, `handovers`, `handover_items`, `acknowledgements`, `preferences`.
- [ ] Task 2.3: Database seed engine for Hospital Ward demo scenario (Outgoing nurse Elena, Incoming nurse Marcus, Charge nurse Dr. Sarah Chen, previous handover, carry-over tasks, warnings).
- [ ] Task 2.4: Core CRUD repositories & transaction safety tests.

### Phase 3: Authentication & Nexconn Token Engine
- [ ] Task 3.1: Session & user authentication REST endpoints (`/api/auth/login`, `/api/auth/me`, `/api/users`).
- [ ] Task 3.2: Nexconn server-side service (`server/src/services/nexconn.ts`) to issue user access tokens using Nexconn credentials with fallback/local dev sandbox support.
- [ ] Task 3.3: Client-side Nexconn adapter (`client/src/lib/nexconn.ts`) with lifecycle, connection status, reconnect, and listener isolation.
- [ ] Task 3.4: Connection status pill indicator and session switcher in UI.

### Phase 4: Workspaces, Channels & Real-Time Messaging
- [ ] Task 4.1: Channels & Direct Messages API (`/api/channels`, `/api/channels/:id/messages`, `/api/channels/members`).
- [ ] Task 4.2: Client channel store (`useChatStore`) managing channels, active channel, messages, unread counts, typing states.
- [ ] Task 4.3: Real-time messaging engine with Nexconn SDK integration (group channels, DMs, handover discussion threads).
- [ ] Task 4.4: Apple Liquid Glass Three-Pane Desktop Layout (Sidebar, Message Feed, Details / Action Rail).

### Phase 5: Structured Handover System
- [ ] Task 5.1: Handover data models & API (`/api/handovers`, draft saving, submission endpoint with transaction).
- [ ] Task 5.2: Structured Handover Form modal/drawer (Completed items, Pending items with priority/owner/due, Warnings, Operational notes).
- [ ] Task 5.3: Rich Handover Card component rendered inside channels & handover feed.
- [ ] Task 5.4: Rule-based risk detection engine (offline analysis for keywords: `urgent`, `critical`, `broken`, `leak`, `allergy`, `overdue`, `danger`, `fail`).

### Phase 6: Acknowledgement Gate & Automatic Carry-Over
- [ ] Task 6.1: Acknowledgement API (`/api/handovers/:id/acknowledge`, `/api/handovers/:id/override`).
- [ ] Task 6.2: Live acknowledgement status card (Unread, Read, Acknowledged with user avatars & exact timestamps).
- [ ] Task 6.3: Shift closure gate: Outgoing staff cannot close shift until incoming staff acknowledges (or manager override).
- [ ] Task 6.4: Carry-Over Engine: Automatically pre-fills next handover with unresolved pending tasks, tracks `carried_count`, flags items as Stale (>= 3 shifts) with zero duplicate carry-overs.

### Phase 7: Liquid Glass Appearance Engine
- [ ] Task 7.1: Theme customization engine (5 Presets: Aurora, Midnight, Sunset, Minimal Mono, High Contrast).
- [ ] Task 7.2: Glass controls (blur intensity, translucency, specular border brightness, corner radius, saturation).
- [ ] Task 7.3: Font & layout preferences (Compact, Comfortable, Spacious; Inter, Rounded, Mono).
- [ ] Task 7.4: Live preview, localStorage caching (anti-flash), and backend preference sync (`/api/preferences`).

### Phase 8: History, Search, Export & Notifications
- [ ] Task 8.1: Handover timeline, full-text search, and multi-filter (priority, status, staff, date).
- [ ] Task 8.2: Printable handover view & clean PDF export styling.
- [ ] Task 8.3: In-app notifications & toast manager for carry-overs, mentions, and urgent warnings.

### Phase 9: Testing, Verification & Competition Demo
- [ ] Task 9.1: Comprehensive unit & integration test suite (TDD coverage of critical business logic).
- [ ] Task 9.2: Two-session real-time message verification.
- [ ] Task 9.3: Prominent "Load Hospital Demo" 1-click trigger & 60-second judge walkthrough guide.
- [ ] Task 9.4: README with architecture diagrams, deployment instructions, and git hygiene verification.
- [ ] Task 9.5: Clean GitHub repository push.
