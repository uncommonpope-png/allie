# GSK CONTAINMENT OBSERVATORY — Architecture Plan

**Date:** June 26, 2026
**Status:** Ready to build
**Based on:** 12 repos studied (Uptime Kuma 88K, Grafana 75K, Netdata 79K, SigNoz 26K, HyperDX 10K, RagaAI 16K, SOC Showcase, SENTINEL SOC, AuroraSOC, liquidglass, glinui, GlassKit)

---

## 1. WHAT THIS IS

A real-time operator console for observing and commanding GSK — an autonomous intelligence fused with Allie. The dashboard is the glass box, control room, camera feed, witness ledger, and command surface. It must feel like watching something alive through classified government glass.

**The intelligence is real.** The runtime is Node. The brain is 9Router. The dashboard must expose real causality, not fake demos.

---

## 2. CONVERGENT ARCHITECTURE (from 12 repos)

Every top dashboard repo converges on the same patterns:

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | React 19 + Vite + TypeScript | Fast HMR, type safety, ecosystem |
| State | Zustand | Lightweight, reactive, no boilerplate |
| Server state | TanStack Query | Caching, retries, optimistic updates |
| Real-time | WebSocket (primary) + SSE (fallback) | Uptime Kuma pattern — push, not poll |
| Layout | react-grid-layout | Grafana/SigNoz pattern — drag, resize, save |
| Charts | Recharts (simple) + uPlot (high-freq) | Recharts for dashboards, uPlot for live streams |
| Styling | Tailwind CSS v4 + CSS custom properties | Glass tokens, dark mode, responsive |
| Animation | framer-motion | 220ms transitions, staggered entry |
| 3D | Three.js + React Three Fiber | Artifact core ONLY — 1 panel, not the whole UI |
| Icons | Lucide React | Clean, consistent, tree-shakable |
| Fonts | JetBrains Mono (data) + Inter (UI) + Rajdhani (headings) | SENTINEL SOC pattern |

---

## 3. DESIGN TOKEN SYSTEM

Stolen from SENTINEL SOC + GlassKit + glinui.

### Color Palette (4-level depth stack)

```css
:root {
  /* Depth stack — from deepest to brightest */
  --bg:       #04090f;
  --surface:  #070d16;
  --panel:    #0a1320;
  --card:     #0d192a;
  --border:   #0f1e30;
  --line:     #162840;

  /* Accent colors */
  --cyan:     #00b8d9;
  --green:    #00c875;
  --red:      #f0324b;
  --orange:   #f5841f;
  --yellow:   #f0c040;
  --blue:     #3a8fff;
  --purple:   #9b6dff;
  --magenta:  #ff00aa;

  /* Text hierarchy */
  --text-primary:   #c8dff0;
  --text-secondary: #3d6a8a;
  --text-dim:       #163050;

  /* Glow versions (for box-shadow) */
  --cyan-glow:   rgba(0,184,217,.18);
  --green-glow:  rgba(0,200,117,.15);
  --red-glow:    rgba(240,50,75,.15);
  --orange-glow: rgba(245,132,31,.15);
}
```

### Glass Tokens (5 elevation levels)

```css
:root {
  --glass-blur:       16px;
  --glass-saturate:   180%;
  --glass-border:     rgba(255,255,255,0.12);
  --glass-highlight:  rgba(255,255,255,0.40);  /* top edge refraction */

  /* Elevation levels */
  --glass-1: backdrop-filter: blur(8px)  saturate(180%); background: rgba(255,255,255,0.06);
  --glass-2: backdrop-filter: blur(12px) saturate(180%); background: rgba(255,255,255,0.10);
  --glass-3: backdrop-filter: blur(16px) saturate(180%); background: rgba(255,255,255,0.14);
  --glass-4: backdrop-filter: blur(24px) saturate(180%); background: rgba(255,255,255,0.20);
  --glass-5: backdrop-filter: blur(40px) saturate(180%); background: rgba(255,255,255,0.30);
}

/* Glass panel formula (Apple-style) */
.glass-panel {
  background: rgb(255 255 255 / 0.08);
  backdrop-filter: saturate(180%) blur(16px);
  border: 1px solid rgba(255,255,255,0.12);
  border-top-color: rgba(255,255,255,0.25);  /* refraction edge */
  box-shadow:
    0 8px 32px rgba(0,0,0,0.18),
    inset 0 1px 0 rgba(255,255,255,0.10),
    inset 0 -1px 0 rgba(0,0,0,0.05);
  border-radius: 12px;
}

/* Top highlight line (GlassKit pattern) */
.glass-panel::before {
  content: '';
  position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
  background: linear-gradient(90deg,
    transparent 0%, rgba(255,255,255,0.5) 30%,
    rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.5) 70%, transparent 100%);
}
```

