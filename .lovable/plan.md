# Smoother landing → map reveal

Goal: when the user clicks **Reveal**, replace the current hard cut + late `flyTo` with a single continuous, cinematic push-through that feels like diving into a 3D earth.

## What the user will experience

1. The input bar pulses once and the landing copy gently scales up and blurs out as if the camera is pushing forward through it.
2. Behind it, the satellite map is already loaded and fades in from a high-altitude view of the earth.
3. The map immediately starts a long, eased zoom from space down to Berlin — the camera move begins *during* the landing exit, not after, so the two motions overlap.
4. HUD elements (brand pill, filters, legend, stats) fade and slide in slightly staggered once the camera is mostly settled.

No black flash, no visible "loading", no two-stage jump.

## Changes

### 1. Preload the map behind the landing
- Mount `PulseMap` as soon as the user lands on the page, hidden under the landing layer at `opacity-0`.
- This lets Leaflet initialize, satellite tiles start loading, and the first frame be ready by the time the user hits Reveal — eliminating the current init lag.

### 2. Replace the AnimatePresence hard swap with a crossfade push
- Drop `AnimatePresence mode="wait"` (which forces sequential exit→enter).
- Render both layers simultaneously during the ~1.4s transition; landing scales `1 → 1.25` + blurs `0 → 12px` + fades `1 → 0`, map scales `1.08 → 1` + fades `0 → 1`.
- Eases use the existing `[0.16, 1, 0.3, 1]` curve for consistency.

### 3. Trigger the camera dive in sync with the click
- Move the `flyTo(Berlin)` out of the map's `useEffect` and expose it via an imperative handle / prop (`shouldDive` boolean or `onReady` callback).
- Starting view becomes a high-altitude globe-ish frame (zoom ~2.5, centered roughly on the user's hemisphere) so the dive feels like coming from space.
- Single `flyTo([52.515, 13.405], 12, { duration: 2.6, easeLinearity: 0.2 })` kicked off the moment the user submits — overlaps the landing fade rather than waiting for it.

### 4. Subtle depth cues
- A brief radial "aperture" highlight emanating from the input position during the first 600ms of the transition (CSS-only, uses existing tokens).
- Vignette on the map intensifies from 0 → final value over the transition so HUD chrome doesn't pop in flat.

### 5. Stagger HUD entrance
- BrandPill, FilterControls, Legend, StatBlock, HeatReplayButton each get a 60–120ms staggered fade+rise, starting at ~70% through the camera dive.

## Technical notes

- Files touched: `src/routes/index.tsx` (remove `AnimatePresence`, render both layers, drive a `revealing` flag), `src/features/pulse/LandingScreen.tsx` (new exit variants, expose input position via a ref or fixed center), `src/features/pulse/MapApp.tsx` (accept `revealing` prop, stagger HUD), `src/features/pulse/PulseMap.tsx` (accept `dive` trigger, start view at z2.5, run `flyTo` on demand instead of after `baseLayer.once("load")`).
- Tile preloading: rely on Leaflet's existing `keepBuffer: 4` plus the early mount; no extra prefetch needed.
- Reduced motion: when `prefers-reduced-motion: reduce`, swap the dive for a 400ms crossfade and `setView` directly to Berlin at zoom 12.
- No changes to data flow, mock data, or hex rendering.
