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

// Continuous Uber/kepler.gl-style color ramp.
// Deep indigo → violet → magenta → muted pink — deliberately capped
// well below white so nothing blows out against the dark basemap.
// Each stop is [r, g, b].
const RAMP: Array<[number, number, number]> = [
  [12, 4, 28],      // 0   deep indigo
  [38, 14, 88],     // 0.2 violet
  [92, 20, 158],    // 0.4 purple
  [158, 30, 210],   // 0.6 magenta
  [198, 60, 170],   // 0.8 hot pink
  [220, 130, 195],  // 1.0 capped peak (never white)
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function sampleRamp(t: number): [number, number, number] {
  const x = Math.max(0, Math.min(1, t));
  const scaled = x * (RAMP.length - 1);
  const i = Math.floor(scaled);
  const f = scaled - i;
  const c0 = RAMP[i];
  const c1 = RAMP[Math.min(i + 1, RAMP.length - 1)];
  return [lerp(c0[0], c1[0], f), lerp(c0[1], c1[1], f), lerp(c0[2], c1[2], f)];
}

function rgb([r, g, b]: [number, number, number], a = 1) {
  if (a >= 1) return `rgb(${r | 0}, ${g | 0}, ${b | 0})`;
  return `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${a})`;
}

// Kepler-style smooth styling: continuous color, tight matching stroke,
// opacity and glow that scale with intensity.
export function styleForIntensity(intensity: number): HexStyle {
  const t = Math.max(0, Math.min(1, intensity / 100));
  const fill = sampleRamp(t);
  // Stroke is a slightly lifted version of the fill so cells read as one surface.
  const stroke = sampleRamp(Math.min(1, t + 0.12));

  // Opacity ramps from a very soft floor to moderately opaque at the peak.
  const fillOpacity = 0.18 + t * 0.52; // 0.18 → 0.70

  // Glow grows with intensity for a bloom feel.
  const glowAlpha = 0.12 + t * 0.55;
  const glow = rgb(fill, glowAlpha);

  return {
    fillColor: rgb(fill),
    fillOpacity,
    color: rgb(stroke),
    weight: 0.4,
    glow,
  };
}
