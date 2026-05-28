I found two likely causes:

1. The preview is currently broken by a syntax error in `PulseMap.tsx` at the component closing line, so the map can fall back to client rendering and fail before pins reliably appear.
2. Marker rendering is still gated by `dataRenderedRef`, and `paintData()` only runs once. If location data, zoom bucket, or map readiness changes after that first paint, pins can be cleared or skipped instead of being re-added.

Plan:

1. Fix the `PulseMap.tsx` syntax error so the map renders normally again.
2. Make marker rendering idempotent: when valid locations exist and the map/layers are ready, pins should be drawn every time relevant data changes, not only during the first paint.
3. Keep the low-zoom aggregation behavior, but guarantee every valid retrieved location contributes to a visible pin, including one-location city groups.
4. Filter invalid coordinates consistently for bounds and pins so bad `0,0` or non-finite coordinates cannot break framing or marker creation.
5. Verify the map loads without runtime errors and pins remain visible at overview zoom and after zoom changes.