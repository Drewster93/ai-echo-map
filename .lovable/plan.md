## Plan: Wire "Improve visibility" to Location Manager view

### Current behavior
- In `DetailPanel.tsx`, clicking the bottom "Improve visibility →" button does nothing (no onClick).
- The hex panel (`DetailPanel`) is opened for a hex cluster, which references one or more `locationIds`.
- `MapApp.tsx` already supports a Location Manager view: when `role === "location"`, it renders `LocationReportView` for the location matching `locationId` state.

### Goal
Clicking "Improve visibility" should:
1. Switch role to `"location"`
2. Set `locationId` to the location associated with that hex
3. Close the hex detail panel

### Changes

#### 1. `src/features/pulse/DetailPanel.tsx`
- Add prop `onImproveVisibility: (locationId: string) => void`
- Pick the target location from the hex: `hexLocations[0]?.id` (the first store in the cluster)
- Wire the button's `onClick` to call `onImproveVisibility(targetId)` when a location is available; disable / hide the button otherwise

#### 2. `src/features/pulse/MapApp.tsx`
- Pass `onImproveVisibility` to `<DetailPanel>`:
  ```
  onImproveVisibility={(id) => {
    setLocationId(id);
    setRole("location");
    setSelectedHex(null);
  }}
  ```

### Notes
- A hex cluster can contain multiple stores. Defaulting to the first one keeps the click deterministic and matches what's currently shown in the panel header. No new UI is added.
- No routing changes needed — the Location Manager view is rendered inline by `MapApp` based on `role`.