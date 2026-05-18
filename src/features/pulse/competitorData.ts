import type { Location } from "./types";

export interface CityCompetitorStats {
  city: string;
  leader: string | null;          // competitor name that wins most prompts
  leaderWins: number;             // # prompts where leader ranked higher
  totalPrompts: number;
  userMentioned: number;
}

export function getCityCompetitorStats(locations: Location[]): Map<string, CityCompetitorStats> {
  const out = new Map<string, CityCompetitorStats>();
  const byCity = new Map<string, Location[]>();
  for (const l of locations) {
    const arr = byCity.get(l.city) ?? [];
    arr.push(l);
    byCity.set(l.city, arr);
  }
  byCity.forEach((locs, city) => {
    const wins = new Map<string, number>();
    let totalPrompts = 0;
    let userMentioned = 0;
    for (const l of locs) {
      for (const p of l.prompts) {
        totalPrompts++;
        if (p.status === "mentioned") userMentioned++;
        if (p.status === "competitor_higher" && p.competitor) {
          wins.set(p.competitor, (wins.get(p.competitor) ?? 0) + 1);
        }
      }
    }
    let leader: string | null = null;
    let leaderWins = 0;
    wins.forEach((n, name) => {
      if (n > leaderWins) {
        leader = name;
        leaderWins = n;
      }
    });
    out.set(city, { city, leader, leaderWins, totalPrompts, userMentioned });
  });
  return out;
}

export interface CompetitorMarker {
  lat: number;
  lng: number;
  name: string;        // leading competitor for that location's city
  initial: string;
}

/**
 * One ghost marker per user location, offset slightly so it doesn't overlap.
 * Represents the leading competitor in that city's "presence" at that point.
 */
export function buildCompetitorMarkers(locations: Location[]): CompetitorMarker[] {
  const stats = getCityCompetitorStats(locations);
  const out: CompetitorMarker[] = [];
  for (const l of locations) {
    const s = stats.get(l.city);
    if (!s?.leader) continue;
    out.push({
      lat: l.lat + 0.0009,
      lng: l.lng + 0.0012,
      name: s.leader,
      initial: s.leader.charAt(0).toUpperCase(),
    });
  }
  return out;
}
