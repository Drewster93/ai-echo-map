# Blind-Spot Auto-Tour — Implementation Plan

A 15-second guided camera + insight sequence that runs once after the map dive lands. Picks the user's strongest, weakest, and most-fixable city from the data, eases to each, dims the rest, and shows one line of copy per stop. Skippable, replayable.

## UX spec

### Lifecycle

```text
Landing → Dive (1.8s flyTo) → moveend
                              → paintData() (existing)
                              → 700ms settle delay
                              → Tour starts
                              → Stop 1 → Stop 2 → Stop 3
                              → Outro (ease back to bounds + summary)
                              → "Replay tour" pill stays in HUD
```

### Stop structure (each ~3.8s)

| Beat     | Duration | What happens                                                                 |
| -------- | -------- | ---------------------------------------------------------------------------- |
| Ease     | 1200ms   | `map.flyTo([lat,lng], 11, { duration: 1.2, easeLinearity: 0.25 })`           |
| Focus    | 300ms    | Non-target hex cells fade fillOpacity → 0.12, stroke opacity → 0.15. Target hex stays 100%, gains a 2px cyan ring. |
| Insight  | 2000ms   | Insight card fades in (opacity + 6px y), anchored top-center under HUD       |
| Handoff  | 300ms    | Insight card fades out, all hexes restore to baseline opacity                |

Total per stop: ~3800ms. Three stops: ~11.4s. Plus 700ms pre-roll + 1200ms outro = ~13.3s end-to-end.

### Outro

- `map.flyToBounds(initialBounds, { padding: [120, 120], duration: 1.2 })`
- Summary line fades in bottom-center for 3s: *"You're strong in 1 of 3 markets. Fix {weakestCity} first."* with secondary "Replay tour" pill that persists in HUD afterward.

### Skip / cancel behavior

The tour cancels immediately on any of these user events:

- `map` event: `mousedown`, `wheel`, `touchstart`, `dragstart`, `zoomstart` (user-initiated only — programmatic flyTo from the tour itself must not cancel)
- Click on any hex (`onHexSelect` fires with non-null h3)
- Filter change (`assistant` or `range` changes while playing)
- Close detail panel via Escape

On cancel:
- Stop the current `flyTo` (`map.stop()`)
- Cancel any pending `setTimeout` / `requestAnimationFrame` for the next stop
- Restore all hex opacities to baseline (re-render with `selectedHex` state untouched)
- Hide insight card
- Show "Replay tour" pill in HUD

To distinguish programmatic vs user motion: set `isProgrammaticMoveRef.current = true` before each tour `flyTo`, clear it on the `moveend` for that flight. Cancel handlers check this flag and ignore programmatic moves.

### Replay

- "Replay tour" pill sits next to `HeatReplayButton` in HUD
- Clicking it re-runs the full sequence from Stop 1
- Pill disabled while tour is running

### Reduced motion

`prefers-reduced-motion: reduce`:
- Skip pre-roll delay
- Each stop: `map.setView(target, 11)` instead of flyTo, hold insight card for 2200ms, no opacity dimming on hexes
- No outro flyTo — just hold final bounds

## Insight selection logic

A pure function `selectTourStops(locations, scoreFor)` returns `TourStop[]` of length ≤ 3. Computed once at tour start so filter state at that moment is locked in.

```ts
interface TourStop {
  kind: "stronghold" | "blindspot" | "opportunity";
  city: "Berlin" | "Paris" | "London";
  center: [number, number];        // avg lat/lng of city's locations
  headline: string;                // e.g. "Berlin — your stronghold"
  insight: string;                 // e.g. "You appear in 14/20 prompts. Top 3 in 9."
}
```

Aggregation: group locations by `city`. For each city compute:
- `avgScore` = mean of `scoreFor(loc)` across its locations
- `promptCount` = sum of `loc.prompts.length`
- `mentionedCount` = sum of prompts where `status === "mentioned"`
- `competitorHigherCount` = sum where `status === "competitor_higher"`
- `notMentionedCount` = sum where `status === "not_mentioned"`
- `center` = mean of lat/lng

