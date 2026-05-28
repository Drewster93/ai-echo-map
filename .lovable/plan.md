## Root cause

`MapApp` falls back to `MOCK_LOCATIONS` (50+ Lumen Coffee dummies across Berlin/Paris/London) while the Google Places fetch is in flight. As a result, when the user submits a brand the map briefly renders the full mock dataset, then snaps down to the real (≤20) locations once the fetch resolves. The tour also visibly transitions from "lots of pins" → "few pins".

## Goal

Never show mock locations once a brand has been searched. The map and tour should display exactly the locations returned by Google Places, from the first frame onward.

## Changes

1. **Drop the mock fallback in `MapApp`**
   - Remove the `MOCK_LOCATIONS` fallback in `src/features/pulse/MapApp.tsx`. `locations` becomes `locationsProp ?? []`.
   - Remove the `"Lumen" → brand` rename branch (no longer needed — real data already has real names).
   - `usingRealData` becomes `locationsProp !== null` (null = still loading, [] = no results, non-empty = ready).

2. **Loading / empty states**
   - While `locationsProp === null` (fetch pending): render the map shell with a centered loading overlay ("Searching Google Places for {brand}…"). HUD counts read 0 from the empty array, but they're hidden behind the overlay so there's no flash.
   - While `locationsProp` is an empty array (fetch returned 0): show a "No locations found for {brand}" empty state with a "Try another brand" button that calls `onSwitchBrand`.

3. **Tour gating (already partially done — tighten it)**
   - Keep the existing `usingRealData` gate on `handleArrived` / the post-arrival effect so the tour only starts once real locations are present.
   - Add a guard: if `brandedLocations.length === 0`, don't render hex cells at all (avoids any "0 markets" flicker behind the overlay).

4. **Remove unused mock import**
   - Drop `MOCK_LOCATIONS` from the `MapApp.tsx` imports once the fallback is gone (keeps `getDateLabels`).

## Technical notes

- No changes needed in `index.tsx`; it already passes `null` while loading and the built `Location[]` once `places` is set.
- No changes to `useBlindSpotTour` or `selectTourStops`; they already operate purely on the locations array they're handed.
- The runtime error `'return' outside of function (60:2)` in the report is stale — the current `src/routes/index.tsx` is syntactically valid.

## Out of scope

- Reworking the mock data file (left in place for other usages, e.g. `getDateLabels`).
- Adding a skeleton for the side nav / top header chrome.
