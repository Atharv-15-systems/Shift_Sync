# ShiftSync — Competition Edition
### Nexconn Build Challenge 2026 Entry

> **Workplace Shift Safety, Real-Time Emergency Command & Handover Platform**  
> *Engineered with Apple Liquid Glass Design, Native Web Audio Klaxons, Nexconn Chat SDK Interactive Cards, and Multi-Industry Enterprise Datasets.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React 18](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Native%20ACID-003B57.svg)](https://sqlite.org/)
[![Nexconn SDK](https://img.shields.io/badge/Nexconn-Chat%20SDK-6366f1.svg)](https://nexconn.ai)
[![Tests Passing](https://img.shields.io/badge/Tests-19%2F19%20Passing-emerald.svg)](https://vitest.dev/)

---

## 🏆 Nexconn Build Challenge Alignment & Judging Rubric

ShiftSync was designed from the ground up to score maximum points across all three official judging criteria:

| Category | Weight | How ShiftSync Wins |
|:---:|:---:|---|
| **Completeness & User Experience** | **50%** | • **60-Second Interactive Judge Tour**: 1-click animated hackathon walkthrough guiding judges through every role.<br>• **Apple Liquid Glass Materials**: 5 dynamic optical presets with live blur, opacity, border reflection, and corner radius sliders.<br>• **Native Web Audio Engine**: Synthesized dual-tone emergency alarms, ascending glass chords, and speech debrief playback with **0 external sound files**.<br>• **19/19 Automated Tests**: Comprehensive test suite covering SQLite foreign keys, transactions, and risk heuristics. |
| **Innovation & Scenario Value** | **30%** | • **Interactive In-Chat Handover Widgets**: Nexconn chat messages render live interactive shift cards with checkable tasks and in-stream peer sign-offs.<br>• **Emergency "Code Blue" Broadcast**: Dispatches high-priority incident broadcasts with pulsating optical red glass alerts and audible alarms.<br>• **Offline Threat Intelligence**: Rule-based hazard scanner detects life-critical risks (`allergy`, `leak`, `p1`, `latency`) with zero external API dependencies.<br>• **AI Voice Shift Debrief**: Outgoing shift leads attach voice debriefs with an interactive waveform player. |
| **Business & Growth Potential** | **20%** | • **Multi-Industry Enterprise Engine**: 1-click switcher between **Healthcare (Acute ICU)**, **Luxury Hospitality (Grand Hyatt)**, and **CloudOps (24/7 SRE)**.<br>• **JCAHO & OSHA Shift Safety Ring**: Apple Watch-style compliance gauge tracking hazard mitigation and transition readiness.<br>• **Guaranteed Daily Active Telemetry**: Shift turnovers create recurring, high-volume message traffic on the Nexconn platform. |

---

## ⚡ 60-Second Interactive Judge Guided Tour

When evaluating ShiftSync, judges can simply click the **"✨ Start 60s Tour"** banner at the top of the application:

1. **Step 1: Outgoing Lead & Hazard Scan**
   - Elena Rostova's ICU handover is reviewed with automated offline flags for severe latex allergy and oxygen line pressure leaks.
2. **Step 2: Emergency Broadcast & Native Web Audio Alarm**
   - Triggers an urgent incident broadcast simulation with native dual-tone alarm klaxons and pulsing red glass alert strobes.
3. **Step 3: Nexconn Real-Time In-Chat Handover Card**
   - Automatically logs in as incoming nurse Marcus Vance in the Nexconn Chat stream. Marcus reviews the interactive in-chat card, toggles pending tasks, and listens to Elena's synthesized voice debrief.
4. **Step 4: 1-Click Peer Sign-off & Compliance Clearance**
   - Marcus signs off directly in chat or in the handover view $\rightarrow$ Shift safety score hits **95%+** $\rightarrow$ Shift closure locks release!

---

## 🏢 Multi-Industry Enterprise Presets (1-Click Switcher)

Switch between real-world 24/7 operating environments using the top navigation dropdown:

- 🏥 **Healthcare (St. Jude ICU Ward)**: Elena Rostova $\rightarrow$ Marcus Vance (Patient vitals, anaphylactic latex allergy, oxygen pressure valve leaks, crash cart intubation kits).
- 🏨 **Hospitality (Grand Hyatt Night Audit)**: Sophia Lin $\rightarrow$ Liam Patel (VIP Diplomatic delegation security detail, 4th floor bathroom ceiling leak, cash safe drop count).
- 💻 **CloudOps / Tech SRE (24/7 Follow-the-Sun)**: Alex Rivera $\rightarrow$ Dev Gupta (P1 Payment gateway latency webhook outage, primary Redis memory saturation, Kubernetes rolling patches).

---

## 🛠️ Architecture & Tech Stack

```
ShiftSync/
├── client/                     # Vite + React 18 + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Apple Liquid Glass UI Components
│   │   │   ├── Navbar.tsx      # Industry Switcher, Emergency Alert, User Dropdown
│   │   │   ├── JudgeTourBanner.tsx  # 60s Hackathon Interactive Tour
│   │   │   ├── ComplianceGauge.tsx  # Apple-Style JCAHO/OSHA Safety Score Ring
│   │   │   ├── VoiceDebriefPlayer.tsx# Interactive Waveform & Speech Synthesis
│   │   │   ├── EmergencyBroadcastModal.tsx # Code Blue & P1 Incident Dispatcher
│   │   │   ├── HandoverView.tsx# Structured Form, Risk Scanner, Audit Trail
│   │   │   ├── ChatView.tsx    # Nexconn Stream with Interactive Handover Cards
│   │   │   ├── HistoryView.tsx # Searchable Archive & Clean PDF Export
│   │   │   └── SettingsView.tsx# 5 Presets & Live Optical Glass Controls
│   │   ├── lib/
│   │   │   ├── audioEffects.ts # Zero-Dependency Web Audio Sound & Speech Engine
│   │   │   └── nexconn.ts      # Isolated Nexconn Client SDK Adapter
│   │   └── store/
│   │       └── useAppStore.ts  # Zustand State Management with Tour & Multi-Industry Engine
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── db/
│   │   │   ├── connection.ts   # Native node:sqlite Engine with ACID Transactions
│   │   │   ├── schema.ts       # Normalized Foreign-Key Enforced Relational Schema
│   │   │   ├── seed.ts         # Base Hospital Ward Seed Dataset
│   │   │   └── scenarios.ts    # Multi-Industry Datasets (Healthcare, Hospitality, CloudOps)
│   │   ├── routes/
│   │   │   ├── scenarios.ts    # Industry Switch Endpoint (/api/scenarios/switch)
│   │   │   ├── auth.ts         # User Sessions & Demo Data Reset
│   │   │   ├── handovers.ts    # Creation, Acknowledgements & Shift Closure Gates
│   │   │   └── channels.ts     # Workspaces & Shift Channels
│   │   └── services/
│   │       ├── riskDetection.ts# Offline Rule-Based Threat Intelligence Scanner
│   │       └── nexconn.ts      # Server Token Generation with SHA1 Header Signatures
│   └── tests/                  # 19/19 Vitest Test Suite Passing
```

---

## 🚀 Quick Start (Run on Device)

### Prerequisites
- Node.js v20+ or v24+
- npm v10+

### Installation & Launch
```powershell
# 1. Clone repository
git clone https://github.com/Atharv-15-systems/Shift_Sync.git
cd Shift_Sync

# 2. Install dependencies (root, server, client)
npm run install:all

# 3. Start client and server concurrently
npm run dev
```

- **Frontend Application:** `http://localhost:5173`
- **Backend API:** `http://localhost:3001`

### Running the Test Suite
```powershell
npm test
```
All **19 tests** covering database integrity, ACID transaction rollbacks, multi-industry switching, offline hazard heuristics, and API endpoints will execute and pass.

---

## 🔒 Security & Credential Isolation

- **App Secret Isolation**: The Nexconn master `App Secret` is exclusively handled on the backend in `server/src/services/nexconn.ts`. It is **never** exposed to the client or browser bundle.
- **Git Hygiene**: Environment files (`.env`), SQLite databases (`*.db`), compilation artifacts, and cache directories are completely excluded via `.gitignore`.
- **Offline Reliability**: The platform functions seamlessly without third-party external API dependencies or paid services.
