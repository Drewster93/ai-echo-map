## Goal

Replace `MOCK_LOCATIONS` with a real flow: GBP onboarding → Google Places resolves the brand and its locations → each picked location's **website URL from Places** is sent to the AI Visibility API → per-location results drive the existing map and detail panel. This gives genuine local-GEO differentiation across locations.

## 1. Onboarding screen (`/start`)

- New `src/routes/start.tsx` becomes the entry point. `/` reads brand state and redirects to `/start` if empty.
- Single search input → Google Places **Autocomplete (New)** (`PlaceAutocompleteElement`) in the browser, restricted to `types: ['establishment']`.
- User picks a suggestion → we capture `displayName`, `websiteUri`, `id` (place_id) — this is the **brand anchor**.
- Confirmation card: brand name, website domain, "Find my locations" CTA.

## 2. Find brand locations (Places Text Search)

Server fn `findBrandLocations({ displayName, anchorPlaceId, anchorWebsite })` in `src/lib/places.functions.ts`:

1. Calls Places **Text Search (New)** via the Google Maps connector gateway with `textQuery = displayName`, requesting field mask: `places.id,places.displayName,places.websiteUri,places.formattedAddress,places.location,places.userRatingCount,places.rating,places.addressComponents`.
2. Paginates up to ~3 pages (~60 results).
3. Filters to true matches:
   - Same registrable domain as `anchorWebsite` (compare eTLD+1) when the place has a `websiteUri` — strongest signal.
   - Fallback: fuzzy `displayName` match (token-set ratio) to handle franchise locations without websites.
4. Returns `Location[]` with `{ id, name, city, address, lat, lng, websiteUri, rating, userRatingCount }`.

## 3. Smart sampling (cost + latency control)

Reason: AI Visibility API is ~95s and paid per call. We sample down to a representative set before calling.

`src/lib/citySampling.ts`:

1. **Always include the anchor** location the user picked.
2. **Geographic clustering**: round each location's coords to ~0.5° lat/lng; keep at most one per cluster.
3. **Flagship per cluster**: score by `log(1 + userRatingCount) * (1 + cityPopulationWeight)`. City population from a small bundled `cities.json` (top ~300 cities); falls back to rating-only.
4. **Cap**: `MAX_LOCATIONS` default **5**, exposed as a UI slider 3–8.
5. Show the user "Analyzing 5 of 47 — flagship stores across New York, London, Tokyo…" before kicking off calls.

## 4. Per-location AI Visibility calls

Server fn `fetchAIVisibility({ url })` in `src/lib/aiVisibility.functions.ts`:

- POSTs to `https://ai-lead-magnet.up.railway.app/api/v1/ai-visibility` with `x-api-key: process.env.AI_VISIBILITY_API_KEY`, body `{ url }`, 120s timeout.
- Returns the typed payload.

Orchestration in the client (TanStack Query):

- After sampling, we have N picked locations, each with a `websiteUri` from Places. We use that **per-location URL** (e.g. `brand.com/locations/berlin-mitte`) as the visibility query — that's our differentiator. If a location has no `websiteUri`, fall back to the brand domain with a city suffix as a query param.
- Fire N queries in parallel with `useQueries`, each keyed by `['ai-visibility', url]` and `staleTime: Infinity` (results are expensive, cache for the session).
- Progressive UI: as each location resolves, its map pin lights up with its real score; pending pins show a pulse animation. Detail panel for a pending location shows skeleton + ETA.
- Concurrency cap: max 3 in flight at once (config) so the gateway isn't hammered and the user sees results trickling in.

## 5. Mapping API → existing UI shape

Per location, from its AI Visibility response:

- `visibilityScore` ← `results.sov[brand] * 100`
- `scoresByAssistant` ← `results.engineSOV.{gemini, openai, perplexity}` × 100 (Claude omitted — API doesn't return it; we grey it out in the legend)
- `prompts` ← `results.promptDetails` mapped to `{ prompt, status, assistant, competitor }`:
  - `status = 'mentioned'` if any engine has `mentions[brand] === true`
  - `status = 'competitor_higher'` if not mentioned but another `allBrands` entry is in the snippet
  - else `'not_mentioned'`
  - `competitor` ← top non-brand entry from `allBrands`
- `history7d` — not provided by API; for now, generate a deterministic 7-day curve seeded by `place_id` ending at the current score (clearly labelled "trend simulated").
- `ResultsSection` (overview): aggregate across resolved locations — average SOV, summed mention counts, top competitor by frequency across `allBrands`. Real data, not mocks.
- `DetailPanel` competitors table: built from the location's own `allBrands` + `engineSOV`, so each location shows its **own** competitive ranking.

## 6. State + routing

- Zustand store `src/features/onboarding/brandStore.ts` holds `{ brand: {name, domain, anchorPlaceId} | null, picks: Location[] }`. Persisted to `sessionStorage`.
- `src/routes/index.tsx` reads the store; if no brand → `redirect({ to: '/start' })` in `beforeLoad`.
- AI Visibility queries live in component-level `useQueries` so navigation in/out of `/` doesn't re-trigger paid calls.

## 7. Secrets + connectors

- Existing **Google Maps Platform** connector covers Places New + browser autocomplete (`VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY`). I'll verify it's linked.
- Add new secret **`AI_VISIBILITY_API_KEY`** via secrets tool, used only in `aiVisibility.functions.ts`.

## 8. UX states

- `/start`: idle → autocomplete suggestions → brand picked → "Found 47 locations, analyzing 5" → CTA → map.
- `/`: map renders immediately with pending pins (pulse, muted color). As each per-location call resolves (~95s each, parallel batches of 3), pin colors update and detail panel becomes available. Top header shows "3 of 5 locations analyzed".
- Errors per location: pin turns amber + tooltip "Couldn't analyze this location — retry"; doesn't block others.
- Global errors (no Places matches, AI Visibility 401/503): toast + back to `/start`.

## Files

**New**
- `src/routes/start.tsx`
- `src/features/onboarding/BrandSearch.tsx` — Places autocomplete wrapper
- `src/features/onboarding/SamplingPreview.tsx` — shows picks before launch, lets user adjust `MAX_LOCATIONS`
- `src/features/onboarding/brandStore.ts` — Zustand + sessionStorage
- `src/lib/places.functions.ts` — `findBrandLocations`
- `src/lib/aiVisibility.functions.ts` — `fetchAIVisibility`
- `src/lib/citySampling.ts` + `src/lib/data/cities.json`
- `src/lib/visibilityMapping.ts` — API payload → `Location` shape

**Modified**
- `src/routes/index.tsx` — read brand store, redirect if empty, drive `MapApp` with live data + per-location `useQueries`
- `src/features/pulse/MapApp.tsx` — accept per-location loading states; render pending pins
- `src/features/pulse/DetailPanel.tsx` — render skeleton when location is pending; otherwise use real per-location data
- `src/features/pulse/ResultsSection.tsx` — aggregate from live `Location[]` (mostly already does, just remap fields)
- `src/features/pulse/hud/TopHeader.tsx` — show analyze progress
- `mockData.ts` retained as a "Try demo data" fallback button on `/start` for offline previews

## Open question (non-blocking)

`MAX_LOCATIONS` default of **5** = ~5 parallel calls (batched 3-at-a-time, ~3-4 min total). If you want a snappier demo, drop default to **3**. Slider stays so users can push higher when they're willing to pay/wait.
