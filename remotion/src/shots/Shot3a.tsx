import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, plex, fraunces } from "../theme";
import { HexGrid } from "../components/HexGrid";
import { AnamorphicBars } from "../motion/Cinematic";
import { CINE_IN } from "../motion/easings";

// Shot 3.1 — Anamorphic bars drop, dolly into one red tile that becomes a neighborhood map.
export const Shot3a: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // tile zoom
  const zoom = interpolate(frame, [0, 60], [1, 18], {
    extrapolateRight: "clamp",
    easing: (v) => v * v,
  });
  const tileFade = interpolate(frame, [40, 60], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hexIn = spring({ frame: frame - 55, fps, config: CINE_IN });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <AnamorphicBars show height={120} />

      {/* red tile being zoomed */}
      <div
        style={{
          position: "absolute",
          width: 200,
          height: 160,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${COLORS.coral}33, ${COLORS.coral}66)`,
          border: `2px solid ${COLORS.coral}`,
          boxShadow: `0 0 60px ${COLORS.coral}`,
          transform: `scale(${zoom})`,
          opacity: tileFade,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: plex,
          fontWeight: 700,
          fontSize: 56,
          color: COLORS.white,
        }}
      >
        3%
      </div>

      {/* hex neighborhood map */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: hexIn,
          transform: `scale(${0.95 + hexIn * 0.05})`,
        }}
      >
        <HexGrid
          cols={42}
          rows={18}
          size={36}
          lit={0.55}
          color={COLORS.ultraviolet}
          glowColor={COLORS.coral}
          width={1920}
          height={1080}
          seed={7}
        />
      </div>

      {/* corner labels */}
      <div
        style={{
          position: "absolute",
          bottom: 150,
          left: 90,
          fontFamily: plex,
          fontSize: 18,
          letterSpacing: 6,
          color: COLORS.aqua,
          opacity: hexIn,
          textTransform: "uppercase",
        }}
      >
        Bushwick · Brooklyn
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 150,
          right: 90,
          fontFamily: plex,
          fontWeight: 700,
          fontSize: 26,
          color: COLORS.coral,
          opacity: hexIn,
          textShadow: `0 0 14px ${COLORS.coral}`,
        }}
      >
        3% mention rate
      </div>
    </AbsoluteFill>
  );
};