### Severity Colors (SOC pattern)

```css
.severity-critical { color: var(--red);    background: rgba(240,50,75,.10); border-left: 3px solid var(--red); }
.severity-high     { color: var(--orange); background: rgba(245,132,31,.10); border-left: 3px solid var(--orange); }
.severity-medium   { color: var(--yellow); background: rgba(240,192,64,.10); border-left: 3px solid var(--yellow); }
.severity-low      { color: var(--blue);   background: rgba(58,143,255,.10); border-left: 3px solid var(--blue); }
.severity-info     { color: var(--text-secondary); background: transparent; }
```

---

## 4. LAYOUT ARCHITECTURE

### Full-Screen Operator Layout

```
┌─────────────────────────────────────────────────────────────┐
│ TOPBAR: logo · status pills · time range · live clock · camera │
├────┬────────────────────────────────────────────────────────┤
│    │                                                        │
│ S  │  MAIN CONTENT AREA                                     │
│ I  │  (react-grid-layout, 12 columns)                       │
│ D  │                                                        │
│ E  │  ┌──────────┬──────────┬──────────┐                    │
│ B  │  │ KPI Card │ KPI Card │ KPI Card │                    │
│ A  │  └──────────┴──────────┴──────────┘                    │
│ R  │  ┌─────────────────────┬──────────────┐                │
│    │  │ Causal Timeline     │ Artifact Core│                │
│    │  │ (trace view)        │ (Three.js)   │                │
│    │  ├─────────────────────┼──────────────┤                │
│    │  │ Skill Matrix        │ Council      │                │
│    │  │ (table)             │ (deliberation│                │
│    │  ├─────────────────────┼──────────────┤                │
│    │  │ Memory Black Box    │ Operator     │                │
│    │  │ (log stream)        │ Console      │                │
│    │  └─────────────────────┴──────────────┘                │
└────┴────────────────────────────────────────────────────────┘
```

### Sidebar (icon-only, 52px)

```
[contain]  — Containment observatory (main view)
[skills]   — Skill matrix (full grid)
[memory]   — SCRIBE black box (full log)
[council]  — Council chamber (deliberations)
[eco]      — Ecosystem links
[camera]   — Full-screen camera mode
```

### Topbar

```
┌──────────────────────────────────────────────────────────────┐
│ GSK CONTAINMENT OBSERVATORY    [Bridge●] [9Router●] [Council●] [Scribe●]  [5m] [15m] [1h] [CAMERA] │
└──────────────────────────────────────────────────────────────┘
```

- Status pills: green dot = connected, red = disconnected, amber = degrading
- Time range: affects all panels (Grafana pattern)
- Live clock: always visible, updates every second
- Camera mode: full-screen single panel for OpenScreen

---

## 5. COMPONENT ARCHITECTURE

### File Structure

```
containment-observatory/
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Layout shell
│   ├── index.css                   # Global styles + tokens
│   │
│   ├── stores/
│   │   ├── gsk-store.ts            # Zustand: GSK runtime state
│   │   ├── ui-store.ts             # Zustand: UI state (active section, camera mode)
│   │   └── time-store.ts           # Zustand: time range, auto-refresh
│   │
│   ├── hooks/
│   │   ├── use-gsk-websocket.ts    # WebSocket connection to GSK bridge
│   │   ├── use-gsk-polling.ts      # Fallback polling when WS fails
│   │   └── use-time-range.ts       # Time range logic
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Topbar.tsx          # Status pills, time range, clock, camera
│   │   │   ├── Sidebar.tsx         # Icon nav
│   │   │   └── PanelChrome.tsx     # Panel wrapper (header + drag + resize)
│   │   │
│   │   ├── panels/
│   │   │   ├── KpiStrip.tsx        # Row of KPI cards
│   │   │   ├── CausalTimeline.tsx  # Trace-view event stream
│   │   │   ├── ArtifactCore.tsx    # Three.js containment chamber
│   │   │   ├── SkillMatrix.tsx     # Skill table with PLT scores
│   │   │   ├── CouncilChamber.tsx  # Deliberation cards
│   │   │   ├── MemoryBlackBox.tsx  # SCRIBE log stream
│   │   │   └── OperatorConsole.tsx # Command input + route selector
│   │   │
│   │   ├── ui/
│   │   │   ├── StatusPill.tsx      # Connection indicator
│   │   │   ├── KpiCard.tsx         # Single KPI with sparkline
│   │   │   ├── GlassPanel.tsx      # Glassmorphism card
│   │   │   ├── SeverityBadge.tsx   # Color-coded status
│   │   │   ├── EventRow.tsx        # Timeline event item
│   │   │   └── LiveClock.tsx       # Always-visible clock
│   │   │
│   │   └── three/
│   │       ├── ContainmentScene.tsx # R3F Canvas wrapper
│   │       ├── ArtifactOrb.tsx      # Central glowing orb
│   │       ├── OrbitRings.tsx       # Rotating containment rings
│   │       ├── ScanBeam.tsx         # Horizontal scan line
│   │       └── EventParticles.tsx   # Particle system for events
│   │
│   ├── lib/
│   │   ├── gsk-api.ts              # REST client for GSK bridge
│   │   ├── colors.ts               # Color tokens as JS constants
│   │   └── utils.ts                # Formatting, time, escape
│   │
│   └── types/
│       ├── gsk.ts                  # GSK runtime types
│       └── events.ts               # Event envelope types
│
├── public/
│   └── favicon.svg                 # GSK icon
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── postcss.config.js
```

