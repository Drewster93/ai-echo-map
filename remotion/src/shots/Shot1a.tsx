import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, fraunces } from "../theme";
import { CINE_IN } from "../motion/easings";

// Shot 1.1 — Black. Single white dot pulses. One word fades in: "VISIBILITY."
export const Shot1a: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dotIn = spring({ frame: frame - 6, fps, config: CINE_IN });
  const pulse = 1 + Math.sin(frame / 6) * 0.18;
  const textIn = spring({ frame: frame - 28, fps, config: CINE_IN });
  const glow = 0.35 + Math.sin(frame / 6) * 0.25;

  return (
    <AbsoluteFill
      style={{
        background: "#000",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: COLORS.white,
          transform: `scale(${dotIn * pulse})`,
          boxShadow: `0 0 ${60 + glow * 120}px ${COLORS.aquaBright}, 0 0 ${180}px ${COLORS.ultraviolet}`,
          top: "50%",
          left: "50%",
          marginLeft: -14,
          marginTop: -14,
        }}
      />
      {/* ring */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 80 + (frame % 30) * 10,
          height: 80 + (frame % 30) * 10,
          marginLeft: -(80 + (frame % 30) * 10) / 2,
          marginTop: -(80 + (frame % 30) * 10) / 2,
          borderRadius: "50%",
          border: `1px solid ${COLORS.aqua}`,
          opacity: interpolate((frame % 30) / 30, [0, 1], [0.6, 0]),
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "62%",
          fontFamily: fraunces,
          fontWeight: 500,
          fontSize: 120,
          letterSpacing: 24,
          color: COLORS.white,
          opacity: textIn,
          transform: `translateY(${(1 - textIn) * 20}px)`,
        }}
      >
        VISIBILITY.
      </div>
    </AbsoluteFill>
  );
};
