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

// Purple-only intensity scale: deep plum (low) → ultraviolet → hot magenta (high).
export function styleForIntensity(i: number): HexStyle {
  if (i < 20) {
    return {
      fillColor: "#2A1452",
      fillOpacity: 0.18,
      color: "#3D1F73",
      weight: 0.5,
      glow: "rgba(61,31,115,0.0)",
    };
  }
  if (i < 40) {
    return {
      fillColor: "#4B1A99",
      fillOpacity: 0.32,
      color: "#5C25B8",
      weight: 0.6,
      glow: "rgba(75,26,153,0.3)",
    };
  }
  if (i < 60) {
    return {
      fillColor: "#6B1FD6",
      fillOpacity: 0.45,
      color: "#860EFF",
      weight: 0.7,
      glow: "rgba(107,31,214,0.5)",
    };
  }
  if (i < 80) {
    return {
      fillColor: "#860EFF",
      fillOpacity: 0.58,
      color: "#A855F7",
      weight: 0.8,
      glow: "rgba(134,14,255,0.65)",
    };
  }
  return {
    fillColor: "#C026FF",
    fillOpacity: 0.72,
    color: "#E879F9",
    weight: 1,
    glow: "rgba(192,38,255,0.85)",
  };
}
