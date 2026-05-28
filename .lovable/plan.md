# Pulse Launch v6 — Lovable-Style Cinematic Edit

Building on the raw Playwright capture already saved at `remotion/public/captures/full-flow.mp4`. The goal: match the rhythm, camera language, and visual energy of the Lovable launch video (https://www.youtube.com/watch?v=xDwR1_vrIg8). No music in this pass — you'll layer Suno audio after.

## What the Lovable video actually does (so we can mirror it)

Watching the reference, the recurring techniques are:
1. **Aggressive punch-zooms** into UI details (cursor, input field, single button) — not slow pans, sharp cuts that snap to 1.4–1.8x scale on a beat.
2. **Macro inserts** — extreme close-ups of one UI atom (a chip, a toggle, a single line of streaming text) cut between wider shots.
3. **Whip-pan / motion-blur transitions** — horizontal blur swipe between scenes, ~6 frames.
4. **Kinetic type stings** — 1–3 word phrases slammed full-bleed between UI shots (display serif + mono caption), held 18–24 frames.
5. **Cursor as character** — the cursor leads the eye; camera follows the cursor with subtle parallax.
6. **Color washes** — brief 4–8 frame full-bleed color flashes (UV, coral, lime) on hard cuts to punctuate beats.
7. **Speed ramps** — interaction starts slow, accelerates into the result, then holds.
8. **Letterbox push** — 2.39:1 bars slide in for "cinematic" hero beats, slide out for UI beats.

## v6 Structure (38s @ 30fps = 1140 frames)

```text
00:00–00:03  COLD OPEN          wordmark + UV chromatic split, letterboxed
00:03–00:05  STING #1           "FIND SIGNAL." kinetic type, coral flash
00:05–00:11  QUERY              real typing capture, punch-zoom on caret
00:11–00:13  STING #2           "IN NOISE." kinetic type, aqua flash
00:13–00:19  MAP BLOOM          real map, slow push-in + parallax on pulses
00:19–00:22  MACRO INSERT       extreme zoom on one location pulse, lime glow
00:22–00:28  LOCATION CARD      whip-pan in, scroll metrics, cursor-led pan
00:28–00:31  AI ANSWERS         streaming text macro, speed-ramp
00:31–00:34  BENCHMARK          bar chart reveal, coral burst on winner
00:34–00:37  PULSE MONITORING   sparkline + alert toast, lime pulse
00:37–00:38  SIGN-OFF           snap-zoom to wordmark, hex grid bloom, hold
```

Total runtime ~38s. Cuts average 0.9s. Longest hold 2.5s (map bloom).

## Camera language (applied per scene)

- **Default move:** subtle 1.00→1.06 push-in over the scene's duration (sinusoidal ease, never linear).
- **Punch-zoom:** on hard beats, snap from 1.0 to 1.5–1.8 in 4 frames with spring `{damping: 12, stiffness: 220}`, then drift back to 1.4 over the remainder.
- **Cursor-follow parallax:** background offset = cursor position × -0.04, foreground UI = cursor × -0.01.
- **Whip-pan transition:** 6-frame horizontal translate (±400px) with motion blur SVG filter, between scenes 2↔3, 5↔6, 7↔8.
- **Letterbox:** 80px black bars slide in over 8 frames for stings and sign-off only.

## Overlay system (Remotion layers on top of captures)

1. `<ParallaxVideo />` — wraps the raw `full-flow.mp4`, applies camera transforms per shot using `<Sequence>` + `useCurrentFrame`.
2. `<KineticSting />` — full-bleed stings (huge display serif word + mono caption), color flash background.
3. `<MacroInsert />` — crops a region of the source video, scales to fill, adds vignette + accent glow.
4. `<WhipPan />` — transition layer, motion blur + translate.
5. `<ColorFlash />` — 4–8 frame solid color overlay on beats.
6. `<BrandOverlay />` — wordmark + corner pills, persistent on stings only.
7. `<Letterbox />` — animated 2.39:1 bars.
8. `<HexBloom />` — sign-off accent, SVG hex grid blooming outward.

## Palette (locked from v5)
- Deep Plum `#0B0418` (base)
- UV `#A855F7` (primary accent)
- Aqua `#22D3EE` (secondary)
- Sunset Coral `#FB7185` (warm accent / winner beats)
- Lime Glow `#A3E635` (positive signal / alerts)
- Ivory `#F5F1EA` (type)

## Typography
- Display: **Instrument Serif** (loaded via `@remotion/google-fonts/InstrumentSerif`) — for stings and sign-off
- Body / mono: **JetBrains Mono** (loaded via `@remotion/google-fonts/JetBrainsMono`) — for captions, timestamps, chip labels

## Files to create

```text
remotion/src/PulseLaunchV6.tsx                   # New composition, 1140 frames @ 30fps, 1920x1080
remotion/src/Root.tsx                            # Register v6 composition
remotion/src/scenes/                             # 10 scene wrappers, each a <Sequence>
  00-ColdOpen.tsx
  01-Sting1.tsx
  02-Query.tsx
  03-Sting2.tsx
  04-MapBloom.tsx
  05-MacroPulse.tsx
  06-LocationCard.tsx
  07-AIAnswers.tsx
  08-Benchmark.tsx
  09-PulseMonitor.tsx
  10-SignOff.tsx
remotion/src/layers/
  ParallaxVideo.tsx                              # Camera transforms on captured footage
  KineticSting.tsx                               # Full-bleed type stings
  MacroInsert.tsx                                # Region crop + scale
  WhipPan.tsx                                    # Transition primitive
  ColorFlash.tsx                                 # Beat punctuation
  Letterbox.tsx                                  # Cinematic bars
  HexBloom.tsx                                   # Sign-off accent
  BrandOverlay.tsx                               # Wordmark + pills
remotion/scripts/render-v6.mjs                   # Programmatic render → /mnt/documents/pulse-launch-v6.mp4
```

## Capture additions (small)
The existing `full-flow.mp4` covers the main flow but we need two extra micro-captures for the macro inserts (single pulse close-up, streaming text close-up). I'll extend `remotion/scripts/capture-full.ts` to also emit:
- `captures/macro-pulse.mp4` (3s, tight viewport over one map pulse)
- `captures/macro-stream.mp4` (3s, tight viewport over streaming text)

## Render
- Muted (no audio in this pass — you'll mux Suno track in afterwards).
- Output: `/mnt/documents/pulse-launch-v6.mp4`
- Concurrency 1 (sandbox Chromium), h264, CRF 18.

## Out of scope for this pass
- Music (you'll do Suno)
- Voiceover
- Final audio mux (trivial ffmpeg one-liner once you have the track)
