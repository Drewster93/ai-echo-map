import type { Location } from "../types";
import type { CityCompetitorStats } from "../competitorData";

export type TourStopKind = "stronghold" | "blindspot" | "opportunity";

export interface TourStop {
  kind: TourStopKind;
  city: string;
  center: [number, number];
  zoom: number;
  headline: string;
  insight: string;
  /** Optional second line — populated when competitor reveal is on. */
  comparison?: string;
}

interface CityAgg {
  city: string;
  avgScore: number;
  promptCount: number;
  mentionedCount: number;
  notMentionedCount: number;
  competitorHigherCount: number;
  center: [number, number];
}

function aggregateByCity(
  locations: Location[],
  scoreFor: (loc: Location) => number,
): CityAgg[] {
  const groups = new Map<string, Location[]>();
  for (const loc of locations) {
    const arr = groups.get(loc.city) ?? [];
    arr.push(loc);
    groups.set(loc.city, arr);
  }
  const out: CityAgg[] = [];
  groups.forEach((locs, city) => {
    const avgScore = locs.reduce((s, l) => s + scoreFor(l), 0) / locs.length;
    let promptCount = 0;
    let mentionedCount = 0;
    let notMentionedCount = 0;
    let competitorHigherCount = 0;
    for (const l of locs) {
      for (const p of l.prompts) {
        promptCount++;
        if (p.status === "mentioned") mentionedCount++;
        else if (p.status === "not_mentioned") notMentionedCount++;
        else if (p.status === "competitor_higher") competitorHigherCount++;
      }
    }
    const center: [number, number] = [
      locs.reduce((s, l) => s + l.lat, 0) / locs.length,
      locs.reduce((s, l) => s + l.lng, 0) / locs.length,
    ];
    out.push({
      city,
      avgScore,
      promptCount,
      mentionedCount,
      notMentionedCount,
      competitorHigherCount,
      center,
    });
  });
  return out;
}

export function selectTourStops(
  locations: Location[],
  scoreFor: (loc: Location) => number,
): TourStop[] {
  const cities = aggregateByCity(locations, scoreFor).filter((c) => c.promptCount > 0);
  if (cities.length === 0) return [];

  const sorted = [...cities].sort((a, b) => b.avgScore - a.avgScore);
  const stronghold = sorted[0];
  const blindspot = sorted[sorted.length - 1];
  const middle = sorted.length >= 3 ? sorted[Math.floor(sorted.length / 2)] : null;

  const used = new Set<string>();
  const stops: TourStop[] = [];

  if (stronghold) {
    used.add(stronghold.city);
    stops.push({
      kind: "stronghold",
      city: stronghold.city,
      center: stronghold.center,
      zoom: 11,
      headline: "Your stronghold",
      insight: `Leading in ${stronghold.mentionedCount}/${stronghold.promptCount} prompts — your strongest market.`,
    });
  }

  if (blindspot && !used.has(blindspot.city) && blindspot.notMentionedCount > 0) {
    used.add(blindspot.city);
    stops.push({
      kind: "blindspot",
      city: blindspot.city,
      center: blindspot.center,
      zoom: 11,
      headline: "Your blind spot",
      insight: `Invisible in ${blindspot.notMentionedCount}/${blindspot.promptCount} local prompts — high intent, no presence.`,
    });
  }

  const opp = middle && !used.has(middle.city) ? middle : null;
  if (opp) {
    used.add(opp.city);
    stops.push({
      kind: "opportunity",
      city: opp.city,
      center: opp.center,
      zoom: 11,
      headline: "Your opportunity",
      insight: `Mentioned in ${opp.mentionedCount}/${opp.promptCount} prompts — one content push from leading.`,
    });
  }

  return stops;
}

export function summaryLine(stops: TourStop[]): string {
  const blindspot = stops.find((s) => s.kind === "blindspot");
  const stronghold = stops.find((s) => s.kind === "stronghold");
  if (blindspot && stronghold) {
    return `You're strong in ${stronghold.city}. Fix ${blindspot.city} first.`;
  }
  if (stronghold) return `You're strong in ${stronghold.city}.`;
  return "Tour complete.";
}
