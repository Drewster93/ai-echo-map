import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, fraunces, grotesk, plex } from "../theme";
import { Counter } from "../components/HexGrid";

export const Scene04Scale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 18 } });
  const numIn = spring({
    frame: frame - 18,
    fps,
    config: { damping: 18 },
  });
  const subIn = spring({
    frame: frame - 100,
    fps,
    config: { damping: 18 },
  });
  // sparkline
  const points = Array.from({ length: 40 }, (_, i) => {
    const x = (i / 39) * 600;
    const v =
      Math.sin(i * 0.5) * 16 + Math.cos(i * 0.3 + 1) * 8 + (i / 39) * 30;
    return [x, 110 - v];
  });
  const reveal = interpolate(frame, [20, 110], [0, points.length - 1], {
    extrapolateRight: "clamp",
  });
  const path =
    "M " +
    points
      .slice(0, Math.max(2, Math.floor(reveal)))
      .map((p) => p.join(","))
      .join(" L ");

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          opacity: labelIn,
          fontFamily: plex,
          fontWeight: 300,
          color: COLORS.dim,
          fontSize: 28,
          letterSpacing: 4,
          textTransform: "uppercase",
          marginBottom: 18,
        }}
      >
        AI prompts analyzed
      </div>
      <div
        style={{
          opacity: numIn,
          transform: `translateY(${(1 - numIn) * 30}px)`,
          fontFamily: grotesk,
          fontWeight: 700,
          color: COLORS.white,
          fontSize: 220,
          letterSpacing: -8,
          lineHeight: 1,
        }}
      >
        <Counter to={4182560} duration={90} />
      </div>
      <div
        style={{
          marginTop: 28,
          width: 600,
          opacity: interpolate(frame, [20, 50], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        <svg width={600} height={130} viewBox="0 0 600 130">
          <path
            d={path}
            stroke={COLORS.aqua}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={path + ` L 600 130 L 0 130 Z`}
            fill={COLORS.aqua}
            fillOpacity={0.08}
          />
        </svg>
      </div>
      <div
        style={{
          opacity: subIn,
          fontFamily: fraunces,
          fontStyle: "italic",
          color: COLORS.white,
          fontSize: 36,
          marginTop: 10,
        }}
      >
        per day · across 240 countries
      </div>
    </AbsoluteFill>
  );
};
