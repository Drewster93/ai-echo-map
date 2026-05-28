## Your concern is correct — Playwright is the wrong substrate

Playwright/CDP screencast caps at JPEG-compressed frames, drops frames under load, and you fight the browser's render loop the whole time. The result looks like a screen recording, not a launch film. We need something better.

## The pivot: render the real app *inside* Remotion

The app and Remotion are both **React + Tailwind**. We can import the actual app components — `<PulseScore>`, `<LocationCard>`, `<QueryResultList>`, `<CompareBars>`, etc. — directly into Remotion scenes and feed them frame-deterministic props. Three wins stacked:

1. **Lossless 1920×1080.** Every frame is rendered by Remotion's pipeline at full quality. Zero compression artifacts, zero dropped frames, zero browser jank.
2. **Frame-perfect choreography.** Numbers tick, bars race, lists populate, the cursor lands on a button — all bound to `useCurrentFrame()` so the cut lands on the exact pixel we planned.
3. **It is the real UI.** Same components, same Tailwind classes, same shadcn primitives, same typography. When the product evolves, re-render and the film updates.

This is **strictly better than Playwright** for a launch piece. It's the move studios use when they have access to the source.

### How it works, concretely

- `remotion/src/v4/app-bridge/AppStyles.tsx` imports the project's `src/styles.css` so Tailwind tokens resolve identically.
- `remotion/src/v4/app-bridge/MockProviders.tsx` stubs the contexts the components depend on: TanStack Router (`createMemoryHistory`), TanStack Query (preloaded `QueryClient` with fixture data), Supabase client (no-op auth + cached query responses), Theme provider.
- `remotion/vite.config.ts` (the Remotion bundler hook in `render-remotion.mjs`) adds an `@/` alias to `../src/` so the same import paths the app uses keep working.
- Each scene imports the real components and wraps them: e.g.
  `<PulseScore value={useCountUp(0, 74, { from: 6, to: 36 })} />` —
  the component is unchanged, the prop is frame-derived.
- Components that hit live data (route loaders, suspense queries) get a thin Remotion adapter that takes the fixture as a prop and bypasses the loader.

### Risk + remedy

- *Some component is router-bound and can't take props directly.* Remedy: a 1-screen-per-scene approach — render the route's `component` function inside a `<MemoryRouterProvider initialEntries={["/dashboard"]}>` with preloaded query cache. Works because the components are pure functions of props/context.
- *A component imports a browser-only API.* Remedy: stub at the alias level (`vite.config` resolve alias swap for `@/integrations/supabase/client` → a `client.mock.ts`).
- *Tailwind v4 token mismatch.* Remedy: copy `src/styles.css` and the `index.css` exactly; Tailwind scans the Remotion src + the project src.

### Live-screen fallback (only if you want it)

If a specific shot demands true live behavior (e.g., a 3D map we don't want to recreate), we can deterministically capture *that one shot* via Chrome DevTools `HeadlessExperimental.beginFrame` — which steps the page frame-by-frame and emits lossless PNGs at any fps. Slow (minutes per clip) but pixel-perfect. We use it surgically, not for the whole film.

## What the film looks like (unchanged from last plan)

Same 50s, 1500f, ~28 cuts, Lovable-2.0-energy structure: cold open → 4 acts (Location-level, Query coverage, Benchmark, Monitored daily) → sign-off. Hero feature nouns smash over the live UI, scripted UV cursor, push-ins, snap-to-detail zooms, 3 surgical whip transitions, hard cuts elsewhere. Geist sans only. `#0A0A0B` canvas, single UV `#860eff` accent.

The dynamism doesn't come from the substrate — it comes from cut rhythm, kinetic type weight, and choreographed UI motion. All three are now under our direct control because the UI is in our render loop.

## Files (revised)

**New**
- `remotion/src/v4/app-bridge/AppStyles.tsx` — mounts `src/styles.css`.
- `remotion/src/v4/app-bridge/MockProviders.tsx` — Router + Query + Supabase + Theme stubs.
- `remotion/src/v4/app-bridge/fixtures/` — JSON fixtures per scene (locations, queries, scores).
- `remotion/src/v4/hooks/useCountUp.ts`, `useScripted.ts`, `useReveal.ts` — frame-derived primitives.
- `remotion/src/v4/scenes/01_Open.tsx` … `12_SignOff.tsx` — scene per beat.
- `remotion/src/v4/overlay/HeroType.tsx`, `Callout.tsx`, `Cursor.tsx`, `Whip.tsx`.
- `remotion/src/v4/MainV4.tsx`, `Stage.tsx`, `theme.ts`.

**Edited**
- `remotion/src/Root.tsx` — register `main-v4` (1920×1080, 1500f, 30fps).
- `remotion/scripts/render-remotion.mjs` — add `@/` alias + include `../src` in the webpack scan so Tailwind picks up real components.

**Not used**
- No Playwright. No `capture-app.mjs`. No `public/captures/`.
- v3 cinematic primitives stay on disk, unmounted.

## One thing to confirm before I build

To bridge the real components in cleanly, the **6 app surfaces** I'll mount need to exist in `src/`. From the route tree we have, I'll target: landing hero, dashboard pulse score, location grid, single-location drill, query results, competitor comparison, daily trend. If any of those don't have a real component yet (or live entirely in a route loader I can't bypass with a fixture), I'll flag it the moment I hit it and either (a) build a frame-perfect equivalent using the same primitives or (b) use the surgical CDP fallback for just that shot.

Approve this and I'll wire it up — bridge first, scene 1 next, render a 10s proof cut so you can sanity-check the look before I commit to the full 50s.
