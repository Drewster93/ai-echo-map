## Goal

Add a **role switcher** in the TopHeader that scopes the Pulse experience to three audiences. The Admin and Regional views are lightweight scope filters on the existing map; the **Location Manager** view is a full, premium single-location report inspired by the AthenaHQ "Underperforming · Action required" layout you shared.

## The three roles

| Role | Scope | Surface |
|---|---|---|
| **Admin** (current default) | All locations, all cities | Map + existing WorldwideOverview (unchanged) |
| **Regional Manager** | One city | Map fit to city bounds + new RegionalOverview sidebar |
| **Location Manager** | One single property | Full-page report (map collapses to a small header strip) |

Role + scope are picked from a segmented control in TopHeader, with a contextual dropdown (city for Regional, property for Location).

---

## Location Manager report — section-by-section

A scrollable, single-column report (max-width ~1100px, premium serif headings in Tiempos Headline, generous whitespace, light theme to match the new map style). Sections in order:

### 1. Status banner
Amber pill: **"Underperforming · Action required"** (color reflects computed health: amber = action, green = healthy, red = critical).

### 2. Property header
- Display name (Tiempos Headline, large)
- Sub-line: `{Brand/Group} · {Address}` (e.g. "A Fairmont Managed Hotel · Strand, London WC2R 0EZ")
- One-paragraph narrative summarizing the branded-vs-unbranded story (auto-generated from the data: if branded mention ≫ unbranded mention, use the "wins on branded, loses on discovery" template; otherwise use a parallel template).

### 3. Performance overview — 4 metric tiles
Grid of 4 cards. Each shows the metric, a small gap chip, and a one-line caption:
- **Mention rate** — % with `±Xpp vs competitors (Y%)`
- **Citation rate** — same pattern
- **Unbranded mention** — % + caption "When guests don't say {Brand}"
- **Branded mention** — % + caption "When guests ask for {Brand} specifically"

The competitor set is named in a small caption above the grid: "How you compare in {City}. Each tile shows {Property}'s metric and the gap versus the competitive set ({…competitor list})."

### 4. Head-to-head — Share of voice
Two horizontal bars (Property vs Competitors) with % labels at the end. Below: bold "Share of voice gap −Xpp" callout.

### 5. Where the gap lives — Performance by guest intent
List of intent categories. Each row:
- Category name + `{n} prompt(s) · ${revenue}/mo at stake`
- Two stacked bars: `{Brand} {x%}` and `Competitors {y%}`
- Right-aligned `+Xpp` / `−Xpp` gap chip (red for positive gap = losing, green for negative = winning)

Sorted by descending monthly value at stake. Categories with no revenue value show "—/mo at stake".

### 6. Action list — Top opportunities table
Compact table, max 7 rows, ranked by monthly value lost:
| # | Prompt (+ category tag) | Brand % | Competitors % | Gap | Monthly value lost |
Caption explains the formula: "Monthly value lost = (competitor mention gap %) × (estimated monthly search value)."

### 7. What's working
2–3 cards highlighting prompts where the property holds its ground. Each card: prompt text, category tag, mention %, and one-line context ("vs competitors X% · AI cites {domain}").

### 8. Recommended next steps
Three numbered cards (01 / 02 / 03), each with a category label (CONTENT / PR & CITATIONS / CATEGORY EXPANSION), bold action title, and a short paragraph. For the demo these are templated from the top opportunities (e.g. the #1 prompt drives the headline of card 01).

### 9. Data footer
Small muted line: `Data: AthenaHQ AI Search Presence · {N} prompts monitored across ChatGPT, Claude, Gemini, Perplexity · Updated {date}`.

---

## Visual / design commitments

- Light surface (`#fafaf7`), generous spacing (`py-16` between sections).
- Tiempos Headline for section titles, body in the existing sans pairing.
- Status banner, gap chips, and bars use a small semantic palette: brand (deep ultraviolet for Property), neutral gray for competitors, amber/red for losing gaps, green for winning gaps.
- Bars are thin (6px) with rounded ends; subtle 1px hairlines between sections rather than heavy dividers.
- Cards use very soft shadows (`shadow-[0_1px_3px_rgba(15,8,40,0.04)]`) and 1px borders — premium, not flashy.

## Data model (frontend-only, no backend)

Extend `mockData.ts` with a richer per-location shape used only by the Location view:

```ts
interface IntentCategory {
  name: string;            // "Luxury Hotels"
  promptCount: number;
  monthlyValueUsd: number; // 56500
  brandPct: number;
  competitorPct: number;
}

interface PromptRow {
  prompt: string;
  category: string;
  brandPct: number;
  competitorPct: number;
  monthlyValueUsd: number;
  citedDomain?: string;    // for "what's working"
}

interface LocationReport {
  mentionRate: number;
  competitorMentionRate: number;
  citationRate: number;
  competitorCitationRate: number;
  unbrandedMentionPct: number;
  brandedMentionPct: number;
  competitorSet: string[];
  intents: IntentCategory[];
  prompts: PromptRow[];          // all monitored prompts
  totalPromptsMonitored: number;
}
```

All numbers are derived deterministically from the existing seeded RNG, so each location has a stable report. The narrative paragraph is generated from a small template that picks the right phrasing based on `brandedMentionPct - unbrandedMentionPct`.

## File changes

**New files**
- `src/features/pulse/hud/RoleSwitcher.tsx` — segmented control + scope dropdowns
- `src/features/pulse/hud/RegionalOverview.tsx` — sidebar variant scoped to one city
- `src/features/pulse/location/LocationReport.tsx` — top-level report layout
- `src/features/pulse/location/StatusBanner.tsx`
- `src/features/pulse/location/PerformanceTiles.tsx`
- `src/features/pulse/location/HeadToHeadBars.tsx`
- `src/features/pulse/location/IntentBreakdown.tsx`
- `src/features/pulse/location/ActionTable.tsx`
- `src/features/pulse/location/WhatsWorking.tsx`
- `src/features/pulse/location/NextSteps.tsx`
- `src/features/pulse/location/reportData.ts` — derives `LocationReport` from a `Location`

**Edits**
- `src/features/pulse/MapApp.tsx` — add `role`, `regionCity`, `locationId` state; compute `scopedLocations`; swap sidebar / surface based on role.
- `src/features/pulse/hud/TopHeader.tsx` — slot in `RoleSwitcher`; chips reflect active scope.
- `src/features/pulse/PulseMap.tsx` — accept optional `fitTo` bounds/point and respond to scope changes.

## Out of scope (call out)
- No real auth or role enforcement — this is a visual switcher for the demo. Real per-user gating would later use Lovable Cloud + a `user_roles` table.
- No new external data; the report values are deterministically generated from existing seeded locations so each property has a stable, plausible story.
- Hotel-specific intent categories (Luxury / Business / Spa / Weddings / …) are used as the demo set since your example is The Savoy. The category list is data-driven, so swapping to coffee-shop intents later is a one-file change.

## One question before I build

Should the Location view **replace** the map (full-screen report, with a small "Back to map" pill) or **slide in over** the map (report panel from the right, map dimmed behind)? The first feels more like a printable report; the second keeps spatial context.
