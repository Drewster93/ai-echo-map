import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fraunces, plex, COLORS } from "../theme";

export const ScoreBadge: React.FC<{
  score: number;
  label?: string;
  delay?: number;
  size?: number;
}> = ({ score, label = "Pulse", delay = 0, size = 260 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 14 } });
  const opacity = interpolate(s, [0, 1], [0, 1]);
  const scale = interpolate(s, [0, 1], [0.7, 1]);
  const value = interpolate(f - delay, [0, 30], [0, score], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const display = Math.round(value);
  const ringO = interpolate(s, [0, 1], [0, value / 100]);

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <svg width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          fill="none"
          stroke={COLORS.ultraviolet}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * (size / 2 - 8)}
          strokeDashoffset={2 * Math.PI * (size / 2 - 8) * (1 - ringO)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 16px ${COLORS.ultraviolet})` }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: COLORS.white,
        }}
      >
        <div
          style={{
            fontFamily: fraunces,
            fontSize: size * 0.42,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: -2,
          }}
        >
          {display}
        </div>
        <div
          style={{
            fontFamily: plex,
            fontSize: size * 0.07,
            fontWeight: 500,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: COLORS.dim,
            marginTop: 8,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};
