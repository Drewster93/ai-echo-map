## Goal

Boot straight into the live map. No intro, no landing, no Google Places. Sales lands on a globally-distributed mock brand with enough density and variety to showcase every feature (heatmap, drill-in, competitor benchmark, assistant filter, pulse alerts, regional overview, blind-spot tour).

## Changes

### `src/routes/index.tsx`
- Strip everything except a direct `<MapApp />` mount inside the `SideNav` shell.
- Remove: `IntroSequence`, `LandingScreen`, `AnimatePresence`, `useServerFn`, `searchBrandLocations`, `buildLocationsFromPlaces`, `places`/`demoLocations`/`brand` state, `isDemo`/`?demo=1` flag, `handleBrand`, `onSwitchBrand`.
- Pass `brand = DEFAULT_BRAND` ("Lumen Coffee" — already in `mockData.ts`) and `locations = MOCK_LOCATIONS` directly.
- `revealing` is always true → drop the conditional layout entirely.

### Files to delete
- `src/features/pulse/IntroSequence.tsx`
- `src/features/pulse/LandingScreen.tsx`
- `src/lib/googlePlaces/` (search.functions.ts, search.server.ts, types.ts)
- `src/features/pulse/buildFromPlaces.ts`

### `src/features/pulse/hud/SideNav.tsx`
- Remove the "switch brand" affordance if it was the only consumer of `onSwitchBrand`. Otherwise make the prop optional and no-op.

### `src/features/pulse/mockData.ts` — global expansion
Goal: ~80–110 locations across 10 cities on 4 continents so the map looks alive at any zoom and every demo beat has data to land on.

Add city seed arrays alongside the existing Berlin / Paris / London:
- **Europe**: Amsterdam (8), Barcelona (8), Milan (7)
- **North America**: New York (12), San Francisco (10), Toronto (7)
- **Asia / Pacific**: Tokyo (10), Singapore (7), Sydney (8)

For each new city:
1. Add a `PROMPTS_BY_CITY` entry (6–8 localized prompts — neighborhood + intent variations consistent with the existing voice).
2. Add a `<city>Seeds` array of `[area, name, lat, lng]` tuples with realistic neighborhood names and coordinates clustered in 3–5 districts per city (so the hex bloom looks dense, not scattered).
3. Spread `visibilityScore` bases across the full 20–95 range per city so the legend, "winning vs losing" benchmark, and blind-spot tour all have material to highlight.
4. Include the new arrays in `buildLocations()`'s `all` concatenation.

`Location.city` is already typed as `string`, so no type changes needed. `DEFAULT_BRAND` stays "Lumen Coffee".

### Verify
- `MapApp`, `WorldwideOverview`, `RegionalOverview`, `useBlindSpotTour`, `selectTourStops` already iterate over `locations` generically — confirm no hardcoded city allow-lists. If any exist, widen them.

## Out of scope
- Remotion capture scripts (their `?demo=1` deep-link goes away; we'll update capture URLs when we re-record).
- Removing `GOOGLE_PLACES_API_KEY` from project secrets (safe to delete in Settings once code is gone).
- New competitor brands — keeping the existing 5.

## Open question
Stick with **"Lumen Coffee"** as the demo brand, or pick something more sector-neutral (e.g. a retail chain, hotel group) so sales can pitch beyond F&B?
