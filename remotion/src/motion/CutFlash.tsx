import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

// 1-frame white pop + 3-frame violet bloom on scene entry.
export const CutFlash: React.FC<{ color?: string }> = ({
  color = "#860eff",
}) => {
  const frame = useCurrentFrame();
  const white = interpolate(frame, [0, 1, 2], [0.55, 0.25, 0], {
    extrapolateRight: "clamp",
  });
  const bloom = interpolate(frame, [0, 2, 6], [0.45, 0.18, 0], {
    extrapolateRight: "clamp",
  });
  if (frame > 6) return null;
  return (
    <>
      <AbsoluteFill
        style={{ background: "#ffffff", opacity: white, pointerEvents: "none" }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 60%)`,
          opacity: bloom,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    </>
  );
};
