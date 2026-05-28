import React from "react";
import { AbsoluteFill } from "remotion";
import { MainVideo } from "../MainVideo";

// Scale the 1920x1080 master down to fit a 1080x1080 square.
// Scenes are designed for landscape; we letterbox top/bottom on the dark bg.
export const SquareVideo: React.FC = () => {
  const scale = 1080 / 1920;
  return (
    <AbsoluteFill style={{ background: "#05030d", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1920,
          height: 1080,
          left: 0,
          top: (1080 - 1080 * scale) / 2,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <MainVideo />
      </div>
    </AbsoluteFill>
  );
};
