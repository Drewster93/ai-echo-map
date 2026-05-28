import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, fraunces, plex } from "../theme";
import { CINE_IN } from "../motion/easings";

// Shot 6.2 — Hero lockup: logo + title + tagline + URL + coral underline whip.
export const Shot6b: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoIn = spring({ frame, fps, config: CINE_IN });
  const titleIn = spring({ frame: frame - 10, fps, config: CINE_IN });
  const taglineIn = spring({ frame: frame - 22, fps, config: CINE_IN });
  const urlIn = spring({ frame: frame - 38, fps, config: CINE_IN });
  const underlineP = interpolate(frame, [46, 56], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (v) => 1 - Math.pow(1 - v, 3),
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 22,
      }}
    >
      <div
        style={{
          width: 130,
          height: 130,
          borderRadius: 30,
          background: `linear-gradient(135deg, ${COLORS.ultraviolet}, ${COLORS.aquaBright})`,
          boxShadow: `0 0 60px ${COLORS.ultraviolet}, 0 0 120px ${COLORS.aquaBright}66`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: logoIn,
          transform: `scale(${0.7 + logoIn * 0.3})`,
        }}
      >
        <svg width="78" height="78" viewBox="0 0 120 120">
          <polygon
            points="60,8 110,36 110,84 60,112 10,84 10,36"
            fill="none"
            stroke="white"
            strokeWidth={5}
          />
          <circle cx="60" cy="60" r="8" fill="white" />
        </svg>
      </div>

      <div
        style={{
          position: "relative",
          fontFamily: fraunces,
          fontWeight: 700,
          fontSize: 150,
          color: COLORS.white,
          letterSpacing: -6,
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 18}px)`,
        }}
      >
        AI Performance Pulse
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -12,
            height: 8,
            background: COLORS.coral,
            transformOrigin: "left",
            transform: `scaleX(${underlineP})`,
            boxShadow: `0 0 18px ${COLORS.coral}`,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: fraunces,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 52,
          color: COLORS.aquaBright,
          opacity: taglineIn,
          transform: `translateY(${(1 - taglineIn) * 14}px)`,
        }}
      >
        Local AI visibility. Mapped. Measured. Won.
      </div>
      <div
        style={{
          marginTop: 22,
          fontFamily: plex,
          fontWeight: 400,
          fontSize: 28,
          letterSpacing: 6,
          color: COLORS.dim,
          opacity: urlIn,
          textTransform: "lowercase",
        }}
      >
        aiperformancepulse.com
      </div>
    </AbsoluteFill>
  );
};
