## Goal

A 45–55s launch film that **feels indistinguishable from the Lovable 2.0 video** — same rhythm, same kinetic-type grammar, same dark canvas + single UV accent — but the on-screen product is **AI Performance Pulse** and the narrative is **"see where AI mentions your brand."**

## Why prior attempts failed (and what changes)

- **Playwright captures** = JPEG-compressed, dropped frames, browser jank.
- **Real app mounted in Remotion** = Leaflet maps and Framer Motion are non-deterministic per frame.
- **Static PNG screenshots** = look like a slideshow. The Lovable video's energy comes from UI elements *moving inside the frame*, not just camera pushes over flat images.

**New approach:** Rebuild ~6 Pulse surfaces as **purpose-built Remotion components** (pure React + Tailwind, every value driven by `useCurrentFrame()`). They use the real design tokens (Deep Plum `#05030d`, UV `#860eff`, Fraunces + IBM Plex Sans, real shadcn primitives copied in) so they ARE the app visually — but they're frame-deterministic, lossless 1920×1080, and can be choreographed shot-by-shot.

A small number of legitimately complex surfaces (the Leaflet world map) stay as pre-captured PNGs and are animated with push-ins / hex blooms layered on top.

## Visual system (locked, matches Lovable)

- Canvas `#05030d` · Accent UV `#860eff` · Text `#FFFFFF` / `#A8A4B8`
- Display: Fraunces 600 (huge kinetic words). Body: IBM Plex Sans 500.
- **Hero type smash:** 12-frame ease-out scale 1.06→1.00 + opacity 0→1, hold 18f, exit 6f fade. Single word per cut. Letterforms can letterbox the UI to lower 60% or overlay full-frame.
- **Cuts:** hard cuts only. Avg shot length 1.4s. No fades between scenes (except final).
- **Camera moves:** push-in (1.0→1.08 over 24f), snap-zoom (1.0→2.5 in 8f for detail reveals), occasional whip-pan via 4-frame UV bar.
- **Cursor:** scripted UV dot that lands on real interactive targets.
- **No grain, no vignette, no chromatic aberration, no anamorphic bars.** Same restraint as Lovable.

## Narrative (8 beats, ~48s)

```text
1. Cold open      0.0–2.5s   Wordmark "PULSE" smashes onto black, UV underline draws
2. The question   2.5–7.0s   Hero type "WHERE DOES AI SEND PEOPLE?" over dim world map
3. The map        7.0–13s    Push into city → hex grid blooms → score badges pop in
4. Drill in       13–20s     Snap-zoom to one hex → location report card slides up
5. The queries    20–28s     Query list types itself, AI answers stream, rank chips land
6. The benchmark  28–36s     Competitor bars race, hero type "BENCHMARK" smashes
7. The pulse      36–44s     7-day sparkline draws, alert toast lands, "MONITORED DAILY"
8. Sign-off       44–48s     Wordmark + tagline + UV pill "Available now" → cut to black
```

Each beat = 2–4 cuts (~28 cuts total), matching Lovable's pacing.

## What gets built as Remotion components vs. captured

| Surface | Source | Why |
|---|---|---|
| Wordmark, hero type, lower-thirds, cursor, whip accents | Native Remotion | Pure motion |
| Hex grid + score badges | Native Remotion (SVG, frame-driven) | Choreographable bloom |
| Location report card | Native Remotion (copy of real card markup + tokens) | Frame-perfect entrance |
| Query list + streaming AI answers | Native Remotion (typewriter + stream sim) | Critical to feel "live" |
| Competitor comparison bars | Native Remotion (frame-driven width) | Bar race must be deterministic |
| 7-day sparkline + alert toast | Native Remotion (SVG path draw) | Stroke-dashoffset animation |
| World map base layer | Pre-captured PNG (already in `remotion/public/captures/`) | Leaflet can't render deterministically |

This is the same technique top motion studios use: **the UI you see in the film is a film-grade rebuild of the product UI**, not a live recording. It will look identical to viewers because the design tokens are identical.

## File structure

```text
remotion/src/
  Root.tsx                     edit: register "pulse-launch"
  PulseLaunch.tsx              new: 1440-frame TransitionSeries, 8 beats
  theme.ts                     edit: lock palette + type
  motion/
    HeroType.tsx               new: kinetic smash text
    Cursor.tsx                 new: scripted UV dot
    Whip.tsx                   new: 4-frame accent bar
    PushIn.tsx                 new: camera push wrapper
    SnapZoom.tsx               new: detail zoom wrapper
  shots/
    01-Wordmark.tsx
    02-Question.tsx
    03-MapBloom.tsx            uses public/captures/world-map.png
    04-HexDrill.tsx
    05-LocationCard.tsx
    06-QueryStream.tsx
    07-BenchmarkBars.tsx
    08-Sparkline.tsx
    09-Signoff.tsx
  ui/                          new: film-grade rebuilds of Pulse UI
    HexGrid.tsx
    ScoreBadge.tsx
    LocationReportCard.tsx
    QueryRow.tsx
    AnswerStream.tsx
    CompetitorBar.tsx
    Sparkline.tsx
    AlertToast.tsx
```

All v3/v4 cinematic primitives stay on disk untouched. New composition id: `pulse-launch`. Renders to `/mnt/documents/ai-performance-pulse-launch-v4.mp4`.

## Honest answer to "is this possible?"

**Yes, very close to identical.** The Lovable video's signature is (a) kinetic typography rhythm, (b) restrained palette + type, (c) UI elements that animate *inside* the frame, (d) hard cuts at 1–2s intervals. All four are reproducible with this approach. The one thing we won't match perfectly is shots of complex live interactions (map pan/zoom in Lovable's editor) — for our equivalent (Leaflet world map) we'll fake the push-in with a captured PNG, which reads as identical at video resolution.

## Open question

Confirm the **8-beat narrative above** matches the story you want to tell. If you'd rather lead with "competitor benchmark" or "daily monitoring" instead of "the map," I'll reorder the beats before scaffolding.