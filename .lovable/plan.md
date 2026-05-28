# Geographically distributed brand search

## Problem

When you search "Starbucks" (or any chain), the map only shows pins clustered in one area instead of across the whole country/region. Google's `searchText` endpoint, even with `locationRestriction`, returns results biased to a single hotspot (usually the densest metro). Paginating just yields more from the same area.

The Global ("worldwide") path already fans out across 8 continental rectangles and merges. The single-country path does not — it makes one call with one rectangle, so you get one cluster.

## Fix

Apply the same "fan out + merge + dedupe" pattern to country searches by splitting each country into multiple sub-region rectangles, querying each in parallel, then deduping by `placeId`.

### Changes in `src/lib/googlePlaces/search.server.ts`

1. **Add `COUNTRY_SUB_REGIONS`** — for each country in `COUNTRY_BOUNDS`, define 4–8 named sub-rectangles covering distinct geographies. Examples:
   - US: West Coast, Mountain, Midwest, South, Northeast, Texas, Florida, Pacific NW (8 regions)
   - DE: North, West (Rhein-Ruhr), South (Bayern/BW), East (Berlin/Sachsen) (4 regions)
   - GB: Scotland, North England, Midlands, South/London, Wales (5 regions)
   - FR: Île-de-France, North, West, South-East, South-West (5 regions)
   - Smaller countries (NL, BE, CH, AT, DK): 2–3 regions
   - Larger (ES, IT, SE, NO, PL): 4–5 regions

2. **Rewrite the country branch** of `searchGooglePlaces` to mirror the global branch:
   - `Promise.all` over sub-regions using `locationRestriction` (hard boundary, so results stay inside the country)
   - Smaller `maxLocations` per region (e.g. 15) so one dense metro can't monopolize the budget
   - Dedupe by `_placeId`
   - Apply `nameFilter` and `filterByDominantDomain` (same as global)
   - Slice to requested `maxLocations`

3. **Distribution-aware truncation** — when slicing to `maxLocations`, interleave results by region instead of taking the first N. This guarantees the final set reflects every sub-region that returned hits, not just the first one in the array.

4. **Logging** — add `[Google Places <COUNTRY>] <REGION>:<count>, ...` log line matching the global format, for debugging coverage.

### Out of scope

- No UI changes (`PulseMap`, HUD panels untouched).
- No schema/type changes — `GooglePlacesLocation` shape is preserved.
- No new API keys or env vars.
- Quota note: this multiplies Places API calls per search by the number of sub-regions (~4–8×). Existing 2s pagination delay is preserved per region; regions run in parallel.

## Verification

- Search "Starbucks" with country=US → expect pins across coasts + interior, not one metro.
- Search "Starbucks" with country=DE → pins in Berlin, Munich, Hamburg, Frankfurt area.
- Server logs show non-zero counts across multiple sub-regions.
