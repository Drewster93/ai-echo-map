## Slim the map to ~70 locations and drop cluster count badges

### 1. `src/features/pulse/mockData.ts` — cut to ~70 locations

Replace the dense `SEEDS` map with a leaner set:

- **North America** (4 cities): New York, San Francisco, Los Angeles, Toronto — 2–3 locations each (~10)
- **South America** (2): São Paulo, Buenos Aires — 2 each (~4)
- **Europe** (8, deliberately thinned): London, Paris, Berlin, Amsterdam, Madrid, Milan, Stockholm, Istanbul — 2–3 each (~20). Drop Barcelona, Lisbon, Dublin, Copenhagen, Oslo, Warsaw, Vienna, Zurich, Rome, Athens, Brussels so Western Europe doesn't crowd at world zoom.
- **Middle East / Africa** (3): Dubai, Cape Town, Lagos — 2 each (~6)
- **Asia** (7): Mumbai, Bangalore, Bangkok, Seoul, Hong Kong, Shanghai, Tokyo, Singapore — 2–3 each (~18)
- **Oceania** (2): Sydney, Melbourne — 2 each (~4)

Target total: **~70 locations across ~26 cities**. Keep per-city neighborhood seeds realistic. `PROMPTS_BY_CITY` trimmed to the surviving cities; `GENERIC_PROMPTS` fallback unchanged. `buildLocations()` and the deterministic rng seed stay the same so visibility scores remain reproducible.

### 2. `src/features/pulse/PulseMap.tsx` — remove the cluster count badge

In the marker render path, when `count > 1`:
- Keep using the standard teardrop `pinSvg` (already in place).
- Remove the small dark pill count badge element (the `<div style="position:absolute;top:-4px;right:-6px…">{count}</div>`) so clusters look identical to single pins.
- Leave `iconSize`/`iconAnchor` at `[34, 44]` / `[17, 42]`.
- Color logic (green/yellow/red by average score) unchanged.

Click behavior unchanged: clicking a cluster still zooms in / opens the group, single pins still open the detail panel.

### Out of scope

- Basemap, hex layer, legend, filters, side panels.
- Clustering thresholds in `bucketKey()` — current zoom-tiered grid already handles density; with fewer European cities it will naturally look uncluttered.
- The unrelated SSR/CSR hydration mismatch on the "Avg Mention %" metric.