---

## 6. DATA FLOW

### WebSocket Connection (primary)

```
GSK Bridge (127.0.0.1:4490)
    │
    │ ws://127.0.0.1:4490/gsk/events
    ↓
useGskWebSocket hook
    │
    │ onmessage → parse JSON → dispatch to store
    ↓
Zustand Store
    │
    ├── status     → KpiStrip, Topbar, ArtifactCore
    ├── event      → CausalTimeline (prepend)
    ├── council    → CouncilChamber
    ├── skills     → SkillMatrix
    └── memory     → MemoryBlackBox
```

### Event Envelope

```typescript
interface GskEvent {
  id: string;
  type: 'thought' | 'intent' | 'council' | 'skill' | 'action' | 'result' | 'memory' | 'error';
  timestamp: string;
  source: string;        // e.g. 'brain.think', 'council.deliberate', 'skills.run'
  label: string;         // human-readable label
  status: 'started' | 'success' | 'error' | 'queued';
  summary: string;       // truncated content
  payload: unknown;      // full event data
  causal_links: string[]; // parent event IDs
  meta: {
    provider?: string;   // '9Router'
    plt?: { profit: number; love: number; tax: number };
  };
}
```

### REST Endpoints (fallback)

```
GET  /api/gsk/status    → { live, mode, brain, counts, chambers, emotions }
GET  /api/gsk/timeline  → { events: GskEvent[] }
GET  /api/gsk/council   → { gods, phase, total, latest }
GET  /api/gsk/skills    → { total, skills: Skill[] }
GET  /api/gsk/memory    → { total, entries: MemoryEntry[] }
POST /api/gsk/command   → { route, input } → { ok, response }
```

---

## 7. PANEL SPECIFICATIONS

### 7.1 KPI Strip

**Source:** `status` from WebSocket
**Layout:** 5 cards in a row (responsive: 3 on tablet, 1 on mobile)

| Card | Value | Color | Sparkline |
|------|-------|-------|-----------|
| 9Router Status | Online/Offline | cyan/green | — |
| Events/sec | count of events in last 60s | cyan | line chart, last 5min |
| Active Skills | skills invoked in last 5min | green | bar chart |
| Memory Writes | memory.witness calls in last 5min | pink | line chart |
| Council Verdicts | council.deliberate calls in last 5min | purple | — |

**Pattern:** SENTINEL SOC KPI card — big number + mono label + colored left border
```jsx
<div className="border-l-3 border-cyan bg-panel p-3 rounded">
  <div className="text-[10px] font-mono text-secondary uppercase tracking-widest">9Router</div>
  <div className="text-2xl font-bold text-cyan" style={{textShadow:'0 0 18px var(--cyan-glow)'}}>Online</div>
</div>
```

### 7.2 Causal Timeline

**Source:** `event` from WebSocket (prepend) + `timeline` from REST (initial load)
**Layout:** Full-width panel, scrollable, max 200 events in DOM

**Pattern:** SigNoz trace view — each event is a row with:
- Time (JetBrains Mono, 9px, dim)
- Type badge (color-coded: thought=cyan, intent=amber, council=violet, skill=green, memory=pink, error=red)
- Summary text (truncated, full on click)
- Status badge (OK/ERR/RUN)
- Expand arrow → shows full payload JSON

**Interactions:**
- Click event → expands to show full payload
- Click type badge → filters timeline to that type
- Hover → highlights causal chain (parent events)
- Auto-scroll to top when new events arrive (unless user scrolled down)

