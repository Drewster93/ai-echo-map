# Geographic coverage for global brand search

## Problem

Searching "Starbucks" with `country=global` returns only North-European pins. The global branch in `src/lib/googlePlaces/search.server.ts` has two issues:

1. **Soft bias instead of hard restriction.** Each of the 8 continental rectangles uses `locationBias`, which Google's `searchText` may ignore — it often returns the same globally-relevant cluster regardless of the bias. After dedupe, you get one regional cluster.
2. **No interleaving on the global path.** After merge + dedupe, results are `.slice(0, maxLocations)` from the concat order. One dominant region eats the whole budget.

The country path was just fixed to interleave; the global path was not.

## Fix

### 1. `src/lib/googlePlaces/search.server.ts` — global path

- Switch each continental region from `locationBias` to `locationRestriction` (hard boundary, matches what the country sub-region path now does).
- Keep per-region budget at 60, but interleave across the 8 continents round-robin (same pattern as the country branch) before slicing to `maxLocations`.
- Apply `nameFilter` per-bucket, then `filterByDominantDomain` across the flat set, then interleave.
- Update the log line to show per-region kept counts after filtering, not just raw counts.

### 2. Diagnostic endpoint — `src/routes/api/public/brand-coverage.ts`

A read-only GET endpoint to check brand presence per region without going through the UI:

```
GET /api/public/brand-coverage?brand=Starbucks&scope=global
GET /api/public/brand-coverage?brand=Starbucks&scope=country&country=US
```

Returns JSON:
```json
{
  "brand": "Starbucks",
  "scope": "global",
  "regions": [
    { "label": "NA_WEST",   "raw": 60, "kept": 47, "sample": ["Seattle", "..."] },
    { "label": "EU_WEST",   "raw": 60, "kept": 38, "sample": [...] },
    ...
  ],
  "totalUnique": 312,
  "afterDomainFilter": 280
}
```

Implementation notes:
- Lives under `/api/public/*` so it's reachable on the published site without auth.
- Input validated with Zod (`brand` 1–120 chars, `scope` enum, `country` optional 2–20 chars).
- Reuses `searchRegion` and the same region tables from `search.server.ts` — refactor those into named exports so the diagnostic route can import them without duplicating geography.
- Caps `sample` at 3 names per region; no PII, just location names.
- Requires `GOOGLE_PLACES_API_KEY`; returns 503 if missing.

### 3. Refactor for shared geography

Move `COUNTRY_BOUNDS`, `COUNTRY_SUB_REGIONS`, the global `regions` array, `searchRegion`, `mapPlace`, and `filterByDominantDomain` into named exports so both `searchGooglePlaces` and the diagnostic route consume the same tables. No behavior change for the existing flow.

## Verification

1. Call `/api/public/brand-coverage?brand=Starbucks&scope=global` — expect non-zero `kept` counts across NA, EU, ASIA at minimum.
2. In the UI, search "Starbucks" with worldwide selected → pins visible in North America, Europe, and Asia, not just one cluster.
3. Server logs show interleaved per-region kept counts.

## Out of scope

- UI changes to `PulseMap`, HUD panels, country selector.
- Caching layer for Places results (each diagnostic call hits the API; this is an admin/debug endpoint).
- Auth on the diagnostic endpoint — it returns only public business listings; if you want it protected, say so and I'll add a shared secret header.
