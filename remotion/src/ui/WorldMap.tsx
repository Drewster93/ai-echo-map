import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

// A stylized dot-grid "world" — pseudo-continents via deterministic noise.
// Renders into the page background; push-in can be applied by parent.

const W = 1920;
const H = 1080;
const COLS = 96;
const ROWS = 54;

function continentMask(x: number, y: number): number {
  // crude shapes: Americas, Europe/Africa, Asia/Oceania
  const inAmericas =
    (x > 0.12 && x < 0.32 && y > 0.18 && y < 0.78 && Math.sin(x * 14 + y * 6) > -0.3) ||
    (x > 0.22 && x < 0.34 && y > 0.45 && y < 0.85);
  const inEurAfr =
    (x > 0.45 && x < 0.6 && y > 0.18 && y < 0.78 && Math.cos(x * 12 + y * 8) > -0.2);
  const inAsiaOcean =
    (x > 0.6 && x < 0.88 && y > 0.2 && y < 0.7 && Math.sin(x * 10 - y * 6) > -0.4) ||
    (x > 0.78 && x < 0.92 && y > 0.7 && y < 0.85);
  return inAmericas || inEurAfr || inAsiaOcean ? 1 : 0;
}

export const WorldMap: React.FC<{
  highlight?: { x: number; y: number; appearAt?: number };
  dim?: number;
}> = ({ highlight, dim = 1 }) => {
  const f = useCurrentFrame();
  const dots: React.ReactNode[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c / COLS;
      const y = r / ROWS;
      if (continentMask(x, y) !== 1) continue;
      const cx = x * W;
      const cy = y * H;
      const dist = highlight
        ? Math.hypot(cx - highlight.x, cy - highlight.y)
        : 9999;
      const inHL = dist < 180;
      dots.push(
        <circle
          key={`${r}-${c}`}
          cx={cx}
          cy={cy}
          r={inHL ? 3 : 2}
          fill={inHL ? COLORS.ultraviolet : "rgba(255,255,255,0.18)"}
          opacity={inHL ? 1 : 0.6 * dim}
        />
      );
    }
  }

  // highlight pulse
  const pulse = highlight
    ? interpolate(
        ((f - (highlight.appearAt ?? 0)) % 60) / 60,
        [0, 1],
        [0, 1]
      )
    : 0;

  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {dots}
      {highlight && (
        <>
          <circle
            cx={highlight.x}
            cy={highlight.y}
            r={20 + pulse * 80}
            fill="none"
            stroke={COLORS.ultraviolet}
            strokeWidth={2}
            opacity={1 - pulse}
          />
          <circle
            cx={highlight.x}
            cy={highlight.y}
            r={10}
            fill={COLORS.ultraviolet}
            style={{ filter: `drop-shadow(0 0 20px ${COLORS.ultraviolet})` }}
          />
        </>
      )}
    </svg>
  );
};
