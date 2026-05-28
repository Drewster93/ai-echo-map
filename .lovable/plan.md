## Plan

1. **Replace the current marker refresh logic with a deterministic marker rebuild**
   - Recompute valid locations every render using the same coordinate filter for bounds and pins.
   - Clear and rebuild the marker layer whenever locations, scores, selected state, or zoom changes require it.
   - Remove the one-time `dataRenderedRef` behavior from marker rendering so pins cannot be skipped after zooming.

2. **Make low-zoom pins zoom-safe**
   - At zoom levels below 9, build city/area aggregate pins from every valid retrieved location.
   - Use coordinate-rounded fallback buckets when city names are missing or when multiple retrieved points share weak labels, so every location contributes to a visible marker.
   - Always render a group pin even when the group contains exactly one location.

3. **Force marker visibility above map tiles and overlays**
   - Put property and aggregate pins in an explicit high-z-index Leaflet pane.
   - Add marker CSS that prevents the SVG wrappers from collapsing and ensures pins remain visible during zoom animations.
   - Keep pins interactive and clickable while staying above basemap tiles and below HUD panels.

4. **Rebuild on all relevant map movements**
   - Re-render markers on `zoomend` every time, not only when crossing the threshold.
   - Re-render after initial dive/arrival and when real locations finish loading.
   - Keep the map bounds based only on valid coordinates so the map does not frame bad data.

5. **Verify in preview**
   - Search a brand, confirm pins render.
   - Zoom out to the failing overview level and confirm `.pulse-pin` / marker DOM nodes are still present and visible.
   - Check console/runtime logs for map errors.