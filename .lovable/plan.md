# AI Performance Pulse — Launch Video (Plan)

A code-rendered Remotion video that mirrors the reference storyboard but reframes every beat around the product's thesis: **brand-level AI visibility is dead — the next edge is location-level AI visibility.** Rendered in three aspect ratios from a single project so the same master can ship to YouTube, the website hero, LinkedIn feed, and vertical (Reels / LinkedIn mobile).

---

## 1. Creative direction

**Thesis baked into every scene:** AI assistants (ChatGPT, Perplexity, Gemini, Claude) recommend places hex-by-hex, store-by-store — not brand-by-brand. Winners will be the ones who can *see* and *fix* their local AI presence.

**Aesthetic:** Dark cosmic (matching the live app) + Uberall pulse arcs.
- Background: `#05030d` → `#260e5a` radial, with drifting pulse arcs (reuse the `PulseArc` motif)
- Accents: ultraviolet `#860eff`, tech blue `#3072fc`, aqua `#7bffff`, orange `#ff5b02`
- Typography: **Fraunces** (display, big editorial headlines) + **IBM Plex Sans** (body/UI) + **Space Grotesk** (numbers/counters) — exactly the stack the app already uses
- Motion system: smooth spring entrances (`damping: 18`), accent pulses on hero moments, hex-grid reveals as connective tissue between scenes, no hard cuts to black

**Sound:** ambient electronic bed + tasteful UI chirps for clicks/typing and a swelling pad for the CTA. Rendered muted by default (sandbox can't encode AAC reliably); we'll either composite audio post-render via ffmpeg from a royalty-free track + ElevenLabs SFX, or ship muted with on-screen captions.

---

## 2. Adapted storyboard (11 scenes, ~75–80s master)

| # | Time | Beat | What the viewer sees |
|---|------|------|----------------------|
| 1 | 0:00–0:06 | **Problem** | Drifting glowing spheres. "Today" fades. Then: *"Brands optimize for AI visibility at the brand level."* Subtitle: *"But AI doesn't recommend brands. It recommends places."* (word "places" pulses) |
| 2 | 0:06–0:09 | **Meet** | Pulse arcs converge → "Meet" → logo lockup **AI Performance Pulse** with the Uberall arc icon |
| 3 | 0:09–0:13 | **Promise** | "Local AI visibility" → "hex by hex" → "in real time" — text scales through over a growing hex grid |
| 4 | 0:13–0:18 | **Scale** | Animated counter: *"4,182,560 AI prompts analyzed per day"* with a tiny sparkline. Subtitle: *"across 240 countries"* |
| 5 | 0:18–0:23 | **Diverse coverage** | Quick montage of recognizable brand pulses lighting up a world map: Starbucks, McDonald's, Sephora, Decathlon — each one a different continent flaring with hex coverage |
| 6 | 0:23–0:33 | **AI-powered query** (replaces "Prompt-to-UI") | Recreated landing input from the live app: cursor types **"Starbucks"** → Go. Camera zooms into the map; hexes ignite by region; the side panel slides in with mention-rate stats. This *is* the product's core interaction. |
| 7 | 0:33–0:40 | **Regional comparison** (replaces "Collaboration") | Split-globe view: North America 87% vs South-East Asia 12%. Pulsing red zones highlight blind spots. Caption: *"Spot the regions AI forgot."* |
| 8 | 0:41–0:53 | **Drill into a location** (replaces "Visual editing") | Click on a single hex → location detail panel opens showing: store name, AI mention rate, top competitors mentioned instead, recommended fixes. Numbers tick up live. |
| 9 | 0:54–1:02 | **Competitive edge** (replaces "Publish") | Two brands side by side on the same hex grid. Yours: glowing aqua. Competitor: faded. Caption builds: *"Publish" → "Fix" → "Win the hex."* Browser frame shows the live coverage dashboard on a laptop. |
| 10 | 1:03–1:11 | **API / Dev mode** | "Introducing" → "/coverage API" in glowing gradient. Toggle flips to a code editor showing a real `fetch('/api/public/brand-coverage?brand=…')` call returning JSON. Caption: *"Wire location-level AI visibility into your stack."* |
| 11 | 1:12–1:19 | **CTA** | "Now" → "Now it's your turn" → "Which hexes does AI forget about you?" Background forms the pulse-arc silhouette. Logo + URL `aiperformancepulse.com` (or chosen domain). |

---

## 3. Technical approach

**Stack:** Remotion + React + Tailwind, scaffolded under `remotion/` per the project's video-creator workflow. Single composition `main` at **1920x1080 / 30fps / ~2370 frames**, plus two adapter compositions:
- `square` — 1080x1080, scenes reflowed (headlines stacked, map cropped centered)
- `vertical` — 1080x1920, headlines top, product UI bottom

**File structure:**
```
remotion/
  src/
    index.ts, Root.tsx, MainVideo.tsx
    scenes/Scene01Problem.tsx … Scene11CTA.tsx
    components/
      PulseArcBg.tsx         # reused from src/features/pulse/PulseArc
      HexGrid.tsx            # animated h3-style hex coverage
      ProductFrame.tsx       # recreated app chrome (sidebar + map area)
      MapGlobe.tsx           # stylized globe with continent rectangles
      Counter.tsx, GradientText.tsx, SfxClick.tsx
    adapters/SquareVideo.tsx, VerticalVideo.tsx
  scripts/render-remotion.mjs   # programmatic render (sandbox-safe)
  public/fonts/                 # Fraunces, IBM Plex, Space Grotesk TTFs
```

**Product UI recreation:** the AI-query, regional comparison, drill-down, and competitive-edge scenes all rebuild the live app's chrome in Remotion (dark plum sidebar, pulse-arc header, hex map area) rather than embedding screenshots — keeps motion crisp at any resolution and lets text animate per character.

**Rendering:** programmatic render script with `chromeMode: "chrome-for-testing"`, `muted: true`, `concurrency: 1`, symlinked ffmpeg/ffprobe and patched musl compositor — per the sandbox constraints. Outputs:
- `/mnt/documents/ai-performance-pulse-launch-1080p.mp4` (YouTube / web hero)
- `/mnt/documents/ai-performance-pulse-launch-square.mp4` (LinkedIn feed)
- `/mnt/documents/ai-performance-pulse-launch-vertical.mp4` (Reels / LinkedIn mobile)

**Audio:** v1 ships muted. If desired in a follow-up, I'll generate an ElevenLabs music bed + per-scene SFX and mux them in with ffmpeg.

**QA:** spot-render stills at frames 0, 90, 240, 540, 900, 1500, 2100, 2350 with `bunx remotion still` and visually inspect before the full render. Re-render any scene that breaks.

---

## 4. Out of scope (call out before building)

- No real-time analytics / no actual Google Places calls inside the video — UI numbers are scripted for narrative pacing
- No voiceover (can add via ElevenLabs in a follow-up)
- The video lives entirely under `remotion/` and ships as MP4 files — no changes to the running app

---

## 5. What I need from you before building

Nothing blocking — but two quick confirms once you approve the plan:
1. The headline counter in Scene 4 ("4,182,560 AI prompts analyzed per day") — keep that number or substitute a real one you'd like to publish?
2. The final URL in Scene 11 — `aiperformancepulse.com`, the current Lovable URL, or something else?

I'll proceed with sensible defaults if you don't specify.
