import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const Letterbox: React.FC<{ active: boolean }> = ({ active }) => {
  const frame = useCurrentFrame();
  const target = active ? 110 : 0;
  // Smooth in/out based on frame change relative to active state
  const h = interpolate(frame, [0, 8], [active ? 0 : 110, target], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: h,
          background: "#000",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: h,
          background: "#000",
        }}
      />
    </AbsoluteFill>
  );
};
