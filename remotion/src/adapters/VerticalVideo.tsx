import React from "react";
import { AbsoluteFill } from "remotion";
import { MainVideo } from "../MainVideo";

// Scale the 1920x1080 master to fit a 1080x1920 vertical.
// Width-fit: scale = 1080/1920. Content sits centered vertically.
export const VerticalVideo: React.FC = () => {
  const scale = 1080 / 1920;
  const scaledH = 1080 * scale;
  return (
    <AbsoluteFill style={{ background: "#05030d", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1920,
          height: 1080,
          left: 0,
          top: (1920 - scaledH) / 2,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <MainVideo />
      </div>
    </AbsoluteFill>
  );
};
