import { interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

type Hex = { q: number; r: number; score: number };

// generate a deterministic hex grid
function makeHexes(radius: number): Hex[] {
  const list: Hex[] = [];
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      if (Math.abs(q + r) <= radius) {
        // pseudo-random score
        const s = Math.abs(Math.sin(q * 12.9 + r * 78.2)) * 100;
        list.push({ q, r, score: s });
      }
    }
  }
  return list;
}

const hexPath = (cx: number, cy: number, size: number) => {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    pts.push(`${cx + size * Math.cos(a)},${cy + size * Math.sin(a)}`);
  }
  return `M${pts.join("L")}Z`;
};

const scoreColor = (s: number) => {
  if (s > 75) return "#3ce0d8";
  if (s > 50) return "#860eff";
  if (s > 25) return "#ff5b02";
  return "#3a1e6e";
};

export const HexGrid: React.FC<{
  radius?: number;
  size?: number;
  bloomDelay?: number;
  highlightCenter?: boolean;
}> = ({ radius = 5, size = 56, bloomDelay = 0, highlightCenter = false }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hexes = makeHexes(radius);
  const cx = 960;
  const cy = 540;

  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="hexGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor={COLORS.ultraviolet} stopOpacity="0.25" />
          <stop offset="100%" stopColor={COLORS.ultraviolet} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={500} fill="url(#hexGlow)" />
      {hexes.map((h, i) => {
        const x = cx + size * 1.5 * h.q;
        const y = cy + size * Math.sqrt(3) * (h.r + h.q / 2);
        const dist = Math.hypot(h.q, h.r);
        const delay = bloomDelay + dist * 4;
        const s = spring({
          frame: f - delay,
          fps,
          config: { damping: 12, stiffness: 180, mass: 0.7 },
        });
        const opacity = interpolate(s, [0, 1], [0, 1]);
        const scale = interpolate(s, [0, 1], [0.4, 1]);
        const isCenter = h.q === 0 && h.r === 0 && highlightCenter;
        const color = isCenter ? COLORS.ultraviolet : scoreColor(h.score);
        return (
          <g
            key={i}
            transform={`translate(${x},${y}) scale(${scale}) translate(${-x},${-y})`}
            opacity={opacity}
          >
            <path
              d={hexPath(x, y, size - 4)}
              fill={color}
              fillOpacity={isCenter ? 0.9 : 0.18}
              stroke={color}
              strokeWidth={isCenter ? 3 : 1.5}
              strokeOpacity={isCenter ? 1 : 0.6}
            />
          </g>
        );
      })}
    </svg>
  );
};
