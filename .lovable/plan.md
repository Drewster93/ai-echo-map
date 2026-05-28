## Goal

When few locations are returned (e.g. Uberall = 2 pins in Berlin + Amsterdam), the initial dive currently zooms in to level 7, which crops context and makes the map feel empty. Decrease the zoom on the initial reveal so all pins are visible with surrounding geography.

## Changes — `src/features/pulse/PulseMap.tsx`

1. **`runDive` (line 330)** — lower the `targetZoom` cap from `7` to `5`, and increase bounds padding from `0.15` to `0.35` so sparse result sets sit comfortably inside the viewport.
   ```ts
   const padded = bounds.pad(0.35);
   const targetZoom = Math.min(map.getBoundsZoom(padded), 5);
   ```

2. **`flyToInitial` (lines 98 & 102)** — bump `padding: [120, 120]` to `[180, 180]` so the "return to overview" animation (used by the tour) matches the new, wider framing.

No other files change. The tour's per-stop zooms (`flyTo(center, zoom)`) keep their existing per-stop zoom levels, so the close-ups during the tour are unaffected.
