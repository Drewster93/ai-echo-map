import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const ColorFlash: React.FC<{ color: string; duration?: number }> = ({
  color,
  duration = 6,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 2, duration],
    [0, 0.85, 0],
    { extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill
      style={{
        background: color,
        opacity,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};
