## Goal

Make sure the locations displayed in the HUD and the blind-spot tour reflect exactly the locations returned by the Google Places search, and cap the search at 20 locations.

## Changes

1. **Cap the fetch at 20 locations**
   - `src/routes/index.tsx`: change the request payload from `maxLocations: 40` to `maxLocations: 20`.
   - `src/lib/googlePlaces/search.functions.ts`: tighten the Zod validator from `.max(120)` to `.max(20)` so the cap is enforced server-side too.

2. **Make HUD counts match the fetched set**
   - The HUD (`TopHeader`, `StatBlock`, `WorldwideOverview`) already derives `propertiesCount` / `marketsCount` from `scopedLocations`. After the cap change, those will read directly off the 20 (or fewer) real places.
   - Sanity-check: `buildLocationsFromPlaces` currently drops places with no lat/lng. Keep that, but log how many were dropped so the toast count and HUD count stay consistent. If we want the toast to show the *displayed* count rather than the raw API count, update `index.tsx` toast to use `locations.length` after the build step.

3. **Make the tour match the fetched locations**
   - `useBlindSpotTour` already receives `brandedLocations`, which is now the fetched set.
   - `selectTourStops` aggregates those by `city`. With only ~20 places this still works: stronghold = top-scoring city, blind spot = lowest, opportunity = middle. No further code change required beyond confirming the tour only auto-starts once real data is in (already wired via `usingRealData` + `arrivedRef`).
   - Add a guard: if fewer than 2 distinct cities are present, the tour will produce a single stop or none. That's acceptable, but we'll keep `selectTourStops`' existing empty-array fallback so the tour cleanly ends instead of looping.

## Technical notes

- No type or schema changes to `Location` / `GooglePlacesLocation`.
- No changes to `MapApp` plumbing; the tour and counts already flow from the same `brandedLocations` source.
- Server-side `searchGooglePlaces` will still page through regions but will stop at 20 due to the `maxLocations` cap propagated from the validator.

## Out of scope

- Reworking tour stop selection logic (still city-aggregated).
- Changing how categories/domain filtering work in `search.server.ts`.
