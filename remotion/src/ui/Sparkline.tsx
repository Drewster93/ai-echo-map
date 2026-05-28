import { interpolate, useCurrentFrame, spring, useVideoConfig, Easing } from "remotion";
import { fraunces, plex, COLORS } from "../theme";

const days = [62, 65, 64, 71, 78, 82, 87];
const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const Sparkline: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const W = 1200;
  const H = 380;
  const padX = 60;
  const padY = 60;
  const max = 100;
  const min = 40;
  const ptX = (i: number) => padX + (i * (W - 2 * padX)) / (days.length - 1);
  const ptY = (v: number) => H - padY - ((v - min) / (max - min)) * (H - 2 * padY);

  const pts = days.map((v, i) => `${ptX(i)},${ptY(v)}`);
  const pathD = "M" + pts.join(" L");

  // measure total length approx
  const segLens = days.slice(1).map((v, i) => {
    const x1 = ptX(i);
    const y1 = ptY(days[i]);
    const x2 = ptX(i + 1);
    const y2 = ptY(v);
    return Math.hypot(x2 - x1, y2 - y1);
  });
  const totalLen = segLens.reduce((a, b) => a + b, 0);

  const drawProgress = interpolate(f - delay, [0, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: (1920 - W) / 2,
        top: 280,
        width: W,
      }}
    >
      <div
        style={{
          fontFamily: plex,
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: COLORS.dim,
          marginBottom: 16,
        }}
      >
        7-day AI visibility · Lumen Coffee
      </div>

      <svg width={W} height={H}>
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.ultraviolet} stopOpacity="0.35" />
            <stop offset="100%" stopColor={COLORS.ultraviolet} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <line
            key={i}
            x1={padX}
            x2={W - padX}
            y1={padY + p * (H - 2 * padY)}
            y2={padY + p * (H - 2 * padY)}
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="4 8"
          />
        ))}

        {/* area under */}
        <path
          d={`${pathD} L${ptX(days.length - 1)},${H - padY} L${ptX(0)},${H - padY} Z`}
          fill="url(#sparkGrad)"
          opacity={interpolate(drawProgress, [0.6, 1], [0, 1], { extrapolateLeft: "clamp" })}
        />

        {/* main line */}
        <path
          d={pathD}
          stroke={COLORS.ultraviolet}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={totalLen}
          strokeDashoffset={totalLen * (1 - drawProgress)}
          style={{ filter: `drop-shadow(0 0 12px ${COLORS.ultraviolet})` }}
        />

        {/* points */}
        {days.map((v, i) => {
          const pStart = delay + 10 + i * 6;
          const s = spring({ frame: f - pStart, fps, config: { damping: 14 } });
          const r = interpolate(s, [0, 1], [0, 8]);
          return (
            <g key={i}>
              <circle cx={ptX(i)} cy={ptY(v)} r={r} fill={COLORS.white} />
              <text
                x={ptX(i)}
                y={H - padY + 28}
                textAnchor="middle"
                fontFamily={plex}
                fontSize={14}
                fill={COLORS.dim}
                opacity={interpolate(s, [0, 1], [0, 1])}
              >
                {labels[i]}
              </text>
              {i === days.length - 1 && (
                <text
                  x={ptX(i)}
                  y={ptY(v) - 24}
                  textAnchor="middle"
                  fontFamily={fraunces}
                  fontSize={36}
                  fontWeight={700}
                  fill={COLORS.aqua}
                  opacity={interpolate(s, [0, 1], [0, 1])}
                >
                  {v}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
