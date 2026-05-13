
# AI Visibility Pulse — Build Plan

A single-page, cinematic mockup for Uberall. Strict brand palette, mocked data, real interaction fidelity.

## Scope decisions

- **Map library**: Leaflet + CartoDB Dark Matter tiles (no API token required). Mapbox GL is "preferred" in the brief but requires a public token; defaulting to Leaflet keeps the preview working out-of-the-box. Easy to swap later.
- **Fonts**: IBM Plex Sans + Spectral 700 (Tiempos fallback) via Google Fonts. Tiempos is not free.
- **Single page**: replace `src/routes/index.tsx`. No routing changes.
- **State**: local React state + a small Zustand-free reducer is overkill — use `useState`/`useReducer` in the root page component and prop-drill / context for HUD filters.
- **No backend**: pure frontend, all data from `mockData.ts`.

## File structure

```text
src/routes/index.tsx                     // orchestrates Landing <-> MapApp
src/styles.css                            // add brand tokens + font imports
src/features/pulse/
  ├── LandingScreen.tsx                  // step 1
  ├── MapApp.tsx                          // step 2-5 container
  ├── PulseMap.tsx                        // Leaflet map + location pulses + hex layer
  ├── HexLayer.tsx                        // h3 polygons via Leaflet GeoJSON
  ├── DetailPanel.tsx                     // step 3 right-side glass panel
  ├── hud/
  │   ├── BrandPill.tsx                   // top-left
  │   ├── FilterControls.tsx              // top-right (assistant + time range)
  │   ├── Legend.tsx                      // bottom-left
  │   ├── StatBlock.tsx                   // bottom-right glass card
  │   └── HeatReplayButton.tsx            // bottom-center
  ├── PulseArc.tsx                        // SVG 1-arch pulse graphic
  ├── PulseCircle.tsx                     // SVG full-circle pulse graphic
  ├── mockData.ts                         // brand, locations, prompts, 7d history
  ├── hexUtils.ts                          // h3 -> GeoJSON, intensity -> color
  └── types.ts
```

## Step-by-step implementation

### 1. Design tokens & fonts (`src/styles.css`)
- Add CSS vars for the 7 brand colors in oklch + hex fallback.
- Register them in `@theme inline` so Tailwind utilities work (`bg-dark-plum`, `text-ultraviolet`, etc.).
- Set body background to Dark Plum, default text White.
- Import Google Fonts: IBM Plex Sans (300/400/700), Spectral (700, 700 italic).
- Define `--font-display` (Spectral) and `--font-sans` (IBM Plex).
- Add a `glass` utility class: `backdrop-blur-2xl bg-dark-plum/70 border border-ultraviolet/30`.

### 2. Mock data (`mockData.ts`)
- Demo brand: `Lumen Coffee` (replaceable).
- ~30 locations across Berlin / Paris / London with realistic lat/lng.
- Per location: `visibilityScore` (0–100), 5–8 prompt results (`mentioned` | `competitor_higher` | `not_mentioned`), per-prompt assistant attribution.
- 4 competitor names: Brewline, Northsip, Caffea, Morningfox.
- 7 days of historical scores per location (small random walk) for replay.
- Cluster names derived from neighborhood (Berlin Mitte, Paris Le Marais, etc.).

### 3. Landing screen (`LandingScreen.tsx`)
- Full-bleed Dark Plum, animated Ultraviolet→Dark Plum mesh gradient (CSS conic-gradient + slow rotation).
- Centered: Spectral headline with "where AI is talking" italicized in Ultraviolet.
- Glowing input (white inner ring, Ultraviolet outer halo on focus).
- CTA button: Ultraviolet, white text, rounded-xl, shadow-lg w/ Ultraviolet glow.
- `PulseArc` SVG behind input at 15% white opacity.
- On submit: Framer Motion `AnimatePresence` cross-fade + scale → `MapApp` mounts. Camera-fly feel via input scale-out + map opacity-in + slight zoom on map container.

