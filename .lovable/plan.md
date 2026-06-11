
# Match DetailPanel to reference screenshot

Rework `src/features/pulse/DetailPanel.tsx` so the bottom sheet matches the Darlington reference: clean white sheet, big black title with a purple postcode chip, "N stores" subline, four KPI tiles with huge numeric values, tabbed nav, and a Competitors ranking table. No data model or filter logic changes.

## Changes (all in `src/features/pulse/DetailPanel.tsx`)

### Header
- Remove the dark `#1a0d3d` header bar entirely.
- Replace with a light header on the white sheet:
  - Left: `h2` city/cluster name in large bold near-black (`text-3xl font-bold text-slate-900`), inline purple pill chip `DL3`-style next to it (`bg-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded-md`) — derive the postcode chip from the first location's `cluster`/`city` shorthand, or fall back to first 3 chars of the city uppercased.
  - Subline: `{N} stores` in slate-500.
  - Right: minimal `✕` close button (slate-400 hover slate-700, no border).
- Drop the green "Market overview" eyebrow + searches/impressions line.

### KPI tiles (4-up)
- Replace existing `Metric` cards with flat tiles (no border, no background fill) sitting on the white sheet, separated by thin vertical dividers or simple spacing.
- Each tile:
  - Tiny uppercase label in slate-500 (`MENTION RATE`, `CITATION RATE`, `SHARE OF VOICE`, `AVG POSITION`).
  - Massive value below in near-black bold (`text-4xl font-bold text-slate-900`), no band chip / footer text.
- Compute values from existing data:
  - Mention Rate: existing `mentionPct`.
  - Citation Rate: existing `citationPct`.
  - Share of Voice: `mentionPct / (mentionPct + competitorPct) * 100`, fallback 0.
  - Avg Position: existing `avgPosition`.

### Tabs row
- Add a simple text tab row under the KPIs: `Competitors`, `Locations`, `Prompt results` with small count chips next to Locations and Prompt results.
- Active tab: violet-700 text with violet underline; inactive: slate-500. Local `useState<'competitors' | 'locations' | 'prompts'>` defaulting to `competitors`.

### Competitors tab content
- Heading line: small uppercase `MENTION RATE VS COMPETITORS` (slate-500).
- Sentence: `{brand} ranks #1 in {city}. Sampled {N} prompts in the last 30 days.` Use existing `_fallbackCompetitors` / `COMPETITORS` data; brand label can be the first competitor entry or a hardcoded "Brand" placeholder if not available — keep it presentation-only.
- Table with columns: `BRAND`, `RANK`, `MENTION` (horizontal bar), `MENTION %`, `CITATION %`, `AVG POS`.
  - Rows: brand row first (violet text, filled violet bar), then up to 4 competitors from `_fallbackCompetitors`/`COMPETITORS`, each with a colored dot, `#2`/`#3`/… rank, light slate bar proportional to a mocked mention %, citation `—`, mocked avg position.
  - Use existing mock data only; derive competitor mention % deterministically from index (e.g. `mentionPct - (i+1)*15`, clamped ≥ 5) so the table renders without new data sources.

### Locations / Prompt results tabs
- `Locations`: keep the existing grouped property cards (current "Properties" block) but render only when this tab is active.
- `Prompt results`: render a simple list of `allPromptsFull` items with `prompt` text and a small status chip (mentioned / competitor_higher / not_mentioned) — purely presentational, no new data.

### Sheet container
- Keep `motion.section` animation, but drop the backdrop dark overlay (set to `bg-black/10` or remove) to match the reference which shows the map still visible above.
- Keep `rounded-t-3xl`, white background, existing position.

## Out of scope
- Map, pins, legend, filters, side nav, top header, mock data shape, SSR hydration warning, debug banner.
