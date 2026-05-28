
# Launch Video v3 — "From Brand to Location. From Guesswork to a Pulse."

## Why v2 doesn't land yet

Watching v2 as a videographer:
- Pacing is even, not edited. No "punch in, hold, breathe, smash-cut" rhythm.
- Camera is monotonic — every scene gets the same gentle zoom. No dolly, no whip-pan, no rack-focus, no parallax.
- The brand→location pivot is *said* (title cards) but never *shown* as one continuous visual transformation.
- The "pulse" metaphor is a passive background, not a heartbeat the viewer feels.
- The product UI is recreated but never used as a hero — no fly-through, no cursor, no live query.
- 11 scenes / 68s = too long for a hook reel.

## The new film — director's treatment

**Logline:** *"Brand-level visibility is a vanity number. The real signal lives location by location — and you can finally feel its pulse."*

**Length:** 50s master (1500f @ 30fps). 6 acts, 12 shots, average shot ~4s, two 1s stingers.

**Aesthetic:** Dark cosmic pushed cinematic — anamorphic letterbox mattes on hero moments (2.39:1), volumetric light beams, particulate dust, chromatic aberration on cuts, 3-frame motion-blur ghost trails, grain overlay throughout. Palette: ultraviolet `#860eff` + aqua `#3ce0d8` + plum + hot-coral `#ff5a4a` for "danger/blindspot" beats. Type: Fraunces (display, italic on emotional words) + IBM Plex Sans (UI).

**Camera grammar (the missing piece):**
1. Dolly-in — opening tension
2. Whip-pan with motion blur — brand→location pivot
3. Orbit — globe / scale beat
4. Rack focus — pulse drill
5. Crane down — into a single hex
6. Hero pull-out — final logo lockup

## The 6 acts (shot list)

```text
ACT 1 — HOOK (0:00–0:06)   [180f]
  Shot 1.1  Black. A single white dot pulses at center. One word fades in: "VISIBILITY."
  Shot 1.2  Dot explodes into a sphere of city-light particles.
            CUT TO white frame (3f) — "But where?" in tight Fraunces italic.

ACT 2 — THE LIE OF BRAND-LEVEL (0:06–0:14)   [240f]
  Shot 2.1  Hero stat: massive "87%" odometer counter rolls up.
            Subtitle: "AI visibility score"   Small caps: "BRAND AVERAGE".
  Shot 2.2  Whip-pan LEFT. 87% shatters into 200+ location tiles, each with its own score:
            12%, 94%, 3%, 71%... most red. Stinger type: "THE AVERAGE LIED."

ACT 3 — THE PIVOT (0:14–0:22)   [240f]
  Shot 3.1  Anamorphic bars drop. Dolly into one red tile → it becomes a neighborhood
            map; hex grid materializes.
  Shot 3.2  Three stacked lines whip in:
              "BRAND-LEVEL"      (struck through, coral)
              "→ LOCATION-LEVEL" (aqua, overshoot)
              Tagline: "Where AI actually sends customers."

ACT 4 — MEET THE PULSE (0:22–0:33)   [330f]
  Shot 4.1  Wordmark assembles letter-by-letter with chromatic split:
            "AI Performance Pulse". Tagline crawls under.
  Shot 4.2  Live UI fly-through (recreated app):
            sidebar slides in → topbar drops → globe materializes →
            cursor enters → types "best italian restaurant near me" →
            hex map blooms with mention-rate colors → KPI cards count up.
            Choreographed in ~8s, no static frame >0.3s.

ACT 5 — THE PULSE METAPHOR (0:33–0:43)   [300f]
  Shot 5.1  Rack-focus from UI to a single hex tile. Hex expands fullscreen →
            becomes an EKG line. EKG pulse syncs with arcs radiating across a city map.
            Stinger card: "FEEL EVERY LOCATION'S HEARTBEAT."
  Shot 5.2  Three competitor logos as ghost-pulses around the hex; ours pulses brightest.
            Caption: "Yours vs. theirs, block by block."

ACT 6 — THE NO-BRAINER CLOSE (0:43–0:50)   [210f]
  Shot 6.1  Crane-out from the hex through city → country → globe →
            globe collapses into the product logo mark.
  Shot 6.2  Hero lockup: "AI Performance Pulse"
            Tagline: "Local AI visibility. Mapped. Measured. Won."
            URL ghost-fades; 8-frame coral underline whip. Final 12-frame hold (only hold in the film).
```

## What gets built / refactored

**Delete:** current Scenes 01–11, three TitleCard interludes, current `MainVideo` Series layout. (Old "API / for developers" beat — removed entirely.)

**Replace `MainVideo.tsx`** with a 6-act `TransitionSeries` using mixed transitions (whip-pan, hex-shutter, rack-focus dissolve, crane-zoom).

**New cinematic primitives** under `remotion/src/motion/`:
- `CameraRig.tsx` — composable transforms: dolly, orbit, crane, whipPan, rackFocus.
- `MotionBlurTrail.tsx` — 3-frame ghost trail for >300px travel.
- `AnamorphicBars.tsx` — top/bottom mattes that drop in for hero shots.
- `Grain.tsx`, `Vignette.tsx`, `ChromaticSplit.tsx`, `LightLeak.tsx` — always-on film overlays.
- `Heartbeat.tsx` — EKG line + radial pulse, synced to shared `bpm`.
- `Counter.tsx` — odometer-style rolling digits with overshoot.
- `KineticLine.tsx` — line-by-line whip-in with per-word stagger and italic accents.

**New shot components** under `remotion/src/shots/` (one file per shot, 12 files), composed by `MainVideo.tsx`.

**Upgrade `ProductFrame`** — scripted cursor, live-typed query, animated hex bloom with counting KPIs (Act 4.2).

**Upgrade `MapGlobe`** — orbit camera + city-light particles (Act 1.2 + Act 6.1 crane).

**Persistent layers** (full-duration): `PulseArcBg` (kept), `Grain`, `Vignette`, `LightLeak` triggered at act boundaries.

**Adapters:** `SquareVideo` re-crops with safe-area pads for Act 4.2 UI; `VerticalVideo` reflows kinetic type as stacked lines, tighter crops on globe/hex.

**Timing additions** in `easings.ts`: `WHIP` (Bezier 0.85, 0, 0.05, 1), `CINE_IN` (damping 14, stiffness 160), `OVERSHOOT` (damping 8, stiffness 240). Scene cuts: 2-frame coral/aqua flash. Act-boundary cuts: 6-frame hex-shutter wipe.

**Render:** master 1920×1080 @ 30fps, 1500 frames (50s), then square + vertical. QA stills at f=0, 90, 180, 300, 420, 540, 720, 900, 1080, 1260, 1400, 1499.

## Out of scope

- Audio bed + SFX (mute MP4 only — say the word if you want ElevenLabs voiceover/SFX this pass).
- Real screen recordings — UI stays a high-fidelity recreation.
- No changes to the live web app.
- No "API for developers" act (removed).

## One creative call before I build

Coral "danger" accent `#ff5a4a` for the "brand-level lied" beats — okay to introduce, or stay strictly within UV/aqua/plum?
