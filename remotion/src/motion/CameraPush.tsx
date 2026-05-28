import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

type Direction = "in" | "out" | "left" | "right" | "up" | "down" | "still";

// Wraps a scene so the entire frame has continuous camera motion.
// Prevents the "single static composition" feel.
export const CameraPush: React.FC<{
  duration: number;
  direction?: Direction;
  amount?: number; // scale delta or px translate factor
  children: React.ReactNode;
}> = ({ duration, direction = "in", amount = 0.06, children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, duration], [0, 1], {
    extrapolateRight: "clamp",
  });

  let scale = 1;
  let tx = 0;
  let ty = 0;

  switch (direction) {
    case "in":
      scale = 1 + p * amount;
      break;
    case "out":
      scale = 1 + amount - p * amount;
      break;
    case "left":
      tx = -p * amount * 100;
      scale = 1 + amount * 0.5;
      break;
    case "right":
      tx = p * amount * 100;
      scale = 1 + amount * 0.5;
      break;
    case "up":
      ty = -p * amount * 100;
      scale = 1 + amount * 0.5;
      break;
    case "down":
      ty = p * amount * 100;
      scale = 1 + amount * 0.5;
      break;
    case "still":
      break;
  }

  // entry pop (first 6 frames) + soft exit (last 8 frames)
  const entryPop = interpolate(frame, [0, 6], [0.985, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitDrift = interpolate(
    frame,
    [duration - 8, duration],
    [1, 1.012],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${tx}px, ${ty}px) scale(${scale * entryPop * exitDrift})`,
        transformOrigin: "50% 50%",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
