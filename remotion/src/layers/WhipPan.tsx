import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

/** 6-frame horizontal whip pan overlay (motion-blurred bar swipe) */
export const WhipPan: React.FC<{ direction?: "left" | "right"; color?: string }> = ({
  direction = "right",
  color = "#0B0418",
}) => {
  const frame = useCurrentFrame();
  const sign = direction === "right" ? 1 : -1;
  const x = interpolate(frame, [0, 6], [-1920 * sign, 1920 * sign], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: 0, bottom: 0, width: "200%",
        background: `linear-gradient(90deg, transparent 0%, ${color} 40%, ${color} 60%, transparent 100%)`,
        filter: "blur(40px)",
        transform: `translateX(${x}px)`,
      }} />
    </AbsoluteFill>
  );
};
