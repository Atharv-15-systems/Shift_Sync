# ShiftSync

> **Competition-Ready Workplace Shift Handover & Real-Time Collaboration Platform**  
> *Built with Apple Liquid Glass Design, Offline Risk Intelligence, and Nexconn Real-Time Chat SDK.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React 18](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL%20Mode-003B57.svg)](https://sqlite.org/)
[![Nexconn SDK](https://img.shields.io/badge/Nexconn-Chat%20SDK-6366f1.svg)](https://nexconn.ai)

---

## 🌟 Executive Summary

During workplace shift changes—particularly in high-stakes environments such as hospital intensive care units, emergency departments, hospitality, and industrial facilities—critical operational data frequently gets dropped across fragmented chat channels, unstructured verbal handovers, and untracked notes.

**ShiftSync** solves this by uniting **structured shift handovers**, **auditable multi-signature acknowledgement gates**, **automated carry-over tracking**, and **rule-based offline safety hazard detection** into a single cohesive platform powered by the **Nexconn Chat SDK** and styled with an authentic **Apple Liquid Glass** design system.

---

## 🚀 Key Features

### 1. 📋 Structured Handover Engine
- **Completed Tasks**: Audited documentation of work completed during the shift.
- **Pending Tasks**: Prioritized actions (`Critical`, `High`, `Medium`, `Low`) with assignees and due times.
- **Safety & Clinical Warnings**: Prominent amber and red risk highlights (e.g., penicillin allergy, pressure line leaks).
- **Draft Auto-Saving & Atomic Submission**: Backed by SQLite transaction safety to ensure zero lost handovers.

### 2. 🛡️ Auditable Acknowledgement & Shift Closure Gate
- **Shift Closure Enforcement**: Outgoing staff cannot close shifts until at least one incoming staff member reviews and explicitly acknowledges the handover.
- **Timestamped Audit Trail**: Every read, acknowledgement, and manager override is permanently logged with ISO timestamps and user IDs.
- **Manager Override**: Charge Nurses / Administrators can authorize urgent emergency transitions with mandatory justification notes.

### 3. 🔄 Intelligent Task Carry-Over & Stale Flagging
- **Zero Duplicate Carry-Overs**: Unresolved pending tasks from previous shifts automatically pre-populate the next shift's draft.
- **Stale Task Alert**: Tasks remaining open across **3 or more consecutive shifts** are automatically tagged with a pulsing **`STALE (xN)`** badge.

### 4. 🧠 Offline Rule-Based Risk Intelligence
- **Zero External API Blocker**: Automatically scans handover items and notes offline for critical keywords: `urgent`, `critical`, `broken`, `leak`, `allergy`, `overdue`, `danger`, `fail`.
- **Automatic 3-Line Summary**: Generates a structured overview with priority breakdowns and required actions.
- **Optional AI Fallback**: Integrates Google Gemini / Groq free tiers with automatic fallback to rule-based analysis.

### 5. 💬 Nexconn Chat SDK Real-Time Integration
- Isolated strictly in `client/src/lib/nexconn.ts` and `server/src/services/nexconn.ts`.
- **Server Token Generation**: Uses Nexconn User Management API signing headers (`App-Key`, `Nonce`, `Timestamp`, `Signature`), keeping the master `App Secret` strictly server-side.
- **Honest Connection Indicator**: Real-time status pill (`Connected`, `Connecting`, `Standby/Unconfigured`). Zero simulated connections.

### 6. 🪟 Apple Liquid Glass Appearance Engine
- Inspired by Apple visionOS and iOS optical glass materials.
- **5 Curated Presets**: `Aurora` (default), `Midnight`, `Sunset`, `Minimal Mono`, and `High Contrast` (WCAG AAA).
- **Live Glass Sliders**: Blur intensity (4px–40px), Surface Opacity, Specular Border Brightness, and Corner Radius.
- **Persistent Preferences**: Instant zero-flash CSS variable updates with backend synchronization and JSON export/import.

---

## 🏥 Hospital Ward Demo Scenario (60-Second Walkthrough)

ShiftSync comes pre-loaded with a realistic clinical care scenario: **St. Jude Hospital — Acute Care Unit (ICU)**.

### Judge Walkthrough Steps:
1. **Outgoing Nurse (Elena Rostova)**:
   - Notice the **Morning Shift Handover** already submitted in `#icu-handover`.
   - Inspect the **Offline Safety Hazards** flagged in red: `ALERT: Patient 304 has severe latex allergy` and `WARNING: Oxygen regulator valve on bed 307 has minor pressure leak`.
   - Observe the **`STALE (x3)`** tag on the backordered dressing kits task.
   - Click **"Close Shift"**: Notice the closure is **blocked** because incoming nurse Marcus has not yet acknowledged!
2. **Switch to Incoming Nurse (Marcus Vance)**:
   - Use the multi-user switcher in the top navigation bar to select **Marcus Vance (INCOMING)**.
   - Marcus reviews the pending arterial line flushes and clicks **"Acknowledge Handover"**.
   - Notice the live acknowledgement audit card updates immediately with Marcus's avatar, timestamp, and verification badge.
3. **Outgoing Nurse Closes Shift**:
   - Switch back to **Elena Rostova**.
   - Click **"Close Shift"**—with Marcus's acknowledgement verified, the shift transitions to **Closed** successfully!
4. **Customization & Dark Mode**:
   - Navigate to **"Liquid Glass Appearance"**.
   - Switch between **Aurora**, **Midnight**, and **Sunset**.
   - Adjust the **Backdrop Blur** and **Specular Border Brightness** sliders and watch the optical surfaces adapt in real-time.
   - Refresh the browser—settings persist without flashing!

---

## 🛠️ Architecture & Tech Stack

```
ShiftSync/
├── client/                     # Vite + React 18 Frontend
│   ├── src/
│   │   ├── components/         # Liquid Glass UI Components
│   │   │   ├── Navbar.tsx      # Status, User Switcher, Demo Reset
│   │   │   ├── Sidebar.tsx     # Channels, Workspaces, Care Team
│   │   │   ├── HandoverView.tsx# Core Handover, Risk Banner, Acks
│   │   │   ├── HandoverFormModal.tsx # Pre-filled Handover Creator
│   │   │   ├── ChatView.tsx    # Nexconn Real-Time Channel
│   │   │   ├── HistoryView.tsx # Timeline, Search & PDF Export
│   │   │   └── SettingsView.tsx# 5 Presets & Live Glass Sliders
│   │   ├── lib/
│   │   │   └── nexconn.ts      # Isolated Nexconn Client SDK Adapter
│   │   ├── store/
│   │   │   └── useAppStore.ts  # Zustand State Management
│   │   └── index.css           # Liquid Glass CSS Tokens & Presets
│   └── vite.config.ts
│
├── server/                     # Node.js + Express + SQLite Backend
│   ├── src/
│   │   ├── db/
│   │   │   ├── connection.ts   # SQLite connection (WAL mode)
│   │   │   ├── schema.ts       # Normalized 8-table schema
│   │   │   └── seed.ts         # Hospital Ward Demo scenario
│   │   ├── routes/
│   │   │   ├── auth.ts         # Users, Sessions, Demo Reset
│   │   │   ├── channels.ts     # Workspaces & Shift Channels
│   │   │   ├── handovers.ts    # Handovers, Carry-over, Acks
│   │   │   └── preferences.ts  # Theme & Optical Persistence
│   │   ├── services/
│   │   │   ├── nexconn.ts      # Server-side Token Issuance API
│   │   │   └── riskDetection.ts# Offline Rule-Based Threat Scanner
│   │   ├── app.ts              # Express Application Setup
│   │   └── index.ts            # Server Entry Point (:3001)
│   └── tests/                  # 16 Vitest Unit & Integration Tests
│       ├── db.test.ts          # Schema & Transaction Integrity
│       ├── riskDetection.test.ts # Keyword Hazard Matching
│       ├── handovers.test.ts   # Shift Closure Gate Tests
│       └── api.test.ts         # End-to-End API Workflows
```

---

## ⚡ Quick Start & Local Run

### Prerequisites
- Node.js 18+ (tested on Node.js v20, v22, and v24)
- npm or pnpm

### 1. Installation
Clone the repository and install dependencies:
```bash
# Install root dependencies
npm install

# Install server & client dependencies
npm --prefix server install
npm --prefix client install
```

### 2. Environment Configuration
Copy the sample environment file:
```bash
cp .env.example .env
```
*(Optional: Add your `NEXCONN_APP_KEY` and `NEXCONN_APP_SECRET` from the [Nexconn Console](https://console.nexconn.ai). If omitted, ShiftSync operates smoothly with full offline capability).*

### 3. Running Locally
Run both client and backend concurrently:
```bash
npm run dev
```
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health

### 4. Running Automated Tests
Execute the full test suite (16 tests across 4 test suites):
```bash
npm test
```

---

## 🔒 Security & Git Hygiene
- **Zero Exposed Secrets**: `App Secret` is strictly server-side.
- **Clean `.gitignore`**: Blocks `.env`, `node_modules/`, `dist/`, local SQLite databases, and agent telemetry.
- **Transaction Safety**: All state changes (handovers, acknowledgements, carry-overs) are wrapped in atomic database transactions.

---

## 📄 License
MIT © ShiftSync Contributors. Developed for the Nexconn Build Challenge.
