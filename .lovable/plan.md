## Goal

Make pins zoom-aware on the map:
- **Zoom < 9** → one aggregated pin per city, placed at the city centroid.
- **Zoom ≥ 9** → individual property pins (current behavior).
- Clicking any pin still inspects metrics via the existing hex-select flow.

## Changes

### `src/features/pulse/PulseMap.tsx`

1. Track current map zoom in a ref + state (`const [zoom, setZoom] = useState<number>(...)`), updated on Leaflet `zoomend`.
2. Compute marker set based on zoom:
   - If `zoom < 9`: group `locations` by `city`, compute average score per city and centroid `(lat, lng)`, render one pin per city.
   - If `zoom >= 9`: render one pin per location (current logic).
3. Pin color uses the same `pinColorForScore` thresholds (city pin uses avg score).
4. Click handler:
   - Property pin → existing: find hex cell containing the location and call `onHexSelect(cell.h3)`.
   - City pin → find any hex cell whose `locationIds` belong to a location in that city and select it (so `DetailPanel` opens with city-scoped metrics, matching current behavior at admin zoom).
5. Re-run `renderMarkers()` whenever `zoom` crosses the threshold (add `zoom` to the existing render effect dependencies).
6. Optional polish: city pin slightly larger (e.g. 36×44) with a small count badge showing number of properties in that city.

### No changes required

- `MapApp.tsx`, `DetailPanel.tsx`, `hexUtils.ts`, role-switcher logic, regional/location report routes.
- The admin coarse-vs-fine hex resolution stays as-is; this change only affects pin rendering.

## Out of scope

- Tour, competitor markers, replay, filters — unchanged.
- No changes to data model or types.