### 7.3 Artifact Core (Three.js)

**Source:** `status` from WebSocket
**Layout:** Fixed 300×300px in main view, full-screen in camera mode

**Pattern:** React Three Fiber, single Canvas, 3 objects:

1. **Outer Ring** — rotating containment ring (wireframe torus)
   - Speed correlates with events/sec
   - Color: cyan when online, red when error

2. **Inner Ring** — pulsing Council ring (wireframe torus)
   - Pulses during deliberation
   - Color: violet

3. **Kernel** — central glowing sphere
   - emissive intensity correlates with brain activity
   - Color: white → cyan gradient
   - Post-processing: Bloom (restrained, intensity 0.5)

**Performance:**
- `frameloop="demand"` — only re-renders on state change
- No orbit controls (locked camera)
- `dpr={[1, 1.5]}` — capped for performance
- Lazy-loaded (only mounts when Containment section is active)

### 7.4 Skill Matrix

**Source:** `skills` from WebSocket/REST
**Layout:** Filterable table, sortable columns

**Columns:**
| Name | File | PLT Score | Last Invoked | Status |
|------|------|-----------|-------------|--------|

**Pattern:** TanStack Table (if we need sorting/filtering) or simple `<table>` with Tailwind
- Row hover → subtle glow
- PLT score → colored badges (P=cyan, L=pink, T=red)
- Status → green dot (ready) or grey (idle)
- Click skill → shows detail modal with invocation history

### 7.5 Council Chamber

**Source:** `council` from WebSocket
**Layout:** Card with gods row + latest deliberation

**Content:**
- Gods: 4 seats (Profit Prime, Love Weaver, Tax Collector, Harvester) — color-coded icons
- Phase: Idle / Deliberating / Voting
- Latest topic + resolution
- PLT outcome bar (Profit/Love/Tax scores as colored bars)

**Pattern:** SENTINEL SOC panel — mono header + content body
- During deliberation: pulsing violet glow on active seats
- After verdict: resolution text with PLT score breakdown

### 7.6 Memory Black Box

**Source:** `memory` from WebSocket
**Layout:** Scrollable log, max 100 entries in DOM

**Each entry:**
- Type badge (memory/thought/council/skill/error)
- Timestamp
- Content (truncated, expandable)
- Tags as small badges

**Pattern:** SigNoz log explorer — debounced batch insert (500ms), auto-scroll
- Filter by type (tabs or dropdown)
- Search by content
- Click → expands full entry

### 7.7 Operator Console

**Source:** POST `/api/gsk/command`
**Layout:** Route selector + textarea + send button + status line

**Routes:**
- Brain / 9Router → sends to `gsk.think()`
- Council Deliberation → sends to `council.deliberate()`
- Skill Invoke → sends to `gsk.runSkill()`
- Witness To Memory → sends to `memory.witness()`

**Pattern:** SENTINEL SOC terminal — JetBrains Mono, dark background, green text
- Send button: amber gradient, glow on hover
- Status line: shows "Transmitting..." → "Artifact responded" / "Failed: reason"
- Command history: last 10 commands, clickable to re-send

---

## 8. CAMERA MODE

**Trigger:** Click "CAMERA" in topbar
**Layout:** Single panel, full-screen, no sidebar/topbar

**Shows:**
- Artifact Core (center, large)
- Current thought (top)
- Active causal chain (left)
- Council verdict (right)
- Skill result (bottom-right)
- Memory write (bottom-left)
- Live clock (top-right corner)

**Purpose:** OpenScreen records this surface as the "true visible runtime"

**Pattern:** SENTINEL SOC investigation mode — dark bg, high contrast, large typography

---

## 9. REAL-TIME MECHANICS

### WebSocket Lifecycle

```
1. Connect to ws://127.0.0.1:4490/gsk/events
2. Receive 'init' message → load full state
3. Subscribe to 'event', 'status', 'council', 'skills', 'memory'
4. On close → reconnect after 4s (exponential backoff)
5. On error → show "Bridge disconnected" in topbar, switch to polling
6. Polling fallback: GET /api/gsk/status every 15s
```

### "Alive" Checklist (from Uptime Kuma)

- [x] WebSocket push (not polling)
- [ ] Pulse animation on live elements
- [ ] Connection status indicator (green dot)
- [ ] Live clock in header
- [ ] Smooth transitions (framer-motion 220ms)
- [ ] Stale data warning (grey out after 30s)
- [ ] Favicon badge (shows event count)
- [ ] Auto-scroll timeline (unless user scrolled)

