I’ll update `src/features/pulse/PulseMap.tsx` so retrieved locations always produce a visible marker on the map.

Plan:
1. Keep the low-zoom city/group marker path, but make it robust:
   - Group only valid retrieved locations with usable coordinates.
   - If a group contains one location, still render the same visible pin instead of relying on count badges or zoomed-in property mode.
   - Use a stable fallback group key so missing/empty city data cannot collapse markers into an invisible or empty group.
2. Re-render markers after the initial dive and whenever location data changes, including the case where data arrives after the map was initialized.
3. Ensure the “overview / zoomed further away” framing still fits all retrieved coordinates with padding, without hiding single-location results.

Technical detail:
- The likely failure is in `renderMarkers()`: below zoom 9 it switches to city aggregation. I’ll make that aggregation always create a marker for every non-empty group and add coordinate guards/fallbacks so a single retrieved location is never dropped.