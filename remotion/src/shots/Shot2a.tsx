import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, fraunces, plex } from "../theme";
import { OdometerCounter } from "../motion/Cinematic";
import { CINE_IN } from "../motion/easings";

// Shot 2.1 — Hero 87% odometer counter, "BRAND AVERAGE" caption.
export const Shot2a: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const captionIn = spring({ frame: frame - 6, fps, config: CINE_IN });
  const subIn = spring({ frame: frame - 60, fps, config: CINE_IN });

  const breathe = 1 + Math.sin(frame / 18) * 0.012;

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div
        style={{
          fontFamily: plex,
          fontWeight: 400,
          fontSize: 22,
          letterSpacing: 8,
          color: COLORS.aqua,
          opacity: captionIn,
          textTransform: "uppercase",
        }}
      >
        AI Visibility Score
      </div>
      <div
        style={{
          fontFamily: fraunces,
          fontWeight: 700,
          fontSize: 540,
          color: COLORS.white,
          letterSpacing: -22,
          lineHeight: 0.9,
          transform: `scale(${breathe})`,
          textShadow: `0 0 80px ${COLORS.ultraviolet}66`,
        }}
      >
        <OdometerCounter to={87} duration={50} suffix="%" delay={10} />
      </div>
      <div
        style={{
          fontFamily: plex,
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 14,
          color: COLORS.dim,
          opacity: subIn,
          textTransform: "uppercase",
        }}
      >
        Brand Average · Worldwide
      </div>
    </AbsoluteFill>
  );
};
