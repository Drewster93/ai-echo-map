# Make the launch video way more dynamic (Lovable 2.0 energy)

The current cut reads as elegant but slow — long holds, gentle springs, mostly single-layer scenes. The Lovable 2.0 reference (1:20) lands because of relentless motion: nothing sits still for more than ~1s, every cut has a directional hand-off (push, zoom, whip-pan, mask wipe), UI elements physically fly into frame, and kinetic typography fills every transition. We'll port that energy onto the AI Performance Pulse storyboard without changing the narrative.

## What changes (creative)

**Pacing**
- Master length goes from 76s → ~60s. Average scene 4–6s, with 2–3 punchy 1.5–2s "stinger" beats.
- No scene holds a single composition: every shot has at least one continuous camera move (push-in, parallax, orbit, dolly) OR a layered element entering/exiting every 8–15 frames.
- Cut on motion: outgoing element's velocity is matched by incoming element's entrance vector.

**Motion language (replaces current gentle springs)**
- New default entrance: `spring({ damping: 12, stiffness: 220, mass: 0.6 })` with a 6–10px blur-to-sharp and 1.04 → 1.0 scale settle. Snappy, not floaty.
- Add a "whip" easing (`bezier(0.7, 0, 0.15, 1)`) for typography and UI panels traveling >300px.
- Hero stinger motion: overshoot 1.12 → 0.97 → 1.0 with a 2-frame motion blur smear (rendered as a stretched ghost copy at 35% opacity).
- Replace fades-between-scenes with directional transitions: mask wipes, slide-pushes, zoom-throughs, and a recurring "hex shutter" wipe (hex grid closes over scene A, opens onto scene B) as the brand-signature transition.

**Kinetic typography (new)**
- Every text block animates per-word (and key words per-character) with 2–3 frame staggers, not as a single block.
- Headlines arrive on a 3D perspective tilt (`rotateX(-15deg) → 0`) and settle.
- Numbers count up rapidly with a `tabular-nums` ticker; the counter for "4,182,560 AI prompts" runs over 24 frames with a final overshoot.
- Add full-screen "kinetic title cards" (Lovable 2.0 style): single bold word fills the frame for 18–24 frames between major beats — e.g., "BRAND-LEVEL." → "WRONG." → "LOCATION-LEVEL."

**Layered UI choreography**
- The recreated app UI no longer appears as one block. Sidebar slides in from left, topbar drops from top, map canvas scales up from center, hex tiles cascade-reveal, then a cursor flies in and triggers an interaction — all within ~1.5s.
- Add "screen-in-screen" moments: the UI shrinks into a floating card while a second UI panel pushes in from the side (regional comparison, drill-down).
- Camera continually pushes into UI hotspots so the frame never feels static. Use `transform: scale + translate` on the whole product frame, not just the elements.

**Background system**
- Persistent layer across all scenes: drifting hex constellation + soft pulse arcs already in place, but accelerated 2x and given parallax (3 depth layers moving at 0.3x / 0.6x / 1x).
- Light-leak / chromatic accent flares on every cut (1 frame white flash + 3 frame violet bloom) to sell impact.
- Occasional full-frame "scan line" sweep tied to data moments.

**Color punch**
- Same palette (`#860eff`, `#3072fc`, `#7bffff`, `#ff5b02`) but accent flashes go brighter on stingers. Add high-contrast white kinetic-type cards for breathing-room beats.

## Adapted 11-beat structure (~60s)

1. **Problem stinger (0–4s)** — Rapid-fire montage: 6 brand logos flash with "AI-visible ✓" stamps, then a globe pulls back, hex tiles dim out one region at a time. Kinetic card: "BRAND-LEVEL ISN'T ENOUGH."
2. **Meet (4–8s)** — Hex shutter opens on logo lockup; tagline whips in per-word. Camera dollies forward through the wordmark.
3. **Promise (8–13s)** — Hex grid builds tile-by-tile with cascading scale-in (8-frame stagger across 60 tiles); each tile briefly lights with a query string.
4. **Scale (13–19s)** — Counter rockets to 4,182,560; "240 countries" badge slams in; mini-globes orbit the number.
5. **Coverage montage (19–24s)** — World map with 8 location pins firing in sequence, each pin triggers a 1-frame zoom to a local hex cluster, then snaps back.
6. **Query (24–30s)** — Product UI flies in (sidebar→topbar→canvas in 12 frames), cursor lands in the input, text types out, results explode onto the map.
7. **Compare (30–36s)** — Split-screen push: two regions race, hex visibility bars fill at different speeds, a "WINNER" tag slams onto one side.
8. **Drill (36–42s)** — Camera Ken-Burns zooms into a single hex; UI panels orbit around it showing query examples, competitor share, gap score.
9. **Edge (42–48s)** — Two brand logos plotted on the same hex grid; one grid fills with brand color, the other stays dim; kinetic card: "OWN THE HEX. OWN THE MARKET."
10. **API (48–53s)** — Code editor flies in tilted on perspective; `fetch('/api/public/brand-coverage?brand=…')` types out character-by-character; JSON response cascades down; "Built for devs" stamp.
11. **CTA (53–60s)** — Hex shutter closes onto wordmark + URL. Final stinger: pulse arc explodes outward, kinetic card "AI Performance Pulse" with 3-frame motion-blur smear, hold 12 frames.

## What we'll do in build mode (technical)

- Add `remotion/src/motion/` with shared easings, spring presets, kinetic-text components (`KineticWord`, `KineticChar`, `Counter`, `TitleCard`), and a `HexShutter` transition presentation.
- Add `remotion/src/components/CutFlash.tsx` (1-frame white + 3-frame violet bloom) and `ParallaxLayer.tsx` for 3-depth background drift.
- Refactor `MainVideo.tsx` to use `TransitionSeries` with `HexShutter`, slide-push, and zoom-through transitions between scenes (no more fades).
- Rewrite each `Scene0X*.tsx` to:
  - Use the new spring/easing presets
  - Add continuous camera transform on the root `AbsoluteFill`
  - Stagger every text block per-word/char
  - Add at least 2 layered elements with independent timings
  - Drop hold times so nothing sits >24 frames without motion
- Insert 3 full-frame kinetic title cards between major beats (after Scene 1, after Scene 5, before Scene 11).
- Re-render the 1920×1080 master, then re-render the 1080×1080 (square) and 1080×1920 (vertical) adapter compositions. Adapters will need re-cropping for kinetic title cards (center-safe).
- QA: render stills at 12 frame checkpoints across the timeline and inspect every cut for visible motion-on-motion.

## Out of scope (still)
- Voiceover / music bed (can layer in after; sandbox renders muted).
- Real product screenshots (still recreated UI).
- Changes to the live app itself.

## One question before I build

Audio: do you want me to **score this with an ambient electronic bed + UI SFX via ElevenLabs** in the same pass (adds ~5 min render + costs API credits), or **deliver muted MP4s** that you'll score in your editor? The kinetic cuts are designed to hit on beat either way.
