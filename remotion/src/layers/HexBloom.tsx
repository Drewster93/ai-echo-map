import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const HexBloom: React.FC<{ accent?: string }> = ({ accent = "#A855F7" }) => {
  const frame = useCurrentFrame();
  const cells = 60;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080">
        {Array.from({ length: cells }).map((_, i) => {
          const cx = 960;
          const cy = 540;
          const ring = Math.floor(i / 12) + 1;
          const angle = ((i % 12) / 12) * Math.PI * 2;
          const radius = ring * 90;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          const delay = ring * 4;
          const s = interpolate(frame - delay, [0, 18], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          const opacity = interpolate(frame - delay, [0, 12, 36], [0, 0.6, 0.15], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          return (
            <polygon
              key={i}
              points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15"
              transform={`translate(${x},${y}) scale(${s})`}
              fill="none"
              stroke={accent}
              strokeWidth={1.2}
              opacity={opacity}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