Selection:
1. **Stronghold** = city with highest `avgScore`. Insight: *"You appear in {mentioned}/{prompts} prompts. Top 3 in {topThreeApprox}."* (Use `mentioned` as proxy for top 3 since we don't have rank in mock data — phrase as "leading in" if needed.)
2. **Blindspot** = city with lowest `avgScore` AND `notMentionedCount > mentionedCount`. Insight: *"High local intent — you're invisible in {notMentioned}/{prompts} prompts."*
3. **Opportunity** = remaining city. Insight: *"Mentioned in {mentioned}/{prompts} — one content push from leading."*

If fewer than 3 cities exist, drop stops in reverse priority (opportunity first, then blindspot). If a city has zero prompts, skip it.

## Files & structure

### New files

- `src/features/pulse/tour/useBlindSpotTour.ts` — hook that owns the state machine
- `src/features/pulse/tour/selectTourStops.ts` — pure selection logic + unit-testable
- `src/features/pulse/tour/TourInsightCard.tsx` — top-center insight card
- `src/features/pulse/tour/TourOutroSummary.tsx` — bottom-center summary line + CTA pill
- `src/features/pulse/hud/ReplayTourPill.tsx` — HUD button

### Modified files

- `src/features/pulse/PulseMap.tsx`
  - Expose imperative handle via `forwardRef` with: `flyTo(center, zoom, opts)`, `flyToBounds(bounds, opts)`, `stop()`, `setHexFocus(targetCityCenter: [number,number] | null, radiusKm: number)`, `getInitialBounds()`
  - `setHexFocus`: when a center is set, re-render hexes with non-focused cells at fillOpacity 0.12 / stroke 0.15 / no glow filter; focused cells full. When null, restore.
  - Fire callback `onArrived()` once after the initial dive's `moveend` (replaces inline behavior; MapApp uses this to kick off the tour).
  - Track `isProgrammaticMoveRef` and expose `onUserInteract` callback to MapApp.
- `src/features/pulse/MapApp.tsx`
  - Add `tour` state from `useBlindSpotTour({ mapRef, locations, scoreFor })`
  - Mount `<TourInsightCard>` when `tour.currentStop`
  - Mount `<TourOutroSummary>` when `tour.phase === "outro" | "done"` (first time only)
  - Mount `<ReplayTourPill>` once `tour.phase === "done"`
  - Cancel hooks: pass `tour.cancel` to map user-interact handler, to `setSelectedHex` (when value non-null and tour active), and to `useEffect` watching `[assistant, range]`.

### Hook: `useBlindSpotTour`

State machine:

```text
phase: "idle" | "preroll" | "stop" | "outro" | "done" | "cancelled"
currentStopIndex: 0 | 1 | 2
currentStop: TourStop | null   // null during preroll/outro/done
```

Transitions:
- `start()` from `idle` or `done`: compute stops, set `phase=preroll`, schedule `phase=stop, idx=0` after 700ms.
- On entering each stop: call `map.flyTo`, then `map.once("moveend")` schedule insight visible for 2000ms, then 300ms handoff, then next stop or `phase=outro`.
- On `outro`: `map.flyToBounds(initialBounds)`, on `moveend` set `phase=done`.
- On `cancel()`: clear all timers, `map.stop()`, set `phase=done` (so replay pill shows).

All timers stored in a ref array; cleanup on unmount and on `cancel()`.

### Insight card

```tsx
// TourInsightCard.tsx — absolute positioned, z-30
<motion.div
  key={stop.kind}                          // re-mount per stop = clean fade
  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
  exit={{ opacity: 0, y: -4, filter: "blur(4px)" }}
  transition={{ duration: 0.45, ease: [0.16,1,0.3,1] }}
  className="absolute left-1/2 top-28 z-30 -translate-x-1/2 max-w-md"
>
  <div className="glass rounded-2xl px-6 py-4 text-center">
    <div className="font-display text-xs uppercase tracking-widest text-cyan-300/80">
      {stop.kind === "stronghold" ? "Your stronghold"
       : stop.kind === "blindspot" ? "Your blind spot"
       : "Your opportunity"}
    </div>
    <div className="mt-1 font-display text-2xl text-white">{stop.city}</div>
    <div className="mt-2 text-sm text-white/80">{stop.insight}</div>
  </div>
</motion.div>
```

Wrapped in `AnimatePresence mode="wait"` in MapApp so successive stops cross-fade cleanly.

### Hex dim during stop

In `PulseMap.renderHex`, accept a `focus` argument: `{ center: [number,number], radiusKm: number } | null`. When set:
- For each cell, compute distance from its centroid to focus center
- If `> radiusKm`: fillOpacity `0.12`, stroke opacity `0.15`, drop the multi-pass glow filter
- If `<= radiusKm`: render normally + add 2px `#7BFFFF` ring on the closest cluster

`radiusKm` defaults to 40 (covers a metro area). Re-render happens via existing `useEffect` on `cellKey`/`selectedHex` — extend to also depend on `focusKey`.

## Edge cases

- **Tour starts before map fully ready**: hook waits for `onArrived` callback from PulseMap before transitioning out of `preroll`.
- **Filters change mid-tour**: tour cancels, dim restores, replay pill appears. Insights are stale anyway.
- **User clicks hex during tour**: tour cancels; detail panel opens normally.
- **Single-city data**: only one stop runs, then outro skips the bounds zoom (already at the right view) and goes straight to summary.
- **`prefers-reduced-motion`**: as specified above.
- **Tour replay after detail panel was opened**: closing detail panel doesn't auto-replay; user must click pill.

## Out of scope (explicit non-goals)

- No tilted/3D camera
- No pulsing animations on hexes (intensity-only baseline preserved)
- No audio
- No persistence across reloads — tour runs on every fresh landing
- No A/B variants of insight copy
