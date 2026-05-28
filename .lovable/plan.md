# Pulse Launch Trailer v5 — Real App Recordings, Cinematic Edit

## What changes vs v4

| | v4 (now) | v5 (this plan) |
|---|---|---|
| Source footage | Remotion rebuilds UI from scratch | **Headless Chromium records the real app** |
| Interactions | Hand-animated `interpolate()` | **Scripted Playwright: real typing, real hovers, real clicks, real scroll** |
| Cursor | Faked SVG dot | **Synthetic cursor injected into the live page, follows real `page.mouse` paths with easing** |
| Palette | Mono dark (gloomy) | **Vibrant: Deep Plum base + UV magenta + Aqua + Sunset Coral accents** |
| Cuts | Slow 1.4s avg | **Fast 0.6–1.2s avg, beat-locked to music** |
| Audio | None | **Dark-electronic royalty-free track with a drop at the brand reveal** |

## Visual direction — "Next-gen, not gloomy"

Reference: Lovable 2.0 launch (fast cuts, real product, kinetic type stings, glowing accents on motion).

**Color system (added to `src/styles.css` behind a `[data-demo]` flag — never touches production look):**
- Base: Deep Plum `#0B0418`
- Primary: UV `#A855F7`
- Accent 1: Aqua `#22D3EE` (data, success, sparkline)
- Accent 2: Sunset Coral `#FB7185` (alerts, deltas, focus rings)
- Accent 3: Lime Glow `#A3E635` (positive scores, "live" badges)
- Surface tint shifts hue subtly per shot — purple in shot 2, cyan in shot 4, coral in shot 7 — so each beat feels different.

**Motion register:**
- Glow trails on cursor moves
- Soft bloom on hover states
- Card lifts use UV-tinted shadows
- Parallax push-ins at every cut (Premiere-style "transform zoom" baked into the Remotion composite layer)

## Pipeline

```text
1. Demo-mode app prep
   └── ?demo=1 flag: vibrant palette, hidden chrome, seeded data, slowed animations
   └── /demo-shots/* routes that pre-stage each shot perfectly
2. Playwright capture (headless Chromium, 1920x1080, 30fps)
   └── 8 scripted shots, each in its own context with recordVideo
   └── Synthetic cursor injected via init script
   └── ffmpeg trims/converts WebM -> MP4
3. Remotion composite layer
   └── Imports the 8 MP4s as <Video>
   └── Adds: parallax push-ins, kinetic-type stings between shots,
            wordmark/pill overlays, snap-zoom punches on key moments,
            chromatic-aberration flash on cuts, glow vignette
   └── Audio bed mixed in
4. Render -> /mnt/documents/pulse-launch-v5.mp4
```

## The 8 shots (40s, beat-locked)

```text
00:00–00:03  COLD OPEN
  Black -> PULSE wordmark smash with UV chromatic split + bass drop
  (Remotion-only, no recording)

00:03–00:08  LANDING + QUERY
  Real /demo route. Cursor glides to search bar, types
  "where does AI send people for coffee in Brooklyn?"
  UV glow follows the caret. Submit -> aqua shimmer fires.

00:08–00:13  MAP BLOOM
  Real map component loads. Cursor pans. City zooms in.
  Hex tiles light up coral->aqua->lime by score.
  Snap-zoom into Lumen Coffee node.

00:13–00:19  LOCATION CARD
  Real LocationDetail component opens with spring.
  Cursor hovers ChatGPT row -> aqua tooltip lifts.
  Score badge ticks 87 -> 92 with lime pulse.

00:19–00:25  AI ANSWERS STREAMING
  Real query results panel. Three provider columns stream text
  in parallel (real component, real typing animation, slowed 0.7x).
  Source citations flip in.

00:25–00:30  BENCHMARK
  Real competitor bar chart. Bars race up coral/aqua/UV.
  Cursor hovers "+34% vs avg" -> coral burst.

00:30–00:35  PULSE MONITORING
  Real sparkline draws (aqua). Alert toast slides in
  with lime "MONITORED DAILY" badge. Subtle screen-shake on impact.

00:35–00:40  SIGN-OFF
  Snap-zoom out from dashboard, hex-grid bloom across screen,
  wordmark resolves with "Available now" coral pill.
```

## Technical decisions

- **Playwright over Puppeteer** — better video recording API, easier cursor injection
- **Recording at 30fps, not 60fps** — headless Chromium without GPU can stutter at 60; 30fps locked is cleaner
- **Each shot in its own browser context** — isolated, re-runnable independently
- **Synthetic cursor** — small UV dot with motion-blur trail, injected via `page.addInitScript`, follows mouse coords with 80ms ease-out
- **Demo palette via `[data-demo="1"]` attribute on `<html>`** — vibrant tokens override production tokens, only when query flag present, zero risk to real app
- **Speed ramps in ffmpeg** — some shots recorded at 1.0x then sped 1.2–1.5x for snap; others slowed 0.7x for hero moments
- **Music**: I'll source 2 candidates from Uppbeat / Pixabay, both ~95 BPM with a drop at 2.7s for the wordmark hit. You pick.

## File plan

```text
remotion/scripts/
  capture-shots.ts          # Playwright orchestrator
  shots/
    01-wordmark.ts          # (no-op, Remotion handles)
    02-landing.ts
    03-map.ts
    04-location.ts
    05-answers.ts
    06-benchmark.ts
    07-pulse.ts
    08-signoff.ts
  cursor.inject.ts          # Synthetic cursor + glow trail
  demo-mode.css             # Vibrant override tokens
remotion/public/captures/   # MP4 outputs land here
remotion/src/
  PulseLaunchV5.tsx         # New composition
  layers/
    ParallaxVideo.tsx       # Wraps captured MP4 with push-in
    KineticSting.tsx        # Between-shot type cards
    BrandOverlay.tsx        # Wordmark, pill, vignette
src/routes/
  demo.tsx                  # Pre-staged demo entry routes
  demo.$shot.tsx
src/styles.css              # +[data-demo] vibrant token block
```

## What I will deliver on approval

1. Demo-mode infrastructure (routes, vibrant palette, synthetic cursor, seed data)
2. 8 Playwright shot scripts, re-runnable any time
3. Remotion v5 composition with parallax + stings + overlays + audio
4. 2 music candidates in `/mnt/documents/music/` with license + the one I'd pick
5. Final render at `/mnt/documents/ai-performance-pulse-launch-v5.mp4`

## What could go wrong (and how I'll handle it)

- **Map component uses Mapbox/WebGL and stutters in headless** → fall back to the existing Remotion HexGrid for that one shot, composite over a still screenshot of the real map
- **Fonts flash on first paint** → preload via `page.evaluate(() => document.fonts.ready)` before recording starts
- **Recording drifts off-beat** → all shots recorded with explicit frame budgets; Remotion timeline snaps to fps grid

## One question before I build

Should I go ahead with this plan as written, or do you want to lock the **palette** first (I can render 3 still mockups of shot 4 with different vibrant palettes so you choose before I wire it through every shot)?
