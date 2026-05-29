## Fill the map and match the pin look

### 1. Expand `src/features/pulse/mockData.ts` to ~330 locations

Replace the per-city seed arrays with a single `SEEDS: Record<string, Seed[]>` map covering **47 cities** across all populated continents (matching the reference screenshot's distribution):

- **North America** (8): New York, San Francisco, Los Angeles, Chicago, Austin, Miami, Seattle, Vancouver, Montreal, Toronto, Mexico City
- **South America** (4): São Paulo, Buenos Aires, Bogotá, Lima
- **Europe** (17): Berlin, Paris, London, Amsterdam, Barcelona, Milan, Madrid, Lisbon, Dublin, Stockholm, Copenhagen, Oslo, Warsaw, Vienna, Zurich, Rome, Athens, Istanbul
- **Middle East / Africa** (6): Dubai, Tel Aviv, Cairo, Nairobi, Cape Town, Lagos
- **Asia** (11): Mumbai, Bangalore, Delhi, Bangkok, Jakarta, Seoul, Hong Kong, Taipei, Manila, Kuala Lumpur, Shanghai, Tokyo, Singapore
- **Oceania** (4): Sydney, Melbourne, Brisbane, Perth, Auckland

Each city: 3–13 locations with realistic neighborhood names and coordinates clustered in 3–6 districts. Total: ~330 locations.

`PROMPTS_BY_CITY` gets entries for every new city (5–7 localized prompts each), plus a `GENERIC_PROMPTS` fallback. `buildLocations()` iterates the `SEEDS` map instead of hardcoded concatenation. Deterministic rng seed unchanged so visibility scores stay reproducible.

### 2. Refine pin look in `src/features/pulse/PulseMap.tsx`

Match the reference screenshot's pin style:

- **Single pin** (zoom ≥ 9): bump size 30×38 → 34×42, increase white stroke from 2.5 → 3, slightly stronger drop shadow. Keep teardrop + white center dot.
- **Cluster pin** (zoom < 9): wrap the teardrop in a rounded white shield/badge base (subtle rounded square with shadow) so groups read as the layered "stacked" pins in the reference. Move the count badge to top-right as a small dark pill with the cluster color. Color of the shield follows the average score (subtle tint of the pin color).

No changes to colors thresholds (green ≥60, yellow 40–60, red <40) or click behavior.

### Out of scope

- Basemap, legend, side panels, hex layer, filters.
- Real geocoding — coordinates remain hand-picked seeds.
- Hydration mismatch warning visible in runtime errors (separate issue: SSR vs client metric jitter; unrelated to pin/density work).
