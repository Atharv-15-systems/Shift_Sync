# ShiftSync Competition Edition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform ShiftSync into the winning entry for the Nexconn Build Challenge 2026 by adding a 60-second interactive Judge Guided Tour, Web Audio emergency & voice memo systems, multi-industry enterprise datasets, and interactive in-chat Nexconn handover widgets.

**Architecture:** 
- Backend: Expand SQLite seed with 3 realistic enterprise industry datasets (Healthcare, Hospitality, CloudOps) with an instant switch endpoint `/api/scenarios/switch`.
- Frontend: Web Audio sound synthesis engine (`audioEffects.ts`), interactive in-chat handover cards in Nexconn message streams, emergency broadcast strobe with sound, Apple-style compliance score gauge, and an automated step-by-step Judge Hackathon Tour.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Framer Motion, Web Audio API, Express, SQLite (`node:sqlite`).

**Spec:** Approved ShiftSync Competition Edition Design Specification (Brainstorming).

## Global Constraints
- Zero external audio file dependencies (all audio chimes and alerts synthesized via standard browser Web Audio API).
- Zero fake connections or decorative non-functional mockups.
- Keep all Nexconn interactions strictly isolated in `client/src/lib/nexconn.ts` and backend token issuing in `server/src/services/nexconn.ts`.
- 100% test pass rate across backend test suites.
- Git hygiene: No secrets or `.env` in repository.

## Review Focus
- Browser Web Audio policy requires user interaction before audio plays (handle gracefully with visual fallbacks).
- Switching industry scenarios must reset client state cleanly without page refresh or session collision.
- Nexconn interactive card actions (e.g. acknowledge inside chat) must synchronize atomically with backend state and update all open views.
- Tour mode must allow manual pausing/canceling at any moment without breaking application state.

---

### Task 1: Multi-Industry Scenario Datasets & API Endpoint

**Files:**
- Create: `server/src/db/scenarios.ts`
- Modify: `server/src/app.ts`
- Modify: `server/src/db/connection.ts`
- Test: `server/tests/scenarios.test.ts`

- [ ] Write failing test `server/tests/scenarios.test.ts` verifying switching between `healthcare`, `hospitality`, and `cloudops` scenarios.
- [ ] Implement `server/src/db/scenarios.ts` with complete realistic data for all 3 industries:
  - Healthcare (St. Jude ICU): Elena $\rightarrow$ Marcus, latex allergy, oxygen regulator leak.
  - Hospitality (Grand Hyatt): Sophia Lin $\rightarrow$ Liam Patel, VIP arrival, water leak Rm 412.
  - CloudOps (24/7 SRE): Alex Rivera $\rightarrow$ Dev Gupta, P1 payment gateway latency, DB failover.
- [ ] Mount `/api/scenarios/switch` and `/api/scenarios/current` in `server/src/app.ts`.
- [ ] Run test suite `npm --prefix server test` and verify passes.
- [ ] Commit: `feat(api): add multi-industry scenario engine for healthcare, hospitality, and cloudops`

---

### Task 2: Native Web Audio Engine

**Files:**
- Create: `client/src/lib/audioEffects.ts`
- Test: `client/src/lib/audioEffects.ts` (testable methods)

- [ ] Create `client/src/lib/audioEffects.ts` using native `AudioContext`:
  - `playEmergencyAlarm()`: Dual-tone warning chime.
  - `playSuccessChime()`: Pleasant 3-note ascending glass chord for acknowledgments.
  - `playHapticClick()`: Subtle 10ms click for tab switches and toggles.
  - `playVoiceDebriefSnippet()`: Generates voice briefing audio waveform & synthesizes speech using `window.speechSynthesis`.
- [ ] Commit: `feat(audio): add native zero-dependency web audio sound engine`

---

### Task 3: Interactive In-Chat Handover Cards & Voice Debrief Player

**Files:**
- Create: `client/src/components/VoiceDebriefPlayer.tsx`
- Modify: `client/src/components/ChatView.tsx`
- Modify: `client/src/components/HandoverView.tsx`
- Modify: `client/src/store/useAppStore.ts`

