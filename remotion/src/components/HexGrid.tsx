import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

// Hex grid: a flat-top hex tessellation that lights up over time.
// `lit` 0..1 controls how many cells are illuminated.
export const HexGrid: React.FC<{
  cols?: number;
  rows?: number;
  size?: number;
  lit?: number;
  color?: string;
  glowColor?: string;
  opacity?: number;
  width?: number;
  height?: number;
  seed?: number;
}> = ({
  cols = 28,
  rows = 14,
  size = 42,
  lit = 0.4,
  color = COLORS.ultraviolet,
  glowColor = COLORS.aqua,
  opacity = 1,
  width = 1920,
  height = 1080,
  seed = 1,
}) => {
  const frame = useCurrentFrame();
  const w = size * Math.sqrt(3);
  const h = size * 1.5;
  const cells: React.ReactElement[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * w + (r % 2 === 0 ? 0 : w / 2);
      const y = r * h;
      // deterministic pseudo-random
      const n = Math.sin((c * 12.9898 + r * 78.233 + seed) * 43758.5453);
      const rnd = n - Math.floor(n);
      const isLit = rnd < lit;
      const flick =
        0.55 + 0.45 * Math.sin((frame + c * 7 + r * 11) / 18 + rnd * 6);
      const pts: string[] = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i + Math.PI / 6;
        pts.push(`${x + Math.cos(a) * size},${y + Math.sin(a) * size}`);
      }
      cells.push(
        <polygon
          key={`${r}-${c}`}
          points={pts.join(" ")}
          fill={isLit ? glowColor : "transparent"}
          fillOpacity={isLit ? 0.18 * flick : 0}
          stroke={isLit ? glowColor : color}
          strokeOpacity={isLit ? 0.9 * flick : 0.18}
          strokeWidth={isLit ? 1.4 : 0.8}
        />,
      );
    }
  }
  return (
    <svg
      width={width}
      height={height}
      viewBox={`-${w} -${h} ${cols * w + w * 2} ${rows * h + h * 2}`}
      style={{ opacity }}
    >
      {cells}
    </svg>
  );
};

// Animated counter
export const Counter: React.FC<{
  to: number;
  duration?: number;
  format?: (n: number) => string;
  style?: React.CSSProperties;
}> = ({ to, duration = 60, format, style }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [0, duration], [0, to], {
    extrapolateRight: "clamp",
  });
  const n = Math.round(v);
  return (
    <span style={style}>
      {format ? format(n) : n.toLocaleString("en-US")}
    </span>
  );
};