### 4. Map app shell (`MapApp.tsx`)
- Holds: brand name, selected hex, filter state (assistant, time range), replay state.
- Renders `PulseMap` full-screen + HUD components absolutely positioned + `DetailPanel` (slide-in from right) + `HeatReplayButton`.

### 5. Map (`PulseMap.tsx`)
- Leaflet map, CartoDB Dark Matter (no labels variant), centered between the 3 cities, zoom ~5 initially then animate to ~11 on first city cluster.
- CSS filter on tile layer: `hue-rotate(260deg) saturate(1.1) brightness(0.7)` to tint toward Dark Plum.
- For each location: a `divIcon` with a Tech Blue dot + 2 expanding sonar rings (CSS keyframes).
- Hex overlay rendered via `HexLayer`.
- Disable default zoom controls (keep a custom minimal one or none).

### 6. Hex layer (`HexLayer.tsx`, `hexUtils.ts`)
- Use `h3-js` `latLngToCell` at resolution 8 around each location to build a unique hex set.
- Aggregate intensity per hex from nearby locations (avg of visibilityScore weighted by distance).
- Convert each hex to GeoJSON polygon via `cellToBoundary`.
- Render with Leaflet `GeoJSON` layer; style per hex per the 5-tier scale from the brief.
- Pulse animation: apply CSS animation to SVG paths (Leaflet renders to SVG by default), 1.8s ease-in-out, 4% scale via `transform-origin: center`.
- Stagger fade-in via JS: assign each path a `--delay` CSS var (50–80ms × index).
- Hover/click → set selected hex in parent state.

### 7. Detail panel (`DetailPanel.tsx`)
- Framer Motion slide from right, glass styling.
- Cluster name (Spectral), big visibility score with circular SVG progress ring (Tech Blue → Ultraviolet gradient stroke).
- `PulseCircle` SVG behind the ring at low Tech Blue opacity.
- Prompt list with status dots (Soft Green / Orange / Dark Plum outlined).
- Competitor chips.
- "Improve visibility →" CTA (Ultraviolet).

### 8. HUD components
- **BrandPill**: glass pill, brand name + tiny circle logo placeholder + "switch brand" link in Aqua → returns to landing.
- **FilterControls**: two segmented controls (assistant, time range). Active: Ultraviolet fill. Inactive: transparent w/ 60% white text. Filtering re-derives intensity (mocked: per-assistant scores pre-baked in mockData).
- **Legend**: horizontal gradient bar Dark Plum → Tech Blue → Ultraviolet → Orange + Low/High labels.
- **StatBlock**: glass card, animated counters (rAF count-up), trend arrow Soft Green/Orange.

### 9. Heat Replay (`HeatReplayButton.tsx`)
- Tech Blue button bottom-center with small Pulse arc icon.
- On click: iterate days 1→7 over ~6s; update intensity per hex from historical data.
- Date label cycles in Spectral at top-center of map.
- Button shows progress ring while playing; cancellable.

### 10. Motion specs
- All transitions: `cubic-bezier(0.16, 1, 0.3, 1)`.
- Pulses: 1.5s infinite ease-out (location), 1.8s ease-in-out (hex).
- No spring overshoot.

## Dependencies to install

```text
leaflet
react-leaflet
@types/leaflet
h3-js
framer-motion
```

## Out of scope (validation mockup)

- Real AI calls, real geocoding, auth, persistence, routing, mobile-specific layout (desktop-first).

## Risks / notes

- `h3-js` is pure JS, works fine in Vite.
- Leaflet needs its CSS imported once (`leaflet/dist/leaflet.css`) and a sized container.
- Tile CSS filter is the cheapest way to tint without a custom Mapbox style.
- If you later provide a Mapbox token, swapping `PulseMap` is isolated — only that file changes.

## Open question (non-blocking — I'll default if you don't answer)

- **Map provider**: I'll use Leaflet + CartoDB Dark Matter tinted toward Dark Plum. Say the word if you want Mapbox GL instead and can supply a public token.