- [ ] Implement `VoiceDebriefPlayer.tsx` with animated canvas/SVG waveform and play/pause controls.
- [ ] Extend `ChatView.tsx` to detect messages with `metadata.type === 'handover_card'` and render full interactive liquid glass handover card inside the chat stream.
- [ ] Allow incoming staff to toggle tasks and click "Acknowledge" directly within the chat message.
- [ ] Integrate Voice Debrief Player into `HandoverView.tsx` header.
- [ ] Commit: `feat(chat): embed interactive handover cards and voice debrief in nexconn stream`

---

### Task 4: Emergency Incident / Code Blue Broadcast System

**Files:**
- Create: `client/src/components/EmergencyBroadcastModal.tsx`
- Modify: `client/src/components/Navbar.tsx`
- Modify: `client/src/App.tsx`
- Modify: `client/src/store/useAppStore.ts`

- [ ] Add emergency broadcast state and active emergency alert banner in `useAppStore.ts`.
- [ ] Build `EmergencyBroadcastModal.tsx` allowing shift leads to dispatch high-priority incident broadcasts with custom severity (`P1 Critical`, `Code Blue`, `Evacuation`).
- [ ] Add prominent "🚨 Emergency Alert" button in `Navbar.tsx`.
- [ ] Display pulsing optical red glass alert banner with sound effects when an alert is active.
- [ ] Commit: `feat(emergency): add real-time code blue broadcast and pulsing glass banner`

---

### Task 5: Shift Safety & Compliance Score Gauge

**Files:**
- Create: `client/src/components/ComplianceGauge.tsx`
- Modify: `client/src/components/HandoverView.tsx`
- Modify: `client/src/store/useAppStore.ts`

- [ ] Implement `ComplianceGauge.tsx` using SVG circular ring with animated stroke and color progression (Red $< 70\%$, Amber $< 90\%$, Emerald $\ge 90\%$).
- [ ] Compute real-time safety score based on:
  - Critical hazard unacknowledged: -25%
  - Stale task unaddressed: -15%
  - Incoming signature missing: -20%
- [ ] Display in the right panel / header of `HandoverView.tsx`.
- [ ] Commit: `feat(compliance): add real-time JCAHO/OSHA shift safety score ring`

---

### Task 6: The 60-Second "Judge Guided Tour" Mode

**Files:**
- Create: `client/src/components/JudgeTourBanner.tsx`
- Modify: `client/src/components/Navbar.tsx`
- Modify: `client/src/App.tsx`
- Modify: `client/src/store/useAppStore.ts`

- [ ] Add `tourStep` and `isTourActive` state in `useAppStore.ts`.
- [ ] Implement `JudgeTourBanner.tsx`:
  - Glowing top banner: `✨ Start 60s Judge Tour`.
  - Step 1: Elena's outgoing handover & hazard scan review.
  - Step 2: Emergency Code Blue alert trigger.
  - Step 3: Switch to Marcus in Nexconn chat with interactive card.
  - Step 4: One-click sign-off & safety score reaching 98%.
- [ ] Mount Industry Switcher in `Navbar.tsx` (`Healthcare`, `Hospitality`, `CloudOps`).
- [ ] Commit: `feat(tour): add 60-second interactive judge tour and industry switcher`

---

### Task 7: End-to-End Verification & GitHub Push

**Files:**
- Test: `server/tests/scenarios.test.ts`
- Test: `server/tests/handovers.test.ts`
- Modify: `README.md`

- [ ] Run backend test suites: `npm --prefix server test` (all tests passing).
- [ ] Run client build: `npm --prefix client run build` (0 errors).
- [ ] Update `README.md` with Hackathon Judge Walkthrough, Industry Presets, and Nexconn Architecture diagrams.
- [ ] Push to GitHub `origin/main` and `origin/master`.
- [ ] Commit: `docs: update competition documentation, judge guide, and architecture diagrams`