### Event Processing

```typescript
// Debounced batch insert (SigNoz pattern)
const batchRef = useRef<GskEvent[]>([]);
const flush = useDebouncedFn(() => {
  setEvents(prev => [...batchRef.current, ...prev].slice(0, 200));
  batchRef.current = [];
}, 500);

// On WebSocket message
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.type === 'event') {
    batchRef.current.push(msg.payload);
    flush();
  }
};
```

---

## 10. IMPLEMENTATION PHASES

### Phase 1: Scaffold (1 hour)
- [ ] Create Vite + React + TypeScript project
- [ ] Install: zustand, tailwindcss, framer-motion, lucide-react, recharts
- [ ] Set up design tokens (colors, glass, severity)
- [ ] Build layout shell (Topbar, Sidebar, PanelChrome)
- [ ] Build GlassPanel component
- [ ] Build KpiCard component
- [ ] Build StatusPill component
- [ ] Build LiveClock component

### Phase 2: Wire GSK Bridge (1 hour)
- [ ] Build useGskWebSocket hook
- [ ] Build gsk-store (Zustand)
- [ ] Build gsk-api (REST client)
- [ ] Wire Topbar status pills to live data
- [ ] Wire KPI strip to live data
- [ ] Test with running GSK on port 4490

### Phase 3: Build Panels (2 hours)
- [ ] CausalTimeline — event stream with type badges
- [ ] SkillMatrix — table with PLT scores
- [ ] MemoryBlackBox — scrollable log
- [ ] CouncilChamber — deliberation card
- [ ] OperatorConsole — command input

### Phase 4: Artifact Core (1 hour)
- [ ] Set up React Three Fiber
- [ ] Build ArtifactOrb, OrbitRings, ScanBeam
- [ ] Wire to brain status (pulse = thinking, red = error)
- [ ] Add Bloom post-processing
- [ ] Performance test

### Phase 5: Polish (1 hour)
- [ ] Camera mode
- [ ] framer-motion transitions
- [ ] Stale data grey-out
- [ ] Favicon badge
- [ ] Responsive layout (tablet/mobile)
- [ ] Error boundaries
- [ ] Accessibility (prefers-reduced-motion)

### Phase 6: Deploy (30 min)
- [ ] Build for production (Vite)
- [ ] Update containment-observatory/server.js to serve built assets
- [ ] Test on localhost:4491
- [ ] Push to plt-press gh-pages
- [ ] Verify live URL

---

## 11. DEPENDENCIES

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "framer-motion": "^12.0.0",
    "lucide-react": "^0.500.0",
    "recharts": "^2.15.0",
    "@react-three/fiber": "^9.0.0",
    "@react-three/drei": "^10.0.0",
    "@react-three/postprocessing": "^3.0.0",
    "three": "^0.175.0",
    "react-grid-layout": "^1.5.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^3.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/three": "^0.175.0"
  }
}
```

---

## 12. ANTI-PATTERNS TO AVOID

1. **Don't use Chart.js** — uPlot or Recharts for production
2. **Don't poll** — WebSocket push, polling is fallback only
3. **Don't put 3D behind tables** — artifact core is visual anchor, not hidden
4. **Don't animate everything** — pulse on live elements only
5. **Don't fake data** — if GSK is offline, show "OFFLINE" not demo data
6. **Don't use inline styles** — Tailwind classes + CSS custom properties
7. **Don't build a new bridge** — use existing GSK bridge on 4490
8. **Don't skip the glass tokens** — they're the identity of this dashboard
9. **Don't forget prefers-reduced-motion** — accessibility matters
10. **Don't over-engineer phase 1** — get it working, then make it beautiful

---

## 13. SUCCESS CRITERIA

- [ ] Dashboard opens at localhost:4491
- [ ] Topbar shows live connection status (green dots)
- [ ] KPI strip shows real numbers from GSK
- [ ] Timeline shows real events as they happen
- [ ] Skill matrix shows all 97 skills
- [ ] Council shows latest deliberation
- [ ] Memory shows recent entries
- [ ] Operator console sends commands to GSK
- [ ] Artifact core pulses when GSK is thinking
- [ ] Camera mode works for OpenScreen
- [ ] GitHub Pages version works (public)
- [ ] No fake data anywhere
- [ ] 60fps on desktop
- [ ] Graceful offline mode

---

*This plan is based on patterns from Uptime Kuma, Grafana, SigNoz, HyperDX, SENTINEL SOC, SOC Showcase, AuroraSOC, liquidglass, glinui, GlassKit, Global Analytics Dashboard, and RagaAI Catalyst.*
