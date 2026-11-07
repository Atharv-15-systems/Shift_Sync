# ShiftSync — Project Memory & Scope

## Overview
ShiftSync is a production-quality, competition-ready workplace shift handover and real-time collaboration platform. It bridges shift transitions in high-stakes environments (healthcare, hospitality, manufacturing, customer support) with structured handovers, auditable acknowledgement gates, automatic task carry-over, offline risk detection, and real-time communication powered by the Nexconn Chat SDK.

## Architecture Decisions
- **Monorepo**: Root scripts orchestrating `client/` and `server/`.
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Zustand, Framer Motion, Lucide.
- **Backend**: Express, TypeScript, SQLite (`better-sqlite3`), Nexconn Server SDK.
- **Real-Time Integration**: Isolated strictly in `client/src/lib/nexconn.ts` and `server/src/services/nexconn.ts`.
- **Design System**: Apple Liquid Glass (lensing, translucency, backdrop blur, dark/light modes, customizable glass parameters).
- **Security**: App Secret never exposed to frontend; SQLite transactions for handover submission, acknowledgement, and carry-over.

