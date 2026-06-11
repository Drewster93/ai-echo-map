# Match Reference Design

Bring the map UI in line with the two reference screenshots. Scope: visual/presentation only — no data model or filter logic changes.

## Visual targets (from references)

- Pins use a **purple palette** in three shades by mention rate, not red/yellow/green.
- Each pin shows a **numeric mention-rate value** (e.g. `30`, `60`, `80`) inside the teardrop head.
- Each pin sits inside a **soft purple hex polygon halo** around it (the postcode/area cell), faintly filled and stroked.
- Bottom-left legend titled **"MENTION RATE / % OF PROMPTS"** with three purple swatches: `< 60`, `60–69`, `≥ 70`.
- Selected-location **bottom sheet** (Darlington example): title + postcode chip, "N stores", 4 KPI tiles (MENTION RATE, CITATION RATE, SHARE OF VOICE, AVG POSITION), tabs (Competitors / Locations / Prompt results), and a competitor ranking table.

## Changes

### 1. `src/features/pulse/PulseMap.tsx`
- Replace `pinColorForScore` (red/yellow/green) with a 3-step purple ramp:
  - `≥ 70` → deep purple `#5b21b6` fill, white text
  - `60–69` → mid purple `#8b5cf6` fill, white text
  - `< 60` → light purple `#c4b5fd` fill, dark text
- Rewrite `pinSvg` so the teardrop renders the **numeric score** centered in the head (replace the small white dot). Accept a `label: string` arg.
- For cluster/aggregate pins, label = rounded average score (no count badge — already removed).
- Re-enable a lightweight `renderHex()` that draws each hex cell's boundary as an `L.polygon` with `fillColor` in the matching purple shade, `fillOpacity ~0.18`, `color` slightly darker, `weight: 1`. Only render hexes at world/region zoom (below `CITY_ZOOM_THRESHOLD`) so city-level views stay clean.
- Keep all interaction handlers, zoom thresholds, bucketing, dive, competitor layer untouched.

### 2. `src/features/pulse/hud/MentionRateLegend.tsx` (or replace `Legend.tsx` usage)
- Make the active legend match the reference: compact white pill, label `MENTION RATE` left + `% OF PROMPTS` right, three rows with purple swatches and ranges `< 60`, `60–69`, `≥ 70`. Update colors to the three purples above. Remove the green/yellow/red variant.

### 3. Detail panel (`src/features/pulse/DetailPanel.tsx`)
- Verify it matches reference layout: header (city + postcode chip + store count + close), 4 KPI tiles row, tabs row, competitor table. Adjust spacing, typography, and color tokens only as needed to match — no new data sources. If the existing panel is already structurally similar, limit edits to color/typography parity.

## Out of scope
- Basemap tiles, filters, side nav, top header, search bar, mock data, clustering thresholds, SSR hydration warning, the pink debug banner visible in screenshots (that's a sandbox overlay, not app code).
