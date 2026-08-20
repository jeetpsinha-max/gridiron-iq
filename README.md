# 🦅 Peddie Football SAC — Broadcast-Grade AI Analytics & Coaching Platform

> **Peddie Football Strategic Analytics & Coaching (SAC)** is a production-grade, broadcast-quality football analytics platform built for **The Peddie School Football Program (MAPL Conference)**. The system features multi-agent AI orchestration, autonomous data ingestion, computer vision telemetry, real-time spatial overlays, printable sideline call sheets, personalized player portals, and bi-directional Hudl CSV synchronization.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Zod](https://img.shields.io/badge/Validated_with-Zod-3068b7?style=for-the-badge&logo=zod)](https://zod.dev/)

---

## ⚡ Key Architectural Capabilities

### 1. 🤖 Multi-Agent AI Orchestration Layer
- **Lead Orchestrator (Claude Opus)** (`src/lib/agents/claude-orchestrator.ts`):
  - Synthesizes executive scouting reports, tendency analysis, and 4th-down win-probability trade-off decision trees (`GO` vs `FG` vs `PUNT`).
- **Worker Sub-Agents (Gemini Flash Suite)** (`src/lib/agents/gemini-workers.ts`):
  - **Natural Language Film Filter**: Converts plain English prompts (e.g., *"Show 3rd and medium pass plays vs Cover 3 with pressure under 2.5s"*) into structured JSON filter ASTs.
  - **Spatial Metric Extraction**: Computes snap-to-pressure elapsed times, pocket integrity states, and receiver-defender separation vectors.
  - **Automated Player Assignment Grading**: Generates batch `+ / - / 0` coach grading sheets for the full roster.

### 2. 🛡️ Strict Zero-Mock & Multi-Season Architecture
- **Complete Season Partitioning** (`src/lib/seasons-data.ts`):
  - `2024–2025`: Historical Championship Baseline (7-2 Record).
  - `2025–2026`: Active Varsity Season (6-3 Record, MAPL Championship contention).
  - `2026–2027`: Future Projected Campaign (8-1 Forecast with Underclassmen Core).
- **Official 38-Player Varsity Roster**: Grounded in official NJ.com state records with **#10 August Cassidy** as ALL-MAPL #1 Linebacker (91/100, 168 snaps, 24 stops, 4 sacks).
- **SSR-Safe State Management** (`src/context/SeasonContext.tsx`): Hydration-safe React context synchronizing query params (`?season=...`) and localStorage.

### 3. 🎥 Broadcast-Grade HUD & Canvas Overlay
- **Floating In-Video HUD Scoreboard** (`src/components/video-player/BroadcastHud.tsx`):
  - Dynamic game clock, down & distance, yard line, hash mark, formation, defensive front, coverage shell, real-time EPA pill, and snap-to-pressure stopwatch.
- **60fps Spatial Canvas Overlay** (`src/components/video-player/SpatialCanvasOverlay.tsx`):
  - Real-time pressure pulse radar (<2.2s red alert, 2.2–3.0s amber, >3.0s clean pocket).
  - Receiver-defender separation vectors with yardage measurement lines.
  - 22-man player tracking with jersey badges.
- **Telestration Suite** (`src/components/video-player/TelestrationSuite.tsx`):
  - Pen, vector arrows, pass protection boxes, color swatches, playback rates (`0.25x` to `1.0x`), frame stepping ($1/30$s), and keyboard shortcuts.

### 4. 📊 Bi-Directional Hudl CSV Engine
- **Import & Parsing** (`src/lib/hudl-csv-engine.ts`): Parses standard Hudl CSVs (`ODK`, `DN`, `DIST`, `YARD LN`, `HASH`, `OFF FORM`, `DEF FRONT`, `COVERAGE`).
- **Enriched Export**: Appends custom AI analytics columns including `EPA`, `SUCCESS_RATE`, `TIME_TO_PRESSURE_SEC`, `SEPARATION_YDS`, and `DEF_PLAYMAKER`.

### 5. 📋 Printable Sideline Call Sheet (`/dashboard/call-sheet`)
- Print-optimized (`@media print`) double-sided card with high-contrast Peddie branding.
- Situational call matrices:
  - 1st & 10 Base Openers & Explosive Shot Plays
  - 2nd Down Run/Pass Balance & RPO Mesh
  - 3rd & 4th Down Money Converters
  - Red Zone Touchdown Targets & Opponent Blitz Alerts

### 6. 👤 Personalized Player Portal (`/dashboard/player-portal`)
- Jersey-filtered athlete portal with personal film feed.
- Coach assignment scorecards (`+`, `-`, `0`), execution rate meters, and recruiting dossiers.

---

## 🛠️ Project Structure

```
gridiron-iq/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── filter-film/       # Gemini NLP film filter endpoint
│   │   │   ├── hudl/              # Bi-directional Hudl CSV import/export
│   │   │   ├── scout/             # Claude Opus scouting report & win-prob API
│   │   │   └── ...
│   │   ├── dashboard/
│   │   │   ├── call-sheet/        # Printable Sideline Call Sheet
│   │   │   ├── player-portal/     # Player Micro-Dashboard & Assignment Dossier
│   │   │   ├── film-room/[id]/    # All-22 Film Room with HUD & Telestration
│   │   │   ├── offensive-coach/   # AI Play-Calling Advisor
│   │   │   ├── players/[id]/      # 38-Player Roster & Recruitment Radar
│   │   │   ├── analytics/[id]/    # ML Analytics & EPA Model
│   │   │   ├── reports/[id]/      # Executive Scouting Reports
│   │   │   └── actions/[id]/      # Coaching Action Items
│   ├── components/
│   │   └── video-player/
│   │       ├── BroadcastHud.tsx           # Glassmorphic in-video scoreboard
│   │       ├── SpatialCanvasOverlay.tsx   # 60fps CV pressure & separation canvas
│   │       └── TelestrationSuite.tsx      # Telestration drawing & transport tools
│   ├── context/
│   │   └── SeasonContext.tsx      # SSR-safe Season state provider
│   ├── lib/
│   │   ├── agents/
│   │   │   ├── claude-orchestrator.ts  # Claude Opus Lead Orchestrator
│   │   │   └── gemini-workers.ts       # Gemini Flash Worker Sub-Agents
│   │   ├── data-schemas.ts        # Zod validation schemas & types
│   │   ├── discovery-engine.ts    # Autonomous Real Data Ingestion Engine
│   │   ├── epa-calculator.ts      # Expected Points Added & Success Rate math
│   │   ├── hudl-csv-engine.ts     # Hudl CSV Ingest & Export
│   │   └── seasons-data.ts        # Master 3-season segregated dataset
│   └── types/
│       └── football.ts            # Core TypeScript interfaces
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ or 20+
- npm or yarn

### Installation
```bash
# Clone repository
git clone https://github.com/jeetpsinha-max/gridiron-iq.git
cd gridiron-iq

# Install dependencies
npm install
```

### Running Locally
```bash
# Start Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
# Compile and optimize production build
npm run build

# Start production server
npm start
```

---

## 🏈 Verified Season Roster & Accolades

- **#10 August Cassidy** — MLB / RB (Junior, Class of 2026) · **91/100 (ALL-MAPL #1 LB)** — 168 snaps, 24 stops, 4 sacks.
- **#22 Benjamin Perkins** — WR / DB (Senior, Class of 2025) · **88/100 (ALL-MAPL #2 WR)** — 158 snaps, 5 TDs, 7 stops.
- **#4 Caleb Allen** — WR / DB (Sophomore, Class of 2027) · **87/100 (IMPACT STARTER)** — 152 snaps, 4 TDs.
- **#15 Liam Melton** — QB (Junior, Class of 2026) · **86/100 (IMPACT STARTER)** — 172 snaps, 6 pass TDs.
- **#5 Rocco Barone** — WR / DB (Junior, Class of 2026) · **86/100 (IMPACT STARTER)** — 144 snaps, 4 TDs.
- **#54 Rocco Annunziata** — OL / DL (Freshman, Class of 2028) · **83/100 (FRESHMAN ANCHOR)** — 142 snaps.

---

## 📄 License

Proprietary software developed for The Peddie School Athletics & Football Operations. All rights reserved.
