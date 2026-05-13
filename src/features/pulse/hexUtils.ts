import { latLngToCell, cellToBoundary, gridDisk } from "h3-js";
import type { HexCell, Location } from "./types";

const HEX_RES = 8;

export function buildHexCells(
  locations: Location[],
  scoreFor: (loc: Location) => number,
): HexCell[] {
  const map = new Map<string, { intensity: number; weight: number; locs: string[]; cluster: string }>();

  for (const loc of locations) {
    const center = latLngToCell(loc.lat, loc.lng, HEX_RES);
    const ring = gridDisk(center, 1); // center + 6 neighbors
    const score = scoreFor(loc);
    ring.forEach((h, i) => {
      const w = i === 0 ? 1 : 0.45; // center weighted higher
      const cur = map.get(h);
      if (cur) {
        cur.intensity += score * w;
        cur.weight += w;
        if (!cur.locs.includes(loc.id)) cur.locs.push(loc.id);
      } else {
        map.set(h, { intensity: score * w, weight: w, locs: [loc.id], cluster: loc.cluster });
      }
    });
  }

  const out: HexCell[] = [];
  map.forEach((v, h3) => {
    out.push({
      h3,
      boundary: cellToBoundary(h3, false) as [number, number][],
      intensity: v.intensity / v.weight,
      locationIds: v.locs,
      cluster: v.cluster,
    });
  });
  return out;
}

export interface HexStyle {
  fillColor: string;
  fillOpacity: number;
  color: string;
  weight: number;
  glow: string;
}

export function styleForIntensity(i: number): HexStyle {
  if (i < 20) {
    return {
      fillColor: "#1B0C3B",
      fillOpacity: 0.05,
      color: "#3072FC",
      weight: 0.5,
      glow: "rgba(48,114,252,0.0)",
    };
  }
  if (i < 40) {
    return {
      fillColor: "#3072FC",
      fillOpacity: 0.22,
      color: "#3072FC",
      weight: 0.6,
      glow: "rgba(48,114,252,0.25)",
    };
  }
  if (i < 60) {
    return {
      fillColor: "#3072FC",
      fillOpacity: 0.4,
      color: "#7BFFFF",
      weight: 0.7,
      glow: "rgba(48,114,252,0.45)",
    };
  }
  if (i < 80) {
    return {
      fillColor: "#860EFF",
      fillOpacity: 0.5,
      color: "#860EFF",
      weight: 0.8,
      glow: "rgba(134,14,255,0.55)",
    };
  }
  return {
    fillColor: "#FF5B02",
    fillOpacity: 0.6,
    color: "#7BFFFF",
    weight: 1,
    glow: "rgba(255,91,2,0.7)",
  };
}
