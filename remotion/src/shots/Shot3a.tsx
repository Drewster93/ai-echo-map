import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, plex } from "../theme";
import { HexGrid } from "../components/HexGrid";
import { AnamorphicBars } from "../motion/Cinematic";
import { CINE_IN } from "../motion/easings";

// Shot 3.1 — Anamorphic bars drop, dolly into one red tile that becomes a neighborhood map.
export const Shot3a: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const zoom = interpolate(frame, [0, 60], [1, 18], {
    extrapolateRight: "clamp",
    easing: (v) => v * v,
  });
  const tileFade = interpolate(frame, [40, 60], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hexIn = spring({ frame: frame - 55, fps, config: CINE_IN });

  const hotspotX = 0.58;
  const hotspotY = 0.48;

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <AnamorphicBars show height={120} />

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

      {/* hotspot center so the frame isn't empty */}
      <div
        style={{
          position: "absolute",
          left: `${hotspotX * 100}%`,
          top: `${hotspotY * 100}%`,
          width: 340,
          height: 340,
          borderRadius: "50%",
          transform: `translate(-50%, -50%) scale(${0.8 + hexIn * 0.25})`,
          background: `radial-gradient(circle, ${COLORS.coral}55 0%, ${COLORS.coral}22 32%, transparent 70%)`,
          opacity: 0.9 * hexIn,
          filter: "blur(6px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${hotspotX * 100}%`,
          top: `${hotspotY * 100}%`,
          transform: `translate(-50%, -50%)`,
          opacity: hexIn,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120">
          <polygon
            points="60,10 108,36 108,84 60,110 12,84 12,36"
            fill={`${COLORS.coral}33`}
            stroke={COLORS.coral}
            strokeWidth={3}
            style={{ filter: `drop-shadow(0 0 20px ${COLORS.coral})` }}
          />
        </svg>
      </div>

      {/* safe labels */}
      <div
        style={{
          position: "absolute",
          bottom: 118,
          left: 120,
          padding: "10px 16px",
          borderRadius: 999,
          background: "rgba(5,3,13,0.72)",
          border: `1px solid ${COLORS.aqua}55`,
          fontFamily: plex,
          fontSize: 16,
          letterSpacing: 4,
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
          bottom: 118,
          right: 120,
          padding: "10px 16px",
          borderRadius: 999,
          background: "rgba(5,3,13,0.72)",
          border: `1px solid ${COLORS.coral}55`,
          fontFamily: plex,
          fontWeight: 700,
          fontSize: 22,
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
