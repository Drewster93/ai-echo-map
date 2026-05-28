## Problem

When a user clicks a hex pin, `DetailPanel` currently renders inline beneath the map as a full-width section (`relative z-10 w-full border-t ...`). Because it sits in normal document flow after `MapApp`'s `h-screen` map, the page scrolls and the panel feels like a takeover of the section rather than a contextual modal over the map.

## Fix

Convert `DetailPanel` into a fixed bottom overlay that covers roughly the lower 45% of the viewport, while the map remains fully visible above it. Click-outside / close button dismisses.

### Changes to `src/features/pulse/DetailPanel.tsx`

- Replace section classes with a fixed bottom overlay:
  - `fixed inset-x-0 bottom-0 z-30 max-h-[45vh] overflow-y-auto`
  - Add rounded top corners, top border, backdrop blur, and a strong drop shadow so it reads as a floating sheet over the map.
  - Constrain inner content width (e.g. `mx-auto max-w-7xl`) and keep the existing header + 4-up metrics grid.
- Animate from `y: 40, opacity: 0` → `y: 0, opacity: 1` (slide-up sheet), exit reverse.
- Remove the `scrollIntoView` effect (no longer needed — overlay appears in place).
- Keep close button and Improve-visibility CTA unchanged.

### Changes to `src/features/pulse/MapApp.tsx`

- No structural change required; `DetailPanel` is already rendered as a sibling of the map. It will simply float over the map once it's `fixed`.
- Optional: add a subtle backdrop dimmer (`fixed inset-0 z-20 bg-black/20`) behind the panel when `selected` is set, dismissing on click. (Will include this for polish.)

### Out of scope

- No changes to data, hex selection logic, ResultsSection, or routing.
- No viewport / route layout changes in `src/routes/index.tsx`.
